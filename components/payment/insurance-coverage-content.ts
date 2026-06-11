import type { StaticImageData } from "next/image";

import tpCoverIcon from "@/assets/TP cover.svg";
import zdCoverIcon from "@/assets/ZD cover.svg";

export type InsuranceCoverageItem = {
  iconSrc: StaticImageData;
  durationLabel: string;
  planTitle: string;
  description: string;
};

/** Coverage rows — Figma Insurance coverage (2585:68086). */
export const INSURANCE_COVERAGE_ITEMS: readonly InsuranceCoverageItem[] = [
  {
    iconSrc: zdCoverIcon,
    durationLabel: "1-year ",
    planTitle: "Zero depreciation (Bumper to bumper) Cover",
    description:
      "Covers theft and damage caused to your car by accidents, natural calamities and fire. It also pays 100% of the cost of replaced parts during a claim.",
  },
  {
    iconSrc: tpCoverIcon,
    durationLabel: "3-year ",
    planTitle: "Third Party Cover",
    description: "Covers damage caused by your car to others and their property.",
  },
] as const;

export const INSURANCE_COVERAGE_SHEET_TITLE = "ACKO Drive Shield — your new car's cover";

/** Shivi's framing at the top of the sheet — she sells the contract, not the card. */
export const INSURANCE_SHEET_SHIVI_LINE =
  "Before you pay, here's exactly what you're buying — Shield only exists here, so let me walk you through it.";

/* ------------------------------------------------------------------------ */
/* IDV — the single biggest price justification                              */
/* ------------------------------------------------------------------------ */

/** Full ex-showroom IDV — zero new-car haircut (pricing-team commitment #1). */
export const INSURANCE_IDV_INR = 9_54_900;
/** Return-to-invoice payout on total loss — full on-road price. */
export const INSURANCE_RTI_PAYOUT_INR = 13_73_780;

export const INSURANCE_IDV_TITLE = "Covered for the full ex-showroom value";
export const INSURANCE_IDV_BODY =
  "Your IDV is ₹9,54,900 — no new-car haircut. And with Return to Invoice, a total loss or theft pays your full on-road price of ₹13,73,780, registration and all.";

/* ------------------------------------------------------------------------ */
/* Add-ons included (no extra charge) — justification #2                     */
/* ------------------------------------------------------------------------ */

export const INSURANCE_INCLUDED_ADDONS = [
  { title: "Return to Invoice", detail: "Total loss pays the on-road price, not the depreciated value" },
  { title: "Engine & gearbox protect", detail: "Water ingress and oil-leak damage — usually excluded" },
  { title: "Consumables cover", detail: "Oils, nuts, bolts and fluids paid in full during claims" },
  { title: "24×7 roadside assistance", detail: "Towing, jumpstart, flat tyre — anywhere in India" },
  { title: "Key & lock replacement", detail: "Lost or stolen keys replaced without a claim hit" },
] as const;

/* ------------------------------------------------------------------------ */
/* The acko.com comparison — preempt the other-tab check                     */
/* ------------------------------------------------------------------------ */

export const INSURANCE_COMPARE_TITLE = "Checking acko.com? Fair — here's the honest math.";
export const INSURANCE_COMPARE_BODY =
  "You won't find Shield on acko.com — it's exclusive to cars bought on ACKO Drive. The website's default quote runs a 5% lower IDV with none of the add-ons above; building the closest match yourself costs more than Shield.";

export type InsuranceCompareRow = {
  label: string;
  idvLabel: string;
  addonsLabel: string;
  priceLabel: string;
  highlight?: boolean;
};

export const INSURANCE_COMPARE_ROWS: readonly InsuranceCompareRow[] = [
  {
    label: "ACKO Drive Shield (only here)",
    idvLabel: "₹9,54,900 IDV",
    addonsLabel: "5 add-ons included",
    priceLabel: "₹37,000",
    highlight: true,
  },
  {
    label: "acko.com default quote",
    idvLabel: "₹9,07,155 IDV",
    addonsLabel: "No add-ons",
    priceLabel: "₹29,800",
  },
  {
    label: "acko.com, built piece by piece",
    idvLabel: "₹9,54,900 IDV",
    addonsLabel: "Same 5 add-ons",
    priceLabel: "₹37,450",
  },
] as const;

/** Pricing-team commitment — the line that ends the support call before it starts. */
export const INSURANCE_PRICE_PROMISE =
  "If you find this exact cover for less on acko.com, I'll refund the difference.";
