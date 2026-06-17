/**
 * Behind-the-scenes catalogue — every point in the post-booking journey where
 * the customer is asked to *wait*, told as a plain-language "before / after":
 *
 *  - `what`       — what this step is, explained so anyone (no prior context) gets it.
 *  - `today`      — how it's done by hand now: the actual human steps + the wait.
 *  - `automated`  — how the wait is removed: a system integration, a government
 *                   rail, a banking API, parallel network matching, etc. The
 *                   `method`/`kind` name the real mechanism.
 *  - `gain`       — the one-line takeaway.
 *  - `accent`     — the step's signature colour; the right panel's background and
 *                   accents recolour to it on every step change.
 *
 * `routeMatchers` drive the focus: the desktop view reads the phone iframe's
 * pathname and shows the step whose matcher is the longest substring of it.
 */

export type WaitStatus = "normal" | "fast" | "northstar";

/** The kind of automation lever — drives the icon and framing. */
export type AutoKind = "matching" | "integration" | "banking" | "govrail" | "system" | "owned";

export type CaseSide = {
  /** Who / what runs it, e.g. "Sourcing executive" / "Live network match". */
  actor: string;
  /** Plain-language steps performed, in order. */
  steps: readonly string[];
  /** Headline time, e.g. "2–3 days" / "Minutes". */
  metric: string;
  /** Small caption under the metric. */
  metricNote: string;
  /** 1–2 short descriptor chips. */
  tags: readonly string[];
};

export type AutomatedSide = CaseSide & {
  /** The real automation lever, e.g. "OEM system integration". */
  method: string;
  kind: AutoKind;
};

export type WaitStep = {
  id: string;
  num: number;
  /** Short chapter label, e.g. "Identity", "Sourcing", "Money". */
  phase: string;
  title: string;
  /** The line the customer reads on the phone (Shivi's voice). */
  customerSees: string;
  /** Plain explanation of the step — assumes no prior knowledge. */
  what: string;
  today: CaseSide;
  automated: AutomatedSide;
  /** One-line takeaway, e.g. "Days → minutes". */
  gain: string;
  /** Signature colour (6-digit hex) — recolours the right panel on change. */
  accent: string;
  routeMatchers: readonly string[];
  launchHref: string;
  status?: WaitStatus;
};

export const JOURNEY_START_HREF = "/quote/";

export const WAIT_STEPS: readonly WaitStep[] = [
  {
    id: "payment",
    num: 1,
    phase: "Checkout",
    title: "Payment in, price locked",
    customerSees: "“Your payment is in and your price is locked.”",
    what: "Before anything can start, the payment has to clear and the car’s price has to be locked in so it can’t change while everything else gets arranged.",
    accent: "#4f46e5",
    today: {
      actor: "Booking desk",
      steps: [
        "The payment gateway confirms the money has cleared",
        "A teammate records the order and the locked price by hand",
        "The price-lock window starts",
      ],
      metric: "Minutes",
      metricNote: "before things move",
      tags: ["Manual entry"],
    },
    automated: {
      method: "Event-driven automation",
      kind: "system",
      actor: "Auto-settle & lock",
      steps: [
        "A payment webhook confirms the money has cleared",
        "The locked order is written automatically",
        "The price-lock timer starts — no human touch",
      ],
      metric: "Instant",
      metricNote: "the moment you pay",
      tags: ["Event-driven"],
    },
    gain: "Minutes → instant",
    routeMatchers: ["/payment/booking-success", "/quote"],
    launchHref: "/payment/booking-success/",
    status: "fast",
  },
  {
    id: "kyc",
    num: 2,
    phase: "Identity",
    title: "Verifying your identity",
    customerSees: "“Got your documents — verifying them now.”",
    what: "By law we must confirm you are who you say you are — checking your PAN and Aadhaar — before the purchase can open in your name.",
    accent: "#2563eb",
    today: {
      actor: "KYC executive",
      steps: [
        "Your documents wait in a queue for a person to open",
        "They read each one and type the details in",
        "Then check them against government records (PAN & Aadhaar)",
      ],
      metric: "Up to 1 day",
      metricNote: "the customer waits",
      tags: ["Queue-based", "Manual"],
    },
    automated: {
      method: "Government ID verification",
      kind: "integration",
      actor: "Instant e-KYC",
      steps: [
        "PAN is verified straight against the NSDL database",
        "Aadhaar is confirmed through DigiLocker",
        "An ML check flags only genuine fraud risks to a human",
      ],
      metric: "~30 seconds",
      metricNote: "fully automated",
      tags: ["DigiLocker", "Fraud-checked"],
    },
    gain: "A day → seconds",
    routeMatchers: [
      "/kyc/documents-received",
      "/kyc/verification-in-progress",
      "/kyc/verification-failed",
    ],
    launchHref: "/kyc/documents-received/",
  },
  {
    id: "sourcing",
    num: 3,
    phase: "Sourcing",
    title: "Finding your exact car",
    customerSees: "“Reaching out to dealers for your exact Creta — runs overnight.”",
    what: "We have to find a dealer who actually has your exact car in stock — the right variant and colour — and can deliver it the soonest.",
    accent: "#d97706",
    today: {
      actor: "Sourcing executive",
      steps: [
        "Calls and messages dealers one at a time",
        "Waits for each to reply with what’s in stock",
        "Compiles the answers by hand to pick the best one",
      ],
      metric: "Overnight–3 days",
      metricNote: "the customer waits",
      tags: ["One-by-one", "Waits on callbacks"],
    },
    automated: {
      method: "Automated dealer matching",
      kind: "matching",
      actor: "Live network match",
      steps: [
        "Queries every dealer in the network at the same time",
        "Ranks them live by stock, delivery date and price",
        "Surfaces the single best match in one shot",
      ],
      metric: "Minutes",
      metricNote: "all dealers at once",
      tags: ["Parallel", "Live data"],
    },
    gain: "Days → minutes",
    routeMatchers: ["/kyc/processing"],
    launchHref: "/kyc/processing/",
  },
  {
    id: "reservation",
    num: 4,
    phase: "Reservation",
    title: "Reserving your exact car",
    customerSees: "“I found your exact car — engine and chassis numbers below.”",
    what: "Once a dealer with your car is found, one specific fresh unit — with its own engine and chassis number — has to be reserved and held in your name.",
    accent: "#7c3aed",
    today: {
      actor: "Dealer + allocation desk",
      steps: [
        "The dealer reserves a car on the manufacturer’s system",
        "Their yard team is chased to assign a fresh unit",
        "Its engine and chassis numbers are noted by hand",
      ],
      metric: "Hours–days",
      metricNote: "the customer waits",
      tags: ["Manual", "Chasing the yard"],
    },
    automated: {
      method: "OEM + dealer DMS integration",
      kind: "integration",
      actor: "Reserve + auto-pick unit",
      steps: [
        "The reservation is placed on the manufacturer’s system over an API",
        "The dealer’s live inventory is read to pick the newest unit",
        "Its engine and chassis numbers are captured automatically",
      ],
      metric: "Minutes",
      metricNote: "freshest unit, automatically",
      tags: ["Live inventory", "Automatic"],
    },
    gain: "Days → minutes",
    routeMatchers: ["/kyc/booking-accepted"],
    launchHref: "/kyc/booking-accepted/",
  },
  {
    id: "confirmation",
    num: 5,
    phase: "Confirmation",
    title: "Confirming it’s yours",
    customerSees: "“Your code is here — enter the 6 digits to lock it in.”",
    what: "A one-time code has to be confirmed so the reservation is locked to you — and no one else can take the car.",
    accent: "#0d9488",
    today: {
      actor: "Dealer staff + you",
      steps: [
        "The dealer phones you to read out a one-time code",
        "You read it back to them over the call",
        "Miss the call and the held car can slip away",
      ],
      metric: "Hours · miss-prone",
      metricNote: "and easy to miss",
      tags: ["Phone call", "Miss-prone"],
    },
    automated: {
      method: "In-app one-time code",
      kind: "system",
      actor: "On-screen OTP",
      steps: [
        "The code is delivered straight to the app — no phone call",
        "You enter the 6 digits right in the app",
        "The reservation locks the moment they match",
      ],
      metric: "Instant",
      metricNote: "no missed calls",
      tags: ["In-app", "Reliable"],
    },
    gain: "Hours → instant",
    routeMatchers: ["/kyc/otp-verify", "/kyc/booking-confirmed"],
    launchHref: "/kyc/otp-verify/",
  },
  {
    id: "loan",
    num: 6,
    phase: "Money",
    title: "Getting your loan approved",
    customerSees: "“Your application’s with the bank — 2–3 days.”",
    what: "If you’re financing the car, a bank has to check your eligibility and approve a loan amount before the car can be paid for.",
    accent: "#16a34a",
    today: {
      actor: "Loan coordinator",
      steps: [
        "Sends your file to one bank and waits",
        "The bank calls you to verify your details",
        "A missed call or a query restarts the wait",
      ],
      metric: "2–3 days",
      metricNote: "the customer waits",
      tags: ["One bank", "Phone verify"],
    },
    automated: {
      method: "Lending APIs + account aggregator",
      kind: "banking",
      actor: "Multi-bank engine",
      steps: [
        "Your application goes to all five partner banks over API at once",
        "Eligibility is checked digitally via account aggregator — no call",
        "The best approved offer comes back",
      ],
      metric: "Same day",
      metricNote: "five banks compared",
      tags: ["Parallel", "Digital"],
    },
    gain: "Days → same day",
    routeMatchers: [
      "/payment/loan-processing",
      "/payment/loan-sanctioned",
      "/payment/loan-application",
      "/payment/loan-documents",
      "/payment/acko-drive-finance",
      "/payment/choose",
    ],
    launchHref: "/payment/loan-processing/",
  },
  {
    id: "disbursement",
    num: 7,
    phase: "Money",
    title: "Moving the money to the dealer",
    customerSees: "“The bank is moving your loan to the dealer — 24–48h.”",
    what: "After approval, the bank actually transfers the loan amount to the dealer — and we have to confirm that exact payment landed before delivery prep can begin.",
    accent: "#0891b2",
    today: {
      actor: "Finance ops",
      steps: [
        "Waits for the bank to release the funds",
        "Manually matches the bank’s payment reference to your order",
        "Confirms to the dealer once it’s matched",
      ],
      metric: "24–48 hours",
      metricNote: "the customer waits",
      tags: ["Manual matching"],
    },
    automated: {
      method: "Payment auto-reconciliation",
      kind: "system",
      actor: "UTR auto-match",
      steps: [
        "The bank transfer is tracked in real time",
        "The payment reference is auto-matched the moment funds land",
        "The dealer is confirmed with no one in the loop",
      ],
      metric: "On landing",
      metricNote: "matched automatically",
      tags: ["Real-time", "Automatic"],
    },
    gain: "Days → automatic",
    routeMatchers: [
      "/payment/down-payment-insurance-setup",
      "/payment/loan-disbursement-received",
      "/payment/pay-down-payment",
      "/payment/enter-disbursement",
      "/payment/enter-sanctioned",
      "/payment/margin-money",
      "/payment/pay-insurance-premium",
    ],
    launchHref: "/payment/down-payment-insurance-setup/",
  },
  {
    id: "insurance",
    num: 8,
    phase: "Insurance",
    title: "Issuing your insurance",
    customerSees: "“Issued the moment your payment landed — insurance is us.”",
    what: "The car can’t be registered without an active insurance policy. This step is the proof of what’s possible — because ACKO is the insurer, there’s nothing to chase.",
    accent: "#059669",
    today: {
      actor: "No one — it’s instant",
      steps: [
        "ACKO is the insurer, so there’s no third party to wait on",
        "The policy goes live the second the premium is paid",
      ],
      metric: "Instant",
      metricNote: "already, today",
      tags: ["Owned end-to-end"],
    },
    automated: {
      method: "Owned rail · ACKO is the insurer",
      kind: "owned",
      actor: "Instant issuance",
      steps: [
        "This is the standard every step above is built to reach",
        "When ACKO owns the rail end-to-end, the wait disappears",
      ],
      metric: "Instant",
      metricNote: "the bar to hit",
      tags: ["North star"],
    },
    gain: "Already instant — the bar",
    routeMatchers: ["/payment/car-delivery-insurance-prep", "/payment/insurance-premium-success"],
    launchHref: "/payment/car-delivery-insurance-prep/",
    status: "northstar",
  },
  {
    id: "rto",
    num: 9,
    phase: "Registration",
    title: "Registering with the RTO",
    customerSees: "“Your file’s at the RTO — a few working days.”",
    what: "Finally, the car has to be registered with the government RTO and get its number plate before it can be delivered.",
    accent: "#e11d48",
    today: {
      actor: "RTO runner",
      steps: [
        "A runner physically takes the file to the RTO",
        "Waits in the government queue and follows up in person",
        "Collects the registration number when it’s issued",
      ],
      metric: "Several days",
      metricNote: "and hard to track",
      tags: ["In-person", "Opaque"],
    },
    automated: {
      method: "Government digital rail",
      kind: "govrail",
      actor: "Vahan e-registration",
      steps: [
        "Registration is filed digitally through the government’s Vahan system",
        "Road tax is paid automatically",
        "Status is tracked live and your number pulled the moment it’s issued",
      ],
      metric: "Digital",
      metricNote: "filed & tracked live",
      tags: ["Vahan", "Live status"],
    },
    gain: "Days → digital & tracked",
    routeMatchers: ["/payment/car-delivery-rto", "/payment/car-delivery-schedule"],
    launchHref: "/payment/car-delivery-rto/",
  },
];

/**
 * Resolve which wait step the phone is on, by longest-substring match against
 * the iframe pathname. Returns the step id, or null if none match.
 */
export function matchStepIdForPath(pathname: string): string | null {
  const path = pathname.toLowerCase();
  let best: { id: string; len: number } | null = null;
  for (const step of WAIT_STEPS) {
    for (const matcher of step.routeMatchers) {
      if (path.includes(matcher) && (!best || matcher.length > best.len)) {
        best = { id: step.id, len: matcher.length };
      }
    }
  }
  return best?.id ?? null;
}

export function stepById(id: string | null): WaitStep | undefined {
  return WAIT_STEPS.find((s) => s.id === id);
}
