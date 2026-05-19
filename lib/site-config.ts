/**
 * Site-wide defaults for this repo (GitHub Pages static export).
 * Change `BASE_PATH` here only — `next.config.ts` and `publicAssetPath()` read from this file.
 */
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

/** Project Pages base path (no trailing slash). Default matches the GitHub repo name. */
export const BASE_PATH =
  rawBasePath && rawBasePath.length > 0
    ? rawBasePath.replace(/\/$/, "")
    : "/post-booking-experience";

/** Production static export is the default build target for this project. */
export const STATIC_EXPORT_ENABLED = true;

/** Canonical GitHub Pages URL (project site). */
export const GITHUB_PAGES_ORIGIN = "https://sharath-hv.github.io";
export const GITHUB_PAGES_URL = `${GITHUB_PAGES_ORIGIN}${BASE_PATH}/`;
