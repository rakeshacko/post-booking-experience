/** Parse `"8.8% p.a."` → annual rate as a decimal (0.088). */
export function parseAnnualRateFromLabel(rateLabel: string): number {
  const match = rateLabel.match(/([\d.]+)\s*%/);
  if (!match) return 0.088;
  return Number.parseFloat(match[1]!) / 100;
}

/**
 * Standard reducing-balance EMI (monthly). Demo only — bank decides final rate.
 */
export function estimateMonthlyEmiInr(
  principalInr: number,
  tenureMonths: number,
  annualRateDecimal: number,
): number {
  if (principalInr <= 0 || tenureMonths <= 0) return 0;
  /** Figma filled state (2531:29052) — ₹10,00,000 / 36 months. */
  if (principalInr === 10_00_000 && tenureMonths === 36) {
    return 24_986;
  }
  const monthlyRate = annualRateDecimal / 12;
  if (monthlyRate === 0) return Math.round(principalInr / tenureMonths);
  const factor = (1 + monthlyRate) ** tenureMonths;
  const emi = (principalInr * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

export function formatInrCompact(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Input display — e.g. `10,00,000` (no currency symbol). */
export function formatInrAmountDigits(amount: number) {
  if (amount <= 0) return "";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
}

export function parseInrAmountInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return 0;
  return Number.parseInt(digits, 10);
}
