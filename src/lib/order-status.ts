export const ORDER_STATUSES = [
  "pending_pay",
  "paid",
  "preparing",
  "done",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_pay: "待支付",
  paid: "已支付",
  preparing: "制作中",
  done: "已完成",
  cancelled: "已取消",
};

/** 合法状态流转；支付失败不推进，保持 pending_pay */
const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  pending_pay: ["paid", "cancelled"],
  paid: ["preparing", "cancelled"],
  preparing: ["done"],
  done: [],
  cancelled: [],
};

export function canTransition(from: string, to: string): boolean {
  if (!ORDER_STATUSES.includes(from as OrderStatus)) return false;
  if (!ORDER_STATUSES.includes(to as OrderStatus)) return false;
  return ALLOWED[from as OrderStatus].includes(to as OrderStatus);
}

export function assertTransition(from: string, to: string): void {
  if (!canTransition(from, to)) {
    throw new Error(`非法状态流转：${STATUS_LABEL[from as OrderStatus] ?? from} → ${STATUS_LABEL[to as OrderStatus] ?? to}`);
  }
}
