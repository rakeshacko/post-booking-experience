/**
 * The AckoDrive-financed purchase runs through a fixed sequence of stages, some
 * the bank's, some the customer's. The bank's steps are otherwise invisible, so
 * the app surfaces the whole sequence as a live status — the customer always
 * knows the current stage and whether anything is needed from them.
 *
 * Rule: never show a stage as done without its underlying confirmation — e.g.
 * disbursement only reads "done" once a transfer reference exists.
 */

export type FinanceStageId =
  | "application"
  | "review"
  | "confirmation"
  | "verification"
  | "agreement"
  | "downPayment"
  | "disbursement"
  | "delivery";

export type FinanceStageState = "done" | "waiting_you" | "waiting_bank" | "upcoming";

export type FinanceStageDef = {
  id: FinanceStageId;
  label: string;
  /** true when the customer is the actor at this stage. */
  you: boolean;
  /** Shown as the call-to-action when this stage is "waiting on you". */
  action?: string;
};

export const FINANCE_STAGES: readonly FinanceStageDef[] = [
  { id: "application", label: "Loan application submitted", you: false },
  { id: "review", label: "Bank review & approval", you: false },
  {
    id: "confirmation",
    label: "Confirm your loan amount",
    you: true,
    action: "Confirm the amount & down payment",
  },
  { id: "verification", label: "Bank verification", you: false },
  { id: "agreement", label: "Sign the agreement", you: true, action: "Sign digitally" },
  { id: "downPayment", label: "Pay the down payment", you: true, action: "Pay your down payment" },
  { id: "disbursement", label: "Bank disburses the loan", you: false },
  { id: "delivery", label: "Allocation & delivery", you: false },
];

export type FinanceStage = FinanceStageDef & { state: FinanceStageState };

/**
 * Resolve every stage's state given the current stage. Past = done, current =
 * waiting on whoever acts here, future = upcoming.
 */
export function resolveFinanceStages(currentId: FinanceStageId): FinanceStage[] {
  const idx = FINANCE_STAGES.findIndex((s) => s.id === currentId);
  return FINANCE_STAGES.map((s, i) => {
    const state: FinanceStageState =
      i < idx ? "done" : i === idx ? (s.you ? "waiting_you" : "waiting_bank") : "upcoming";
    return { ...s, state };
  });
}
