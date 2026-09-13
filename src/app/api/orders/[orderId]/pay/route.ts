import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { charge, type PayChannel } from "@/lib/payments";
import { assertTransition } from "@/lib/order-status";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const body = await req.json().catch(() => ({}));
  const channel = (body.payChannel || body.channel) as PayChannel;

  if (channel !== "wechat" && channel !== "alipay") {
    return NextResponse.json({ error: "请选择微信支付或支付宝" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "订单不存在" }, { status: 404 });

  if (order.status !== "pending_pay") {
    return NextResponse.json(
      { error: "仅待支付订单可发起支付", status: order.status },
      { status: 400 }
    );
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { payChannel: channel },
  });

  const result = await charge({
    orderId,
    amountFen: order.total,
    channel,
    description: `扫码点餐订单 ${orderId}`,
  });

  if (!result.ok) {
    // 支付失败：不推进状态，保持 pending_pay
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        status: "pending_pay",
        orderId,
      },
      { status: 402 }
    );
  }

  try {
    assertTransition(order.status, "paid");
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "非法状态流转" },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "paid", payChannel: channel },
  });

  return NextResponse.json({
    ok: true,
    orderId: updated.id,
    status: updated.status,
    payChannel: updated.payChannel,
    transactionId: result.transactionId,
  });
}
