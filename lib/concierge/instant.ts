/**
 * Demo/testing affordance — when set, concierge turns render fully revealed
 * (no word-by-word cadence, no staged working feed). Useful when a presenter
 * revisits screens or automated checks walk the journey.
 *
 * Enable from the console: `sessionStorage.setItem("pbe-concierge-instant", "1")`
 */

const INSTANT_REVEAL_KEY = "pbe-concierge-instant";

export function instantRevealEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(INSTANT_REVEAL_KEY) === "1";
  } catch {
    return false;
  }
}
