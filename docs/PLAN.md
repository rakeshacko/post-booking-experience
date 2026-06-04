# Post-booking experience — implementation plan

Living document: update this file when flows, routes, or UI behavior change.

**Source spec:** `docs/detailed_post_booking_experience.docx`  
**Design (Figma):** [Post-booking-experience](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience) — bank sheet node `1941:12822`.

---

## Tech stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- Local dev: `npm run dev` → **http://localhost:3000/post-booking-experience** (`next dev --turbopack --port 3000`; `BASE_PATH` from `lib/site-config.ts`, default `/post-booking-experience`)
- Static export + GitHub Pages: `npm run build` → `out/`; prefer `import` from `@/assets/` or `publicAssetPath()` for `/public/assets/`

---

## Experience flows (Express / Standard / Verification failed / Modify no charges / Modify with charges)

Switch on **`/quote`** via the top-left menu (`QuoteFlowMenuSheet`). Active flow is stored in **`sessionStorage`** (`post-booking-experience-flow`) via `readExperienceFlow()` in `lib/experience-flow.ts`.

| Flow | Selectable | Journey |
|------|------------|---------|
| **Express delivery** | Yes | Default — full route map below |
| **Standard delivery** | Yes | **Same routes as express** until a screen branches on `readExperienceFlow() === "standard"` |
| **Verification failed** | Yes | Same as express until KYC verification in progress → `lib/kyc-verification-outcome.ts` |
| **Change selection without any charges** | Yes | Express path through **`/kyc` (KYC pending)** only; post–KYC-pending routes redirect to `/kyc`; manage booking fees always free (`lib/manage-booking-modify.ts`); modify-selection routes unchanged |
| **Change selection with 50% charges** | Yes | **Same routes as express** through **`/kyc/booking-accepted`**; change selection from booking accepted (`isModifyWithChargesFlow()` + `isChangeSelectionAvailablePhase`); ₹5,000 change fee in review-and-pay (`lib/modify-selection-review-pay-content.ts`) |

### Common vs flow-specific changes

- **Common** — edit shared components/libs with **no** flow guard; applies to Express and Standard.
- **Standard only** — `isStandardDeliveryFlow()` / helpers in `lib/experience-flow-content.ts` (e.g. car card delivery line + icon).
- **Express only** — `isExpressDeliveryFlow()` or default branch when not standard.
- **Modify no charges** — `isModifyNoChargesFlow()` / `lib/experience-flow-journey.ts` (journey cap + always-free modify fees).
- **Modify with charges** — `isModifyWithChargesFlow()` / `getModifySelectionFlowRedirectTarget` (full express to booking accepted; change fee in booking amount).

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
| `/quote` | Entry / quote screen |
| `/payment/choose` | Choose payment method (ACKO Drive / self finance / full payment) |
| `/payment/acko-drive-finance-confirmed` | After bank sheet **Confirm banking partner** — celebration + docs card; **Continue** → `/payment/acko-drive-finance-action?bank=` |
| `/payment/acko-drive-finance-action` | ACKO Drive loan application action — same content as confirmed; **Continue with loan application** → `/payment/loan-documents-upload?bank=` |
| `/payment/loan-documents-upload` | Loan document upload (after ACKO Drive action step); accepts optional `?bank=` |
| `/payment/loan-processing` | ACKO loan processing — `LoanBookingProcessingScreen` + **`LoanProcessingWhatsNext`** (`variant` default `processing`) |
| `/payment/loan-sanctioned` | Loan sanctioned — same shell family as loan-processing |
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
| `/kyc/verification-in-progress` | KYC verification in progress (between documents received and processing) |
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
- [ ] Pass selected `bankId` / self-finance step state into payment/checkout and APIs
- [ ] Full a11y pass on sheets
- [ ] End-to-end journey documented in README (optional)
