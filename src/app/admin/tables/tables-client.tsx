"use client";

import { useCallback, useEffect, useState } from "react";

type TableRow = { tableId: string; number: string; deepLink: string };

export function TablesClient() {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [number, setNumber] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/tables");
    if (res.ok) setTables(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createTable(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number }),
    });
    if (res.ok) {
      setNumber("");
      await load();
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={createTable} className="flex gap-2 rounded-xl bg-white p-4 shadow-sm">
        <input
          className="rounded-lg border px-3 py-2 text-sm"
          placeholder="桌号"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
        <button type="submit" className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white">
          新增桌台
        </button>
      </form>
      <ul className="mt-4 space-y-3">
        {tables.map((t) => (
          <li key={t.tableId} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="font-semibold">{t.number} 号桌</div>
            <div className="mt-1 break-all text-sm text-gray-600">{t.deepLink}</div>
            <a
              className="mt-2 inline-block text-sm text-rose-600 underline"
              href={t.deepLink}
              target="_blank"
              rel="noreferrer"
            >
              打开顾客端
            </a>
            <div className="mt-3">
              {/* 简易 QR：使用公开 API 生成，演示用 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={`桌台 ${t.number} 二维码`}
                width={140}
                height={140}
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(t.deepLink)}`}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
