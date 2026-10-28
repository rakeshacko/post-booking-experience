"use client";

import { useMemo, useState, type ReactNode } from "react";

import { postLiveOtp, type LiveOtp } from "@/lib/live-booking";

/**
 * Live mode — the OEM OTP call on the car-found screen. What a 2-minute call is
 * for (with a short video), then the times the dealer has committed to; once one
 * is picked it's set, and the dealer is told. When it opens the customer is asked
 * "Are you free?" (answered in the footer), and only then is the OTP sent.
 * The dealer is never named: the customer only deals with AckoDrive.
 */
export function LiveOtpCall({ otp, carModel, carMake }: { otp?: LiveOtp; carModel: string; carMake: string }) {
  const [picking, setPicking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (slot: string) => {
    setPicking(slot);
    setError(null);
    try {
      await postLiveOtp("pick", slot);
    } catch {
      setError("That time didn't go through. Try again?");
    } finally {
      setPicking(null);
    }
  };
  const none = async () => {
    setError(null);
    try {
      await postLiveOtp("none");
    } catch {
      setError("That didn't go through. Try again?");
    }
  };

  const state = otp?.state ?? "";
  if (!otp || state === "") {
    return (
      <Card eyebrow="Next">
        <p className="text-shimmer text-base font-semibold leading-6">Lining up times for a quick call…</p>
        <p className="mt-1 text-[13px] leading-[19px] text-[#757575]">
          {carModel === "" ? "It" : `Your ${carModel}`} is reserved for you meanwhile.
        </p>
      </Card>
    );
  }

  if (state === "offered" || state === "missed") {
    return (
      <>
        <SlotPicker otp={otp} picking={picking} onPick={pick} onNone={none} error={error} />
        {otp.again ? null : <OtpExplainer make={carMake} />}
      </>
    );
  }

  if (state === "booked") {
    return (
      <Card eyebrow="Your call is set">
        <p className="text-xl font-semibold leading-7 text-[#121212]">{otp.slot?.label ?? "Soon"}</p>
        <ul className="mt-3 space-y-2 text-[13px] leading-[19px] text-[#4b4b4b]">
          <Row icon={<PhoneIcon />}>
            ACKO Drive calls you from <span className="font-medium text-[#121212]">{otp.line}</span>
          </Row>
          <Row icon={<CheckIcon />}>Just before, I&apos;ll check you&apos;re free. No OTP is sent until you say so.</Row>
        </ul>
        {otp.slot ? <CalendarLink start={otp.slot.start} end={otp.slot.end} line={otp.line} /> : null}
      </Card>
    );
  }

  if (state === "checking") {
    return (
      <Card eyebrow="Now" pulse>
        <p className="text-base font-semibold leading-6 text-[#121212]">The dealer is ready. Are you free to talk?</p>
        <p className="mt-1 text-[13px] leading-[19px] text-[#757575]">
          ACKO Drive calls you a minute after you tap I&apos;m here. Not free right now? Your car stays reserved
          and you pick another time.
        </p>
      </Card>
    );
  }

  if (state === "ready") {
    return (
      <Card eyebrow="Calling you" pulse>
        <p className="text-base font-semibold leading-6 text-[#121212]">Pick up the call from {otp.line}</p>
        <p className="mt-1 text-[13px] leading-[19px] text-[#757575]">
          The OTP is on its way to your phone. Read it out when you&apos;re asked. Two minutes, and it&apos;s done.
        </p>
      </Card>
    );
  }

  return (
    <Card eyebrow="Done">
      <p className="text-base font-semibold leading-6 text-[#121212]">Your OTP is verified</p>
    </Card>
  );
}

/** Why the call, who's on it, and what if it's missed: a short video, then three lines. */
function OtpExplainer({ make }: { make: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white card-elevated">
      <div className="relative aspect-video w-full bg-[linear-gradient(135deg,#1d1340_0%,#3a1a8a_55%,#5920c5_100%)]">
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-[0_6px_20px_rgba(0,0,0,0.25)]">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5.5v13l10.5-6.5z" fill="#5920c5" />
            </svg>
          </span>
        </span>
        <span className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <span className="text-[13px] font-semibold leading-[18px]">How the 2-minute call works</span>
          <span className="rounded-full bg-black/35 px-2 py-0.5 text-[11px] font-medium">0:45</span>
        </span>
      </div>
      <div className="px-4 pb-4 pt-3.5">
        <p className="text-base font-semibold leading-6 text-[#121212]">What happens on the call</p>
        <ul className="mt-2.5 space-y-2.5 text-[13px] leading-[19px] text-[#4b4b4b]">
          <Row icon={<LockIcon />}>
            <span className="font-medium text-[#121212]">Why: </span>{make} registers the car in your name with an
            OTP sent to your phone.
          </Row>
          <Row icon={<PhoneIcon />}>
            <span className="font-medium text-[#121212]">Who: </span>ACKO Drive&apos;s number calls you and I connect
            you to the dealer. Your number stays private.
          </Row>
          <Row icon={<CalendarIcon />}>
            <span className="font-medium text-[#121212]">If you miss it: </span>your car stays reserved. Just pick a
            new time.
          </Row>
        </ul>
      </div>
    </div>
  );
}

function SlotPicker({
  otp,
  picking,
  onPick,
  onNone,
  error,
}: {
  otp: LiveOtp;
  picking: string | null;
  onPick: (slot: string) => void;
  onNone: () => void;
  error: string | null;
}) {
  const days = useMemo(() => {
    const out: { day: string; slots: LiveOtp["slots"] }[] = [];
    for (const s of otp.slots) {
      const last = out[out.length - 1];
      if (last && last.day === s.day) last.slots.push(s);
      else out.push({ day: s.day, slots: [s] });
    }
    return out;
  }, [otp.slots]);
  const busy = picking !== null;

  return (
    <Card eyebrow={otp.again ? "Pick a new time" : "Your 2-minute call"}>
      <p className="text-base font-semibold leading-6 text-[#121212]">
        {otp.again ? "No problem. When suits you instead?" : "When can you talk?"}
      </p>
      <p className="mt-1 text-[13px] leading-[19px] text-[#757575]">
        Times the dealer has kept for it. Once you pick, it&apos;s set.
      </p>
      {days.map((d) => (
        <div key={d.day} className="mt-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#757575]">{d.day}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {d.slots.map((s) => (
              <button
                key={s.start}
                type="button"
                disabled={busy}
                onClick={() => onPick(s.start)}
                className="relative h-10 rounded-xl border border-[#e3d9fa] bg-white text-[13px] font-semibold text-[#121212] transition-colors hover:border-[#5920c5] disabled:opacity-60"
              >
                {picking === s.start ? "…" : s.time}
                {otp.extra === s.start ? (
                  <span className="absolute -right-1 -top-1.5 rounded-full bg-[#0d8452] px-1.5 text-[9px] font-semibold leading-4 text-white">
                    New
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ))}
      {otp.extra === "asked" ? (
        <p className="mt-3.5 text-[13px] leading-[19px] text-[#4b4b4b]">
          I&apos;ve asked the dealer for another time. It&apos;ll show up here.
        </p>
      ) : otp.extra === "sfm" ? (
        <p className="mt-3.5 text-[13px] leading-[19px] text-[#4b4b4b]">
          I&apos;ll call you to find a time that works for you both.
        </p>
      ) : otp.extra === "" ? (
        <button
          type="button"
          disabled={busy}
          onClick={onNone}
          className="mt-3 text-[13px] font-medium text-[#4b4b4b] underline decoration-[#c2c2c2] underline-offset-4"
        >
          None of these work
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-[13px] font-medium text-[#d83d37]">
          {error}
        </p>
      ) : null}
    </Card>
  );
}

/** The action-card grammar of `NextStepCard`: purple outline, purple-to-clear wash. */
function Card({ eyebrow, pulse, children }: { eyebrow: string; pulse?: boolean; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#e3d9fa] bg-[linear-gradient(to_bottom,#f4eefe,rgba(244,238,254,0))] px-4 py-4">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-[#5920c5]">
        {pulse ? (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#5920c5]/60 motion-reduce:hidden" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-[#5920c5]" />
          </span>
        ) : null}
        {eyebrow}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[#5920c5]">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

/** "Add to calendar": an .ics file for the call window. */
function CalendarLink({ start, end, line }: { start: string; end: string; line: string }) {
  const href = useMemo(() => {
    const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const s = Date.parse(start);
    const e = Date.parse(end) || s + 30 * 60 * 1000;
    if (!s) return null;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ACKO Drive//Car call//EN",
      "BEGIN:VEVENT",
      `UID:${s}@ackodrive`,
      `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(new Date(s).toISOString())}`,
      `DTEND:${stamp(new Date(e).toISOString())}`,
      "SUMMARY:ACKO Drive: 2-minute OTP call for your car",
      `DESCRIPTION:ACKO Drive calls you from ${line}. Keep your phone handy for the OTP.`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  }, [start, end, line]);
  if (!href) return null;
  return (
    <a
      href={href}
      download="acko-drive-call.ics"
      className="mt-3.5 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#e3d9fa] bg-white text-sm font-semibold text-[#5920c5]"
    >
      <CalendarIcon />
      Add to calendar
    </a>
  );
}

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function PhoneIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg {...iconProps}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.2l2.3 2.3 4.7-4.8" />
    </svg>
  );
}
