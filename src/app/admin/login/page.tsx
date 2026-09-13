"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("merchant");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "登录失败");
      router.push("/admin/orders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm pt-16">
      <h1 className="text-2xl font-bold">商户登录</h1>
      <p className="mt-1 text-sm text-gray-500">演示账号见 README</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-xl bg-white p-4 shadow-sm">
        <label className="block text-sm">
          账号
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          密码
          <input
            type="password"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-rose-600 py-2.5 font-medium text-white"
        >
          {busy ? "登录中…" : "登录"}
        </button>
      </form>
    </main>
  );
}
