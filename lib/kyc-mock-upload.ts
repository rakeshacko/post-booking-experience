import {
  KYC_MOCK_UPLOAD_NAMES,
  type KycDocumentKind,
  type KycUploadSource,
} from "@/components/kyc/kyc-upload-content";
import type { KycUploadedFile, KycUploadsState } from "@/lib/kyc-upload-state";

function nextMockFilename(uploadIndex: number): string {
  return KYC_MOCK_UPLOAD_NAMES[uploadIndex % KYC_MOCK_UPLOAD_NAMES.length];
}

function createMockFile(
  kind: KycDocumentKind,
  source: KycUploadSource,
  mockUploadCounterRef: { current: number },
): KycUploadedFile {
  const uploadIndex = mockUploadCounterRef.current;
  mockUploadCounterRef.current += 1;

  return {
    id: `${kind}-${source}-${uploadIndex}-${Date.now()}`,
    name:
      source === "digilocker"
        ? `${kind === "aadhaar" ? "Aadhaar" : "PAN"} · DigiLocker.pdf`
        : nextMockFilename(uploadIndex),
    source,
  };
}

export function appendKycMockUpload(
  uploads: KycUploadsState,
  kind: KycDocumentKind,
  source: KycUploadSource,
  mockUploadCounterRef: { current: number },
): KycUploadsState {
  const newFile = createMockFile(kind, source, mockUploadCounterRef);

  return {
    ...uploads,
    [kind]: kind === "pan" ? [newFile] : [...uploads[kind], newFile],
  };
}

/** Demo shortcut: DigiLocker fetches both PAN and Aadhaar in one action. */
export function appendKycDigilockerPanAadhaarUploads(
  uploads: KycUploadsState,
  mockUploadCounterRef: { current: number },
): KycUploadsState {
  const aadhaarFile = createMockFile("aadhaar", "digilocker", mockUploadCounterRef);
  const panFile = createMockFile("pan", "digilocker", mockUploadCounterRef);

  return {
    ...uploads,
    aadhaar: [...uploads.aadhaar, aadhaarFile],
    pan: [panFile],
  };
}
