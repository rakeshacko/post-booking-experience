import type { KycDocumentKind, KycUploadSource } from "@/components/kyc/kyc-upload-content";

export type KycUploadedFile = {
  id: string;
  name: string;
  source: KycUploadSource;
};

export type KycUploadsState = Record<KycDocumentKind, KycUploadedFile[]>;

export type StoredKycUploadState = {
  uploads: KycUploadsState;
  mockUploadCounter: number;
};

const STORAGE_KEY = "pbe_kyc_upload_state_v1";

const KYC_DOCUMENT_KINDS: KycDocumentKind[] = ["aadhaar", "pan"];
const KYC_UPLOAD_SOURCES: KycUploadSource[] = ["camera", "gallery", "file", "digilocker"];

export function createEmptyKycUploads(): KycUploadsState {
  return { aadhaar: [], pan: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isKycUploadSource(value: unknown): value is KycUploadSource {
  return typeof value === "string" && KYC_UPLOAD_SOURCES.includes(value as KycUploadSource);
}

function isUploadedFile(value: unknown): value is KycUploadedFile {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isKycUploadSource(value.source)
  );
}

function isUploadsState(value: unknown): value is KycUploadsState {
  if (!isRecord(value)) return false;
  return KYC_DOCUMENT_KINDS.every(
    (kind) => Array.isArray(value[kind]) && value[kind].every(isUploadedFile),
  );
}

function parseStoredState(raw: string): StoredKycUploadState | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || !isUploadsState(parsed.uploads)) return null;

    const mockUploadCounter = Number(parsed.mockUploadCounter);
    if (!Number.isFinite(mockUploadCounter) || mockUploadCounter < 0) return null;

    return {
      uploads: parsed.uploads,
      mockUploadCounter: Math.floor(mockUploadCounter),
    };
  } catch {
    return null;
  }
}

export function readKycUploadState(): StoredKycUploadState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseStoredState(raw);
  } catch {
    return null;
  }
}

export function writeKycUploadState(state: StoredKycUploadState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}
