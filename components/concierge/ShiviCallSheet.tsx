"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { BottomSheetPortal } from "@/components/ui/BottomSheetPortal";
import { publicAssetPathIn } from "@/lib/public-asset-path";

/** Parity with the other bottom sheets. */
const SHEET_TRANSITION_MS = 280;

/** The customer's relationship manager — a person, so a callback at a time they pick. */
const RM = { name: "Meera", photo: publicAssetPathIn("live", "rm-meera.jpg") };

export type ShiviCallSheetProps = {
  open: boolean;
  onClose: () => void;
};

type Step = "choose" | "shivi" | "rm" | "rmSet";

/**
 * “Call me” — two ways to talk: Shivi calls right away, or the relationship
 * manager calls back at a time the customer picks. Either way it ends in a
 * plain commitment, not a ticket number.
 */
export function ShiviCallSheet({ open, onClose }: ShiviCallSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [step, setStep] = useState<Step>("choose");
  const [picked, setPicked] = useState<Slot | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
    setStep("choose");
    setPicked(null);
    setMounted(true);
    setAnimateIn(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimateIn(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (open || !mounted) return;
    setAnimateIn(false);
    exitTimeoutRef.current = setTimeout(() => {
      exitTimeoutRef.current = null;
      setMounted(false);
    }, SHEET_TRANSITION_MS);
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  const slots = useMemo(() => (open ? rmSlots(new Date()) : []), [open]);

  if (!mounted) return null;

  return (
    <BottomSheetPortal>
      <div className="fixed inset-0 z-[100] flex flex-col">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className={`absolute inset-0 bg-black/90 transition-opacity duration-[280ms] ease-out motion-reduce:transition-none ${
            animateIn ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`relative z-10 mx-auto mt-auto flex w-full max-w-[640px] shrink-0 flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
            animateIn ? "translate-y-0" : "translate-y-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shivi-call-sheet-title"
        >
          <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
            {step === "choose" ? (
              <>
                <h2 id="shivi-call-sheet-title" className="text-xl font-medium leading-7 text-[#121212]">
                  Who should call you?
                </h2>
                <div className="mt-5 flex flex-col gap-3">
                  <Option
                    avatar={<Avatar src={KYC_ASSETS.avatarSmall} />}
                    name="Shivi"
                    role="Your ACKO Drive guide"
                    pill={{ text: "Now", tone: "green" }}
                    detail="Calls you right away. Ask about your car, your OTP call or your payments."
                    onClick={() => setStep("shivi")}
                  />
                  <Option
                    avatar={<Avatar src={RM.photo} />}
                    name={RM.name}
                    role="Your relationship manager"
                    pill={{ text: "Callback", tone: "purple" }}
                    detail="A person on our team. Pick a time and she calls you back."
                    onClick={() => setStep("rm")}
                  />
                </div>
              </>
            ) : step === "rm" ? (
              <>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Back"
                    onClick={() => setStep("choose")}
                    className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-[#121212] hover:bg-[#f5f5f5]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <Avatar src={RM.photo} size={40} />
                  <h2 id="shivi-call-sheet-title" className="text-lg font-medium leading-6 text-[#121212]">
                    When should {RM.name} call?
                  </h2>
                </div>
                {groupByDay(slots).map((d) => (
                  <div key={d.day} className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#757575]">{d.day}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {d.slots.map((s) => (
                        <button
                          key={s.at.toISOString()}
                          type="button"
                          onClick={() => {
                            setPicked(s);
                            setStep("rmSet");
                          }}
                          className="h-10 rounded-xl border border-[#e3d9fa] bg-white text-[13px] font-semibold text-[#121212] transition-colors hover:border-[#5920c5]"
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                <span className="relative flex h-16 w-16 items-center justify-center">
                  {step === "shivi" ? (
                    <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#0d8452]/25 [animation-duration:1.8s] motion-reduce:hidden" />
                  ) : null}
                  <Avatar src={step === "shivi" ? KYC_ASSETS.avatarSmall : RM.photo} size={64} />
                </span>
                <h2 id="shivi-call-sheet-title" className="mt-5 text-xl font-medium leading-7 text-[#121212]">
                  {step === "shivi"
                    ? "Calling you now."
                    : `${RM.name} will call you ${picked ? `${picked.day.toLowerCase()} at ${picked.time}` : "soon"}.`}
                </h2>
                <p className="mt-2 text-sm leading-5 text-[#4b4b4b]">
                  {step === "shivi"
                    ? "Pick up the call from ACKO Drive on your registered number."
                    : "She'll have your car's details in front of her. The call comes from ACKO Drive on your registered number."}
                </p>
                <button
                  type="button"
                  className="primary-cta mt-7 w-full focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2"
                  onClick={onClose}
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </BottomSheetPortal>
  );
}

function Avatar({ src, size = 48 }: { src: string; size?: number }) {
  return (
    <span className="relative shrink-0 overflow-hidden rounded-full bg-[#f5f5f5]" style={{ width: size, height: size }}>
      <Image src={src} alt="" fill className="object-cover" unoptimized sizes={`${size}px`} priority />
    </span>
  );
}

function Option({
  avatar,
  name,
  role,
  pill,
  detail,
  onClick,
}: {
  avatar: ReactNode;
  name: string;
  role: string;
  pill: { text: string; tone: "green" | "purple" };
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-2xl border border-[#ececec] bg-white px-4 py-3.5 text-left transition-colors hover:border-[#5920c5]"
    >
      {avatar}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[15px] font-semibold leading-5 text-[#121212]">{name}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase leading-4 tracking-[0.04em] ${
              pill.tone === "green" ? "bg-[#e7f6ee] text-[#0c7a42]" : "bg-[#f1ebfd] text-[#5920c5]"
            }`}
          >
            {pill.text}
          </span>
        </span>
        <span className="block text-xs font-medium leading-[18px] text-[#4b4b4b]">{role}</span>
        <span className="mt-1 block text-[13px] leading-[18px] text-[#757575]">{detail}</span>
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}

type Slot = { at: Date; day: string; time: string };

/** The RM's callback times: half-hours in working hours (10 am–7 pm), the rest of today and tomorrow. */
function rmSlots(now: Date): Slot[] {
  const out: Slot[] = [];
  const fmt = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
  const start = new Date(now.getTime() + 45 * 60 * 1000);
  start.setMinutes(start.getMinutes() < 30 ? 30 : 60, 0, 0);
  for (let d = 0; d < 2 && out.length < 9; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    for (let h = 10; h < 19; h += 0.5) {
      const at = new Date(day);
      at.setHours(Math.floor(h), h % 1 ? 30 : 0, 0, 0);
      if (at < start) continue;
      if (d === 1 && out.filter((s) => s.day === "Tomorrow").length >= 6) break;
      out.push({ at, day: d === 0 ? "Today" : "Tomorrow", time: fmt(at) });
      if (d === 0 && out.length >= 6) break;
    }
  }
  return out;
}

function groupByDay(slots: Slot[]) {
  const out: { day: string; slots: Slot[] }[] = [];
  for (const s of slots) {
    const last = out[out.length - 1];
    if (last && last.day === s.day) last.slots.push(s);
    else out.push({ day: s.day, slots: [s] });
  }
  return out;
}
