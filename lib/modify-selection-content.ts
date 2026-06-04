import changeCarIcon from "@/assets/Change car.svg";
import type { StaticImageData } from "next/image";

import {
  isModifyNoChargesFlow,
  isModifyWithChargesFlow,
  readExperienceFlow,
  type ExperienceFlow,
} from "@/lib/experience-flow";
import { MODIFY_BOOKING_CHANGE_FEE_INR } from "@/lib/manage-booking-modify";

export const MODIFY_SELECTION_PATH = "/kyc/modify-selection";

export const MODIFY_SELECTION_TITLE = "What would you like to change, Sharath?";

export const MODIFY_SELECTION_SUBLINE_NO_CHARGES =
  "No change fee applies. Your current booking stays active while you make changes.";

export const MODIFY_SELECTION_SUBLINE_WITH_CHARGES =
  "A booking change fee of ₹5,000 applies. Your current booking stays active while you make changes.";

/** @deprecated Use {@link resolveModifySelectionSubline}. */
export const MODIFY_SELECTION_SUBLINE = MODIFY_SELECTION_SUBLINE_NO_CHARGES;

export function resolveModifySelectionSubline(flow?: ExperienceFlow): string {
  const active = flow ?? readExperienceFlow();
  if (isModifyWithChargesFlow(active)) {
    return MODIFY_SELECTION_SUBLINE_WITH_CHARGES;
  }
  if (isModifyNoChargesFlow(active)) {
    return MODIFY_SELECTION_SUBLINE_NO_CHARGES;
  }
  return MODIFY_SELECTION_SUBLINE_NO_CHARGES;
}

const MODIFY_SELECTION_CONFIRM_CHANGE_FEE_BULLET = `A booking change fee of ₹${MODIFY_BOOKING_CHANGE_FEE_INR.toLocaleString("en-IN")} is applicable for this change.`;

/** Confirm-sheet bullets — includes change-fee point in the modify-with-charges flow. */
export function resolveModifySelectionConfirmPoints(
  choiceId: ModifySelectionChoiceId,
  flow?: ExperienceFlow,
): readonly string[] {
  const option = MODIFY_SELECTION_OPTIONS.find((o) => o.id === choiceId);
  if (option == null) return [];

  const active = flow ?? readExperienceFlow();
  if (!isModifyWithChargesFlow(active)) {
    return option.confirmPoints;
  }

  return [MODIFY_SELECTION_CONFIRM_CHANGE_FEE_BULLET, ...option.confirmPoints];
}

/** Section label above booked-car summary on colour / variant pickers. */
export const MODIFY_SELECTION_CURRENT_SELECTION_HEADING = "Current selection";

export type ModifySelectionChoiceId = "colour" | "variant" | "different_car";

export type ModifySelectionOption = {
  id: ModifySelectionChoiceId;
  title: string;
  description: string;
  illustrationSrc: StaticImageData | string;
  /** Primary CTA on `/kyc/modify-selection` when this option is selected. */
  continueCtaLabel: string;
  continuePath: string;
  confirmHeader: string;
  /** Bullet points in confirm bottom sheet (grey container + tick icons). */
  confirmPoints: readonly string[];
};

export const MODIFY_SELECTION_OPTIONS: readonly ModifySelectionOption[] = [
  {
    id: "colour",
    title: "Change colour",
    description:
      "Pick a different colour for your Creta. Price may vary by colour.",
    illustrationSrc: changeCarIcon,
    continueCtaLabel: "See available colours",
    continuePath: "/kyc/modify-selection/colour",
    confirmHeader: "Before you change the colour",
    confirmPoints: [
      "Your ₹10,000 booking amount carries forward to your new colour selection.",
      "Delivery date will be updated based on the availability of your chosen colour.",
    ],
  },
  {
    id: "variant",
    title: "Change variant",
    description:
      "Upgrade or switch to another Creta variant. Price will be updated based on your new choice.",
    illustrationSrc: changeCarIcon,
    continueCtaLabel: "See available variants",
    continuePath: "/kyc/modify-selection/variant",
    confirmHeader: "Before you change the variant",
    confirmPoints: [
      "Your ₹10,000 booking amount carries forward to your new variant selection.",
      "Price will be updated based on the variant you choose.",
      "Delivery date will be updated based on availability of your new variant.",
    ],
  },
  {
    id: "different_car",
    title: "Choose a different car",
    description:
      "Browse other models from Hyundai or explore cars from other brands.",
    illustrationSrc: changeCarIcon,
    continueCtaLabel: "Browse cars",
    continuePath: "/kyc/modify-selection/different-car",
    confirmHeader: "Before you choose a different car",
    confirmPoints: [
      "Your ₹10,000 booking amount carries forward to your new car selection.",
      "Price will be updated based on the car you choose.",
      "Delivery date will be updated based on availability of your new car.",
    ],
  },
] as const;

export function modifySelectionChoiceSlugToId(slug: string): ModifySelectionChoiceId | undefined {
  if (slug === "different-car") return "different_car";
  if (slug === "colour" || slug === "variant") return slug;
  return undefined;
}

export function modifySelectionChoiceLabel(choiceSlug: string): string | undefined {
  const id = modifySelectionChoiceSlugToId(choiceSlug);
  if (id == null) return undefined;
  return MODIFY_SELECTION_OPTIONS.find((o) => o.id === id)?.title;
}
