import { redirect } from "next/navigation";
import { isMerchantAuthed } from "@/lib/auth";
import { TablesClient } from "./tables-client";

export const dynamic = "force-dynamic";

export default async function AdminTablesPage() {
  if (!(await isMerchantAuthed())) redirect("/admin/login");
  return (
    <div>
      <h1 className="text-xl font-bold">桌台与二维码</h1>
      <p className="mt-1 text-sm text-gray-500">深链 /t/:tableId，可用于生成桌台二维码</p>
      <TablesClient />
    </div>
  );
}
