// Remembers the rosary in progress (which mystery set + which step) on this
// device, so the landing page can offer "continue where you left off". Cleared
// when a rosary is prayed through to the end. Device-local, fail-open, and short-
// lived — a rosary is meant to be finished in one sitting, so a stale resume
// point older than a couple of days is dropped rather than nagging forever.

const STORE_KEY = 'rosary.resume.v1';
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 2; // 2 days

export interface ResumePoint {
  mysteryKey: string;
  slug: string;
}

export function saveResume(mysteryKey: string, slug: string): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ mysteryKey, slug, ts: Date.now() }));
  } catch {
    // storage disabled (private mode) — resume is a nice-to-have.
  }
}

export function clearResume(): void {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
}

export function getResume(): ResumePoint | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p || typeof p !== 'object') return null;
    if (typeof p.ts !== 'number' || Date.now() - p.ts > MAX_AGE_MS) return null;
    if (typeof p.mysteryKey !== 'string' || typeof p.slug !== 'string') return null;
    return { mysteryKey: p.mysteryKey, slug: p.slug };
  } catch {
    return null;
  }
}
