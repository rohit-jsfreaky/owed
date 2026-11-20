// SLA maths on a real snapshot of GitHub's public status data (public/samples).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GITHUB_TERMS, claimBy, creditFor, periodOf, serviceStat } from "../templates/_shared/sla.ts";
import { fromCsv, readStatuspage } from "../src/lib/sources.ts";

const snap = JSON.parse(readFileSync(new URL("../public/samples/githubstatus-2026-11-19.json", import.meta.url), "utf8"));
const feed = readStatuspage("www.githubstatus.com", snap, snap);
const q4 = periodOf("quarter", Date.parse("2026-11-19T00:00:00Z"));
const asOf = Date.parse("2026-11-19T00:00:00Z");

test("periods and deadlines", () => {
  assert.equal(q4.label, "Q4 2026");
  assert.equal(new Date(q4.start).toISOString().slice(0, 10), "2026-10-01");
  assert.equal(claimBy(q4.end, 30), "2027-01-30");
  assert.equal(periodOf("month", Date.parse("2026-11-19")).label, "November 2026");
});

test("GitHub's credit tiers", () => {
  assert.equal(creditFor(99.95, GITHUB_TERMS), 0);
  assert.equal(creditFor(99.9, GITHUB_TERMS), 0);
  assert.equal(creditFor(99.7, GITHUB_TERMS), 5);
  assert.equal(creditFor(99.2, GITHUB_TERMS), 10);
  assert.equal(creditFor(98.1, GITHUB_TERMS), 25);
});

test("reads the real feed", () => {
  assert.equal(feed.vendor, "GitHub");
  assert.ok(feed.services.includes("Actions"));
  assert.ok(!feed.services.some((s) => /visit/i.test(s)));
});

test("Actions in Q4 2026 to 19 Nov: overlapping incidents merged, 10% tier", () => {
  const a = serviceStat("Actions", feed.incidents, GITHUB_TERMS, q4.start, q4.end, asOf, false);
  assert.equal(Math.round(a.downtimeMs / 60000), 1202);
  assert.ok(a.uptimeAtBest > 99.0 && a.uptimeAtBest < 99.5);
  assert.equal(a.credit, 10);
  // merged windows never overlap
  for (let i = 1; i < a.windows.length; i++) assert.ok(a.windows[i][0] > a.windows[i - 1][1]);
});

test("CSV import", () => {
  const f = fromCsv("start,end,service,title\n2026-10-02T10:00:00Z,2026-10-02T11:30:00Z,API,\"Outage, EU\"\n", "Acme");
  assert.equal(f.incidents[0].title, "Outage, EU");
  const s = serviceStat("API", f.incidents, GITHUB_TERMS, q4.start, q4.end, asOf, false);
  assert.equal(Math.round(s.downtimeMs / 60000), 90);
});
