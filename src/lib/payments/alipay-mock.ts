import type { PaymentProvider, PayRequest, PayResult } from "./types";

/** 支付宝 Mock / 沙箱适配器。接入真实商户密钥时替换本实现即可。 */
export class AlipayMockProvider implements PaymentProvider {
  channel = "alipay" as const;

  async pay(req: PayRequest): Promise<PayResult> {
    const key = process.env.ALIPAY_MOCK_KEY || "alipay-mock-key";
    if (!key) {
      return { ok: false, channel: "alipay", error: "未配置 ALIPAY_MOCK_KEY" };
    }
    if (process.env.PAYMENT_FORCE_FAIL === "true") {
      return { ok: false, channel: "alipay", error: "支付宝支付失败（模拟）" };
    }
    await new Promise((r) => setTimeout(r, 300));
    return {
      ok: true,
      channel: "alipay",
      transactionId: `ALI_MOCK_${req.orderId}_${Date.now()}`,
    };
  }
}
