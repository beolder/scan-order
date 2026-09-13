export type PayChannel = "wechat" | "alipay";

export type PayRequest = {
  orderId: string;
  amountFen: number;
  channel: PayChannel;
  description: string;
};

export type PayResult =
  | { ok: true; channel: PayChannel; transactionId: string }
  | { ok: false; channel: PayChannel; error: string };

export interface PaymentProvider {
  channel: PayChannel;
  pay(req: PayRequest): Promise<PayResult>;
}
