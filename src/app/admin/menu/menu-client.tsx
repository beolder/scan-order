"use client";

import { useCallback, useEffect, useState } from "react";
import { formatYuan, yuanToFen } from "@/lib/money";

type Item = { itemId: string; name: string; price: number; available: boolean };

export function MenuClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [priceYuan, setPriceYuan] = useState("18");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/menu?all=1");
    if (res.ok) setItems(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price: yuanToFen(Number(priceYuan)),
        available: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "创建失败");
      return;
    }
    setName("");
    await load();
  }

  async function toggle(item: Item) {
    await fetch(`/api/menu/${item.itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    await load();
  }

  async function remove(itemId: string) {
    if (!confirm("确认删除该菜品？")) return;
    await fetch(`/api/menu/${itemId}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="mt-4">
      <form onSubmit={createItem} className="flex flex-wrap gap-2 rounded-xl bg-white p-4 shadow-sm">
        <input
          className="rounded-lg border px-3 py-2 text-sm"
          placeholder="名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="w-28 rounded-lg border px-3 py-2 text-sm"
          placeholder="价格(元)"
          value={priceYuan}
          onChange={(e) => setPriceYuan(e.target.value)}
          required
        />
        <button type="submit" className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white">
          新增
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <ul className="mt-4 space-y-2">
        {items.map((i) => (
          <li
            key={i.itemId}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-sm"
          >
            <div>
              <span className="font-medium">{i.name}</span>
              <span className="ml-2 text-sm text-rose-600">{formatYuan(i.price)}</span>
              <span className="ml-2 text-xs text-gray-400">
                {i.available ? "上架" : "下架"}
              </span>
            </div>
            <div className="flex gap-2 text-sm">
              <button type="button" className="rounded border px-2 py-1" onClick={() => toggle(i)}>
                {i.available ? "下架" : "上架"}
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1 text-red-600"
                onClick={() => remove(i.itemId)}
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
