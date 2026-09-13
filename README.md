# 扫码点餐（堂食桌台）MVP

顾客扫桌台二维码点餐 → 购物车下单 → 微信/支付宝 **Mock 支付** → 商户更新订单状态。

**范围锁定**：仅堂食桌台扫码。不含外卖、会员、优惠券、多门店、后厨小票机。

## 快速开始（Docker）

```bash
cp .env.example .env
docker compose up --build
```

打开：

- 顾客 / 首页：http://localhost:3000
- 商户后台：http://localhost:3000/admin
- 健康检查：http://localhost:3000/health

同一应用提供顾客端与 `/admin` 商户端（端口 **3000**）。

## 本地开发（无 Docker）

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

## 演示账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 商户 | `merchant` | `demo1234` |

可通过环境变量 `MERCHANT_USERNAME` / `MERCHANT_PASSWORD` 修改。

Seed 会创建若干桌台与菜品。首页会列出可点的桌台深链；也可在 **商户后台 → 桌台二维码** 查看 `/t/:tableId` 与二维码图。

## Happy path（演示步骤）

1. 打开首页，点击某桌台深链（或扫后台二维码）进入 `/t/:tableId`
2. 加购菜品 → 选择 **微信支付** 或 **支付宝** → **下单并支付**
3. Mock 支付成功后订单变为 **已支付**，进入订单状态页
4. 商户登录 `/admin` → **订单** → 筛选「已支付」→ **开始制作** → **完成**
5. 顾客订单页会轮询刷新状态（待支付 / 已支付 / 制作中 / 已完成）

### 支付失败演示

```bash
PAYMENT_FORCE_FAIL=true docker compose up --build
# 或本地：PAYMENT_FORCE_FAIL=true npm run dev
```

发起支付会失败，订单 **保持「待支付」**，不会推进状态。在订单页可再次 Mock 支付（将 `PAYMENT_FORCE_FAIL` 改回 `false` 后重试）。

## 订单状态机

```
pending_pay → paid → preparing → done
cancelled 仅可从 pending_pay 或 paid
```

- 支付失败：**不推进**，仍为 `pending_pay`
- 非法流转由 API 拒绝

中文展示：待支付 → 已支付 → 制作中 → 已完成；已取消。

## 数据模型（锁定）

- **桌台** `tableId` / 桌号 / QR（深链）
- **菜品** `itemId` / 名称 / 价格（分） / 是否上架
- **订单** `orderId` / `tableId` / 明细（item+qty+unitPrice） / total / `payChannel`（wechat|alipay） / status

## 支付适配器

`src/lib/payments/` 提供干净接口：

- `WechatMockProvider` / `AlipayMockProvider`
- 密钥走环境变量：`WECHAT_PAY_MOCK_KEY`、`ALIPAY_MOCK_KEY`

### 接入真实密钥（后续）

1. 在 `.env` 填写微信/支付宝商户参数（见 `.env.example` 注释）
2. 实现真实 `PaymentProvider`（签名、下单、回调验签）
3. 在 `src/lib/payments/index.ts` 替换 mock 实现
4. 配置异步通知 URL，在回调成功后再将订单从 `pending_pay` → `paid`

## 端口与健康检查

| 项目 | 值 |
|------|-----|
| 应用端口 | `3000` |
| 顾客端 | `http://localhost:3000/t/:tableId` |
| 商户端 | `http://localhost:3000/admin` |
| Health | `GET /health` → `{ "status": "ok" }` |

## 技术栈

- Next.js（App Router）+ TypeScript + Tailwind
- Prisma + SQLite（单容器即可演示）
- Docker Compose 一键启动

## 已知限制

- Mock 支付同步成功/失败，无真实异步回调
- 二维码图依赖公共 QR API（演示用）；生产可改为本地生成
- SQLite 适合单机演示，多实例请换 PostgreSQL
- 商户鉴权为演示级 Cookie Session（非 SSO）
