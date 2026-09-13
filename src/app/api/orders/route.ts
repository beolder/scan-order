import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isMerchantAuthed } from "@/lib/auth";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

type LineIn = { itemId: string; qty: number };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const tableId = url.searchParams.get("tableId");
  const orderId = url.searchParams.get("orderId");

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, table: true },
    });
    if (!order) return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    return NextResponse.json(await serializeOrder(order));
  }

  const merchant = await isMerchantAuthed();
  if (!merchant && !tableId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const where: { status?: string; tableId?: string } = {};
  if (status) {
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json({ error: "无效状态" }, { status: 400 });
    }
    where.status = status;
  }
  if (tableId) where.tableId = tableId;

  const orders = await prisma.order.findMany({
    where,
    include: { items: true, table: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(await Promise.all(orders.map(serializeOrder)));
}

export async function POST(req: Request) {
  const body = await req.json();
  const tableId = String(body.tableId || "");
  const lines = (body.items || []) as LineIn[];
  const payChannel = body.payChannel as string | undefined;

  if (!tableId) return NextResponse.json({ error: "缺少桌台" }, { status: 400 });
  if (!Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "购物车为空" }, { status: 400 });
  }

  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table) return NextResponse.json({ error: "桌台不存在" }, { status: 404 });

  if (payChannel && payChannel !== "wechat" && payChannel !== "alipay") {
    return NextResponse.json({ error: "支付渠道无效" }, { status: 400 });
  }

  const itemIds = lines.map((l) => l.itemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: itemIds }, available: true },
  });
  const byId = new Map(menuItems.map((m) => [m.id, m]));

  const orderItems: { itemId: string; qty: number; unitPrice: number }[] = [];
  let total = 0;
  for (const line of lines) {
    const qty = Math.floor(Number(line.qty));
    if (!Number.isFinite(qty) || qty < 1) {
      return NextResponse.json({ error: "数量无效" }, { status: 400 });
    }
    const menu = byId.get(line.itemId);
    if (!menu) {
      return NextResponse.json({ error: `菜品不可用：${line.itemId}` }, { status: 400 });
    }
    orderItems.push({ itemId: menu.id, qty, unitPrice: menu.price });
    total += menu.price * qty;
  }

  const order = await prisma.order.create({
    data: {
      tableId,
      total,
      payChannel: payChannel || null,
      status: "pending_pay",
      items: { create: orderItems },
    },
    include: { items: true, table: true },
  });

  return NextResponse.json(await serializeOrder(order));
}

async function serializeOrder(order: {
  id: string;
  tableId: string;
  total: number;
  payChannel: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  table: { id: string; number: string };
  items: { id: string; itemId: string; qty: number; unitPrice: number }[];
}) {
  const menus = await prisma.menuItem.findMany({
    where: { id: { in: order.items.map((i) => i.itemId) } },
  });
  const nameById = new Map(menus.map((m) => [m.id, m.name]));
  return {
    orderId: order.id,
    tableId: order.tableId,
    tableNumber: order.table.number,
    total: order.total,
    payChannel: order.payChannel,
    status: order.status,
    items: order.items.map((i) => ({
      itemId: i.itemId,
      name: nameById.get(i.itemId) || "菜品",
      qty: i.qty,
      unitPrice: i.unitPrice,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
