/** Label for GitHub Pages demo-only navigation (not a production user action). */
export const DEMO_NAV_CTA_LABEL = "Next";

export function isDemoNavCtaLabel(label: string): boolean {
  return label === DEMO_NAV_CTA_LABEL;
}

/** Filled primary vs outlined demo nav — same #121212 brand colour. */
export function primaryOrDemoNavCtaClass(label: string): "demo-nav-cta" | "primary-cta" {
  return isDemoNavCtaLabel(label) ? "demo-nav-cta" : "primary-cta";
}
