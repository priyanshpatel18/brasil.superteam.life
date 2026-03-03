const CHALLENGE_TIMEZONE = process.env.CHALLENGE_TIMEZONE ?? "UTC";

/** Returns YYYY-MM-DD for "today" in CHALLENGE_TIMEZONE. */
export function getToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: CHALLENGE_TIMEZONE });
}

/** Parses YYYY-MM-DD to Date at start of day in CHALLENGE_TIMEZONE (as UTC for comparison). */
export function parseDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

/** Returns true if the given day (YYYY-MM-DD) is within [start, end] (inclusive). */
export function isDayInRange(
  day: string,
  start: Date,
  end: Date
): boolean {
  const d = parseDay(day);
  const s = new Date(start);
  const e = new Date(end);
  s.setUTCHours(0, 0, 0, 0);
  e.setUTCHours(23, 59, 59, 999);
  return d >= s && d <= e;
}
