"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AmountReceivedCard } from "@/components/concierge/artifacts";
import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import { CancelBookingReasonBottomSheet } from "@/components/kyc/CancelBookingReasonBottomSheet";
import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

/**
 * Cancellation — policy-correct at every stage:
 * - Before Booking Confirmation (the dealer lock): full refund, no questions.
 * - After: 50% of the TOTAL amount paid is retained (the global rule).
 * Shivi tries to save the deal first; the refund math is shown before any
 * commitment; reasons are collected in her voice; the farewell keeps the door open.
 */
export function ConciergeCancelScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reasonSheetOpen, setReasonSheetOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const paidInr = useMemo(() => {
    const raw = Number(searchParams.get("paid"));
    return Number.isFinite(raw) && raw > 0 ? Math.round(raw) : BOOKING_LOCK_AMOUNT_INR;
  }, [searchParams]);

  const postConfirmation = searchParams.get("stage") === "post";
  /** Second model/colour change — policy §1.9 treats it as cancel + rebook. */
  const secondChange = searchParams.get("reason") === "second-change";
  /** ACKO couldn't deliver — policy §1.14: 100% refund at any stage. */
  const ourFailure = searchParams.get("reason") === "our-failure";

  const chargeInr = postConfirmation && !ourFailure ? Math.round(paidInr / 2) : 0;
  const refundInr = paidInr - chargeInr;

  const refundCard = (title: string, note: string) => (
    <AmountReceivedCard
      amountInr={refundInr}
      title={title}
      rows={[
        { label: "Paid so far", value: formatInr(paidInr) },
        {
          label: "Cancellation charge",
          value: chargeInr > 0 ? `− ${formatInr(chargeInr)}` : "₹0",
        },
      ]}
      note={note}
    />
  );

  if (cancelled) {
    return (
      <ConciergeTurnShell
        says={[
          "It's done, Sharath.",
          `${formatInr(refundInr)} is on its way back to your account — 5 to 7 business days. I'm sorry this one didn't work out. Whenever you're ready to try again, you know where I am.`,
        ]}
        artifact={refundCard(
          "Refund initiated",
          "Refunds go to the original payment method within 5–7 business days."
        )}
        timeSkip={{ label: "Back to the start", href: "/quote" }}
        showMenu={false}
      />
    );
  }

  return (
    <>
      <ConciergeTurnShell
        says={
          ourFailure
            ? [
                "Full refund — every rupee, no questions.",
                "We couldn't hold up our side, so no rule applies to you: 100% of what you've paid comes back. I'm sorry, Sharath — and whenever you're ready to try again, I'd love another shot.",
              ]
            : secondChange
            ? [
                "A second change means starting over, Sharath.",
                "You've used your one change — that's the line in the policy I can't move. Changing again works as a cancel-and-rebook: 50% of what you've paid is held back, and you start fresh with the car you actually want. Your call entirely.",
              ]
            : postConfirmation
              ? [
                  "Before I cancel anything, Sharath…",
                  "We're past the lock point, so cancelling holds back 50% of everything you've paid — the one rule I can't bend. If it's the car that's wrong, a colour or model change costs just ₹5,000. If it's anything else, talk to me first — I can usually fix it.",
                ]
              : [
                  "Want to stop here, Sharath?",
                  "No charge at this stage — every rupee comes straight back. But tell me what went wrong first; if it's the car or the timing, I can usually fix it before you go.",
                ]
        }
        artifact={refundCard(
          "Comes back to you if you cancel now",
          "Refunds land in 5–7 business days. This math is final — no surprises later."
        )}
        replies={[
          {
            label: ourFailure
              ? "Refund me " + formatInr(refundInr)
              : "I'm sure — cancel and refund " + formatInr(refundInr),
            // When WE failed, asking "what went wrong" is tone-deaf — skip the reason sheet.
            onClick: () => (ourFailure ? setCancelled(true) : setReasonSheetOpen(true)),
            echo: null,
          },
          {
            label: "Let me think — go back",
            onClick: () => router.back(),
            kind: "soft",
            echo: null,
          },
        ]}
        callLabel="Before you decide — I can call you"
        showMenu={false}
      />
      <CancelBookingReasonBottomSheet
        open={reasonSheetOpen}
        onClose={() => setReasonSheetOpen(false)}
        onConfirm={() => {
          setReasonSheetOpen(false);
          setCancelled(true);
        }}
      />
    </>
  );
}
