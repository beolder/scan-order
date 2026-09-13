import Link from "next/link";
import { isMerchantAuthed } from "@/lib/auth";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isMerchantAuthed();
  return (
    <div className="min-h-screen bg-slate-50">
      {authed && (
        <nav className="border-b bg-white px-4 py-3">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 text-sm">
            <span className="font-bold text-slate-800">商户后台</span>
            <Link href="/admin/orders" className="text-rose-600">
              订单
            </Link>
            <Link href="/admin/menu" className="text-rose-600">
              菜单
            </Link>
            <Link href="/admin/tables" className="text-rose-600">
              桌台二维码
            </Link>
            <div className="ml-auto">
              <LogoutButton />
            </div>
          </div>
        </nav>
      )}
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
