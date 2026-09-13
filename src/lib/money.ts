/** 价格以「分」存储，展示为「元」 */
export function fenToYuan(fen: number): string {
  return (fen / 100).toFixed(2);
}

export function yuanToFen(yuan: number): number {
  return Math.round(yuan * 100);
}

export function formatYuan(fen: number): string {
  return `¥${fenToYuan(fen)}`;
}
