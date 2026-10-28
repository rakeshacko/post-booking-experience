"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ConciergeDocumentsCard } from "@/components/concierge/ConciergeDocumentsCard";
import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import type { ConciergeReply } from "@/components/concierge/ConciergeReplies";
import { writeConciergeEcho } from "@/lib/concierge/echo";
import { VERIFY_IDENTITY_WORDS } from "@/lib/concierge/script";
import { JOURNEY_PATHS } from "@/lib/journey-routes";
import {
  createEmptyKycUploads,
  readKycUploadState,
  writeKycUploadState,
  type KycUploadsState,
} from "@/lib/kyc-upload-state";
import { postLiveBooking, useLiveMode } from "@/lib/live-booking";

/** Live mode: remembered for the tab once OMS has the documents, so coming back never files them twice. */
const LIVE_KYC_SENT_KEY = "pbe_live_kyc_sent_v1";
/** Live mode: lets both DigiLocker documents visibly land before the turn moves on. */
const DIGILOCKER_LAND_MS = 700;
const LIVE_SEND_FAILED = "Your documents didn't go through. Please try again.";

function readLiveKycSent(): boolean {
  try {
    return sessionStorage.getItem(LIVE_KYC_SENT_KEY) === "1";
  } catch {
    return false;
  }
}

function writeLiveKycSent(): void {
  try {
    sessionStorage.setItem(LIVE_KYC_SENT_KEY, "1");
  } catch {
    /* private mode — a resend only repeats the filing */
  }
}

/**
 * Identity turn — Shivi asks for PAN + Aadhaar and the user hands them over
 * right here: upload cards are the conversation, not a separate form page.
 * The reply stays unanswerable until both documents are in.
 *
 * Live mode: the documents are filed on the booking in OMS — DigiLocker sends
 * them in one tap, uploads go with the reply — and the documents turn then
 * waits for the team's approval.
 */
export function ConciergeVerifyIdentityScreen() {
  const router = useRouter();
  const liveMode = useLiveMode();
  const mockUploadCounterRef = useRef(0);
  const hasHydratedUploadsRef = useRef(false);
  const [uploads, setUploads] = useState<KycUploadsState>(createEmptyKycUploads);
  const sendingRef = useRef(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

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
  const replyLabel = VERIFY_IDENTITY_WORDS.replyLabel ?? "Here are my documents";
  const replyEcho = VERIFY_IDENTITY_WORDS.replyEcho ?? replyLabel;

  /** Live mode: file both documents on the booking, then wait on the documents turn. */
  const sendLive = useCallback(
    async (docs: KycUploadsState, landMs = 0) => {
      if (sendingRef.current) return;
      if (!(docs.aadhaar.length > 0 && docs.pan.length > 0)) return;
      sendingRef.current = true;
      setSending(true);
      setSendError(null);
      const landed = new Promise((resolve) => window.setTimeout(resolve, landMs));
      try {
        if (!readLiveKycSent()) {
          const all = [...docs.aadhaar, ...docs.pan];
          await postLiveBooking("kyc", {
            source: all.every((file) => file.source === "digilocker") ? "digilocker" : "upload",
            documents: [
              { type: "aadhaar", name: "Aadhaar" },
              { type: "pan", name: "PAN" },
            ],
          });
          writeLiveKycSent();
        }
        await landed;
        writeConciergeEcho(replyEcho);
        router.push(JOURNEY_PATHS.kyc.documentsReceived);
      } catch (error) {
        console.warn("[live] KYC documents not filed", error);
        sendingRef.current = false;
        setSending(false);
        setSendError(LIVE_SEND_FAILED);
      }
    },
    [replyEcho, router],
  );

  const handleDigilockerFetched = useCallback(
    (docs: KycUploadsState) => void sendLive(docs, DIGILOCKER_LAND_MS),
    [sendLive],
  );

  const replies = useMemo<ConciergeReply[]>(
    () =>
      liveMode
        ? [
            {
              label: sending ? "Sending your documents…" : replyLabel,
              onClick: () => void sendLive(uploads),
              echo: null,
              disabled: !canSubmit || sending,
            },
          ]
        : [
            {
              label: replyLabel,
              href: JOURNEY_PATHS.kyc.documentsReceived,
              echo: VERIFY_IDENTITY_WORDS.replyEcho,
              disabled: !canSubmit,
            },
          ],
    [canSubmit, liveMode, replyLabel, sendLive, sending, uploads],
  );

  return (
    <ConciergeTurnShell
      dayStamp={VERIFY_IDENTITY_WORDS.dayStamp}
      says={VERIFY_IDENTITY_WORDS.says}
      footnote={VERIFY_IDENTITY_WORDS.footnote}
      callLabel={VERIFY_IDENTITY_WORDS.callLabel}
      replies={replies}
      replyError={sendError}
      artifact={
        <ConciergeDocumentsCard
          uploads={uploads}
          onUploadsChange={(next) => {
            setSendError(null);
            setUploads(next);
          }}
          mockUploadCounterRef={mockUploadCounterRef}
          onDigilockerFetched={liveMode ? handleDigilockerFetched : undefined}
          locked={sending}
        />
      }
    />
  );
}
