# Assets and deployment (project defaults)

This repo is configured **by default** for **static export** and **GitHub Pages** hosting at:

`https://sharath-hv.github.io/post-booking-experience/`

## Single source of truth

| Setting | Location |
|--------|----------|
| `basePath` / site prefix | [`lib/site-config.ts`](../lib/site-config.ts) → `BASE_PATH` |
| Next.js static export | [`next.config.ts`](../next.config.ts) (`output: "export"`, `basePath`) |
| Public asset URL helper | [`lib/public-asset-path.ts`](../lib/public-asset-path.ts) |
| Jekyll bypass for `_next/` | [`public/.nojekyll`](../public/.nojekyll) |
| CI deploy | [`.github/workflows/deploy-github-pages.yml`](../.github/workflows/deploy-github-pages.yml) |

To host under a different path, set `NEXT_PUBLIC_BASE_PATH` (see [`.env.example`](../.env.example)) and update the GitHub repo name / Pages URL accordingly.

## How to add images and icons

### Preferred: import from `assets/`

```ts
import hero from "@/assets/KYC.svg";

<Image src={hero} alt="" unoptimized />
```

Next.js rewrites bundled asset URLs for `basePath` automatically.

### When using `public/assets/`

Files in `public/assets/` are copied to `out/assets/` on build. **Do not** use raw strings like `` `/assets/foo.svg` `` — they break on GitHub Pages.

Use the helper:

```ts
import { publicAssetPath, publicAssetPathIn } from "@/lib/public-asset-path";

const icon = publicAssetPath("Info.svg");
const nested = publicAssetPathIn("kyc-booking-confirmed", "car-cutout.png");
```

Keep repo `assets/` and `public/assets/` in sync when adding new art.

### Avoid

- Remote demo URLs (Figma MCP, Unsplash, `lottie.host`) for production UI
- `next.config` `redirects()` (unsupported with `output: "export"`) — use client redirects in `app/` routes instead
- `next/image` without `unoptimized: true` (already set globally for static export)

## Local development

```bash
npm run dev
```

With the default `basePath`, open:

`http://localhost:3000/post-booking-experience/`

(`next dev` applies the same `basePath` as production.)

## Production build

```bash
npm run build
```

Output: `out/` (gitignored). GitHub Actions uploads `out/` to Pages on pushes to **`main`**.
