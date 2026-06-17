import type { ExperienceFlow } from "@/lib/experience-flow";

/**
 * Shivi's script — every word she says on the converted journey, in one place.
 *
 * Voice rules:
 * - First person singular. She did it, she's doing it, she'll do it.
 * - Each turn says at most three things: what just happened, what she's doing,
 *   what she needs (or when she'll be back).
 * - COLD-OPEN RULE: the journey plays out over days, so every turn must read
 *   correctly to someone who just reopened the app — lead lines are standalone
 *   news ("Your Creta is reserved in your name."), never reactions ("Done —")
 *   unless the user acted seconds ago on the previous screen. Stamps are real
 *   dates with event anchors ("Wed 23 Apr · after the dealer's call") — never
 *   journey bookkeeping like "Day 1"; omit them when no time has passed.
 *   Day-boundary turns greet the return ("Morning, Sharath —", "Welcome back —").
 * - Never the word "booking". The user paid, the price is locked, a car is
 *   being found, money gets sorted, the car arrives.
 */

export type ConciergeMomentId =
  | "arrival"
  | "documentsReceived"
  | "verificationInProgress"
  | "dealerSearch"
  | "dealerFound"
  | "carReserved"
  | "moneyIntro";

export type TurnWords = {
  /** Conversation date divider — real date + event anchor, e.g. “Wed 23 Apr · morning”. */
  dayStamp?: string;
  /** Her lines, in speaking order. First line is the lead. */
  says: readonly string[];
  /** Visible activity lines for working turns. */
  workingLines?: readonly string[];
  /**
   * `live` (default) — quick system actions that finish while you watch.
   * `ongoing` — real-world work (dealers, registries) that takes hours/days:
   * first line spins, the rest queue, nothing fake-completes; results are
   * reported on the NEXT turn after time passes.
   */
  workingMode?: "live" | "ongoing";
  workingDoneLabel?: string;
  /** Ongoing mode — lines before this index render done (already happened). */
  workingDoneCount?: number;
  /** Expectation row for ongoing work — when she'll have news. */
  workingEtaLabel?: string;
  /** Primary reply — the user's words back to her. */
  replyLabel?: string;
  /** Echo shown on the next turn (defaults to replyLabel). */
  replyEcho?: string;
  /** Demo time travel label — e.g. “Next morning”. */
  timeSkipLabel?: string;
  /** Orange commitment line (deadlines, expectations). */
  footnote?: string;
  /** Contextual call affordance under the replies. */
  callLabel?: string;
};

/**
 * Identity turn (`/kyc`) — bespoke screen with the upload interaction inline
 * (`ConciergeVerifyIdentityScreen`), so its words live here but outside the
 * moment map.
 */
export const VERIFY_IDENTITY_WORDS: TurnWords = {
  says: [
    "PAN and Aadhaar — that's all I need.",
    "They're what your invoice and RTO registration run on. Add them below, and I'll handle everything else from there.",
  ],
  replyLabel: "Here are my documents",
  replyEcho: "Documents sent",
  callLabel: "Stuck? I can call you",
};

/** Arrival lead once the payment settles — close in length so the headline doesn't reflow. */
export const ARRIVAL_LEAD_PAID =
  "Hi Sharath, I'm Shivi — your payment's in and your price is locked.";

const EXPRESS_SCRIPT: Record<ConciergeMomentId, TurnWords> = {
  arrival: {
    says: [
      "Hi Sharath, I'm Shivi — your payment is going through right now.",
      "Only one thing now stands between you and a confirmed delivery date — your PAN and Aadhaar. It's two minutes, and it's best done right now, while I'm on it.",
      "Here's how the next few days look:",
    ],
    replyLabel: "Let's get the paperwork done",
    replyEcho: "Let's get the paperwork done",
    footnote: "Do this now — your price lock and delivery date ride on it",
  },

  documentsReceived: {
    says: [
      "Got them — verifying right now.",
      "No queues for this — I read and match them in seconds. Watch.",
    ],
    workingLines: [
      "Reading your PAN…",
      "Matching your Aadhaar details…",
      "Cross-checking name and address…",
    ],
    workingDoneLabel: "Verified ✓ — your purchase is officially open",
    replyLabel: "Great — what's next?",
    replyEcho: "Great — what's next?",
    callLabel: "Questions? I can call you",
  },

  /** Off the main path — the cancel-no-charges demo parks here (cancel via the ⋮ menu). */
  verificationInProgress: {
    says: [
      "All set — your paperwork cleared.",
      "I'm lining up dealers for your Creta now. Need anything meanwhile — a change, a question, even cancelling? The ⋮ menu up top has it all.",
    ],
    timeSkipLabel: "A little later",
    callLabel: "Questions? I can call you",
  },

  dealerSearch: {
    says: [
      "That's the paperwork done, Sharath ✓",
      "Straight to my favourite part — I've already pinged dealers for your exact Creta, 1.5 X-Line AT in Starry Night. Dealers take a few hours to confirm stock, so this runs overnight. Sleep on it; I won't.",
    ],
    workingLines: [
      "Reaching out to Hyundai dealers around Bengaluru…",
      "Confirm stock for 1.5 X-Line AT · Starry Night",
      "Compare who can deliver soonest",
    ],
    workingMode: "ongoing",
    workingEtaLabel: "Expect news from me by tomorrow morning",
    timeSkipLabel: "Next morning",
    callLabel: "Can't sleep on it? I can call you",
    footnote:
      "As promised, a heads-up: changes and cancellation are free until I lock a dealer — after that, a change costs ₹5,000 and cancelling holds back 50% of what you've paid",
  },

  dealerFound: {
    says: [
      "Morning, Sharath — found it, down to the exact car.",
      "Three dealers came back overnight; Advaith Hyundai can move the fastest, so I've reserved a specific Creta for you — fresh stock, and its engine and chassis numbers are below. They'll call you today: an OTP lands on your phone, you read it back, and this exact car is locked to you for good.",
    ],
    timeSkipLabel: "After the dealer's call",
    callLabel: "Questions? I can call you",
  },

  carReserved: {
    says: [
      "OTP confirmed — this exact Creta is yours.",
      "Advaith Hyundai matched your OTP on the Hyundai portal, so the car below — engine, chassis and all — is locked to you for good. That's the whole car settled, Sharath.",
    ],
    replyLabel: "What's next?",
    replyEcho: "What's next?",
  },

  moneyIntro: {
    says: [
      "Morning, Sharath — one big thing left: the money.",
      "₹13,63,780 remains on your Creta. You can finance it through me — I've pre-negotiated rates with five banks — or sort it your own way. Either way, I make it painless.",
    ],
    replyLabel: "Show me my options",
    replyEcho: "Show me my options",
    footnote: "Delivery on 10 Jun holds only once payment is set up — every day here moves it a day",
    callLabel: "Rather talk it through? I can call you",
  },
};

/**
 * Standard delivery — same conversation, slower clock. Only what differs.
 */
const STANDARD_OVERRIDES: Partial<Record<ConciergeMomentId, Partial<TurnWords>>> = {
  arrival: {
    says: [
      "Hi Sharath, I'm Shivi — your payment is going through right now.",
      "Only one thing now stands between you and a confirmed delivery date — your PAN and Aadhaar. It's two minutes, and it's best done right now, while I'm on it.",
      "Here's how the next few weeks look:",
    ],
  },
  dealerSearch: {
    says: [
      "That's the paperwork done, Sharath ✓",
      "Straight to my favourite part — I've started reaching out to dealers for your exact Creta, 1.5 X-Line AT in Starry Night. Stock for this colour moves slowly, so confirmations can take a couple of days. I'll chase; you relax.",
    ],
    workingEtaLabel: "Expect news from me in 2–3 days",
    timeSkipLabel: "2 days later",
  },
  dealerFound: {
    says: [
      "Welcome back, Sharath — found it, down to the exact car.",
      "Took a couple of days of chasing, but three dealers came back with your exact Creta; Advaith Hyundai can move the fastest, so I've reserved a specific car for you — fresh stock, engine and chassis numbers below. They'll call you today: an OTP lands on your phone, you read it back, and this exact car is locked to you for good.",
    ],
  },
  moneyIntro: {
    says: [
      "Welcome back, Sharath — one big thing left: the money.",
      "₹13,63,780 remains on your Creta. You can finance it through me — I've pre-negotiated rates with five banks — or sort it your own way. Either way, I make it painless.",
    ],
    footnote: "Delivery by 25 Oct holds only once payment is set up — delays here push it out",
  },
};

/**
 * AckoDrive-only overrides — the dealer is never named and the OTP is on-screen
 * rather than a dealer call. Flow-neutral wording so it merges cleanly over
 * either the express or standard base.
 */
const ACKO_ONLY_OVERRIDES: Partial<Record<ConciergeMomentId, Partial<TurnWords>>> = {
  dealerFound: {
    says: [
      "Found it, Sharath — down to the exact car.",
      "I've sourced and reserved a specific Creta for you through AckoDrive — fresh stock, with its engine and chassis numbers below. To lock it to you there's a quick one-time code: I'll trigger it on your phone and you enter it on the next screen. No dealer calls — I handle all of that in the background.",
    ],
  },
  carReserved: {
    says: [
      "OTP confirmed — this exact Creta is yours.",
      "Your one-time code checked out, so the car below — engine, chassis and all — is locked to you for good. I squared everything with the dealer in the background. That's the whole car settled, Sharath.",
    ],
  },
};

/**
 * Words for a turn — standard delivery overrides merge over the express base,
 * then the AckoDrive-only overrides merge on top when the dealer is hidden.
 */
export function getTurnWords(
  moment: ConciergeMomentId,
  flow: ExperienceFlow,
  ackoOnly = false,
): TurnWords {
  const base = EXPRESS_SCRIPT[moment];
  const withFlow =
    flow === "standard" && STANDARD_OVERRIDES[moment]
      ? { ...base, ...STANDARD_OVERRIDES[moment] }
      : base;
  if (!ackoOnly) return withFlow;
  const ackoOverride = ACKO_ONLY_OVERRIDES[moment];
  return ackoOverride ? { ...withFlow, ...ackoOverride } : withFlow;
}

/**
 * On-screen OTP turn (`/kyc/otp-verify`) — bespoke screen with two beats
 * (heads-up → enter the code) handled inline by `ConciergeOtpScreen`, so its
 * words live here but outside the moment map. AckoDrive-only path only.
 */
export const OTP_HEADSUP_WORDS: TurnWords = {
  says: [
    "Last step to lock your Creta — a one-time code.",
    "When you're ready I'll trigger it on your phone as an SMS. Read it back to me on the next screen and this exact car is yours — the dealer never has to call you, I pass it on in the background.",
  ],
  replyLabel: "Trigger my OTP",
  replyEcho: "Trigger my OTP",
  callLabel: "Rather do this on a call? I can call you",
};

export const OTP_ENTER_WORDS: TurnWords = {
  says: [
    "Sent — enter the 6-digit code.",
    "It's on its way to your phone ending 3210. Pop it in and your exact Creta is locked to you.",
  ],
};

/** Demo masked phone the OTP appears to land on. */
export const OTP_DEMO_PHONE_SUFFIX = "3210";
