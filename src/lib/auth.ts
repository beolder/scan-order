import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "merchant_session";

function secret(): string {
  return process.env.SESSION_SECRET || "dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function verifyMerchantCredentials(username: string, password: string): boolean {
  const u = process.env.MERCHANT_USERNAME || "merchant";
  const p = process.env.MERCHANT_PASSWORD || "demo1234";
  try {
    const a = Buffer.from(username);
    const b = Buffer.from(u);
    const c = Buffer.from(password);
    const d = Buffer.from(p);
    if (a.length !== b.length || c.length !== d.length) return false;
    return timingSafeEqual(a, b) && timingSafeEqual(c, d);
  } catch {
    return false;
  }
}

export async function createMerchantSession(): Promise<void> {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `merchant:${exp}`;
  const token = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearMerchantSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isMerchantAuthed(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  const parts = payload.split(":");
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return parts[0] === "merchant";
}

export async function requireMerchant(): Promise<void> {
  if (!(await isMerchantAuthed())) {
    throw new Error("UNAUTHORIZED");
  }
}
