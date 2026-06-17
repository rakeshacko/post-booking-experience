# Post-booking experience — implementation plan

Living document: update this file when flows, routes, or UI behavior change.

---

## Concierge experience (branch: `concierge`) — first draft

The journey is being redesigned as a conversation with **Shivi** (first-person voice, no chat thread). Every converted page is a **turn**: the user's last reply lands as a sent chip (echo) → Shivi speaks (word-by-word) → she hands over an artifact (card) or visibly works (activity feed) → the user replies via user-voice CTAs, or a demo **time-skip pill** stands in for days passing.

### Booking & Delivery Policy alignment

The business policy (5 stages; Booking Confirmation = lock point; 50%-of-total-paid cancellation; one ₹5,000 model/colour change; CYP deadlines; 100% refund on ACKO failure) governs all flows. **Stage mapping:** Booking Request = arrival · KYC = identity chapter · Booking Confirmation = dealer lock (booking-accepted/confirmed) · CYP = the money chapter · Delivery Processing = post-payment delivery chapter.

**Cancellation (built, policy-correct):** “Cancel my purchase” is available from the manage sheet at **every** stage in **every** flow. The sheet computes total paid from the URL plans (lock ₹10,000 + DP/instalments) and passes `?paid=&stage=` to `/kyc/cancel-booking` (`ConciergeCancelScreen`, no flow guard). Pre-confirmation: free, full refund. Post-confirmation: 50% of **total paid** retained (grows with payments — ₹3,10,000 paid → ₹1,55,000 retained). The turn shows the refund math before any commitment, Shivi attempts a save (change for ₹5,000 / call), reasons collected in her voice, farewell keeps the door open; legacy success route redirects. Fee copy swept: manage sheet + lock-boundary footnotes now state the 50%-of-paid rule, never a flat ₹5,000 cancellation fee.

**One-time change rule (built, policy §1.9 / §2.3):** `lib/change-policy.ts` tracks post-lock changes (sessionStorage; reset on demo flow switch). Modify-selection routes are open to **express/standard** (not just the modify demo flows); the manage sheet records the entry stage (`pre`/`post`) on the way in. Pre-lock: changes free and unlimited (“No change fee”). Post-lock, unused: row reads “One change — ₹5,000 plus any price difference”, and the review screen charges the **“One-time change fee”** (₹5,000) for express/standard post-lock entries as well as modify-with-charges. A completed post-lock change records the allowance as used (on the modify-return confirmation). Post-lock, used: row reads “Change used — another means cancel & rebook” and routes to the cancel turn with `reason=second-change`, where Shivi frames it per policy: *“Changing again works as a cancel-and-rebook: 50% of what you've paid is held back, and you start fresh.”* The dealer-found footnote says “your **one** change costs ₹5,000”. Loan one-time rules (§6.2/6.3) are surfaced conversationally on the loan wait: “you get one free switch; just call me.”

**Inability to deliver (built, policy §1.14 / §2.4):** the allocation-pending turn carries a second demo pill (“If no car is found”) → `/car-allocation/failed` (`ConciergeAllocationFailedScreen`). Shivi apologises and owns it (“This one is on us, not you — so every option below is free, and your money is never stuck”), with three free outs: **switch to standard delivery** (flips the flow — the pending turn re-renders on the standard clock, delivery becomes 25 Oct '26, echo lands), **free car change** (entry stage `pre` — no fee, does not consume the one-time allowance), or **full refund** (cancel turn `reason=our-failure`: ₹0 charge at any stage, “Refund me ₹10,000” skips the reason sheet — asking what went wrong when we failed is tone-deaf).

**Known policy deviations (reported, not yet built):** insurance *selection* belongs in CYP (we select+pay at the RTO gate — proposal: confirm Shield at ₹0 during CYP, pay at the gate); no unified CYP deadline/auto-cancel state; loan agreement/e-mandate signing step missing from the wizard; §6 loan scenarios beyond the surfaced copy (rejection paths, the actual provider-switch/amount-change flows, same-day self-finance switch in Delivery Processing); cheaper-change invoice adjustment messaging missing; change-selection during Delivery Processing not yet blocked; Pre-Launch booking type absent; inability-to-deliver during *other* stages (e.g. post-payment) has no entry point yet; 50 km delivery-zone promise unsurfaced; allocation/VIN exposed as customer-facing turns (deliberate concierge transparency — needs a policy-doc blessing or comms-language alignment).

**Cold-open rule:** every turn is a re-entry point days apart, not a step in one sitting — copy must read correctly to someone who just reopened the app. Lead lines are standalone news (“Your Creta is reserved in your name.”), never reactions (“Done —”) unless the user acted seconds ago on the previous screen; day stamps carry event anchors (“Day 2 · after the dealer's call”); day-boundary turns greet the return (“Morning, Sharath —”, standard: “Welcome back —”). The only legitimately reactive turn is documents-received (the user just tapped submit).

**Paperwork rule:** never frame identity/KYC as “verify you” (confrontational) — but also never name a third party as the documents' recipient unless that's actually true (we collect and hold KYC; the dealer needs it later, and we don't surface that yet). Honest framing: documents are what the *purchase* runs on — “Your PAN and Aadhaar open the purchase in your name — they're what the invoice and RTO registration run on.” Shivi runs the checks herself (“Running the standard checks…”, “Paperwork's done ✓”); documents “stay encrypted with me, used only for what your purchase needs.” Bank document asks in finance journeys may name the bank — the bank genuinely receives them.

**No interstitials rule:** “Payment option confirmed”-style success screens break the conversation — the user's choice should land as an echo on Shivi's next action turn instead. The three payment-choice celebrations are removed (routes 308 to the action turns); the choice echoes (“Let's finance via HDFC Bank”).

**Demo prefill:** the loan application wizard starts fully prefilled (`createDefaultLoanApplicationState()` returns complete demo data; `fresh=1` re-seeds it) so Continue is enabled on every step — fields stay editable.

**Policy transparency:** Shivi's arrival promise (“fully refundable right now — I'll flag it before that ever changes”) is kept: the last free turn (`/kyc/processing`) carries “As promised, a heads-up: changes and cancellation are free until I lock a dealer — after that, a ₹5,000 fee applies”; dealer-found restates it with the ⋮ menu pointer. The manage sheet (the user's “out”) is reachable from every converted turn including `/payment/choose`, and its fee copy tracks the journey phase (free through processing, ₹5,000 post-accept, modify hidden once money is paid).

**Insurance plan details & the acko.com price gap:** users comparison-shop mid-flow; discovering a cheaper number on acko.com themselves is what triggers support calls. The experience preempts it instead of defending after the fact. The premium card carries the value line up front (“Covered for ₹9,54,900 (full ex-showroom) · 5 add-ons included”); the coverage sheet (`InsuranceCoverageBottomSheet`, content in `insurance-coverage-content.ts`) is the full justification: Shivi's framing → **IDV block** (full ex-showroom, zero haircut; RTI pays full on-road ₹13,73,780) → base covers → **5 included add-ons** (RTI, engine protect, consumables, RSA, key cover) → **“Seen a lower price on acko.com?”** like-for-like table (this plan ₹37,000 vs website default ₹29,800 at −5% IDV/no add-ons vs website matched ₹37,450) → **price promise** (“find this exact cover for less on acko.com, I'll refund the difference”).

**ACKO Drive Shield (exclusive package):** the bundle is branded **Shield** and positioned as *only available with cars bought on ACKO Drive* — which dissolves like-for-like comparison at the root: there is nothing identical to find on acko.com. The sheet now says so plainly (“You won't find Shield on acko.com”) and reframes the table as *build-it-yourself-costs-more* (“acko.com, built piece by piece — ₹37,450”). Card title: “ACKO Drive Shield · zero depreciation”, includes-line leads with “Only on ACKO Drive”.

**Pricing-team commitments required (numbers in the sheet must stay true):**
0. **Shield exclusivity** — the Shield SKU (this IDV + these 5 add-ons as one bundle) is never sold on acko.com or other channels; exclusivity is what makes the comparison story unbeatable, so it must be contractual, not accidental.
1. **IDV floor** — drive-channel policies are written at full ex-showroom IDV, zero new-car haircut, and the exact IDV prints in the flow and on the policy doc.
2. **Bundle integrity** — the 5 listed add-ons are in the issued policy at the quoted ₹37,000, not endorsement-priced later.
3. **Like-for-like parity** — drive price ≤ acko.com price for identical spec (same IDV + same add-ons), monitored continuously; the comparison row is fed by the live quote API, never hardcoded.
4. **Price promise underwriting** — sign-off on “refund the difference” for exact-spec matches, with the claim handled by the concierge (Shivi-initiated refund, no forms).
5. **Anchor substantiation** — the ₹60,000 strikethrough must be a defensible dealer-channel average quote for this model, documented.
6. **Quote freshness** — the website-default comparison number (₹29,800-class) re-fetched on each render in production; staleness window agreed (e.g. 24h max).

**AckoDrive finance redesign (loan confirmation → e-sign → disbursement):** the financed path now treats the bank's number as an **approved ceiling**, valid for **24 hours**, presented at **loan confirmation** (`/payment/loan-sanctioned`, `LoanSanctionedScreen`). The down payment is the dominant "due now" figure; a secondary **"borrow less"** control reveals a slider capped at the approved amount (`MIN_LOAN_INR` floor, `SLIDER_STEP`) with the down payment rising live (`cashDownPaymentDueInr(loan)`). Rules: amount can only go **down**, never above approved; on commit the split **locks** and feeds the agreement + disbursement; on expiry the terms must be re-confirmed. This **supersedes the earlier "no loan-amount slider" decision** — the slider is now a lower-only choice within the approval, not a free pick of the bank's number. A new **digital agreement** step (`/payment/loan-agreement`, `LoanAgreementScreen`) sits between confirmation and the down payment — tripartite (you / bank / dealer-or-AckoDrive), e-signed in-app, with a labelled in-person fallback. The whole sequence is surfaced as a live status (`lib/finance-status.ts` 8 stages → `components/payment/FinanceStatusTimeline.tsx`, states done / waiting-on-you / waiting-on-bank / upcoming) on the loan-processing, confirmation and agreement screens — never showing "disbursed" without a transfer reference. Card payment for the down payment is a deliberately separate, additive workstream (the DP step is built to accept it later, not implemented). Dealer is never named on the financed path when dealer-visibility is `acko_only` ("Bank → AckoDrive", "straight to AckoDrive"). **The price identity (business rule — all three finance flows):** `price lock (₹10,000) + bank disbursement + insurance (₹37,000) + down payment = locked price (₹13,73,780)`. The bank's disbursement remains the bank's decision; on the financed path the customer may only confirm it or borrow less (`/payment/choose-loan-amount` stays a legacy redirect — the live slider is on the loan-confirmation screen). The down payment is **derived** (`cashDownPaymentDueInr()` in `loan-amount-demo-constants.ts`; ACKO demo: HDFC disburses ₹10,76,780 → DP ₹2,50,000). `CarPriceBreakupCard` makes the identity visible on loan-sanctioned, pay-down-payment, and full-payment screens: lock tagged **Paid ✓**, disbursement tagged **Bank → dealer**, insurance tagged **Later · before delivery**, and the due-now row highlighted — with the footer line “These parts always add up to your locked price — nothing extra, ever.” The `down_payment` URL param now always means **net cash due now** (self-finance screens pass `carDownPaymentPortionInr`; full payment cash = `cashDownPaymentDueInr(0)` = ₹13,26,780, finally net of the lock). Self-finance keeps its enter-the-bank's-number screens (reporting the bank's figure, not choosing); partial instalments work on raw net figures.

**Insurance timing (business rule):** the ₹37,000 insurance amount is needed only just before delivery, for RTO registration — never framed as due after disbursement. Disbursement-received ends with a “When your car's nearly ready” time-skip; the premium ask reads as the final pre-delivery gate (“The RTO won't register a car without an active policy”); all summary cards/sheets say “pay later, just before delivery — needed for RTO registration”.

**What's-left sheet:** the old “See your delivery timeline” link is now the user asking “What's left, Shivi?”, and the sheet opens with her framing (“Here's the road to your driveway — I'll nudge you at every step.”) above the timeline rail.

**Delivery schedule (journey finale):** `/payment/car-delivery-schedule` is a bespoke two-phase turn — day + window chips inline (flow-aware dates; “Lock this slot” disabled until both picked), then her confirmation with confetti (`fireBasicCannon`), the car card with the arrival line, and a “Start over” demo skip to `/quote`. The old screen's stale `nextHref="/kyc"` dead-end is gone.

**Honest time rule (both directions):** real-world third-party work (dealers, yard allocations, RTO) must never fake-complete on screen — and ACKO's own work must never fake-slow. ACKO **is** the insurer: the policy issues the instant the premium lands (“Issued the moment your payment landed — insurance is us, after all”), a brand moment, not a wait. The only honest waits in the delivery chapter are the dealer's prep and the RTO. `WorkingNarration` has two modes — `live` for quick system actions that tick off while you watch (e.g. document submission), and `ongoing` for real-world waits: the first task spins, the rest queue with dashed circles, a clock row sets the expectation (“Expect news from me by tomorrow morning”), and the **result is reported in Shivi's dialogue on the next turn** (“I heard back overnight — three dealers…”). Set via `workingMode` / `workingEtaLabel` in the script. The word **“booking” never appears in user-facing copy** — the language is: payment received → verify identity → find your car → reserve it → assign the exact unit → sort the money → delivery.

### Primitives (`components/concierge/`, `lib/concierge/`)

| Piece | Purpose |
|---|---|
| `ConciergeTurnShell` | Page grammar: day-stamp divider, echo chip, `ShiviDialogue`, artifact slot, `WorkingNarration`, fixed footer (footnote + replies + optional call affordance + time-skip); nav has back + manage-sheet menu only — no persistent Shivi pill |
| `ConciergeMoment` | Binds a script moment to routes + artifacts (flow-aware via `readExperienceFlow()`) |
| `ConciergeVerifyIdentityScreen` | Bespoke `/kyc` turn — PAN/Aadhaar upload cards inline as the conversation; reply disabled until both docs are in (words: `VERIFY_IDENTITY_WORDS`) |
| `ShiviCallSheet` | Call-offer confirmation sheet — contextual call affordances per turn (`callLabel` in the script; `callLabel` prop on the shell adapter for finance screens) instead of ambient presence chrome. **Always her voice:** “Stuck? I can call you” — never third person. **Every waiting/watching turn has one** — waiting is when anxiety peaks (“Can't sleep on it? I can call you”, “Anxious about the loan? I can call you”) |
| `NextStepCard` | The user's single pending action — purple highlight, shimmer attention sweep, clock ETA row (e.g. dealer OTP call: “Pick up Advaith Hyundai's call · Expected today, before 6:00 PM”) |
| `lib/concierge/script.ts` | All of Shivi's lines per moment; standard-delivery overrides merge over the express base |
| `lib/concierge/echo.ts` | sessionStorage handoff: reply label → sent chip on the next turn (StrictMode-safe consume) |
| `lib/concierge/instant.ts` | `sessionStorage.pbe-concierge-instant = "1"` renders turns fully revealed (demos/automation) |
| `artifacts.tsx` | `AmountReceivedCard`, `PlanList`, `NoteCallout`, `CarSummaryCardLite` |

### Converted moments (express + standard)

`/payment/booking-success` (arrival — Shivi intro + plan; initial price-lock checkout now lands here via `buildBookingLockSuccessHref`, modify returns unchanged) → `/kyc` (identity ask **with upload inline**; Shivi intro sheet removed; `/kyc/upload` 302s here — verification-failed re-upload links included) → `/kyc/documents-received` (working) → `/kyc/verification-in-progress` (kyc_failed fork + cancel_no_charges skip-hide preserved) → `/kyc/processing` (dealer search, working) → `/kyc/booking-accepted` (found it + OTP note) → `/kyc/booking-confirmed` (reserved; modify-selection returns keep the old celebration) → `/car-allocation/*` (exact unit) → `/payment/default` (money intro) → `/payment/choose` (header converted to a Shivi ask; CTAs in user voice).

Buying-guide routes are bypassed on the spine (the arrival plan replaces them). No-"booking" sweep applied to converted surfaces + manage sheet ("Your car", "Make a change", "Cancel my purchase", "Paid so far", "Price lock amount").

### Finance & delivery — converted via the shell adapter

`KycBookingProcessingScreen` is now a **concierge adapter** (renders `ConciergeTurnShell`; same props API): headline/subline → Shivi's lines, infoBox/summary card → artifacts, demo “Next” → “Skip ahead” time-skip pill, real CTAs → user replies, ctaWarningLine → footnote, delivery-timeline sheet behind a footer link. This converts in one move: finance action, loan processing (+ bank-call `NextStepCard` with ETA + stake), loan sanctioned, pay down payment, insurance setup/disbursement waits, disbursement received, pay insurance premium, insurance prep, RTO, delivery schedule, self-finance action, margin money slip, full payment. Voice pass applied to all their copy (first person, honest time, stakes tied to the delivery date). Loan application wizard keeps its milestone rail + inline forms; step headings are her asks (“First, the loan itself — how much and how long?”).

**Day stamps are real dates** with event anchors (“Wed 23 Apr · after the dealer's call”), never “Day 1” journey bookkeeping; omitted when no time has passed. **Customer-dependency stakes** are explicit wherever the user's action gates the timeline (footnotes + `stakeLabel` on next-step cards).

**Known debt:** celebration interstitials (finance/self-finance/full-payment confirmed, down-payment success), choose-loan-amount + enter-sanctioned/disbursement headers, modify/cancel flow screens, verification-failed, and `WhatsNextTimeline` labels still use the old voice — next pass.

**Source spec:** `docs/detailed_post_booking_experience.docx`  
**Design (Figma):** [Post-booking-experience](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience) — bank sheet node `1941:12822`.

---

## Tech stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- Local dev: `npm run dev` → **http://localhost:3000/post-booking-experience** (`next dev --turbopack --port 3000`; `BASE_PATH` from `lib/site-config.ts`, default `/post-booking-experience`)
- Static export + GitHub Pages: `npm run build` → `out/`; prefer `import` from `@/assets/` or `publicAssetPath()` for `/public/assets/`

---

## Experience flows (Express / Standard / Verification failed / Modify no charges / Modify with charges / Cancel no charges)

Switch on **`/quote`** via the top-left menu (`QuoteFlowMenuSheet`). Active flow is stored in **`sessionStorage`** (`post-booking-experience-flow`) via `readExperienceFlow()` in `lib/experience-flow.ts`.

| Flow | Selectable | Journey |
|------|------------|---------|
| **Express delivery** | Yes | Default — full route map below |
| **Standard delivery** | Yes | **Same routes as express** until a screen branches on `readExperienceFlow() === "standard"` |
| **Verification failed** | Yes | Same as express until KYC verification in progress → `lib/kyc-verification-outcome.ts` |
| **Change selection without any charges** | Yes | Express path through **`/kyc` (KYC pending)** only; post–KYC-pending routes redirect to `/kyc`; manage booking fees always free (`lib/manage-booking-modify.ts`); modify-selection routes unchanged |
| **Change selection with 50% charges** | Yes | **Same routes as express** through **`/kyc/booking-accepted`**; change selection from booking accepted (`isModifyWithChargesFlow()` + `isChangeSelectionAvailablePhase`); ₹5,000 change fee in review-and-pay (`lib/modify-selection-review-pay-content.ts`) |
| **Cancellation with no charges** | Yes | Express path through **`/kyc/verification-in-progress`** (inclusive); post–verification-in-progress routes redirect to `/kyc/verification-in-progress`; manage booking fees always free; **Cancel booking** → confirm full page → reason bottom sheet → success; **Change selection** shown but not clickable (normal styling, no `disabled`) |

### Common vs flow-specific changes

- **Common** — edit shared components/libs with **no** flow guard; applies to Express and Standard.
- **Standard only** — `isStandardDeliveryFlow()` / helpers in `lib/experience-flow-content.ts` (e.g. car card delivery line + icon).
- **Express only** — `isExpressDeliveryFlow()` or default branch when not standard.
- **Modify no charges** — `isModifyNoChargesFlow()` / `lib/experience-flow-journey.ts` (journey cap + always-free modify fees).
- **Modify with charges** — `isModifyWithChargesFlow()` / `getModifySelectionFlowRedirectTarget` (full express to booking accepted; change fee in booking amount).
- **Cancel no charges** — `isCancelNoChargesFlow()` / `lib/experience-flow-journey.ts` (journey cap through verification in progress + cancel-booking routes); `lib/cancel-booking-content.ts`, `lib/cancel-booking-success-content.ts`, `lib/cancel-booking-stagger.ts`.

### Journey map (`lib/journey-routes.ts`)

- **`JOURNEY_PATHS`** — canonical path strings for milestones (KYC hub → processing → booking accepted → car allocation → payment).
- **`resolveJourneyPhase(pathname)`** — coarse phase for fees and future branching (not payment instalment state).
- **`isIdentityFunnelPhase`** — free modify-booking fees (`/kyc` through `/kyc/processing` only).
- Prefer importing paths from here when touching navigation; migrate `router.push` strings incrementally.

### Demo vs product CTAs (GitHub Pages)

- **`primary-cta`** — filled `#121212`; real user actions (Pay, Complete KYC, Choose how to pay, etc.).
- **`demo-nav-cta`** — outline `#121212`, no fill; label **`Next`** only (`lib/demo-nav-cta.ts`, `primaryOrDemoNavCtaClass()`). Used on `KycBookingProcessingScreen`, `KycVerificationInProgressScreen`, buying guide steps 1–3.

---

## Routes (current)

| Path | Purpose |
|------|---------|
| `/` | Redirects to `/quote` |
| `/behind-the-scenes` | **Desktop "behind the scenes" view** (wide screens) — the mobile prototype in a phone frame (iframe) on the left (~1/3), and every journey *wait* on the right (~2/3): what's happening operationally, who runs it by hand today, and the real automation lever (integration / government rail / banking API / parallel matching / in-app code). Light mode; the panel recolours to a per-step accent on every change. Live-syncs the active step to the phone's route and offers per-step jumps. Source: `components/behind-the-scenes/BehindTheScenesDesktop.tsx`, wait catalogue in `lib/behind-the-scenes/steps.ts`. Steps track the concierge spine (`lib/concierge/script.ts`), incl. the dealer-found turn (reservation + exact unit) and the on-screen OTP (`/kyc/otp-verify`). |
| `/quote` | Entry / quote screen |
| `/payment/choose` | Choose payment method (ACKO Drive / self finance / full payment) |
| `/payment/acko-drive-finance-confirmed` | After bank sheet **Confirm banking partner** — celebration + docs card; **Continue** → `/payment/acko-drive-finance-action?bank=` |
| `/payment/acko-drive-finance-action` | ACKO Drive loan application action — same content as confirmed; **Continue with loan application** → `/payment/loan-documents-upload?bank=` |
| `/payment/loan-documents-upload` | Loan document upload (after ACKO Drive action step); accepts optional `?bank=` |
| `/payment/loan-processing` | ACKO loan processing — `LoanBookingProcessingScreen` + **`LoanProcessingWhatsNext`** (`variant` default `processing`) |
| `/payment/loan-sanctioned` | **Loan confirmation** (`LoanSanctionedScreen`) — approved-amount ceiling + 24h countdown + down-payment-primary + lower-only "borrow less" slider; commit → `/payment/loan-agreement` |
| `/payment/loan-agreement` | **Digital agreement** (`LoanAgreementScreen`) — tripartite e-sign of the locked split; sign → down-payment checkout |
| `/payment/choose-loan-amount` | Choose loan amount slider (`?bank=`); **Confirm loan amount** → `LoanSubmitConfirmBottomSheet` → `/payment/pay-down-payment?bank=&loan_amount=&down_payment=` |
| `/payment/pay-down-payment` | Pay down payment hero (`KycBookingProcessingScreen`); CTA → `/payment?down_payment=` (instalments demo) |
| `/payment/down-payment-success` | Instalment / full DP celebration → remaining or `/payment/down-payment-insurance-setup` |
| `/payment/down-payment-insurance-setup` | Down payment received — loan disbursement processing or full-payment complete; `?loan_amount=` (+ `original_down_payment` / `down_payment=0` when DP complete) |
| `/payment/loan-disbursement-received` | Loan disbursed ack (`?loan_amount=`, optional `?transaction_id=`) — **Continue** → `/payment/pay-insurance-premium` |
| `/payment/pay-insurance-premium` | Insurance premium due — `ZeroDepInsuranceCoverageCard` + CTA → mock checkout |
| `/payment/insurance-premium-success` | After insurance payment |
| `/payment/car-delivery-insurance-prep` | Car insurance prep in progress |
| `/payment/car-delivery-rto` | RTO registration in progress — `RtoRegistrationStatusCard` info callout |
| `/payment/car-delivery-schedule` | Pick delivery slot |
| `/payment/enter-sanctioned-loan-amount` | Self finance — declare sanctioned / disbursement amount |
| `/payment/margin-money-slip` | Self finance — margin money slip after full DP |
| `/payment/pay-full-payment` | Full payment action screen |
| `/payment/full-payment-option-confirmed` | Full payment celebration — “Payment option confirmed”; auto-advance (~3s) → action |
| `/payment/full-payment-confirmed` | Full payment action — `KycBookingProcessingScreen` + amount breakdown; **Continue** → `/payment/pay-full-payment` |
| `/payment/loan-application` | Wizard entry (redirects to first step) |
| `/payment/loan-application/loan-details` … `references`, `submitted` | ACKO loan application wizard (`lib/loan-application-state.ts`) |
| `/kyc/verification-failed` | KYC verification failed — 1 retry; 2nd failure → cancelled + refund screen (demo: `sessionStorage` attempt count) |
| `/payment/self-finance-confirmed` | Self finance — post-confirm celebration; **Continue** → `/payment/self-finance-action` |
| `/payment/self-finance-action` | Self finance — proforma hero + **`LoanProcessingWhatsNext variant="self_finance_action"`**; primary CTA → `/payment/pay-down-payment` (current wire) |
| `/payment` | Payment flow / hub (e.g. full payment path from choose) |
| `/payment/default` | Default payment prompt — CTA to **`/payment/choose`** |
| `/payment/booking-success` | Legacy redirect → `/kyc/booking-confirmed?source=payment` |
| `/payment/booking-success/next` | Legacy redirect → `/kyc/buying-guide/1` |
| `/kyc/buying-guide/[1-4]` | Buying process onboarding (Figma 2460:7661); step 4 **Continue** → `/kyc` |
| `/kyc` | KYC pending — Shivi intro bottom sheet on load ([Figma 2479:7600](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2479-7600)); **Got it** → hero + **Complete KYC Now** |
| `/kyc/upload` | PAN/Aadhaar upload via `KycPanAadhaarDocumentUploadSections` + shared `DocumentUploadInfoTipsCard`, `DigilockerFetchButton`, `DocumentUploadDocumentCards` ([Figma 2501:8136](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2501-8136)); `mt-6` title→tips→cards; DigiLocker fetch above Aadhaar only; no headline subtext; re-upload from verification-failed uses same screen; **Submit documents** → `/kyc/documents-received` |
| `/kyc/documents-received` | Documents received |
| `/kyc/verification-in-progress` | KYC verification in progress (between documents received and processing); demo **Next** hidden in **cancel_no_charges** flow |
| `/kyc/cancel-booking` | **Cancel-no-charges demo flow only** — Figma 2709:17395 (`CancelBookingConfirmScreen`); staggered page load; car card + refund breakdown + outline CTAs; **Yes, cancel my booking** → reason bottom sheet (Figma 2711:21013) |
| `/kyc/cancel-booking/success` | **Cancel-no-charges demo flow only** — celebration success layout + fixed bottom **Done** CTA; full booking amount refund copy; **Done** → `/quote` |
| `/kyc/processing` | Processing — **Next** → `/kyc/booking-accepted` |
| `/kyc/booking-accepted` | Booking accepted — **Next** → `/kyc/booking-confirmed` |
| `/kyc/modify-selection` | **Modify-selection demo flows** (`modify_no_charges`, `modify_with_charges`) — chooser; bottom CTA varies by option (See available colours / variants / Browse cars) |
| `/kyc/modify-selection/colour` \| `variant` \| `different-car` | Selection steps; each path has `…/confirm` → shared review-and-pay (`ModifySelectionReviewPayScreen`) |
| `/kyc/modify-selection/*/confirm` | Review selection + pay; edit icons gated by flow (see **Modify selection**) |
| `/kyc/booking-confirmed` | Booking confirmed — default: **Okay** → `/car-allocation/pending`; `?source=payment`: **See how the buying works** → `/kyc/buying-guide/1` |
| `/car-allocation/pending` | Car allocation in progress (“matching stock”) |
| `/car-allocation/confirmed` | Car allocated celebration; **Okay** → `/payment/default` |

**Legacy URLs** (308 redirect): `/kyc/car-allocation-pending` → `/car-allocation/pending`, `/kyc/car-allocation-confirmed` → `/car-allocation/confirmed` (`next.config.ts`).

Intended journey (from product doc): **Payment success → KYC → Processing → Confirmed** (wire as needed per final IA).

---

## Payment journeys — ACKO Drive finance vs self finance

Entry: **`/payment/choose`** (`ChoosePaymentOptionsScreen`).

### Shared

- All three options use the same screen; CTA label and route depend on `choice` (`acko_drive` \| `self_finance` \| `full_payment`).
- **“What’s next?”** on `KycBookingProcessingScreen` renders `whatsNextCard` inside **`WhatsNextTimelineBottomSheet`** (`components/kyc/WhatsNextTimelineBottomSheet.tsx`).

### ACKO Drive finance (assisted loan via partner banks)

| Step | Behaviour |
|------|-----------|
| Choose | CTA **“See bank options”** opens **`BankSelectionBottomSheet`**. |
| Bank partner | **Confirm banking partner** → **`/payment/acko-drive-finance-confirmed?bank={id}`**. |
| Confirmed | **`AckoDriveFinanceConfirmedScreen`**: brief success (Lottie + headline + banking partner); auto-advances (~3s) → **`/payment/acko-drive-finance-action?bank={id}`**. |
| Action | **`AckoDriveFinanceActionScreen`**: `KycBookingProcessingScreen` (two-line headline, banking partner, documents info box, **`LoanProcessingWhatsNext variant="acko_drive_action"`**); **Continue with loan application** → **`/payment/loan-application/loan-details?bank={id}`**. |
| Loan application wizard | Four milestones: **Loan details** → **Personal details** → **Documents** (shared upload UI: `DocumentUploadDocumentCards`, `mt-6` title spacing; green verified banner; no DigiLocker CTA — same for express and standard delivery) → **References**. Final CTA → **`LoanSubmitConfirmBottomSheet`** → **`/payment/loan-processing?bank={id}`**. Legacy **`/payment/loan-documents-upload`** redirects to documents step. |
| Processing | **`LoanBookingProcessingScreen`** (`/payment/loan-processing`) with **`LoanProcessingWhatsNext`** default **`processing`** — expandable **Payment** section, measured inner green/grey rail, `text-sm` nested substeps (documents uploaded → loan processing → choose loan amount → down payment → loan disbursement, etc.). |
| Loan sanctioned | **`LoanSanctionedScreen`** — `SanctionedAmountSummaryCard`; CTA → choose loan amount |
| Choose loan | **`ChooseLoanAmountScreen`** — slider min **₹1L** (`MIN_LOAN_INR`), max on-road price; down-payment split card (car DP + insurance); **`ChooseLoanPaymentSummaryCard`** |
| Before pay DP | **`LoanSubmitConfirmBottomSheet`** on confirm — bullets + **Agree and continue** → pay-down-payment |
| Pay DP | **`PayDownPaymentScreen`** — car DP summary card; partial remaining uses **`DownPaymentSummaryCard`** (car amounts) |
| DP complete | **`buildInsuranceSetupHref`** carries `loan_amount`, `original_down_payment`, `down_payment=0` |
| Disbursement wait | **`DownPaymentInsuranceSetupScreen`** — info: insurance ₹37k after disbursement |
| Disbursed | **`LoanDisbursementReceivedScreen`** — amount + transaction ID; headline **Loan disbursed, Sharath!** |
| Insurance | **`PayInsurancePremiumScreen`** — coverage sheet ([Figma 2585:68086](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2585-68086)) |
| Later stages | **`LoanProcessingWhatsNext`** variants (`sanctioned`, `down_payment`, `down_payment_complete`, `insurance_premium_due`, delivery `*_prep`, …) on respective screens |

**Key files**

- `components/payment/ChoosePaymentOptionsScreen.tsx` — ACKO branch + bank sheet open
- `components/payment/BankSelectionBottomSheet.tsx`
- `components/payment/AckoDriveFinanceConfirmedScreen.tsx`
- `components/payment/AckoDriveFinanceActionScreen.tsx`
- `components/payment/FinanceWhatsNextPaymentProcess.tsx`
- `components/payment/loan-application/*` — wizard shell, milestone rail, step screens
- `lib/loan-application-urls.ts`, `lib/loan-application-state.ts`
- `components/payment/LoanBookingProcessingScreen.tsx`
- `components/payment/LoanProcessingWhatsNext.tsx`
- `components/payment/ChooseLoanAmountScreen.tsx`, `ChooseLoanPaymentSummaryCard.tsx`
- `components/payment/LoanSubmitConfirmBottomSheet.tsx`, `LoanSanctionedScreen.tsx`, `SanctionedAmountSummaryCard.tsx`
- `components/payment/PayDownPaymentScreen.tsx`, `DownPaymentAmountSummaryCard.tsx`, `DownPaymentSummaryCard.tsx`
- `components/payment/DownPaymentInsuranceSetupScreen.tsx`, `LoanDisbursementReceivedScreen.tsx`
- `components/payment/PayInsurancePremiumScreen.tsx`, `ZeroDepInsuranceCoverageCard.tsx`, `InsuranceCoverageBottomSheet.tsx`
- `components/payment/loan-amount-demo-constants.ts` — pricing demo, `MIN_LOAN_INR`, `carDownPaymentFromTotalInr()`, `DEMO_LOAN_DISBURSEMENT_TRANSACTION_ID`
- `lib/paymentUrls.ts` — checkout / success / insurance-setup href builders

### Self finance (customer arranges loan with their bank)

| Step | Behaviour |
|------|-----------|
| Choose | CTA **“I’ll go with Self finance”** opens **`SelfFinanceConfirmBottomSheet`** (“Things to know before you continue!” + bullets). |
| Agree | **Agree and continue** → **`/payment/self-finance-confirmed`**. |
| Confirmed | **`SelfFinanceConfirmedScreen`**: **`FadePageTransition`** (fade-in, not celebration slide-from-bottom); ACKO success Lottie; **`onComplete`** → headline + subtext → **Continue**. |
| Action | **`/payment/self-finance-action`** — **`SelfFinanceActionScreen`**: `KycBookingProcessingScreen` (two-line headline, `ProformaInvoiceCard`, CTA **“Enter the disbursement amount”** → **`/payment/pay-down-payment`**). |
| What’s next | **`LoanProcessingWhatsNext variant="self_finance_action"`** — **same interaction model as loan-processing** (expandable Payment, chevron, nested rail, 24×24 icons): Car allocation (dated “Completed on …”) → **Payment** (self-finance subtitle) → **five nested substeps** → **Car delivery** (flat row). |

**Nested Payment substeps (self finance only) — product meaning**

1. **Download proforma invoice** — for customer to submit to bank for disbursement workflow.  
2. **Declare loan disbursement amount** — after bank approval, user enters sanctioned amount → drives **down payment** calculation.  
3. **Downpayment** — pay in app.  
4. **Download margin money slip** — after DP; customer gives slip to bank to release funds to dealer.  
5. **Confirm disbursement from bank** — user enters **UTR**; verification/confirmation of transfer to dealer.

Initial UI statuses in code: first substep **`in_progress`**, others **`next`** (replace with server/session state later).

**Key files**

- `components/payment/SelfFinanceConfirmBottomSheet.tsx`
- `components/payment/SelfFinanceConfirmedScreen.tsx`
- `components/payment/SelfFinanceActionScreen.tsx`
- `components/payment/ProformaInvoiceCard.tsx`
- `components/payment/LoanProcessingWhatsNext.tsx` — **`self_finance_action`**, **`SELF_FINANCE_ACTION_PAYMENT_SUBSTEPS`**, **`paymentSectionSubtitle()`**
- `app/payment/self-finance-confirmed/page.tsx`, `app/payment/self-finance-action/page.tsx`

**Note:** `WhatsNextTimeline` exposes optional **`paymentSubSteps`** for a lighter nested layout; **self finance timeline in the bottom sheet deliberately uses `LoanProcessingWhatsNext`** so visuals and behaviour align with ACKO **`/payment/loan-processing`**.

### Full payment

| Step | Behaviour |
|------|-----------|
| Choose | CTA opens **`FullPaymentConfirmBottomSheet`** → **Agree and continue** |
| Confirmed | **`/payment/full-payment-option-confirmed`** — celebration (tick Lottie, “Payment option confirmed”); auto-advance ~3s |
| Action | **`/payment/full-payment-confirmed`** — `KycBookingProcessingScreen` + breakdown; **Continue** → **`/payment/pay-full-payment`** |

**Key files:** `FullPaymentConfirmBottomSheet.tsx`, `FullPaymentOptionConfirmedScreen.tsx`, `FullPaymentConfirmedScreen.tsx`, `PayFullPaymentScreen.tsx`

---

## Manage booking — payment summary & modify booking

**Component:** `components/kyc/ManageBookingBottomSheet.tsx` (opened from nav menu on `KycBookingProcessingScreen` and KYC screens).

### Payment summary (query-driven)

| URL context | Card shown |
|-------------|------------|
| No `loan_amount` | **`PaymentSummaryCard`** — ACKO price, booking paid, amount to pay |
| `loan_amount` + `down_payment` (pending / partial) | **`ChooseLoanPaymentSummaryCard`** — loan amount; optional **Down payment paid** row when `original_down_payment` > remaining; footer **Remaining down payment** or **Down payment amount** |
| `loan_amount` + full DP (`down_payment` absent, `0`, or post–insurance-setup params) | Same card — **Down payment paid** (full); **no** grey footer row |

Parser: `parseConfirmedLoanPlan()` in manage sheet; derives full DP from `ON_ROAD_PRICE_INR − loan_amount` when only `loan_amount` is present (e.g. after `buildInsuranceSetupHref`).

### Modify booking

Hidden when URL parsers detect money paid toward down payment or full payment:

| Journey | Hide modify when |
|---------|------------------|
| ACKO Drive finance + self finance (`loan_amount` on URL) | Partial DP (`downPaymentPaidInr` from `original_down_payment` − remaining) or full DP (`downPaymentFullyPaid`) |
| Full payment (`bank=full_payment`, no `loan_amount`) | Any instalment paid (`paymentPaidInr` > 0 on `parseFullPaymentPlan`) |

When visible, **Change selection** and **Cancel booking** are both shown. Fee copy uses journey phase (`lib/journey-routes.ts` → `lib/manage-booking-modify.ts`):

| Fee tier | When | Change selection | Cancel booking |
|----------|------|------------------|----------------|
| **Free** | Identity funnel only: **`/kyc`** (Verify your identity) through **`/kyc/processing`** — hub, upload, documents received, verification in progress / failed, processing | No change fee | No cancellation fee |
| **Standard** | From **`/kyc/booking-accepted`** through **`/payment/pay-down-payment`** (and other post-accepted routes: buying guide, booking celebration, car allocation, payment choice) until down payment is paid (ACKO Drive, self finance, full payment — no DP instalment on URL) | Change fee **₹5,000** | Cancellation fee **₹5,000** (50% of **₹10,000** booking lock — amount shown, not %) |

`resolveModifyBookingFeeTier()` returns **`free`** when `isModifyNoChargesFlow()` **or** `isCancelNoChargesFlow()`.

#### Flow-specific modify booking behaviour

| Flow | Change selection | Cancel booking |
|------|------------------|----------------|
| **cancel_no_charges** | Row visible with normal styling; **no `onClick`** and **no `disabled`** (not clickable, does not look greyed out) | Enabled → `/kyc/cancel-booking` |
| **modify_no_charges** | Enabled → `/kyc/modify-selection` | Row shown; no navigation wired (demo) |
| **modify_with_charges** | Enabled from booking accepted when `isChangeSelectionAvailablePhase` | Row shown; fee copy per tier |
| **express / standard / kyc_failed** | Disabled when not in modify demo flows | Row shown; fee copy per tier |

`showVehicleIdentification` only affects the car card (engine/chassis rows), not modify actions.

Post-allocation car card is enabled when `manageBookingShowVehicleIdentification` is set or `whatsNextCard != null` / car allocation step `done` on `KycBookingProcessingScreen`.

---

## Modify selection (modify-no-charges / modify-with-charges flows)

**Entry:** manage booking → **Change selection** when `isModifyNoChargesFlow()` (from `/kyc`) or `isModifyWithChargesFlow()` + `isChangeSelectionAvailablePhase` (from booking accepted) → `/kyc/modify-selection` (`ChooseModifyBookingScreen`).

**Booking amount (modify-with-charges):** `bookingAmountToPayInr` = max(0, new booking lock − paid lock) + **`MODIFY_BOOKING_CHANGE_FEE_INR`** (₹5,000); shown as “Booking change fee” on `ModifySelectionReviewBookingAmountCard`.

**Chooser primary CTA** (`lib/modify-selection-content.ts` → `continueCtaLabel`; updates when the selected radio option changes):

| Option | CTA label |
|--------|-----------|
| Change colour | See available colours |
| Change variant | See available variants |
| Choose a different car | Browse cars |

Tap opens `ModifySelectionConfirmBottomSheet` — content-hug height, `BottomSheetConfirmBulletList`, bottom CTA = `continueCtaLabel` (e.g. **See available colours** / **See available variants** / **Browse cars**). Copy: `confirmHeader` + `confirmPoints[]` per option in `lib/modify-selection-content.ts` (colour: 2 bullets; variant / different car: 3 bullets on price + delivery).

| User choice | Confirm / review route | `ModifySelectionReviewPayScreen` `flow` |
|-------------|------------------------|----------------------------------------|
| **Change colour** | `/kyc/modify-selection/colour/confirm` | `colour` |
| **Change variant** | `/kyc/modify-selection/variant/confirm` | `variant` |
| **Choose a different car** | `/kyc/modify-selection/different-car/[brand]/[model]/confirm` | `different-car` (+ `brandId`, `modelId`) |

**Shared review UI:** `ModifySelectionReviewPayScreen` + `ModifySelectionReviewSelectionCard` (review-and-pay).

### Review page — which rows are editable

Edit icons appear only for fields the user may change on that entry path. **Delivery** edit is shown only when the selected colour is **express** (`resolved.option.isExpressDelivery` → `showDeliveryEdit`); standard colours show delivery as read-only.

| Entry choice | Make & model (title) | Variant | Colour | Delivery (express only) |
|--------------|----------------------|---------|--------|-------------------------|
| **Change colour** | Read-only (default booked car) | Read-only | **Edit** → `/kyc/modify-selection/colour` | **Edit** (bottom sheet) if express |
| **Change variant** | Read-only | **Edit** → `/kyc/modify-selection/variant` | **Edit** → `/kyc/modify-selection/variant/colour` | **Edit** if express |
| **Choose a different car** | **Edit** → `/kyc/modify-selection/different-car` | **Edit** → model/variant step for brand+model | **Edit** → colour step for brand+model | **Edit** if express |

**Implementation:** gate callbacks in `ModifySelectionReviewPayScreen` when passing props to `ModifySelectionReviewSelectionCard`:

- `onEditCar` — only when `flow === "different-car"`.
- `onEditVariant` — only when `flow === "variant"` or `flow === "different-car"`.
- `onEditColour` — all three flows.
- `showDeliveryEdit` — all three flows, express colour only.

The card renders an edit control only when the matching callback is non-null (or `showDeliveryEdit` for delivery).

### Pay → booking received

- On **Pay**, write pending snapshot: `writeModifySelectionPendingFromSummary` (`lib/active-booking-snapshot.ts`, key `pbe_modify_selection_pending_payment_v1`).
- Mock checkout: `buildBookingLockCheckoutHref` with `return_source=modify-selection`.
- Success: `/kyc/booking-confirmed?source=payment&paid=…&return_source=modify-selection` — `syncModifySelectionBookingSnapshot` commits **pending** checkout before reading completed (avoids stale car on repeat changes); show updated car on `BookingCarSummaryCard` via `activeBookingCardDetails` (title/variant for different-car and variant flows). Same success screen for colour, variant, and different-car.

| After pay (`KycBookingConfirmedScreen`) | Up next strip | Primary CTA | Next route |
|----------------------------------------|---------------|-------------|------------|
| **modify_no_charges** | Verify your identity | Continue to verification | `/kyc` |
| **modify_with_charges** | *(none — identity already done)* | Continue | `/kyc/processing` (processing your booking) |

**Key files:** `components/kyc/ModifySelectionReviewPayScreen.tsx`, `ModifySelectionReviewSelectionCard.tsx`, `KycBookingConfirmedScreen.tsx`, `lib/modify-selection-*-pending.ts`, `lib/active-booking-snapshot.ts`, `lib/paymentUrls.ts`.

---

## Cancel booking (cancel-no-charges flow)

**Flow id:** `cancel_no_charges` — selectable on **`/quote`** via `QuoteFlowMenuSheet` (`lib/experience-flow.ts`).

### Journey cap

Unlike **modify_no_charges** (stops at **`/kyc` hub**), this flow allows the full identity funnel through **verification in progress**:

| Allowed | Blocked (redirect → `/kyc/verification-in-progress`) |
|---------|------------------------------------------------------|
| `/quote`, payment routes, `/kyc`, `/kyc/upload`, `/kyc/documents-received`, `/kyc/verification-in-progress` | `/kyc/processing`, `/kyc/booking-accepted`, `/kyc/booking-confirmed`, car allocation, payment post-KYC, etc. |
| `/kyc/cancel-booking`, `/kyc/cancel-booking/success` | `/kyc/modify-selection/*` (redirect away — change selection not part of this demo) |

Guards: `getCancelNoChargesRedirectTarget()` + `getCancelBookingFlowRedirectTarget()` in `lib/experience-flow-journey.ts`; KYC post-hub pages use unified `getExperienceFlowJourneyRedirectTarget()` via `ModifyNoChargesGatedPage`. **`getModifyNoChargesRedirectTarget` unchanged** for `modify_no_charges`.

On **`/kyc/verification-in-progress`**, demo **Next** is hidden when `isCancelNoChargesFlow()`.

### Entry

**Manage booking** → **Cancel booking** when `isCancelNoChargesFlow()` → **`/kyc/cancel-booking`**.

### Cancel confirmation (full page — Figma 2709:17395)

**Component:** `CancelBookingConfirmScreen`  
**Copy:** `lib/cancel-booking-content.ts`  
**Stagger:** `lib/cancel-booking-stagger.ts` (`.payment-success-stagger` sequence)  
**Subcomponents:** `CancelBookingCarCard`, `CancelBookingRefundSummaryCard`

| Element | Copy / behaviour |
|---------|------------------|
| Overline | Are you sure you want to cancel? — `#D16900` |
| Headline | You have come a long way to get your {model} |
| Car card | Compact horizontal card — title, variant, colour, delivery line + icon (clock for standard, bolt for express) |
| Modify prompt | Not happy with your selection? |
| Modify CTA | **Modify my booking** — `demo-nav-cta`, visible but not clickable in this flow |
| Cancel prompt | Still want to cancel? |
| Refund card | Booking amount ₹10,000 · Cancellation fee 0 · Refund amount ₹10,000 + “You'll get your refund in 5-7 business days” |
| Confirm CTA | **Yes, cancel my booking** — `demo-nav-cta` → opens reason bottom sheet |
| Back | `KycTopNavHeader` (`transparent`) chevron → `router.back()`; solid **`bg-white`** on scroll |

**Layout:** Gradient section (`from-white to-[#f5f5f5]`) wraps overline + headline + car card with **20px** padding below card (`pb-5`); white section starts **24px** below (`pt-8`). **16px** between refund card and confirm CTA (`mt-4`). **32px** page bottom padding below confirm CTA.

Car details: `readActiveBookingSnapshot()` or defaults from `booking-car-card-content.ts` + `getBookingDeliveryLine()`. Refund amount: `BOOKING_LOCK_AMOUNT_INR` (`lib/paymentUrls.ts`).

### Cancel reason bottom sheet (Figma 2711:21013)

**Component:** `CancelBookingReasonBottomSheet`  
Opened from **Yes, cancel my booking** on the confirm page.

| Element | Copy / behaviour |
|---------|------------------|
| Title | Before you go, tell us what went wrong? |
| Options | Checkbox-style rows (toggle select/deselect); **no default selection** |
| Reasons | Found a better deal elsewhere · Changed my mind about the car · Financial reasons · Delivery timeline is too long · Unhappy with the process · Other |
| Primary CTA | **Cancel my booking** — `primary-cta`; disabled until a reason is selected → `/kyc/cancel-booking/success` |

### Cancel success (celebration layout — not action hero)

**Component:** `CancelBookingSuccessScreen`  
**Copy:** `lib/cancel-booking-success-content.ts`  
**Layout:** Centered success content + **fixed bottom** CTA strip (same family as `SelfFinanceConfirmedScreen` — not `min-h-[90dvh]` action hero).

| Element | Copy |
|---------|------|
| Hero | `assets/Booking cancelled.svg` |
| Headline | Your booking has been cancelled (word-by-word reveal) |
| Subline | No cancellation fee applied |
| Info box | Your full booking amount of ₹10,000 will be refunded to your account in 5-7 business days. |
| CTA | **Done** (fixed footer) → `/quote` |

### Route guards

- `/kyc/cancel-booking` and `/kyc/cancel-booking/success` redirect to `/kyc` when flow ≠ `cancel_no_charges` (`CancelBookingFlowGuard`).

**Key files:** `lib/experience-flow.ts`, `lib/experience-flow-journey.ts`, `lib/manage-booking-modify.ts`, `lib/cancel-booking-content.ts`, `lib/cancel-booking-success-content.ts`, `lib/cancel-booking-stagger.ts`, `components/kyc/CancelBookingConfirmScreen.tsx`, `components/kyc/CancelBookingCarCard.tsx`, `components/kyc/CancelBookingRefundSummaryCard.tsx`, `components/kyc/CancelBookingReasonBottomSheet.tsx`, `components/kyc/CancelBookingSuccessScreen.tsx`, `components/kyc/CancelBookingFlowGuard.tsx`, `components/kyc/ManageBookingBottomSheet.tsx`, `app/kyc/cancel-booking/page.tsx`, `app/kyc/cancel-booking/success/page.tsx`.

---

## UI patterns — hero info callout & bottom sheets

Shared **info callout** (icon + `text-xs` body, `rounded-2xl`, `border-[#E8E8E8]`, `px-3 py-3`):

- `KycBookingProcessingScreen` — `infoBox` / `sublineLine2` below subline
- `DownPaymentInsuranceSetupScreen` — insurance payable after disbursement
- `RtoRegistrationStatusCard` — RTO registration message on `/payment/car-delivery-rto`

**Bottom sheets** (280ms slide + `bg-black/90` backdrop, `BottomSheetPortal`, `max-w-[640px]`, `rounded-t-[24px]`):

- `BankSelectionBottomSheet`, `LoanSubmitConfirmBottomSheet`, `ManageBookingBottomSheet`, `InsuranceCoverageBottomSheet` ([2585:68086](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2585-68086)), `WhatsNextTimelineBottomSheet`, …

**Insurance coverage sheet:** ZD + TP rows (`assets/ZD cover.svg`, `assets/TP cover.svg`), 20px gap between rows; opened from **View coverage details** on `ZeroDepInsuranceCoverageCard` (button unless `coverageDetailsHref` set).

---

## Done — payment choice + bank sheet (ACKO Drive)

### Behaviour

- On **Finance with ACKO Drive**, primary CTA label is **“See bank options”** (not direct checkout).
- Tap opens **`BankSelectionBottomSheet`** (modal over dimmed backdrop).
- **Confirm banking partner** closes the sheet and navigates to **`/payment/acko-drive-finance-confirmed`**; user continues to **`/payment/acko-drive-finance-action`**, then **loan document upload** (see **Payment journeys** above). Chosen bank id is carried in **`?bank=`** on downstream routes where wired — persistence to checkout/API remains backlog.

### Files

- `components/payment/BankSelectionBottomSheet.tsx` — sheet UI + open/close animation
- `components/payment/ChoosePaymentOptionsScreen.tsx` — `bankSheetOpen`, self-finance sheet, CTA routing
- `components/payment/payment-choose-assets.ts` — `BANK_SHEET_OPTIONS`, `PAYMENT_CHOOSE_ASSETS`, `asset()` helper for `/public/assets/`

### Bank sheet UX (implemented)

- **Animation:** Sheet slides up on open, down on dismiss (~280ms); backdrop fades in/out. `prefers-reduced-motion` disables motion.
- **Backdrop:** `bg-black/90` (90% opacity).
- **Layout:** Full-viewport overlay; sheet `max-w-[360px]`, centered, `rounded-t-[20px]`, `max-h-[90dvh]` with sheet-level scroll only if viewport is very short (removed inner scroll + 560px cap that caused unnecessary scrolling).
- **Header:** Title “Choose your banking partner”; subtitle “Finance through” + **ACKO Drive logo** (`public/assets/ACKO Drive logo.svg`).
- **Top padding** on scrollable header block: **24px** (`pt-6`).
- **Bank rows:** HDFC, Bank of Baroda, ICICI, Bank of India, Canara Bank — logo, name, “Interest rate from …”, selected border/background, shared radio artwork from assets.
- **Radio:** Absolutely positioned **12px from top and right** of each card (`top-3 right-3`); `pointer-events-none` so the whole row remains the hit target; content uses extra right padding (`pr-10`) to avoid overlap.
- **Footer:** **Confirm banking partner** uses `primary-cta`; **no top border** above the CTA.

### Assets added / referenced

- `public/assets/ACKO Drive logo.svg` (wordmark; synced from `assets/ACKO Drive logo.svg`)

---

## Local-only dev tools (not in git)

These paths are **gitignored** (see root `.gitignore`). They are optional helpers kept on developer machines only; fresh clones will not include them unless you restore copies locally.

| Path | Purpose |
|------|---------|
| `/dev/flow-visualiser` | Flow catalogue + screen picker, device chrome, iframe (`app/dev/flow-visualiser/page.tsx`, `components/dev/FlowVisualiser.tsx`) |
| `/dev/mobile-mock` | Same-origin iframe preview (`app/dev/mobile-mock/page.tsx`, e.g. `?path=/payment`) |

---

## Operational notes (local)

- **“This page isn’t working” / HTTP 500 in dev** with the server still listening: often **stale Turbopack `.next`**. Fix: stop the process on **3000**, `rm -rf .next`, `npm run dev`.
- Do not run `http://localhost:3000` in the shell as a command; open it in the **browser**.

---

## Backlog / follow-ups

1. **Persist selected bank** on Confirm (`?bank=` already used on navigation; persist to checkout/API / session as needed).
2. **Self finance journey state** — drive nested substep statuses from backend or `sessionStorage`; wire **ProformaInvoiceCard** `downloadHref` to real PDF.
3. **Loan / DP state** — replace URL query demo (`loan_amount`, `down_payment`, `original_down_payment`) with session or API; real transaction IDs on disbursement screen.
4. **Manage booking payment summary** — align “post-allocation” flag with true car-allocation milestone (today also true when `whatsNextCard` is set on early payment screens).
5. **Accessibility:** focus trap in sheets, return focus to trigger on close, optional `aria-describedby` for subtitle.
6. **Z-index / stacking:** confirm no clash with other fixed layers (e.g. choose-screen footer).
7. **KYC + payment sequencing:** align route guards and deep links with final product copy in the DOCX.
8. **Static export / prerender:** wrap `useSearchParams()` consumers (e.g. `/kyc/processing`, manage booking) in `Suspense` where build fails.

---

## Checklist (high level)

- [x] Payment choose screen with three options + partner strip
- [x] ACKO Drive → bank selection bottom sheet (Figma-aligned iterations)
- [x] ACKO Drive confirmed → finance action → loan document upload
- [x] Self finance → confirm bottom sheet → celebration → action screen + proforma card
- [x] Self finance “What’s next” uses **`LoanProcessingWhatsNext`** (`self_finance_action`) for parity with loan-processing timeline UX
- [x] Sheet motion, strong backdrop, layout and radio placement refinements
- [x] ACKO Drive logo in sheet subtitle
- [x] Choose loan amount — slider ₹1L–on-road, payment summary card, confirm bottom sheet copy + **Agree and continue**
- [x] Pay down payment — car DP hero card, partial/remaining summary, confirmed subline
- [x] Down payment complete → insurance setup info callout; manage-booking loan payment summary
- [x] Loan disbursed screen — transaction ID, personalised headline
- [x] Insurance coverage bottom sheet (Figma 2585:68086) from **View coverage details**
- [x] RTO prep info callout aligned with hero info pattern
- [x] Manage booking — post-allocation cancel fee ₹5,000; loan plan summary with partial/full DP states
- [x] Modify selection review — edit icons gated by flow (colour: colour+delivery; variant: variant+colour+delivery; different-car: make/model+variant+colour+delivery; delivery edit express-only)
- [x] Cancel no charges flow — selectable on quote; journey through verification in progress
- [x] Cancel no charges — manage booking: cancel enabled; change selection visible but not clickable
- [x] Cancel confirmation full page (Figma 2709:17395) + reason bottom sheet (Figma 2711:21013) + celebration success page; route guards; full booking amount refund (₹10,000, no fee)
- [ ] Pass selected `bankId` / self-finance step state into payment/checkout and APIs
- [ ] Full a11y pass on sheets
- [ ] End-to-end journey documented in README (optional)
