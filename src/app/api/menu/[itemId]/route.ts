import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isMerchantAuthed } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  if (!(await isMerchantAuthed())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { itemId } = await params;
  const body = await req.json();
  const data: { name?: string; price?: number; available?: boolean } = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "名称必填" }, { status: 400 });
    data.name = name;
  }
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "价格无效（单位：分）" }, { status: 400 });
    }
    data.price = Math.round(price);
  }
  if (body.available !== undefined) data.available = Boolean(body.available);
  try {
    const item = await prisma.menuItem.update({ where: { id: itemId }, data });
    return NextResponse.json({
      itemId: item.id,
      name: item.name,
      price: item.price,
      available: item.available,
    });
  } catch {
    return NextResponse.json({ error: "菜品不存在" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  if (!(await isMerchantAuthed())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { itemId } = await params;
  try {
    await prisma.menuItem.delete({ where: { id: itemId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "菜品不存在" }, { status: 404 });
  }
}
