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
    "Just two documents, Sharath: your PAN and Aadhaar.",
    "These are what your invoice and registration are issued against. Add them below and I'll take care of the rest.",
  ],
  replyLabel: "Here are my documents",
  replyEcho: "Documents sent",
  callLabel: "Need a hand? I can call you",
};

/** Arrival lead once the payment settles — close in length so the headline doesn't reflow. */
export const ARRIVAL_LEAD_PAID =
  "Hi Sharath, I'm Shivi. Your payment is in and your price is locked.";

const EXPRESS_SCRIPT: Record<ConciergeMomentId, TurnWords> = {
  arrival: {
    says: [
      "Hi Sharath, I'm Shivi. Your payment is going through now.",
      "You're almost there. One short paperwork step comes next, then I can lock in your delivery date.",
      "Here's how the next few days look:",
    ],
    replyLabel: "Let's do the paperwork",
    replyEcho: "Let's do the paperwork",
    footnote: "Worth doing now, so your price lock and delivery date hold.",
  },

  documentsReceived: {
    says: [
      "Got your documents, Sharath. I'm verifying them now.",
      "This won't take long.",
    ],
    workingLines: [
      "Reading your PAN",
      "Matching your Aadhaar details",
      "Checking your name and address",
    ],
    workingDoneLabel: "Verified. Your purchase is now open in your name.",
    replyLabel: "What's next?",
    replyEcho: "What's next?",
    callLabel: "Questions? I can call you",
  },

  /** Off the main path — the cancel-no-charges demo parks here (cancel via the ⋮ menu). */
  verificationInProgress: {
    says: [
      "Your paperwork has cleared, Sharath.",
      "I'm lining up dealers for your Creta now. Anything you need in the meantime, a change, a question, even cancelling, is in the menu up top.",
    ],
    timeSkipLabel: "A little later",
    callLabel: "Questions? I can call you",
  },

  dealerSearch: {
    says: [
      "That's the paperwork done, Sharath.",
      "Now I'm reaching out to dealers for your exact Creta, the 1.5 X-Line AT in Starry Night. They usually take a few hours to confirm stock, so this runs overnight. I'll let you know the moment I hear back.",
    ],
    workingLines: [
      "Reaching out to Hyundai dealers near you",
      "Checking stock for your 1.5 X-Line AT in Starry Night",
      "Finding who can deliver soonest",
    ],
    workingMode: "ongoing",
    workingEtaLabel: "I'll have news by tomorrow morning",
    timeSkipLabel: "Next morning",
    callLabel: "Can't sleep on it? I can call you",
    footnote:
      "A quick heads-up: changes and cancellation are free until I lock in a dealer. After that, a change costs ₹5,000 and cancelling holds back half of what you've paid.",
  },

  dealerFound: {
    says: [
      "Morning, Sharath. I found your exact car.",
      "Three dealers came back, and Advaith Hyundai can deliver soonest, so I've reserved a fresh Creta for you with them. Its engine and chassis numbers are below. They'll call you today, and a one-time code on your phone confirms it's yours.",
    ],
    timeSkipLabel: "After the dealer's call",
    callLabel: "Questions? I can call you",
  },

  carReserved: {
    says: [
      "Your code checked out, Sharath. This Creta is yours.",
      "You'll find its engine and chassis numbers on the card below.",
    ],
    replyLabel: "What's next?",
    replyEcho: "What's next?",
  },

  moneyIntro: {
    says: [
      "Morning, Sharath. Let's sort out the payment.",
      "₹13,63,780 is left to pay on your Creta. You can finance it through me, at rates I've already negotiated with five banks, or arrange it yourself. Whichever you prefer.",
    ],
    replyLabel: "Show me my options",
    replyEcho: "Show me my options",
    footnote: "Your 10 Jun delivery holds once payment is set up. Every day this waits moves it back.",
    callLabel: "Rather talk it through? I can call you",
  },
};

/**
 * Standard delivery — same conversation, slower clock. Only what differs.
 */
const STANDARD_OVERRIDES: Partial<Record<ConciergeMomentId, Partial<TurnWords>>> = {
  arrival: {
    says: [
      "Hi Sharath, I'm Shivi. Your payment is going through now.",
      "You're almost there. One short paperwork step comes next, then I can lock in your delivery date.",
      "Here's how the next few weeks look:",
    ],
  },
  dealerSearch: {
    says: [
      "That's the paperwork done, Sharath.",
      "Now I'm reaching out to dealers for your exact Creta, the 1.5 X-Line AT in Starry Night. Stock in this colour moves slowly, so it can take a couple of days to confirm. I'll chase it and keep you posted.",
    ],
    workingEtaLabel: "I'll have news in 2–3 days",
    timeSkipLabel: "2 days later",
  },
  dealerFound: {
    says: [
      "Welcome back, Sharath. I found your exact car.",
      "It took a couple of days, but three dealers came back, and Advaith Hyundai can deliver soonest, so I've reserved a fresh Creta for you with them. Its engine and chassis numbers are below. They'll call you today, and a one-time code on your phone confirms it's yours.",
    ],
  },
  moneyIntro: {
    says: [
      "Welcome back, Sharath. Let's sort out the payment.",
      "₹13,63,780 is left to pay on your Creta. You can finance it through me, at rates I've already negotiated with five banks, or arrange it yourself. Whichever you prefer.",
    ],
    footnote: "Your 25 Oct delivery holds once payment is set up. Delays here push it back.",
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
      "Found it, Sharath. This is your exact car.",
      "I've reserved a fresh Creta for you, with its engine and chassis numbers below. One quick code confirms it's yours. I'll notify you the moment it's ready to enter.",
    ],
  },
  carReserved: {
    says: [
      "Your code checked out, Sharath. This Creta is yours.",
      "You'll find its engine and chassis numbers on the card below.",
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
    "I'll let you know when your code is ready, Sharath.",
    "You'll get a notification, usually within the next half hour. Open the app and enter the code within 10 minutes, as it expires after that.",
  ],
  callLabel: "Prefer a call instead? I can call you",
};

export const OTP_ENTER_WORDS: TurnWords = {
  says: [
    "Your code is here. Enter the 6 digits.",
    "It's just landed on your phone ending 3210. Enter it before it expires.",
  ],
};

/** Demo masked phone the OTP appears to land on. */
export const OTP_DEMO_PHONE_SUFFIX = "3210";
