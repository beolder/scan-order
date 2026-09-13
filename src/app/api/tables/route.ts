import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isMerchantAuthed } from "@/lib/auth";

export async function GET() {
  const tables = await prisma.table.findMany({ orderBy: { number: "asc" } });
  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  return NextResponse.json(
    tables.map((t) => ({
      tableId: t.id,
      number: t.number,
      deepLink: `${base}/t/${t.id}`,
    }))
  );
}

export async function POST(req: Request) {
  if (!(await isMerchantAuthed())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const body = await req.json();
  const number = String(body.number || "").trim();
  if (!number) return NextResponse.json({ error: "桌号必填" }, { status: 400 });
  const table = await prisma.table.create({ data: { number } });
  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  return NextResponse.json({
    tableId: table.id,
    number: table.number,
    deepLink: `${base}/t/${table.id}`,
  });
}
