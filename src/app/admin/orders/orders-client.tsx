"use client";

import { useCallback, useEffect, useState } from "react";
import { formatYuan } from "@/lib/money";
import { STATUS_LABEL, type OrderStatus } from "@/lib/order-status";

type OrderRow = {
  orderId: string;
  tableNumber: string;
  total: number;
  payChannel: string | null;
  status: string;
  items: { itemId: string; name?: string; qty: number; unitPrice: number }[];
};

const FILTERS: { key: string; label: string }[] = [
  { key: "", label: "全部" },
  { key: "pending_pay", label: "待支付" },
  { key: "paid", label: "已支付" },
  { key: "preparing", label: "制作中" },
  { key: "done", label: "已完成" },
  { key: "cancelled", label: "已取消" },
];

function nextActions(status: string): { to: OrderStatus; label: string }[] {
  if (status === "pending_pay") return [{ to: "cancelled", label: "取消" }];
  if (status === "paid")
    return [
      { to: "preparing", label: "开始制作" },
      { to: "cancelled", label: "取消" },
    ];
  if (status === "preparing") return [{ to: "done", label: "完成" }];
  return [];
}

export function OrdersClient() {
  const [status, setStatus] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const q = status ? `?status=${status}` : "";
    const res = await fetch(`/api/orders${q}`);
    if (!res.ok) {
      setError("加载失败");
      return;
    }
    setOrders(await res.json());
    setError("");
  }, [status]);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  async function transition(orderId: string, to: OrderStatus) {
    setError("");
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "状态更新失败");
      return;
    }
    await load();
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key || "all"}
            type="button"
            onClick={() => setStatus(f.key)}
            className={`rounded-full px-3 py-1 text-sm ${
              status === f.key ? "bg-rose-600 text-white" : "bg-white text-gray-700 shadow-sm"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <ul className="mt-4 space-y-3">
        {orders.map((o) => (
          <li key={o.orderId} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-semibold">
                  {o.tableNumber} 号桌 · {STATUS_LABEL[o.status as OrderStatus] || o.status}
                </div>
                <div className="text-xs text-gray-400">{o.orderId}</div>
                <div className="mt-1 text-sm">
                  {o.items.map((i) => `${i.name || "菜品"}×${i.qty}`).join("，")} ·{" "}
                  {formatYuan(o.total)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {nextActions(o.status).map((a) => (
                  <button
                    key={a.to}
                    type="button"
                    onClick={() => transition(o.orderId, a.to)}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </li>
        ))}
        {orders.length === 0 && (
          <li className="rounded-xl bg-white p-8 text-center text-sm text-gray-500">暂无订单</li>
        )}
      </ul>
    </div>
  );
}
