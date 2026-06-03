/** Product experience variants — not individual screen routes within a journey. */
export type ExperienceFlow = "express" | "standard" | "kyc_failed";

export const EXPERIENCE_FLOW_STORAGE_KEY = "post-booking-experience-flow";

export type ExperienceFlowDefinition = {
  id: ExperienceFlow;
  label: string;
  description: string;
  /** Entry route when this flow is selected. */
  entryPath: string;
  /** Shown in quote flow menu when true. */
  available: boolean;
};

export const EXPERIENCE_FLOWS: readonly ExperienceFlowDefinition[] = [
  {
    id: "express",
    label: "Express delivery",
    description: "Express timeline — payment, KYC, car allocation, and finance paths",
    entryPath: "/quote",
    available: true,
  },
  {
    id: "standard",
    label: "Standard delivery",
    description: "Standard timeline — same routes as express; flow-specific copy via readExperienceFlow()",
    entryPath: "/quote",
    available: true,
  },
  {
    id: "kyc_failed",
    label: "Verification failed",
    description: "Same journey until verification in progress, then verification fails",
    entryPath: "/quote",
    available: true,
  },
] as const;

export const DEFAULT_EXPERIENCE_FLOW: ExperienceFlow = "express";

export function isExperienceFlow(value: string | null | undefined): value is ExperienceFlow {
  return value === "express" || value === "standard" || value === "kyc_failed";
}

export function readExperienceFlow(): ExperienceFlow {
  if (typeof window === "undefined") return DEFAULT_EXPERIENCE_FLOW;
  try {
    const stored = sessionStorage.getItem(EXPERIENCE_FLOW_STORAGE_KEY);
    return isExperienceFlow(stored) ? stored : DEFAULT_EXPERIENCE_FLOW;
  } catch {
    return DEFAULT_EXPERIENCE_FLOW;
  }
}

export function writeExperienceFlow(flow: ExperienceFlow): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(EXPERIENCE_FLOW_STORAGE_KEY, flow);
  } catch {
    /* ignore quota / private mode */
  }
}

export function getExperienceFlowDefinition(flow: ExperienceFlow): ExperienceFlowDefinition {
  const found = EXPERIENCE_FLOWS.find((item) => item.id === flow);
  return found ?? EXPERIENCE_FLOWS[0];
}
