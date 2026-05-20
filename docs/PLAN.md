# Post-booking experience — implementation plan

Living document: update this file when flows, routes, or UI behavior change.

**Source spec:** `docs/detailed_post_booking_experience.docx`  
**Design (Figma):** [Post-booking-experience](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience) — bank sheet node `1941:12822`.

---

## Tech stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- Local dev: `npm run dev` → **http://localhost:3000** (`next dev --turbopack --port 3000`)
- Static assets: `/public/assets/` (keep in sync with repo `assets/` where applicable)

---

## Routes (current)

| Path | Purpose |
|------|---------|
| `/` | Redirects to `/quote` |
| `/quote` | Entry / quote screen |
| `/payment/choose` | Choose payment method (ACKO Drive / self finance / full payment) |
| `/payment/acko-drive-finance-confirmed` | After bank sheet **Confirm banking partner** — celebration + docs card; **Continue** → `/payment/loan-documents-upload?bank=` |
| `/payment/loan-documents-upload` | Loan document upload (after ACKO Drive confirmation); accepts optional `?bank=` |
| `/payment/loan-processing` | ACKO loan processing — `LoanBookingProcessingScreen` + **`LoanProcessingWhatsNext`** (`variant` default `processing`) |
| `/payment/loan-sanctioned` | Loan sanctioned — same shell family as loan-processing |
| `/payment/choose-loan-amount` | Choose loan / down payment range |
| `/payment/pay-down-payment` | Pay down payment screen |
| `/payment/down-payment-insurance-setup` | Down payment received — disbursement processing (loan) or payment complete (full payment) |
| `/payment/loan-disbursement-received` | Loan disbursed success ack — **Okay** → insurance prep |
| `/payment/self-finance-confirmed` | Self finance — post-confirm celebration; **Continue** → `/payment/self-finance-action` |
| `/payment/self-finance-action` | Self finance — proforma hero + **`LoanProcessingWhatsNext variant="self_finance_action"`**; primary CTA → `/payment/pay-down-payment` (current wire) |
| `/payment` | Payment flow / hub (e.g. full payment path from choose) |
| `/payment/default` | Default payment prompt — CTA to **`/payment/choose`** |
| `/payment/booking-success` | Booking-lock payment success — Lottie + headline + car card; **`router.replace`** → `/payment/booking-success/next` **3s** after car shows (max **10s**) |
| `/payment/booking-success/next` | Shivi RM intro + fixed **Up next:** + **Continue** → `/kyc` |
| `/kyc` | KYC hub / redirect |
| `/kyc/upload` | Document upload |
| `/kyc/documents-received` | Documents received |
| `/kyc/verification-in-progress` | KYC verification in progress (between documents received and processing) |
| `/kyc/processing` | Processing |
| `/kyc/booking-confirmed` | Booking confirmed |
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
| Confirmed | **`AckoDriveFinanceConfirmedScreen`**: ACKO Drive success Lottie, headline + selected bank (**Change** reopens sheet), **`FinanceWhatsNextPaymentProcess`** (“Keep these documents handy”), amber **Up next** strip. **Continue** → **`/payment/loan-documents-upload?bank={id}`**. |
| Documents upload | **`LoanDocumentUploadScreen`** (`/payment/loan-documents-upload`). |
| Processing | **`LoanBookingProcessingScreen`** (`/payment/loan-processing`) with **`LoanProcessingWhatsNext`** default **`processing`** — expandable **Payment** section, measured inner green/grey rail, `text-sm` nested substeps (documents uploaded → loan processing → choose loan amount → down payment → loan disbursement, etc.). |
| Later stages | **`LoanProcessingWhatsNext`** other variants (`sanctioned`, `down_payment`, `down_payment_complete`, delivery prep variants) on respective screens (`loan-sanctioned`, `pay-down-payment`, car-delivery flows, …). |

**Key files**

- `components/payment/ChoosePaymentOptionsScreen.tsx` — ACKO branch + bank sheet open
- `components/payment/BankSelectionBottomSheet.tsx`
- `components/payment/AckoDriveFinanceConfirmedScreen.tsx`
- `components/payment/FinanceWhatsNextPaymentProcess.tsx`
- `components/payment/LoanDocumentUploadScreen.tsx`
- `components/payment/LoanBookingProcessingScreen.tsx`
- `components/payment/LoanProcessingWhatsNext.tsx`

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

From choose: **“I’ll go with full payment”** → **`/payment`** (no ACKO sheet, no self-finance sheets).

---

## Done — payment choice + bank sheet (ACKO Drive)

### Behaviour

- On **Finance with ACKO Drive**, primary CTA label is **“See bank options”** (not direct checkout).
- Tap opens **`BankSelectionBottomSheet`** (modal over dimmed backdrop).
- **Confirm banking partner** closes the sheet and navigates to **`/payment/acko-drive-finance-confirmed`**; user continues from there to **loan document upload** (see **Payment journeys** above). Chosen bank id is carried in **`?bank=`** on downstream routes where wired — persistence to checkout/API remains backlog.

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
3. **Accessibility:** focus trap in sheets, return focus to trigger on close, optional `aria-describedby` for subtitle.
4. **Z-index / stacking:** confirm no clash with other fixed layers (e.g. choose-screen footer).
5. **KYC + payment sequencing:** align route guards and deep links with final product copy in the DOCX.

---

## Checklist (high level)

- [x] Payment choose screen with three options + partner strip
- [x] ACKO Drive → bank selection bottom sheet (Figma-aligned iterations)
- [x] ACKO Drive confirmed → loan document upload
- [x] Self finance → confirm bottom sheet → celebration → action screen + proforma card
- [x] Self finance “What’s next” uses **`LoanProcessingWhatsNext`** (`self_finance_action`) for parity with loan-processing timeline UX
- [x] Sheet motion, strong backdrop, layout and radio placement refinements
- [x] ACKO Drive logo in sheet subtitle
- [ ] Pass selected `bankId` / self-finance step state into payment/checkout and APIs
- [ ] Full a11y pass on sheets
- [ ] End-to-end journey documented in README (optional)
