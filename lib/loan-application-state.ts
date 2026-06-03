import type { LoanApplicationEmploymentType } from "@/lib/loan-application-content";
import {
  createEmptyLoanApplicationDocuments,
  isLoanApplicationDocumentsState,
  type LoanApplicationDocumentsState,
} from "@/lib/loan-application-documents-state";

export type LoanApplicationAddressFields = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export type LoanApplicationOfficialAddress = {
  pincode: string;
  city: string;
  state: string;
  address: string;
};

export type LoanApplicationWorkDetails = {
  officialEmail: string;
  employerName: string;
  officialAddress: LoanApplicationOfficialAddress;
};

export function emptyOfficialAddress(): LoanApplicationOfficialAddress {
  return { pincode: "", city: "", state: "", address: "" };
}

export type LoanApplicationReference = {
  fullName: string;
  phone: string;
  address: string;
};

export type LoanApplicationState = {
  loanDetails: {
    loanAmountInr: number;
    tenureMonths: number;
    employmentType: LoanApplicationEmploymentType | null;
  };
  personal: {
    email: string;
    motherName: string;
    spouseName: string;
    work: LoanApplicationWorkDetails;
  };
  address: {
    permanent: LoanApplicationAddressFields;
    current: LoanApplicationAddressFields;
    currentSameAsPermanent: boolean;
  };
  documents: LoanApplicationDocumentsState;
  references: [LoanApplicationReference, LoanApplicationReference];
};

const STORAGE_KEY = "pbe_loan_application_state_v1";

export function emptyAddress(): LoanApplicationAddressFields {
  return { line1: "", line2: "", city: "", state: "", pincode: "" };
}

export function emptyReference(): LoanApplicationReference {
  return { fullName: "", phone: "", address: "" };
}

export function createDefaultLoanApplicationState(): LoanApplicationState {
  return {
    loanDetails: {
      loanAmountInr: 0,
      tenureMonths: 0,
      employmentType: null,
    },
    personal: {
      email: "",
      motherName: "",
      spouseName: "",
      work: {
        officialEmail: "",
        employerName: "",
        officialAddress: emptyOfficialAddress(),
      },
    },
    address: {
      permanent: emptyAddress(),
      current: emptyAddress(),
      currentSameAsPermanent: false,
    },
    documents: createEmptyLoanApplicationDocuments(),
    references: [emptyReference(), emptyReference()],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAddress(value: unknown): value is LoanApplicationAddressFields {
  if (!isRecord(value)) return false;
  return (
    typeof value.line1 === "string" &&
    typeof value.line2 === "string" &&
    typeof value.city === "string" &&
    typeof value.state === "string" &&
    typeof value.pincode === "string"
  );
}

function isReference(value: unknown): value is LoanApplicationReference {
  if (!isRecord(value)) return false;
  return (
    typeof value.fullName === "string" &&
    typeof value.phone === "string" &&
    (typeof value.address === "string" || typeof value.relationship === "string")
  );
}

function normalizeReference(value: unknown): LoanApplicationReference {
  if (!isRecord(value)) return emptyReference();
  return {
    fullName: typeof value.fullName === "string" ? value.fullName : "",
    phone: typeof value.phone === "string" ? value.phone : "",
    address:
      typeof value.address === "string"
        ? value.address
        : typeof value.relationship === "string"
          ? value.relationship
          : "",
  };
}

function parseState(raw: string): LoanApplicationState | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;
    const defaults = createDefaultLoanApplicationState();
    const loanDetails = isRecord(parsed.loanDetails) ? parsed.loanDetails : {};
    const personal = isRecord(parsed.personal) ? parsed.personal : {};
    const work = isRecord(personal.work) ? personal.work : {};
    const address = isRecord(parsed.address) ? parsed.address : {};
    const refs = Array.isArray(parsed.references) ? parsed.references : [];

    return {
      loanDetails: {
        loanAmountInr:
          typeof loanDetails.loanAmountInr === "number"
            ? loanDetails.loanAmountInr
            : defaults.loanDetails.loanAmountInr,
        tenureMonths:
          typeof loanDetails.tenureMonths === "number"
            ? loanDetails.tenureMonths
            : defaults.loanDetails.tenureMonths,
        employmentType:
          loanDetails.employmentType === "salaried" ||
          loanDetails.employmentType === "self_employed"
            ? loanDetails.employmentType
            : defaults.loanDetails.employmentType,
      },
      personal: {
        email: typeof personal.email === "string" ? personal.email : "",
        motherName: typeof personal.motherName === "string" ? personal.motherName : "",
        spouseName: typeof personal.spouseName === "string" ? personal.spouseName : "",
        work: (() => {
          const officialAddr = isRecord(work.officialAddress) ? work.officialAddress : {};
          const legacyWorkAddress =
            typeof work.workAddress === "string" ? work.workAddress : "";
          return {
            officialEmail:
              typeof work.officialEmail === "string" ? work.officialEmail : "",
            employerName:
              typeof work.employerName === "string" ? work.employerName : "",
            officialAddress: {
              pincode:
                typeof officialAddr.pincode === "string" ? officialAddr.pincode : "",
              city: typeof officialAddr.city === "string" ? officialAddr.city : "",
              state: typeof officialAddr.state === "string" ? officialAddr.state : "",
              address:
                typeof officialAddr.address === "string"
                  ? officialAddr.address
                  : legacyWorkAddress,
            },
          };
        })(),
      },
      address: {
        permanent: isAddress(address.permanent) ? address.permanent : emptyAddress(),
        current: isAddress(address.current) ? address.current : emptyAddress(),
        currentSameAsPermanent:
          typeof address.currentSameAsPermanent === "boolean"
            ? address.currentSameAsPermanent
            : false,
      },
      documents: isLoanApplicationDocumentsState(parsed.documents)
        ? parsed.documents
        : createEmptyLoanApplicationDocuments(),
      references: [
        isReference(refs[0]) ? normalizeReference(refs[0]) : emptyReference(),
        isReference(refs[1]) ? normalizeReference(refs[1]) : emptyReference(),
      ],
    };
  } catch {
    return null;
  }
}

export function readLoanApplicationState(): LoanApplicationState {
  if (typeof window === "undefined") return createDefaultLoanApplicationState();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultLoanApplicationState();
    return parseState(raw) ?? createDefaultLoanApplicationState();
  } catch {
    return createDefaultLoanApplicationState();
  }
}

export function writeLoanApplicationState(state: LoanApplicationState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/** Clears wizard session — use when starting a new application from finance action. */
export function resetLoanApplicationState(): LoanApplicationState {
  const next = createDefaultLoanApplicationState();
  writeLoanApplicationState(next);
  return next;
}

export function patchLoanApplicationState(
  patch: Partial<LoanApplicationState>,
): LoanApplicationState {
  const current = readLoanApplicationState();
  const next: LoanApplicationState = {
    ...current,
    ...patch,
    loanDetails: { ...current.loanDetails, ...patch.loanDetails },
    personal: {
      ...current.personal,
      ...patch.personal,
      work: {
        ...current.personal.work,
        ...patch.personal?.work,
        officialAddress: {
          ...current.personal.work.officialAddress,
          ...patch.personal?.work?.officialAddress,
        },
      },
    },
    address: {
      ...current.address,
      ...patch.address,
      permanent: { ...current.address.permanent, ...patch.address?.permanent },
      current: { ...current.address.current, ...patch.address?.current },
    },
    references: patch.references ?? current.references,
    documents: patch.documents ?? current.documents,
  };
  writeLoanApplicationState(next);
  return next;
}
