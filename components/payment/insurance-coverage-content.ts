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

export const INSURANCE_COVERAGE_SHEET_TITLE = "ACKO insurance for your new car";
