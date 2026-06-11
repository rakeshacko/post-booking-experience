/**
 * Conversational handoff between turns — when the user taps a reply, their words
 * are stored here and surfaced once on the next page as a sent-message chip
 * (`UserEchoChip`). Read-and-clear so a refresh or a later visit never replays it.
 */

const ECHO_STORAGE_KEY = "pbe-concierge-echo";

/** Echoes older than this are stale (user navigated away mid-journey). */
const ECHO_MAX_AGE_MS = 2 * 60 * 1000;

type StoredEcho = {
  text: string;
  ts: number;
};

export function writeConciergeEcho(text: string): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredEcho = { text, ts: Date.now() };
    sessionStorage.setItem(ECHO_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * React StrictMode double-invokes mount effects; the second consume within this
 * window returns the same value instead of finding cleared storage.
 */
const CONSUME_REPLAY_WINDOW_MS = 800;

let lastConsumed: StoredEcho | null = null;

/** Returns the pending echo and clears it (one-shot per turn). */
export function consumeConciergeEcho(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ECHO_STORAGE_KEY);
    if (raw) {
      sessionStorage.removeItem(ECHO_STORAGE_KEY);
      const parsed = JSON.parse(raw) as Partial<StoredEcho>;
      if (
        typeof parsed.text === "string" &&
        typeof parsed.ts === "number" &&
        Date.now() - parsed.ts <= ECHO_MAX_AGE_MS
      ) {
        lastConsumed = { text: parsed.text, ts: Date.now() };
        return parsed.text;
      }
    }
    if (lastConsumed && Date.now() - lastConsumed.ts <= CONSUME_REPLAY_WINDOW_MS) {
      return lastConsumed.text;
    }
    return null;
  } catch {
    return null;
  }
}
