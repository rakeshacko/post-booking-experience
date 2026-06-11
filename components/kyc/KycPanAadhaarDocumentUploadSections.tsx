"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";

import {
  DOCUMENT_UPLOAD_TIPS_TO_SECTIONS_CLASS,
  DOCUMENT_UPLOAD_TITLE_TO_TIPS_CLASS,
  DocumentUploadInfoTipsCard,
} from "@/components/kyc/DocumentUploadInfoTipsCard";
import { DocumentUploadDocumentCards } from "@/components/kyc/DocumentUploadDocumentCards";
import { KycUploadSourceBottomSheet } from "@/components/kyc/KycUploadSourceBottomSheet";
import {
  KYC_UPLOAD_CARD_DEFINITIONS,
  KYC_UPLOAD_INFO_TIPS,
  type KycDocumentKind,
  type KycUploadSource,
} from "@/components/kyc/kyc-upload-content";
import {
  appendKycDigilockerPanAadhaarUploads,
  appendKycMockUpload,
} from "@/lib/kyc-mock-upload";
import type { KycUploadsState } from "@/lib/kyc-upload-state";

type KycPanAadhaarDocumentUploadSectionsProps = {
  uploads: KycUploadsState;
  onUploadsChange: (next: KycUploadsState) => void;
  /** Persists mock filename index with parent session state. */
  mockUploadCounterRef: React.MutableRefObject<number>;
  /** No internal top margins — for parents that already space blocks (concierge shell's gap). */
  flush?: boolean;
  wrapTips?: (node: ReactNode) => ReactNode;
  wrapCard?: (kind: string, card: ReactNode) => ReactNode;
};

/**
 * PAN + Aadhaar upload body — tips, DigiLocker fetch above Aadhaar, upload cards, source sheet.
 * Used by `/kyc/upload` and verification-failed re-upload (same route).
 */
export function KycPanAadhaarDocumentUploadSections({
  uploads,
  onUploadsChange,
  mockUploadCounterRef,
  flush = false,
  wrapTips,
  wrapCard,
}: KycPanAadhaarDocumentUploadSectionsProps) {
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState<KycDocumentKind | null>(null);

  const openSourceSheet = useCallback((kind: KycDocumentKind) => {
    setActiveDocument(kind);
    setSourceSheetOpen(true);
  }, []);

  const handleDigilockerFetchAll = useCallback(() => {
    onUploadsChange(
      appendKycDigilockerPanAadhaarUploads(uploads, mockUploadCounterRef),
    );
  }, [mockUploadCounterRef, onUploadsChange, uploads]);

  const handleMockUpload = useCallback(
    (source: KycUploadSource) => {
      if (source === "digilocker") {
        handleDigilockerFetchAll();
        return;
      }
      if (activeDocument == null) return;
      onUploadsChange(
        appendKycMockUpload(uploads, activeDocument, source, mockUploadCounterRef),
      );
    },
    [activeDocument, handleDigilockerFetchAll, mockUploadCounterRef, onUploadsChange, uploads],
  );

  const handleRemove = useCallback(
    (kind: string, fileId: string) => {
      if (kind !== "aadhaar" && kind !== "pan") return;
      onUploadsChange({
        ...uploads,
        [kind]: uploads[kind].filter((file) => file.id !== fileId),
      });
    },
    [onUploadsChange, uploads],
  );

  const tipsBlock = (
    <div className={flush ? undefined : DOCUMENT_UPLOAD_TITLE_TO_TIPS_CLASS}>
      <DocumentUploadInfoTipsCard tips={KYC_UPLOAD_INFO_TIPS} />
    </div>
  );

  return (
    <>
      {wrapTips != null ? wrapTips(tipsBlock) : tipsBlock}

      <div className={flush ? undefined : DOCUMENT_UPLOAD_TIPS_TO_SECTIONS_CLASS}>
        <DocumentUploadDocumentCards
          documents={KYC_UPLOAD_CARD_DEFINITIONS}
          getFiles={(kind) => uploads[kind as KycDocumentKind] ?? []}
          onUploadClick={(kind) => openSourceSheet(kind as KycDocumentKind)}
          onRemove={handleRemove}
          onDigilockerFetchAll={handleDigilockerFetchAll}
          wrapCard={wrapCard}
        />
      </div>

      <KycUploadSourceBottomSheet
        open={sourceSheetOpen}
        onClose={() => setSourceSheetOpen(false)}
        onSelect={handleMockUpload}
      />
    </>
  );
}
