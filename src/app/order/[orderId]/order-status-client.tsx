"use client";

import { useCallback, useEffect, useState } from "react";
import { formatYuan } from "@/lib/money";
import { STATUS_LABEL, type OrderStatus } from "@/lib/order-status";

type OrderView = {
  orderId: string;
  tableNumber: string;
  total: number;
  payChannel: string | null;
  status: string;
  items: { itemId: string; name: string; qty: number; unitPrice: number }[];
};

export function OrderStatusClient({ initial }: { initial: OrderView }) {
  const [order, setOrder] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/orders/${order.orderId}`);
    if (res.ok) {
      const data = await res.json();
      setOrder({
        orderId: data.orderId,
        tableNumber: data.tableNumber,
        total: data.total,
        payChannel: data.payChannel,
        status: data.status,
        items: data.items,
      });
    }
  }, [order.orderId]);

  useEffect(() => {
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [refresh]);

  async function retryPay(channel: "wechat" | "alipay") {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/orders/${order.orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payChannel: channel }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || "支付失败，状态仍为待支付");
        await refresh();
        return;
      }
      setMsg("支付成功");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const label = STATUS_LABEL[order.status as OrderStatus] || order.status;

  return (
    <main className="mx-auto min-h-screen max-w-md p-4">
      <h1 className="text-xl font-bold">订单状态</h1>
      <p className="mt-1 text-sm text-gray-500">
        {order.tableNumber} 号桌 · {order.orderId.slice(0, 8)}…
      </p>

      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="text-2xl font-bold text-rose-600">{label}</div>
        <div className="mt-1 text-sm text-gray-500">
          支付方式：
          {order.payChannel === "wechat"
            ? "微信"
            : order.payChannel === "alipay"
              ? "支付宝"
              : "未选择"}
        </div>
      </div>

      <ul className="mt-4 space-y-2 rounded-xl bg-white p-4 shadow-sm">
        {order.items.map((i) => (
          <li key={i.itemId + i.qty} className="flex justify-between text-sm">
            <span>
              {i.name} × {i.qty}
            </span>
            <span>{formatYuan(i.unitPrice * i.qty)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t pt-2 font-semibold">
          <span>合计</span>
          <span>{formatYuan(order.total)}</span>
        </li>
      </ul>

      {order.status === "pending_pay" && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-amber-700">订单待支付。支付失败不会推进状态。</p>
          <button
            type="button"
            disabled={busy}
            className="w-full rounded-xl bg-emerald-600 py-3 text-white"
            onClick={() => retryPay("wechat")}
          >
            微信支付（Mock）
          </button>
          <button
            type="button"
            disabled={busy}
            className="w-full rounded-xl bg-blue-600 py-3 text-white"
            onClick={() => retryPay("alipay")}
          >
            支付宝（Mock）
          </button>
        </div>
      )}

      {msg && <p className="mt-3 text-sm text-gray-700">{msg}</p>}
    </main>
  );
}
