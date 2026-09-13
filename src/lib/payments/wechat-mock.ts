import type { PaymentProvider, PayRequest, PayResult } from "./types";

/** 微信支付 Mock / 沙箱适配器。接入真实商户密钥时替换本实现即可。 */
export class WechatMockProvider implements PaymentProvider {
  channel = "wechat" as const;

  async pay(req: PayRequest): Promise<PayResult> {
    const key = process.env.WECHAT_PAY_MOCK_KEY || "wechat-mock-key";
    if (!key) {
      return { ok: false, channel: "wechat", error: "未配置 WECHAT_PAY_MOCK_KEY" };
    }
    if (process.env.PAYMENT_FORCE_FAIL === "true") {
      return { ok: false, channel: "wechat", error: "微信支付失败（模拟）" };
    }
    await new Promise((r) => setTimeout(r, 300));
    return {
      ok: true,
      channel: "wechat",
      transactionId: `WX_MOCK_${req.orderId}_${Date.now()}`,
    };
  }
}
