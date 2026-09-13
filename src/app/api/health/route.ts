import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", service: "scan-order" });
  } catch {
    return NextResponse.json({ status: "error", service: "scan-order" }, { status: 503 });
  }
}
