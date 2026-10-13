export const deliveryExpired = (createdAt: Date, now: Date) => +now - +createdAt >= 86400000;
export const deliveryRetryAt = (attemptsBeforeClaim: number, now: Date) =>
  new Date(+now + [60000, 300000, 1800000][Math.min(attemptsBeforeClaim, 2)]!);
