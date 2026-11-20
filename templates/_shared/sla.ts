/**
 * SLA maths, with no imports: the browser and the templates both use it.
 *
 * Downtime for a service is the union of the incidents that hit it (overlaps counted once), clipped to the period.
 * Uptime is reported two ways: so far (over the time that has passed) and for the whole period, assuming nothing else
 * happens: the best the vendor can still reach. A credit is owed when the whole-period figure is under the target.
 */
export type Impact = "none" | "minor" | "major" | "critical" | "maintenance";
export type Incident = { id: string; title: string; impact: Impact; start: string; end: string | null; services: string[]; link?: string };
export type Tier = { atLeast: number; credit: number }; // uptime ≥ atLeast (and under the target or the tier above) → credit %
export type Terms = { name: string; url?: string; target: number; period: "month" | "quarter"; tiers: Tier[]; claimDays: number };

/** GitHub Online Services SLA (Version: June 2026): 99.9% per calendar quarter; 5% / 10% / 25%; claim within 30 days. */
export const GITHUB_TERMS: Terms = {
  name: "GitHub Online Services SLA",
  url: "https://github.com/customer-terms/github-online-services-sla",
  target: 99.9,
  period: "quarter",
  tiers: [
    { atLeast: 99.5, credit: 5 },
    { atLeast: 99.0, credit: 10 },
    { atLeast: 0, credit: 25 },
  ],
  claimDays: 30,
};

const DAY = 86_400_000;
const utc = (y: number, m: number, d = 1) => Date.UTC(y, m, d);

/** The calendar period containing `when`: its first instant, the instant after its end, and its name. */
export function periodOf(period: Terms["period"], when: number) {
  const d = new Date(when);
  const y = d.getUTCFullYear();
  const m0 = period === "quarter" ? Math.floor(d.getUTCMonth() / 3) * 3 : d.getUTCMonth();
  const start = utc(y, m0);
  const end = utc(y, m0 + (period === "quarter" ? 3 : 1));
  const label = period === "quarter" ? `Q${m0 / 3 + 1} ${y}` : new Date(start).toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  return { start, end, label };
}
/** The period before the one containing `when`. */
export const previousPeriod = (period: Terms["period"], when: number) => periodOf(period, periodOf(period, when).start - 1);

export type ServiceStat = { name: string; downtimeMs: number; windows: Array<[number, number]>; incidents: Incident[]; uptimeSoFar: number; uptimeAtBest: number; credit: number };

/**
 * One service's downtime in [start, end), counting incidents up to `asOf`. Minor incidents (degraded performance) are
 * left out unless `countMinor`: SLAs usually count unavailability, and the vendor's monitoring decides the rest.
 */
export function serviceStat(name: string, incidents: Incident[], terms: Terms, start: number, end: number, asOf: number, countMinor: boolean): ServiceStat {
  const counted = incidents.filter((i) => i.services.includes(name) && (i.impact === "major" || i.impact === "critical" || (countMinor && i.impact === "minor")));
  const until = Math.min(end, asOf);
  const raw: Array<[number, number]> = [];
  const used: Incident[] = [];
  for (const i of counted) {
    const s = Math.max(Date.parse(i.start), start);
    const e = Math.min(i.end ? Date.parse(i.end) : until, until);
    if (e > s) {
      raw.push([s, e]);
      used.push(i);
    }
  }
  raw.sort((a, b) => a[0] - b[0]);
  const windows: Array<[number, number]> = [];
  for (const w of raw) {
    const last = windows[windows.length - 1];
    if (last && w[0] <= last[1]) last[1] = Math.max(last[1], w[1]);
    else windows.push([w[0], w[1]]);
  }
  const downtimeMs = windows.reduce((t, [s, e]) => t + (e - s), 0);
  const elapsed = Math.max(1, until - start);
  const uptimeSoFar = 100 * (1 - downtimeMs / elapsed);
  const uptimeAtBest = 100 * (1 - downtimeMs / (end - start));
  return { name, downtimeMs, windows, incidents: used.sort((a, b) => Date.parse(a.start) - Date.parse(b.start)), uptimeSoFar, uptimeAtBest, credit: creditFor(uptimeAtBest, terms) };
}

/** The credit % for an uptime under these terms (0 when the target is met). */
export function creditFor(uptime: number, terms: Pick<Terms, "target" | "tiers">) {
  if (uptime >= terms.target) return 0;
  const tier = [...terms.tiers].sort((a, b) => b.atLeast - a.atLeast).find((t) => uptime >= t.atLeast);
  return tier?.credit ?? 0;
}

/** Last day to claim: `claimDays` after the period ends (the end is exclusive, so the last day of the period + N). */
export const claimBy = (end: number, claimDays: number) => new Date(end - DAY + claimDays * DAY).toISOString().slice(0, 10);

export const minutes = (ms: number) => Math.round(ms / 60_000);
export const pct = (v: number, digits = 3) => `${v.toFixed(digits)}%`;
/** "3 h 22 min", "45 min". */
export function duration(ms: number) {
  const m = minutes(ms);
  return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min` : `${m} min`;
}
