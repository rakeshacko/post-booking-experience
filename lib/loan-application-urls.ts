import type { LoanApplicationRoute } from "@/lib/loan-application-content";
import { ackoDriveFinanceActionPath } from "@/components/payment/acko-drive-finance-bank";

export const LOAN_APPLICATION_ENTRY_ROUTE: LoanApplicationRoute = "loan-details";

function withBank(route: LoanApplicationRoute, bankId: string) {
  return `/payment/loan-application/${route}?bank=${encodeURIComponent(bankId)}`;
}

export function loanApplicationPath(bankId: string, route: LoanApplicationRoute) {
  return withBank(route, bankId);
}

export function loanApplicationEntryPath(bankId: string, options?: { fresh?: boolean }) {
  const path = loanApplicationPath(bankId, LOAN_APPLICATION_ENTRY_ROUTE);
  if (options?.fresh) {
    return `${path}&fresh=1`;
  }
  return path;
}

const ROUTE_ORDER: LoanApplicationRoute[] = [
  "loan-details",
  "personal",
  "address",
  "documents",
  "references",
];

export function loanApplicationNextPath(
  bankId: string,
  current: LoanApplicationRoute,
): string {
  const index = ROUTE_ORDER.indexOf(current);
  if (index < 0 || index >= ROUTE_ORDER.length - 1) {
    return loanProcessingPath(bankId);
  }
  return loanApplicationPath(bankId, ROUTE_ORDER[index + 1]!);
}

export function loanApplicationPrevPath(
  bankId: string,
  current: LoanApplicationRoute,
): string | null {
  const index = ROUTE_ORDER.indexOf(current);
  if (index <= 0) {
    return ackoDriveFinanceActionPath(bankId);
  }
  return loanApplicationPath(bankId, ROUTE_ORDER[index - 1]!);
}

export function loanProcessingPath(bankId: string) {
  return `/payment/loan-processing?bank=${encodeURIComponent(bankId)}`;
}

export function loanApplicationSubmittedPath(bankId: string) {
  return `/payment/loan-application/submitted?bank=${encodeURIComponent(bankId)}`;
}
