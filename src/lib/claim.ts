// From a feed and the person's settings to the per-service ledger and the claim the templates take.
import { claimBy, periodOf, previousPeriod, serviceStat, type ServiceStat, type Terms } from "../../templates/_shared/sla.ts";
import type { Feed } from "./sources.ts";

export type Settings = {
  terms: Terms;
  which: "current" | "previous";
  countMinor: boolean;
  included: string[];
  customer: string;
  sender: string;
  account: string;
};

/** GitHub's time-based Enterprise Cloud features (SLA §5.B). Actions and Packages are measured differently. */
export const GITHUB_TIME_BASED = ["Git Operations", "API Requests", "Issues", "Pull Requests", "Webhooks", "Pages"];

export function ledger(feed: Feed, s: Settings) {
  const asOf = Date.parse(feed.fetchedAt);
  const p = s.which === "current" ? periodOf(s.terms.period, asOf) : previousPeriod(s.terms.period, asOf);
  const final = asOf >= p.end;
  const stats: ServiceStat[] = feed.services.map((name) => serviceStat(name, feed.incidents, s.terms, p.start, p.end, asOf, s.countMinor));
  const covered = feed.complete || (feed.from ? Date.parse(feed.from) <= p.start : false);
  return { period: p, asOf, final, stats, covered, deadline: claimBy(p.end, s.terms.claimDays) };
}

const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const stamp = (ms: number) => new Date(ms).toISOString().slice(0, 16).replace("T", " ");

export function claimFor(feed: Feed, s: Settings, l: ReturnType<typeof ledger>) {
  // Worst first: the services owed the most lead the letter.
  const chosen = l.stats.filter((x) => s.included.includes(x.name)).sort((a, b) => a.uptimeAtBest - b.uptimeAtBest);
  const until = Math.min(l.asOf, l.period.end);
  return {
    vendor: feed.vendor.slice(0, 60),
    statusPage: feed.page || "https://status.example.com",
    slaName: s.terms.name,
    slaUrl: s.terms.url || undefined,
    target: s.terms.target,
    period: l.period.label,
    periodStart: day(l.period.start),
    periodEnd: day(l.period.end - 86_400_000),
    through: day(until - 1),
    final: l.final,
    deadline: l.deadline,
    customer: s.customer.trim(),
    sender: s.sender.trim(),
    account: s.account.trim() || undefined,
    countMinor: s.countMinor,
    services: chosen.map((x) => ({
      name: x.name,
      uptime: +x.uptimeAtBest.toFixed(3),
      soFar: +x.uptimeSoFar.toFixed(3),
      downtimeMin: Math.round(x.downtimeMs / 60_000),
      incidents: x.incidents.length,
      credit: x.credit,
    })),
    evidence: chosen.flatMap((x) =>
      x.incidents.map((i) => {
        const st = Math.max(Date.parse(i.start), l.period.start);
        const en = Math.min(i.end ? Date.parse(i.end) : until, until);
        return {
          service: x.name,
          title: i.title.slice(0, 200),
          start: stamp(Date.parse(i.start)),
          end: i.end ? stamp(Date.parse(i.end)) : undefined,
          minutes: Math.max(0, Math.round((en - st) / 60_000)),
          impact: (i.impact === "critical" || i.impact === "major" ? i.impact : "minor") as "minor" | "major" | "critical",
          link: i.link,
        };
      }),
    ),
  };
}
