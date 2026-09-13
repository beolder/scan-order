import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.table.deleteMany();

  const tables = await Promise.all(
    ["1", "2", "3", "8", "12"].map((number) =>
      prisma.table.create({ data: { number } })
    )
  );

  await prisma.menuItem.createMany({
    data: [
      { name: "宫保鸡丁", price: 2800, available: true },
      { name: "鱼香肉丝", price: 2600, available: true },
      { name: "麻婆豆腐", price: 1800, available: true },
      { name: "番茄鸡蛋汤", price: 1200, available: true },
      { name: "米饭", price: 200, available: true },
      { name: "可乐", price: 500, available: true },
      { name: "季节凉菜（已下架示例）", price: 1500, available: false },
    ],
  });

  console.log("Seed OK");
  console.log("桌台:", tables.map((t) => `${t.number} → /t/${t.id}`).join("\n      "));
  console.log("商户登录: MERCHANT_USERNAME / MERCHANT_PASSWORD（默认 merchant / demo1234）");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
