import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tables = await prisma.table.findMany({ orderBy: { number: "asc" }, take: 5 });
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold">扫码点餐 · 堂食</h1>
      <p className="mt-2 text-sm text-gray-600">
        顾客扫描桌台二维码进入点餐；商户在管理后台处理订单与菜单。
      </p>

      <section className="mt-8 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold">演示入口</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {tables.map((t) => (
            <li key={t.id}>
              <Link className="text-rose-600 underline" href={`/t/${t.id}`}>
                {t.number} 号桌 → /t/{t.id}
              </Link>
            </li>
          ))}
          {tables.length === 0 && (
            <li className="text-gray-500">暂无桌台，请先 seed 或在后台创建。</li>
          )}
        </ul>
        <Link
          href="/admin"
          className="mt-4 inline-block rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white"
        >
          商户管理后台
        </Link>
      </section>

      <p className="mt-6 text-xs text-gray-400">健康检查：GET /health</p>
    </main>
  );
}
