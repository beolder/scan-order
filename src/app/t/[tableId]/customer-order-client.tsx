"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatYuan } from "@/lib/money";

type MenuRow = { itemId: string; name: string; price: number };

export function CustomerOrderClient({
  tableId,
  tableNumber,
  menu,
}: {
  tableId: string;
  tableNumber: string;
  menu: MenuRow[];
}) {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [payChannel, setPayChannel] = useState<"wechat" | "alipay">("wechat");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const lines = useMemo(() => {
    return menu
      .filter((m) => (cart[m.itemId] || 0) > 0)
      .map((m) => ({ ...m, qty: cart[m.itemId] }));
  }, [menu, cart]);

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  function add(itemId: string) {
    setCart((c) => ({ ...c, [itemId]: (c[itemId] || 0) + 1 }));
  }
  function sub(itemId: string) {
    setCart((c) => {
      const n = (c[itemId] || 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[itemId];
      else next[itemId] = n;
      return next;
    });
  }

  async function checkout() {
    setError("");
    if (lines.length === 0) {
      setError("请先选择菜品");
      return;
    }
    setBusy(true);
    try {
      const createRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          payChannel,
          items: lines.map((l) => ({ itemId: l.itemId, qty: l.qty })),
        }),
      });
      const order = await createRes.json();
      if (!createRes.ok) throw new Error(order.error || "下单失败");

      const payRes = await fetch(`/api/orders/${order.orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payChannel }),
      });
      const pay = await payRes.json();
      if (!payRes.ok || !pay.ok) {
        // 支付失败：停留待支付，仍可进入订单页重试
        setError(pay.error || "支付失败，订单仍为待支付");
        router.push(`/order/${order.orderId}`);
        return;
      }
      router.push(`/order/${order.orderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "下单失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-[#f6f7f9] pb-28">
      <header className="sticky top-0 z-10 border-b bg-white px-4 py-3">
        <div className="text-xs text-gray-500">堂食扫码点餐</div>
        <h1 className="text-lg font-bold">{tableNumber} 号桌</h1>
      </header>

      <ul className="space-y-2 p-4">
        {menu.map((m) => {
          const qty = cart[m.itemId] || 0;
          return (
            <li
              key={m.itemId}
              className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
            >
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-sm text-rose-600">{formatYuan(m.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                {qty > 0 && (
                  <>
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full border text-lg leading-none"
                      onClick={() => sub(m.itemId)}
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{qty}</span>
                  </>
                )}
                <button
                  type="button"
                  className="h-8 w-8 rounded-full bg-rose-600 text-lg leading-none text-white"
                  onClick={() => add(m.itemId)}
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
        {menu.length === 0 && (
          <li className="rounded-xl bg-white p-6 text-center text-sm text-gray-500">
            暂无上架菜品
          </li>
        )}
      </ul>

      <div className="fixed inset-x-0 bottom-0 border-t bg-white p-4">
        <div className="mx-auto max-w-md">
          <div className="mb-3 flex gap-3 text-sm">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="pay"
                checked={payChannel === "wechat"}
                onChange={() => setPayChannel("wechat")}
              />
              微信支付
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="pay"
                checked={payChannel === "alipay"}
                onChange={() => setPayChannel("alipay")}
              />
              支付宝
            </label>
          </div>
          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
          <button
            type="button"
            disabled={busy || count === 0}
            onClick={checkout}
            className="flex w-full items-center justify-between rounded-xl bg-rose-600 px-4 py-3 font-medium text-white"
          >
            <span>{busy ? "提交中…" : `下单并支付（${count}）`}</span>
            <span>{formatYuan(total)}</span>
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            当前为 Mock 支付，无需真实商户密钥
          </p>
        </div>
      </div>
    </main>
  );
}
