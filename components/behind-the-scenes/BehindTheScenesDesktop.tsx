"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  Landmark,
  Network,
  Plug,
  ShieldCheck,
  User,
  Workflow,
  Zap,
} from "lucide-react";

import {
  JOURNEY_START_HREF,
  WAIT_STEPS,
  matchStepIdForPath,
  stepById,
  type AutoKind,
  type AutomatedSide,
  type CaseSide,
  type WaitStep,
} from "@/lib/behind-the-scenes/steps";
import { cn } from "@/lib/utils";

/** Poll cadence for reading the phone iframe's current route. */
const SYNC_INTERVAL_MS = 450;

/** Method icon — the real automation mechanism, per kind. */
const KIND_ICON: Record<AutoKind, ReactNode> = {
  matching: <Network size={17} />,
  integration: <Plug size={17} />,
  banking: <Landmark size={17} />,
  govrail: <Building2 size={17} />,
  system: <Workflow size={17} />,
  owned: <ShieldCheck size={17} />,
};

/**
 * Behind-the-scenes desktop view (light).
 *
 * Left (~1/3): the live mobile prototype, full-height. Right (~2/3): one step at
 * a time — what the wait is, who does it by hand today, and how it's removed
 * (a system integration, a government rail, a banking API, parallel network
 * matching, …). The panel recolours to the step's accent on every change so the
 * eye is pulled to the right.
 */
export function BehindTheScenesDesktop() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastActiveRef = useRef<string | null>(null);
  /** null = the phone is on a non-wait screen (quote / payment); panel sits empty. */
  const [activeId, setActiveId] = useState<string | null>(null);

  const syncFromIframe = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    let path = "";
    try {
      path = frame.contentWindow?.location.pathname ?? "";
    } catch {
      return; // mid-navigation cross-origin guard
    }
    if (!path) return;
    const id = matchStepIdForPath(path); // null when the route isn't a wait
    if (id !== lastActiveRef.current) {
      lastActiveRef.current = id;
      setActiveId(id);
    }
  }, []);

  useEffect(() => {
    const t = window.setInterval(syncFromIframe, SYNC_INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [syncFromIframe]);

  const loadInPhone = useCallback((href: string) => {
    const frame = iframeRef.current;
    if (frame) frame.src = href;
  }, []);

  const active = stepById(activeId);
  const accent = active?.accent ?? "#8b8a93";

  return (
    <div className="fixed inset-0 z-50 flex bg-white text-[#1b1a22]">
      {/* Left — the live phone, full height */}
      <aside className="flex w-[clamp(360px,32%,500px)] shrink-0 items-center justify-center bg-[#f4f4f7] p-5">
        <PhoneFrame iframeRef={iframeRef} />
      </aside>

      {/* Right — only the current step; recolours per step */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden border-l border-black/[0.07] px-10 py-8">
        {/* accent wash — re-keyed per step so it blooms in on change */}
        {active ? (
          <div
            key={active.id}
            aria-hidden
            className="bts-wash-in pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(58% 52% at 94% -8%, ${accent}26, ${accent}00 60%), radial-gradient(46% 48% at -6% 108%, ${accent}1a, ${accent}00 58%)`,
            }}
          />
        ) : null}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <Stepper activeId={activeId} accent={accent} onJump={(s) => loadInPhone(s.launchHref)} />
          <div className="flex flex-1 flex-col justify-center overflow-y-auto py-6">
            {active ? <FocusedStep key={active.id} step={active} /> : <EmptyState />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PhoneFrame({ iframeRef }: { iframeRef: React.RefObject<HTMLIFrameElement | null> }) {
  return (
    <div className="relative h-full max-h-[980px] w-[386px]">
      <div className="relative h-full w-full rounded-[46px] bg-[#15141b] p-[11px] shadow-[0_40px_90px_-34px_rgba(20,18,30,0.5),0_0_0_1px_rgba(0,0,0,0.06)]">
        <div className="h-full w-full overflow-hidden rounded-[36px] bg-white">
          <iframe
            ref={iframeRef}
            src={JOURNEY_START_HREF}
            title="ACKO Drive post-booking prototype"
            className="h-full w-full border-0"
            allow="clipboard-write"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Stepper({
  activeId,
  accent,
  onJump,
}: {
  activeId: string | null;
  accent: string;
  onJump: (s: WaitStep) => void;
}) {
  const activeNum = activeId ? (stepById(activeId)?.num ?? 0) : 0;
  const progress = activeNum > 0 ? (activeNum - 1) / (WAIT_STEPS.length - 1) : 0;
  return (
    <nav className="relative flex items-start justify-between" aria-label="Journey waits">
      <div className="pointer-events-none absolute inset-x-[15px] top-[15px] h-[2px] rounded-full bg-black/10" aria-hidden />
      <div
        className="pointer-events-none absolute left-[15px] top-[15px] h-[2px] rounded-full transition-all duration-500"
        style={{ width: `calc(${progress} * (100% - 30px))`, backgroundColor: accent }}
        aria-hidden
      />
      {WAIT_STEPS.map((s) => {
        const isActive = s.id === activeId;
        const done = s.num < activeNum;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onJump(s)}
            title={`${s.num}. ${s.title}`}
            className="group relative z-10 flex flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "flex h-[30px] w-[30px] items-center justify-center rounded-full border text-[12px] font-semibold transition-all",
                !isActive && !done && "border-black/15 bg-white text-black/40 group-hover:border-black/35 group-hover:text-black/70",
              )}
              style={
                isActive
                  ? { backgroundColor: accent, borderColor: accent, color: "#fff", boxShadow: `0 0 0 4px ${accent}26` }
                  : done
                    ? { backgroundColor: `${accent}1f`, borderColor: `${accent}66`, color: accent }
                    : undefined
              }
            >
              {s.num}
            </span>
            <span
              className="h-3.5 text-[10px] font-semibold uppercase tracking-wide transition-colors"
              style={{ color: isActive ? accent : "transparent" }}
            >
              {isActive ? s.phase : ""}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */

/** Shown while the phone is on a non-wait screen (quote / payment) — airy, not blank. */
function EmptyState() {
  return (
    <div className="mx-auto flex max-w-[440px] flex-col items-center text-center">
      <p className="text-[13.5px] leading-relaxed text-[#a9a8b1]">
        Walk the journey on the phone. As each wait comes up, the work behind it — and how we
        remove it — appears here.
      </p>
    </div>
  );
}

function FocusedStep({ step }: { step: WaitStep }) {
  const northstar = step.status === "northstar";
  const accent = step.accent;
  return (
    <div className="bts-fade-in mx-auto w-full max-w-[900px]">
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: accent }}
      >
        Step {step.num} of {WAIT_STEPS.length} · {step.phase}
      </span>
      <h1 className="mt-2.5 text-[30px] font-semibold leading-[1.1] tracking-tight text-[#16151c]">
        {step.title}
      </h1>
      <p className="mt-3 max-w-[780px] text-[15px] leading-relaxed text-[#55545d]">{step.what}</p>

      {northstar ? <NorthStar step={step} /> : <BeforeAfter step={step} />}
    </div>
  );
}

function BeforeAfter({ step }: { step: WaitStep }) {
  const accent = step.accent;
  return (
    <>
      <div className="mt-6">
        <span
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold tracking-tight text-[#16151c]"
          style={{ borderColor: `${accent}40`, backgroundColor: `${accent}12` }}
        >
          <Zap size={14} style={{ color: accent }} />
          {step.gain}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-stretch gap-4">
        <TodayCard side={step.today} />
        <div className="flex items-center justify-center">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[0_12px_28px_-12px_rgba(0,0,0,0.4)]"
            style={{ backgroundColor: accent }}
          >
            <ArrowRight size={18} />
          </span>
        </div>
        <AutomatedCard side={step.automated} accent={accent} />
      </div>
    </>
  );
}

function TodayCard({ side }: { side: CaseSide }) {
  return (
    <div className="flex flex-col rounded-2xl border border-black/[0.08] bg-[#f5f5f8] p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/[0.06] text-[#55545d]">
          <User size={17} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8992]">
            Today · by hand
          </p>
          <p className="text-[15px] font-semibold leading-tight text-[#16151c]">{side.actor}</p>
        </div>
      </div>

      <ol className="mt-4 flex flex-col gap-2.5">
        {side.steps.map((text, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-black/[0.07] text-[10px] font-semibold text-[#6c6b74]">
              {i + 1}
            </span>
            <span className="text-[13px] leading-snug text-[#55545d]">{text}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto border-t border-black/[0.07] pt-4">
        <p className="whitespace-nowrap text-[21px] font-semibold leading-none tracking-tight text-[#b45309]">
          {side.metric}
        </p>
        <p className="mt-1.5 text-[10.5px] uppercase tracking-wide text-[#8a8992]">{side.metricNote}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {side.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-medium text-[#6c6b74]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AutomatedCard({ side, accent }: { side: AutomatedSide; accent: string }) {
  return (
    <div
      className="flex flex-col rounded-2xl border p-5"
      style={{
        borderColor: `${accent}38`,
        backgroundColor: `${accent}0b`,
        boxShadow: `0 26px 60px -40px ${accent}, 0 0 0 1px ${accent}10`,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: accent }}
        >
          {KIND_ICON[side.kind]}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: accent }}>
            {side.method}
          </p>
          <p className="text-[15px] font-semibold leading-tight text-[#16151c]">{side.actor}</p>
        </div>
      </div>

      <ol className="mt-4 flex flex-col gap-2.5">
        {side.steps.map((text, i) => (
          <li key={i} className="flex gap-2.5">
            <Check size={14} className="mt-[3px] shrink-0" style={{ color: accent }} />
            <span className="text-[13px] leading-snug text-[#46454e]">{text}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto border-t pt-4" style={{ borderColor: `${accent}24` }}>
        <p
          className="whitespace-nowrap text-[21px] font-semibold leading-none tracking-tight"
          style={{ color: accent }}
        >
          {side.metric}
        </p>
        <p className="mt-1.5 text-[10.5px] uppercase tracking-wide text-[#8a8992]">{side.metricNote}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {side.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: `${accent}18`, color: accent }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Insurance — the one rail ACKO owns end-to-end. A "this is the bar" panel. */
function NorthStar({ step }: { step: WaitStep }) {
  const accent = step.accent;
  return (
    <div
      className="mt-6 overflow-hidden rounded-3xl border p-8"
      style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0c` }}
    >
      <div className="mx-auto flex max-w-[620px] flex-col items-center text-center">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
          style={{ backgroundColor: accent, boxShadow: `0 0 0 6px ${accent}1f` }}
        >
          <ShieldCheck size={22} />
        </span>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
          Already instant — the bar
        </p>
        <h2 className="mt-2 text-[24px] font-semibold leading-tight tracking-tight text-[#16151c]">
          The policy is live the second you pay
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-[#55545d]">
          No queue, no third party, no chase — when ACKO owns the rail end-to-end, the wait simply
          disappears. It’s the standard every step on the journey is built to reach.
        </p>
        <div className="mt-6 flex items-center gap-7">
          <div className="text-center">
            <p className="text-[26px] font-semibold leading-none" style={{ color: accent }}>
              Instant
            </p>
            <p className="mt-1.5 text-[10.5px] uppercase tracking-wide text-[#8a8992]">today, already</p>
          </div>
          <div className="h-9 w-px bg-black/10" />
          <div className="text-center">
            <p className="text-[26px] font-semibold leading-none text-[#16151c]">1 rail</p>
            <p className="mt-1.5 text-[10.5px] uppercase tracking-wide text-[#8a8992]">ACKO owns end-to-end</p>
          </div>
        </div>
      </div>
    </div>
  );
}
