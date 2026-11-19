export const LIMITS = { userDaily: 5, siteDaily: 60, userSearchDaily: 1, siteSearchDaily: 25, searchMonthly: 900, tokensDaily: 180000, tokensMinute: 7500, ipDaily: 15, cooldownSeconds: 20 } as const;
export class QuotaError extends Error {
  retryAfter: number;
  constructor(message: string, retryAfter = 60) { super(message); this.retryAfter = retryAfter; }
}
