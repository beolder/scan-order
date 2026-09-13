import type { PayChannel, PaymentProvider, PayRequest, PayResult } from "./types";
import { WechatMockProvider } from "./wechat-mock";
import { AlipayMockProvider } from "./alipay-mock";

const providers: Record<PayChannel, PaymentProvider> = {
  wechat: new WechatMockProvider(),
  alipay: new AlipayMockProvider(),
};

export function getPaymentProvider(channel: PayChannel): PaymentProvider {
  const p = providers[channel];
  if (!p) throw new Error(`不支持的支付渠道：${channel}`);
  return p;
}

export async function charge(req: PayRequest): Promise<PayResult> {
  return getPaymentProvider(req.channel).pay(req);
}

export type { PayChannel, PayRequest, PayResult, PaymentProvider };
