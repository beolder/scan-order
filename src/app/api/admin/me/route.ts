import { NextResponse } from "next/server";
import { isMerchantAuthed } from "@/lib/auth";

export async function GET() {
  const ok = await isMerchantAuthed();
  if (!ok) return NextResponse.json({ authed: false }, { status: 401 });
  return NextResponse.json({ authed: true });
}
