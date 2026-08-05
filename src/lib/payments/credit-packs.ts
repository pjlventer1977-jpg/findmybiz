import { LEAD_CREDIT_PACKS } from "@/constants/membership";

export function resolveLeadCreditPack(credits: unknown): {
  credits: number;
  price: number;
} | null {
  const n = Number(credits);
  if (!Number.isFinite(n) || n <= 0) return null;
  const pack = LEAD_CREDIT_PACKS.find((p) => p.credits === n);
  return pack ?? null;
}
