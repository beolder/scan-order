import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  const { tableId } = await params;
  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table) return NextResponse.json({ error: "桌台不存在" }, { status: 404 });
  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  return NextResponse.json({
    tableId: table.id,
    number: table.number,
    deepLink: `${base}/t/${table.id}`,
  });
}
