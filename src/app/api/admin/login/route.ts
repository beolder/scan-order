import { NextResponse } from "next/server";
import { createMerchantSession, verifyMerchantCredentials } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const username = String(body.username || "");
  const password = String(body.password || "");
  if (!verifyMerchantCredentials(username, password)) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }
  await createMerchantSession();
  return NextResponse.json({ ok: true });
}
