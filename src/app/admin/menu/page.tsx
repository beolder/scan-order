import { redirect } from "next/navigation";
import { isMerchantAuthed } from "@/lib/auth";
import { MenuClient } from "./menu-client";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  if (!(await isMerchantAuthed())) redirect("/admin/login");
  return (
    <div>
      <h1 className="text-xl font-bold">菜单管理</h1>
      <p className="mt-1 text-sm text-gray-500">字段：名称 / 价格 / 是否上架</p>
      <MenuClient />
    </div>
  );
}
