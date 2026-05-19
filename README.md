# post-booking-experience

ACKO Drive post-booking journey (quote, payment, KYC) — **Next.js 15** (App Router), React 19, TypeScript, Tailwind CSS 4.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/quote`).

## GitHub Pages (static build)

Production builds use **`output: 'export'`** and **`basePath: /post-booking-experience`**. After `npm run build`, the site is in **`out/`** (start with **`out/index.html`**). CI deploys via [`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml) on pushes to **`main`**; in **Settings → Pages**, set the source to **GitHub Actions**.  
Live site: [https://sharath-hv.github.io/post-booking-experience/](https://sharath-hv.github.io/post-booking-experience/)

## Typography (Euclid Circular B)

Fonts are **not** committed as binaries here. Add licensed font files under **`public/font/`** and follow **[font/README.md](font/README.md)** so `app/globals.css` and `lib/euclid-font-preload.ts` load from those files. Until then, the repo may use hosted URLs in `globals.css` for local development.

## Docs

- Implementation notes: `docs/PLAN.md`  
- Local-only dev tools (gitignored): see `docs/PLAN.md` → “Local-only dev tools”.
