"use client";

import { useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";

import { NoteCallout } from "@/components/concierge/artifacts";
import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import infoIcon from "@/assets/Info.svg";
import {
  OTP_DEMO_PHONE_SUFFIX,
  OTP_ENTER_WORDS,
  OTP_HEADSUP_WORDS,
} from "@/lib/concierge/script";
import { JOURNEY_PATHS } from "@/lib/journey-routes";

const OTP_LENGTH = 6;

/**
 * On-screen OTP — the AckoDrive-only replacement for the dealer's call. Two
 * beats: a heads-up that the code is about to be triggered, then the entry
 * screen. AckoDrive relays the code to the dealer in the background, so the
 * customer never talks to anyone but us. Submitting lands on the existing
 * "OTP confirmed — yours" turn (booking-confirmed / carReserved).
 */
export function ConciergeOtpScreen() {
  const [phase, setPhase] = useState<"headsup" | "enter">("headsup");
  const [digits, setDigits] = useState<string[]>(() => Array<string>(OTP_LENGTH).fill(""));

  const complete = digits.every((d) => d !== "");

  if (phase === "headsup") {
    return (
      <ConciergeTurnShell
        key="otp-headsup"
        says={OTP_HEADSUP_WORDS.says}
        callLabel={OTP_HEADSUP_WORDS.callLabel}
        artifact={
          <NoteCallout iconSrc={infoIcon}>
            No dealer call — I trigger the code, you read it back here, and I confirm it with
            the dealer in the background.
          </NoteCallout>
        }
        replies={[
          {
            label: OTP_HEADSUP_WORDS.replyLabel ?? "Trigger my OTP",
            echo: OTP_HEADSUP_WORDS.replyEcho,
            onClick: () => setPhase("enter"),
          },
        ]}
      />
    );
  }

  return (
    <ConciergeTurnShell
      key="otp-enter"
      says={OTP_ENTER_WORDS.says}
      artifact={<OtpInput digits={digits} onChange={setDigits} />}
      replies={[
        {
          label: "Verify & lock my car",
          href: JOURNEY_PATHS.kyc.bookingConfirmed,
          echo: "OTP confirmed",
          disabled: !complete,
        },
      ]}
    />
  );
}

type OtpInputProps = {
  digits: string[];
  onChange: (next: string[]) => void;
};

/** Six single-digit boxes with auto-advance and backspace handling. */
function OtpInput({ digits, onChange }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const groupId = useId();

  const focusBox = (index: number) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/\D/g, "");
    if (!raw) {
      const next = [...digits];
      next[index] = "";
      onChange(next);
      return;
    }
    // Paste / fast typing — distribute across the boxes from here.
    const next = [...digits];
    let cursor = index;
    for (const ch of raw) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = ch;
      cursor += 1;
    }
    onChange(next);
    focusBox(Math.min(cursor, OTP_LENGTH - 1));
  };

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        onChange(next);
        return;
      }
      if (index > 0) focusBox(index - 1);
    } else if (event.key === "ArrowLeft" && index > 0) {
      focusBox(index - 1);
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-4 card-elevated">
      <div className="flex items-center justify-between gap-2" role="group" aria-label="One-time code">
        {digits.map((digit, index) => (
          <input
            key={`${groupId}-${index}`}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={index === 0 ? OTP_LENGTH : 1}
            value={digit}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            aria-label={`Digit ${index + 1}`}
            className="h-12 w-11 rounded-xl border border-[#e0e0e0] bg-[#fafafa] text-center text-lg font-semibold text-[#121212] tabular-nums outline-none transition-colors focus:border-[#121212] focus:bg-white"
          />
        ))}
      </div>
      <p className="mt-3 text-center text-xs leading-[18px] text-[#757575]">
        Sent to your phone ending {OTP_DEMO_PHONE_SUFFIX}
      </p>
    </div>
  );
}
