/** Main milestones shown in the horizontal rail (4 steps). */
export const LOAN_APPLICATION_MILESTONES = [
  { id: "loan_details", label: "Loan details" },
  { id: "personal", label: "Personal details" },
  { id: "documents", label: "Documents" },
  { id: "references", label: "Reference" },
] as const;

export type LoanApplicationMilestoneId = (typeof LOAN_APPLICATION_MILESTONES)[number]["id"];

/** Routable screens within the wizard (personal has 2 substeps). */
export const LOAN_APPLICATION_ROUTES = [
  "loan-details",
  "personal",
  "address",
  "documents",
  "references",
] as const;

export type LoanApplicationRoute = (typeof LOAN_APPLICATION_ROUTES)[number];

export function isLoanApplicationRoute(value: string): value is LoanApplicationRoute {
  return (LOAN_APPLICATION_ROUTES as readonly string[]).includes(value);
}

export function routeToMilestone(route: LoanApplicationRoute): LoanApplicationMilestoneId {
  if (route === "loan-details") return "loan_details";
  if (route === "personal" || route === "address") return "personal";
  if (route === "documents") return "documents";
  return "references";
}

export const LOAN_APPLICATION_TENURE_OPTIONS = [12, 24, 36, 48, 60, 84] as const;

export type LoanApplicationEmploymentType = "salaried" | "self_employed";
