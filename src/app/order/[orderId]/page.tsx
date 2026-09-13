import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { OrderStatusClient } from "./order-status-client";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, table: true },
  });
  if (!order) notFound();

  const menus = await prisma.menuItem.findMany({
    where: { id: { in: order.items.map((i) => i.itemId) } },
  });
  const nameById = new Map(menus.map((m) => [m.id, m.name]));

  return (
    <OrderStatusClient
      initial={{
        orderId: order.id,
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
      }}
    />
  );
}
