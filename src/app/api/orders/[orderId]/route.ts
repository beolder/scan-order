import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, table: true },
  });
  if (!order) return NextResponse.json({ error: "订单不存在" }, { status: 404 });

  const menuIds = order.items.map((i) => i.itemId);
  const menus = await prisma.menuItem.findMany({ where: { id: { in: menuIds } } });
  const nameById = new Map(menus.map((m) => [m.id, m.name]));

  return NextResponse.json({
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
  });
}
