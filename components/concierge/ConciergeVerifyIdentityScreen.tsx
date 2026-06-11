"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ConciergeDocumentsCard } from "@/components/concierge/ConciergeDocumentsCard";
import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import { VERIFY_IDENTITY_WORDS } from "@/lib/concierge/script";
import { JOURNEY_PATHS } from "@/lib/journey-routes";
import {
  createEmptyKycUploads,
  readKycUploadState,
  writeKycUploadState,
  type KycUploadsState,
} from "@/lib/kyc-upload-state";

/**
 * Identity turn — Shivi asks for PAN + Aadhaar and the user hands them over
 * right here: upload cards are the conversation, not a separate form page.
 * The reply stays unanswerable until both documents are in.
 */
export function ConciergeVerifyIdentityScreen() {
  const mockUploadCounterRef = useRef(0);
  const hasHydratedUploadsRef = useRef(false);
  const [uploads, setUploads] = useState<KycUploadsState>(createEmptyKycUploads);

  useEffect(() => {
    const stored = readKycUploadState();
    if (stored) {
      setUploads(stored.uploads);
      mockUploadCounterRef.current = stored.mockUploadCounter;
    }
    hasHydratedUploadsRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydratedUploadsRef.current) return;
    writeKycUploadState({
      uploads,
      mockUploadCounter: mockUploadCounterRef.current,
    });
  }, [uploads]);

  const canSubmit = uploads.aadhaar.length > 0 && uploads.pan.length > 0;

  const replies = useMemo(
    () => [
      {
        label: VERIFY_IDENTITY_WORDS.replyLabel ?? "Here are my documents",
        href: JOURNEY_PATHS.kyc.documentsReceived,
        echo: VERIFY_IDENTITY_WORDS.replyEcho,
        disabled: !canSubmit,
      },
    ],
    [canSubmit],
  );

  return (
    <ConciergeTurnShell
      dayStamp={VERIFY_IDENTITY_WORDS.dayStamp}
      says={VERIFY_IDENTITY_WORDS.says}
      footnote={VERIFY_IDENTITY_WORDS.footnote}
      callLabel={VERIFY_IDENTITY_WORDS.callLabel}
      replies={replies}
      artifact={
        <ConciergeDocumentsCard
          uploads={uploads}
          onUploadsChange={setUploads}
          mockUploadCounterRef={mockUploadCounterRef}
        />
      }
    />
  );
}
