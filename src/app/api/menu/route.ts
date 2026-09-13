import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isMerchantAuthed } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const all = url.searchParams.get("all") === "1";
  const merchant = await isMerchantAuthed();
  const items = await prisma.menuItem.findMany({
    where: merchant && all ? undefined : { available: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(
    items.map((i) => ({
      itemId: i.id,
      name: i.name,
      price: i.price,
      available: i.available,
    }))
  );
}

export async function POST(req: Request) {
  if (!(await isMerchantAuthed())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const body = await req.json();
  const name = String(body.name || "").trim();
  const price = Number(body.price);
  const available = body.available !== false;
  if (!name) return NextResponse.json({ error: "名称必填" }, { status: 400 });
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "价格无效（单位：分）" }, { status: 400 });
  }
  const item = await prisma.menuItem.create({
    data: { name, price: Math.round(price), available },
  });
  return NextResponse.json({
    itemId: item.id,
    name: item.name,
    price: item.price,
    available: item.available,
  });
}
