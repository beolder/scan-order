import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isMerchantAuthed } from "@/lib/auth";
import { assertTransition, ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  if (!(await isMerchantAuthed())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { orderId } = await params;
  const body = await req.json();
  const to = String(body.status || "") as OrderStatus;

  if (!ORDER_STATUSES.includes(to)) {
    return NextResponse.json({ error: "无效状态" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "订单不存在" }, { status: 404 });

  try {
    assertTransition(order.status, to);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "非法状态流转" },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: to },
  });

  return NextResponse.json({
    orderId: updated.id,
    status: updated.status,
  });
}
