"use client";

import type { ReactNode } from "react";

import { DocumentUploadSection, type DocumentUploadFile } from "@/components/kyc/DocumentUploadSection";
import { DigilockerFetchButton } from "@/components/kyc/DigilockerFetchButton";

export type DocumentUploadCardDefinition = {
  kind: string;
  title: string;
  description?: string;
  allowMultiple?: boolean;
  showDigilockerFetch?: boolean;
};

type DocumentUploadDocumentCardsProps = {
  documents: readonly DocumentUploadCardDefinition[];
  getFiles: (kind: string) => DocumentUploadFile[];
  onUploadClick: (kind: string) => void;
  onRemove: (kind: string, fileId: string) => void;
  onDigilockerFetch?: (kind: string) => void;
  /** Optional wrapper for stagger animations (e.g. PaymentSuccessStagger). */
  wrapCard?: (kind: string, card: ReactNode) => ReactNode;
};

/**
 * Document upload cards with optional DigiLocker CTA above a section — shared by KYC and loan flows.
 */
export function DocumentUploadDocumentCards({
  documents,
  getFiles,
  onUploadClick,
  onRemove,
  onDigilockerFetch,
  wrapCard,
}: DocumentUploadDocumentCardsProps) {
  return (
    <div className="flex flex-col gap-4">
      {documents.map((doc) => {
        const card = (
          <>
            {doc.showDigilockerFetch && onDigilockerFetch != null ? (
              <DigilockerFetchButton onClick={() => onDigilockerFetch(doc.kind)} />
            ) : null}
            <DocumentUploadSection
              title={doc.title}
              description={doc.description}
              allowMultiple={doc.allowMultiple ?? true}
              files={getFiles(doc.kind)}
              onUploadClick={() => onUploadClick(doc.kind)}
              onAddMoreClick={() => onUploadClick(doc.kind)}
              onRemove={(fileId) => onRemove(doc.kind, fileId)}
            />
          </>
        );

        const content = wrapCard != null ? wrapCard(doc.kind, card) : card;
        return <div key={doc.kind}>{content}</div>;
      })}
    </div>
  );
}
