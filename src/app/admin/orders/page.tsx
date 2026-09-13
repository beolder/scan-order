import { redirect } from "next/navigation";
import { isMerchantAuthed } from "@/lib/auth";
import { OrdersClient } from "./orders-client";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!(await isMerchantAuthed())) redirect("/admin/login");
  return (
    <div>
      <h1 className="text-xl font-bold">实时订单</h1>
      <p className="mt-1 text-sm text-gray-500">
        按状态筛选；仅允许合法流转（待支付→已支付→制作中→已完成；取消仅待支付/已支付）
      </p>
      <OrdersClient />
    </div>
  );
}
