import { BANK_SHEET_OPTIONS } from "@/components/payment/payment-choose-assets";

export function bankForQueryParam(bankId: string | null) {
  if (!bankId) return BANK_SHEET_OPTIONS[0];
  const found = BANK_SHEET_OPTIONS.find((b) => b.id === bankId);
  return found ?? BANK_SHEET_OPTIONS[0];
}

export function ackoDriveFinanceActionPath(bankId: string) {
  return `/payment/acko-drive-finance-action?bank=${encodeURIComponent(bankId)}`;
}

/** @deprecated Use {@link loanApplicationDocumentsPath} — kept for legacy links. */
export function loanDocumentsUploadPath(bankId: string) {
  return loanApplicationDocumentsPath(bankId);
}

export function loanApplicationDocumentsPath(bankId: string) {
  return `/payment/loan-application/documents?bank=${encodeURIComponent(bankId)}`;
}
