"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import { NextStepCard } from "@/components/concierge/artifacts";
import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import {
  OTP_DEMO_PHONE_SUFFIX,
  OTP_ENTER_WORDS,
  OTP_HEADSUP_WORDS,
} from "@/lib/concierge/script";
import { JOURNEY_PATHS } from "@/lib/journey-routes";

const OTP_LENGTH = 6;
/** The window the customer has to enter the code once it lands. */
const OTP_WINDOW_SECONDS = 10 * 60;

/**
 * On-screen OTP — the AckoDrive-only replacement for the dealer's call. The
 * code is triggered when the dealer is ready (not by the customer), so the
 * first beat is a heads-up: we'll notify you, here's roughly when, and you'll
 * have ~10 minutes to enter it before it expires. The second beat is the entry
 * screen, reached when the notification lands (a demo time-skip stands in for
 * that). Submitting lands on the "your car is confirmed" turn.
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
          <NextStepCard
            title="Watch for your code"
            body="We'll notify you the moment it's ready. Open the app and enter it within 10 minutes."
            etaLabel="Usually within 30 minutes"
          />
        }
        footerExtra={
          <button
            type="button"
            className="time-skip-chip"
            onClick={() => setPhase("enter")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 5v14l8-7-8-7zM13 5v14l8-7-8-7z" fill="currentColor" fillOpacity="0.7" />
            </svg>
            <span>
              When the code arrives <span className="text-[#a6a6a6]">· demo</span>
            </span>
          </button>
        }
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
          label: "Confirm my car",
          href: JOURNEY_PATHS.kyc.bookingConfirmed,
          echo: "Code entered",
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

/** Six single-digit boxes with auto-advance, backspace handling, and an expiry countdown. */
function OtpInput({ digits, onChange }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const groupId = useId();
  const [remaining, setRemaining] = useState(OTP_WINDOW_SECONDS);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const expired = remaining === 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");

  const resend = () => {
    onChange(Array<string>(OTP_LENGTH).fill(""));
    setRemaining(OTP_WINDOW_SECONDS);
    inputsRef.current[0]?.focus();
  };

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
            disabled={expired}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            aria-label={`Digit ${index + 1}`}
            className="h-12 w-11 rounded-xl border border-[#e0e0e0] bg-[#fafafa] text-center text-lg font-semibold text-[#121212] tabular-nums outline-none transition-colors focus:border-[#121212] focus:bg-white disabled:opacity-50"
          />
        ))}
      </div>
      <p className="mt-3 text-center text-xs leading-[18px] text-[#757575]">
        {expired ? (
          <>
            Your code expired.{" "}
            <button
              type="button"
              onClick={resend}
              className="font-medium text-[#5920c5] underline underline-offset-2"
            >
              Send a new one
            </button>
          </>
        ) : (
          <>
            Sent to your phone ending {OTP_DEMO_PHONE_SUFFIX}. Expires in{" "}
            <span className="font-medium text-[#121212] tabular-nums">
              {minutes}:{seconds}
            </span>
            .
          </>
        )}
      </p>
    </div>
  );
}
