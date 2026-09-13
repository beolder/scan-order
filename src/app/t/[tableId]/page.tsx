import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CustomerOrderClient } from "./customer-order-client";

export const dynamic = "force-dynamic";

export default async function TableOrderPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = await params;
  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table) notFound();

  const menu = await prisma.menuItem.findMany({
    where: { available: true },
    orderBy: { name: "asc" },
  });

  return (
    <CustomerOrderClient
      tableId={table.id}
      tableNumber={table.number}
      menu={menu.map((m) => ({
        itemId: m.id,
        name: m.name,
        price: m.price,
      }))}
    />
  );
}
