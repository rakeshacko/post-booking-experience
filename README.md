# post-booking-experience

ACKO Drive post-booking journey (quote, payment, KYC) — **Next.js 15** (App Router), React 19, TypeScript, Tailwind CSS 4.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000/post-booking-experience/](http://localhost:3000/post-booking-experience/) (redirects to `/quote`).

## Project defaults (static export + GitHub Pages)

This repo is set up **by default** for GitHub Pages, not a Node server:

| Default | Detail |
|--------|--------|
| **Build** | `output: "export"` → static site in `out/` |
| **Base path** | `/post-booking-experience` — defined in [`lib/site-config.ts`](lib/site-config.ts) |
| **Live URL** | [https://sharath-hv.github.io/post-booking-experience/](https://sharath-hv.github.io/post-booking-experience/) |
| **Deploy** | [`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml) on push to **`main`** (Pages source: **GitHub Actions**) |
| **Assets** | Import from [`assets/`](assets/) or use [`publicAssetPath()`](lib/public-asset-path.ts) for `public/assets/` — see [`docs/ASSETS_AND_DEPLOYMENT.md`](docs/ASSETS_AND_DEPLOYMENT.md) |
| **Pages + `_next/`** | [`public/.nojekyll`](public/.nojekyll) disables Jekyll so bundled JS/CSS load |

Optional: copy [`.env.example`](.env.example) to `.env.local` and set `NEXT_PUBLIC_BASE_PATH` if the repo name changes.

## Typography (Euclid Circular B)

Fonts are **not** committed as binaries here. Add licensed font files under **`public/font/`** and follow **[font/README.md](font/README.md)** so `app/globals.css` and `lib/euclid-font-preload.ts` load from those files. Until then, the repo may use hosted URLs in `globals.css` for local development.

## Docs

- **Assets & deployment conventions:** [`docs/ASSETS_AND_DEPLOYMENT.md`](docs/ASSETS_AND_DEPLOYMENT.md)  
- Implementation notes: [`docs/PLAN.md`](docs/PLAN.md)  
- Local-only dev tools (gitignored): see `docs/PLAN.md` → “Local-only dev tools”.
