"use client";

import NextLink from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, ChevronDown, Download01, FileCheck02, Image01, Link01, Mail01, Plus, Trash01, Upload01, XClose } from "@untitledui/icons";
import { GITHUB_TERMS, duration, pct, type Terms } from "../../templates/_shared/sla.ts";
import { fromCsv, fromStatuspage, readStatuspage, type Feed } from "@/lib/sources";
import { GITHUB_TIME_BASED, claimFor, ledger, type Settings } from "@/lib/claim";
import { Mark } from "./Mark";

const VENDORS = [
  { label: "GitHub", host: "www.githubstatus.com", note: "live" },
  { label: "OpenAI", host: "status.openai.com", note: "live" },
  { label: "Cloudflare", host: "www.cloudflarestatus.com", note: "live" },
];
const SNAPSHOT = "/samples/githubstatus-2026-11-19.json";
const CUSTOM: Terms = { name: "Our SLA", target: 99.9, period: "month", tiers: [{ atLeast: 99.0, credit: 10 }, { atLeast: 95.0, credit: 25 }, { atLeast: 0, credit: 50 }], claimDays: 30 };
const STORE = "owed:v1";
type Out = "letter" | "email" | "card";

export function Ledger() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [s, setS] = useState<Settings>({ terms: GITHUB_TERMS, which: "current", countMinor: false, included: [], customer: "", sender: "", account: "" });
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Out | null>(null);

  async function load(kind: "snapshot" | "live" | "csv", arg: string, csvText?: string) {
    setLoading(arg);
    setError(null);
    try {
      let f: Feed;
      if (kind === "snapshot") {
        const snap = await fetch(SNAPSHOT).then((r) => r.json());
        f = { ...readStatuspage("www.githubstatus.com", snap, snap), fetchedAt: "2026-11-19T00:00:00.000Z" };
      } else if (kind === "live") f = await fromStatuspage(arg);
      else f = fromCsv(csvText ?? "", arg.replace(/\.csv$/i, ""));
      const isGitHub = /githubstatus\.com/.test(f.page);
      setFeed(f);
      setSource(kind === "snapshot" ? "snapshot" : arg);
      setS((prev) => ({
        ...prev,
        terms: isGitHub ? GITHUB_TERMS : prev.terms === GITHUB_TERMS ? CUSTOM : prev.terms,
        included: isGitHub ? GITHUB_TIME_BASED.filter((n) => f.services.includes(n)) : f.services.slice(0, 8),
      }));
      setOpen(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  // Keep the person's details between visits (not the feed: it should be fresh).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORE) ?? "null");
        if (saved) setS((prev) => ({ ...prev, customer: saved.customer ?? "", sender: saved.sender ?? "", account: saved.account ?? "" }));
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ customer: s.customer, sender: s.sender, account: s.account }));
    } catch {}
  }, [s.customer, s.sender, s.account]);

  const l = useMemo(() => (feed ? ledger(feed, s) : null), [feed, s]);
  const claim = useMemo(() => (feed && l ? claimFor(feed, s, l) : null), [feed, s, l]);

  if (!feed || !l || !claim) return <Start loading={loading} error={error} onLoad={load} />;

  const chosen = l.stats.filter((x) => s.included.includes(x.name));
  const owedCredit = Math.max(0, ...chosen.map((x) => x.credit));
  const missedCount = chosen.filter((x) => x.credit > 0).length;
  const ready = s.customer.trim() !== "" && s.sender.trim() !== "" && chosen.length > 0 && l.covered;
  const isGitHub = /githubstatus\.com/.test(feed.page);
  const sorted = [...l.stats].sort((a, b) => Number(s.included.includes(b.name)) - Number(s.included.includes(a.name)) || a.uptimeAtBest - b.uptimeAtBest);

  return (
    <div className="min-h-dvh flex flex-col bg-paper">
      <header className="h-14 shrink-0 border-b border-line flex items-center gap-4 px-5">
        <NextLink href="/" className="flex items-center gap-2 text-[18px] font-semibold tracking-tight">
          <Mark /> Owed
        </NextLink>
        <span className="h-5 w-px bg-line" />
        <span className="text-[14px] font-semibold">{feed.vendor}</span>
        <span className="hidden md:inline mono-label !normal-case truncate">{source === "snapshot" ? "snapshot of githubstatus.com · 19 Nov 2026" : feed.page ? feed.page.replace(/^https:\/\//, "") : "CSV"}</span>
        <div className="flex-1" />
        <button className="btn btn-line" onClick={() => setFeed(null)}>
          Change vendor
        </button>
      </header>

      <div className="flex-1 grid md:grid-cols-[300px_1fr] min-h-0">
        {/* Setup rail */}
        <aside className="order-last md:order-none border-t md:border-t-0 md:border-r border-line bg-grid/60 overflow-y-auto scroll-thin">
          <Group title="Period">
            <div className="grid grid-cols-2 rounded-md border border-line-strong p-0.5 bg-paper text-[13px] font-semibold">
              {(["current", "previous"] as const).map((w) => (
                <button key={w} onClick={() => setS({ ...s, which: w })} className={`rounded py-1.5 ${s.which === w ? "bg-ink text-white" : "text-muted"}`}>
                  {w === "current" ? `This ${s.terms.period}` : `Last ${s.terms.period}`}
                </button>
              ))}
            </div>
            <label className="flex items-start gap-2 text-[13px] text-ink-2 cursor-pointer">
              <input type="checkbox" className="mt-0.5 accent-[var(--ink)]" checked={s.countMinor} onChange={(e) => setS({ ...s, countMinor: e.target.checked })} />
              Count minor incidents (degraded performance) as downtime
            </label>
          </Group>

          <Group title="SLA terms">
            <div className="grid grid-cols-2 rounded-md border border-line-strong p-0.5 bg-paper text-[12.5px] font-semibold">
              <button onClick={() => setS({ ...s, terms: GITHUB_TERMS })} className={`rounded py-1.5 ${s.terms === GITHUB_TERMS ? "bg-ink text-white" : "text-muted"}`}>
                GitHub&apos;s
              </button>
              <button onClick={() => setS({ ...s, terms: s.terms === GITHUB_TERMS ? CUSTOM : s.terms })} className={`rounded py-1.5 ${s.terms !== GITHUB_TERMS ? "bg-ink text-white" : "text-muted"}`}>
                Your own
              </button>
            </div>
            {s.terms === GITHUB_TERMS ? (
              <p className="text-[12.5px] text-muted leading-relaxed">
                99.9% per calendar quarter. Credit 5% under 99.9%, 10% under 99.5%, 25% under 99%. Claim in writing within 30 days.{" "}
                <a className="underline" href={GITHUB_TERMS.url} target="_blank" rel="noreferrer">
                  Read the SLA
                </a>
              </p>
            ) : (
              <TermsEditor terms={s.terms} onChange={(terms) => setS({ ...s, terms })} />
            )}
          </Group>

          <Group title="Vendor">
            <Field label="Name" value={feed.vendor} onChange={(v) => setFeed({ ...feed, vendor: v })} />
          </Group>

          <Group title="From">
            <Field label="Company" value={s.customer} onChange={(v) => setS({ ...s, customer: v })} placeholder="Your company" />
            <Field label="Signed by" value={s.sender} onChange={(v) => setS({ ...s, sender: v })} placeholder="Name, role" />
            <Field label="Account (optional)" value={s.account} onChange={(v) => setS({ ...s, account: v })} placeholder="Org or account ID" />
          </Group>
        </aside>

        {/* Ledger */}
        <main className="min-w-0 overflow-y-auto scroll-thin">
          <section className="border-b border-line px-5 md:px-8 py-7 flex flex-wrap items-end gap-x-12 gap-y-5">
            <div>
              <p className="mono-label">
                {feed.vendor} · {l.period.label} {l.final ? "" : `· to ${new Date(l.asOf).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}`}
              </p>
              <p className="mt-2 text-[34px] md:text-[44px] leading-none font-light tracking-tight">
                {!l.covered ? (
                  "Not enough data for this period"
                ) : owedCredit ? (
                  <>
                    Up to <span className="text-red">{owedCredit}%</span> owed
                  </>
                ) : (
                  "Nothing owed"
                )}
              </p>
              <p className="mt-2 text-[14px] text-muted">
                {!l.covered ? "The status feed doesn't reach back to the start of the period. " : ""}
                {missedCount} of {chosen.length} services you rely on {l.final ? "missed" : "can no longer meet"} {s.terms.target}%. Claim by{" "}
                {new Date(`${l.deadline}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}.
              </p>
            </div>
            <div className="hidden md:block flex-1" />
            <div className="flex flex-wrap gap-2">
              <OutButton icon={<FileCheck02 size={16} />} label="Letter" onClick={() => setSheet("letter")} disabled={!ready} primary />
              <OutButton icon={<Mail01 size={16} />} label="Email" onClick={() => setSheet("email")} disabled={!ready} />
              <OutButton icon={<Image01 size={16} />} label="Card" onClick={() => setSheet("card")} disabled={!ready} />
            </div>
          </section>

          {!l.covered ? (
            <p className="mx-5 md:mx-8 mt-5 flex gap-2 rounded-lg bg-red-soft px-4 py-3 text-[13px] text-ink-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red" />
              The feed starts on {feed.from ? new Date(feed.from).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "an unknown date"}, after this period began.
              Incidents before that aren&apos;t counted, so uptime here is too high. Use a CSV export for the whole period.
            </p>
          ) : null}
          {l.covered && !ready ? (
            <p className="mx-5 md:mx-8 mt-5 text-[13px] text-muted">{chosen.length ? "Add your company and who signs it, under From, to write the letter." : "Tick the services you rely on to write the letter."}</p>
          ) : null}

          <div className="px-5 md:px-8 py-6">
            <div className="hidden md:grid grid-cols-[28px_1fr_110px_300px_70px_28px] gap-4 items-center pb-2 border-b border-ink mono-label">
              <span />
              <span>Service</span>
              <span className="text-right">Downtime</span>
              <span>Uptime for the {s.terms.period} vs {s.terms.target}%</span>
              <span className="text-right">Credit</span>
              <span />
            </div>
            {sorted.map((x) => {
              const on = s.included.includes(x.name);
              const expanded = open === x.name;
              return (
                <div key={x.name} className={`border-b border-line ${on ? "" : "opacity-55"}`}>
                  <div className="grid grid-cols-[20px_1fr_48px_20px] md:grid-cols-[28px_1fr_110px_300px_70px_28px] gap-x-3 gap-y-2 md:gap-4 items-center py-3">
                    <input
                      type="checkbox"
                      aria-label={`Include ${x.name}`}
                      className="accent-[var(--ink)] size-4"
                      checked={on}
                      onChange={() => setS({ ...s, included: on ? s.included.filter((n) => n !== x.name) : [...s.included, x.name] })}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{x.name}</p>
                      <p className="text-[12.5px] text-muted">
                        {x.incidents.length} {x.incidents.length === 1 ? "incident" : "incidents"}
                        <span className="md:hidden"> · {x.downtimeMs ? duration(x.downtimeMs) : "no"} down</span>
                        {isGitHub && !GITHUB_TIME_BASED.includes(x.name) ? " · not a time-based feature in GitHub's SLA" : ""}
                      </p>
                    </div>
                    <p className="hidden md:block font-mono text-[13px] text-right">{x.downtimeMs ? duration(x.downtimeMs) : "—"}</p>
                    <div className="order-last col-start-2 col-span-2 md:order-none md:col-start-auto md:col-span-1">
                      <div className="flex items-baseline justify-between">
                        <span className={`font-mono text-[13.5px] ${x.credit ? "text-red" : "text-ok"}`}>{pct(x.uptimeAtBest)}</span>
                        {!l.final ? <span className="font-mono text-[11.5px] text-faint">so far {pct(x.uptimeSoFar, 2)}</span> : null}
                      </div>
                      <Bar uptime={x.uptimeAtBest} target={s.terms.target} />
                    </div>
                    <p className={`font-mono text-[15px] text-right ${x.credit ? "font-medium" : "text-faint"}`}>{x.credit ? `${x.credit}%` : "—"}</p>
                    <button onClick={() => setOpen(expanded ? null : x.name)} disabled={!x.incidents.length} className="text-muted hover:text-ink disabled:opacity-25" aria-label={`Show incidents for ${x.name}`}>
                      <ChevronDown size={18} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  {expanded ? <Timeline stat={x} start={l.period.start} end={l.period.end} asOf={l.asOf} /> : null}
                </div>
              );
            })}
            <p className="mt-4 text-[12.5px] text-muted leading-relaxed max-w-[780px]">
              Downtime is each {s.countMinor ? "minor, major or critical" : "major or critical"} incident&apos;s start to its resolution, overlaps counted once, clipped to the
              period. {l.final ? "" : "Uptime for the period assumes nothing else goes down: the best it can still reach."} These are estimates from the
              vendor&apos;s public record; its own monitoring is what its SLA counts.
            </p>
          </div>
        </main>
      </div>

      {sheet ? <Sheet out={sheet} setOut={setSheet} claim={claim} onClose={() => setSheet(null)} /> : null}
    </div>
  );
}

/* ---------- pieces ---------- */

function Bar({ uptime, target }: { uptime: number; target: number }) {
  const lo = 99;
  const x = (v: number) => ((Math.max(lo, Math.min(100, v)) - lo) / (100 - lo)) * 100;
  return (
    <div className="relative h-2 mt-1.5 rounded-full bg-grid" title={`${uptime.toFixed(3)}% (scale 99–100%)`}>
      <div className={`absolute inset-y-0 left-0 rounded-full ${uptime >= target ? "bg-ok" : "bg-red"}`} style={{ width: `${x(uptime)}%` }} />
      <div className="absolute -top-1 -bottom-1 w-0.5 bg-ink" style={{ left: `${x(target)}%` }} />
    </div>
  );
}

function Timeline({ stat, start, end, asOf }: { stat: ReturnType<typeof ledger>["stats"][number]; start: number; end: number; asOf: number }) {
  const span = end - start;
  const at = (t: number) => `${((t - start) / span) * 100}%`;
  const months: number[] = [];
  for (let d = new Date(start); d.getTime() < end; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))) months.push(d.getTime());
  return (
    <div className="pb-5 md:px-11 space-y-4">
      <div>
        <div className="relative h-7 rounded bg-grid overflow-hidden">
          {asOf < end ? <div className="absolute inset-y-0 right-0 bg-[repeating-linear-gradient(135deg,transparent_0_5px,#e6e8ec_5px_6px)]" style={{ left: at(asOf) }} title="Still to come" /> : null}
          {stat.windows.map(([a, b]) => (
            <div key={a} className="absolute inset-y-0 bg-red" style={{ left: at(a), width: `max(2px, ${((b - a) / span) * 100}%)` }} title={duration(b - a)} />
          ))}
        </div>
        <div className="relative h-5 mt-1">
          {months.map((m) => (
            <span key={m} className="absolute font-mono text-[11px] text-muted" style={{ left: at(m) }}>
              {new Date(m).toLocaleString("en-GB", { month: "short", timeZone: "UTC" })}
            </span>
          ))}
        </div>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {stat.incidents.map((i) => (
          <li key={i.id} className="flex items-center gap-3 md:gap-4 py-2 text-[13px]">
            <span className={`font-mono text-[11.5px] uppercase w-16 ${i.impact === "critical" ? "text-red" : "text-ink-2"}`}>{i.impact}</span>
            <span className="flex-1 min-w-0 truncate">{i.title}</span>
            <span className="hidden sm:inline font-mono text-[12px] text-muted">{new Date(i.start).toISOString().slice(0, 16).replace("T", " ")}</span>
            <span className="font-mono text-[12px] w-20 md:w-24 text-right">{duration(Math.max(0, Math.min(i.end ? Date.parse(i.end) : asOf, end, asOf) - Math.max(Date.parse(i.start), start)))}</span>
            {i.link ? (
              <a href={i.link} target="_blank" rel="noreferrer" className="text-muted hover:text-ink" aria-label="Open on the status page">
                <Link01 size={14} />
              </a>
            ) : (
              <span className="w-3.5" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TermsEditor({ terms, onChange }: { terms: Terms; onChange: (t: Terms) => void }) {
  const tiers = [...terms.tiers].sort((a, b) => b.atLeast - a.atLeast);
  return (
    <div className="space-y-3">
      <Field label="Name" value={terms.name} onChange={(v) => onChange({ ...terms, name: v })} />
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="Commitment %" value={terms.target} onChange={(v) => onChange({ ...terms, target: v })} step={0.01} />
        <label className="block space-y-1">
          <span className="text-[12px] font-semibold text-ink-2">Period</span>
          <select className="input" value={terms.period} onChange={(e) => onChange({ ...terms, period: e.target.value as Terms["period"] })}>
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
          </select>
        </label>
      </div>
      <div className="space-y-1.5">
        <span className="text-[12px] font-semibold text-ink-2">Credit tiers</span>
        {tiers.map((t, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[12.5px]">
            <span className="text-muted">from</span>
            <input className="input !w-20 font-mono !text-[12.5px]" type="number" step={0.1} value={t.atLeast} onChange={(e) => onChange({ ...terms, tiers: tiers.map((x, j) => (j === i ? { ...x, atLeast: Number(e.target.value) } : x)) })} aria-label="Uptime from" />
            <span className="text-muted">% →</span>
            <input className="input !w-16 font-mono !text-[12.5px]" type="number" value={t.credit} onChange={(e) => onChange({ ...terms, tiers: tiers.map((x, j) => (j === i ? { ...x, credit: Number(e.target.value) } : x)) })} aria-label="Credit percent" />
            <span className="text-muted">%</span>
            <button className="ml-auto text-faint hover:text-ink" onClick={() => onChange({ ...terms, tiers: tiers.filter((_, j) => j !== i) })} aria-label="Remove tier">
              <Trash01 size={14} />
            </button>
          </div>
        ))}
        {tiers.length < 5 ? (
          <button className="text-[12.5px] font-semibold inline-flex items-center gap-1 text-ink-2 hover:text-ink" onClick={() => onChange({ ...terms, tiers: [...tiers, { atLeast: 0, credit: 10 }] })}>
            <Plus size={14} /> Add a tier
          </button>
        ) : null}
      </div>
      <NumberField label="Claim within (days)" value={terms.claimDays} onChange={(v) => onChange({ ...terms, claimDays: Math.max(0, Math.round(v)) })} />
    </div>
  );
}

function Sheet({ out, setOut, claim, onClose }: { out: Out; setOut: (o: Out) => void; claim: ReturnType<typeof claimFor>; onClose: () => void }) {
  const [view, setView] = useState<{ url?: string; html?: string; issues?: string[] } | null>(null);
  const key = JSON.stringify(claim);
  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      const res = await fetch("/api/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ output: out, claim }) });
      const type = res.headers.get("Content-Type") ?? "";
      const next = type.includes("json")
        ? await res.json().then((j) => (res.ok ? { html: j.html as string } : { issues: (j.diagnostics ?? [{ message: j.error }]).map((d: { message: string; path?: string }) => `${d.path ? `${d.path.replace(/^values\./, "")}: ` : ""}${d.message}`) }))
        : { url: URL.createObjectURL(await res.blob()) };
      if (!alive) return;
      setView((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return next;
      });
    }, 100);
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [out, key]);

  async function download() {
    const res = await fetch("/api/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ output: out, claim }) });
    if (!res.ok) return;
    const a = document.createElement("a");
    a.href = out === "email" ? URL.createObjectURL(new Blob([(await res.json()).html], { type: "text/html" })) : URL.createObjectURL(await res.blob());
    const slug = `${claim.vendor}-${claim.period}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `${slug}-${out === "letter" ? "sla-credit-letter.pdf" : out === "card" ? "reliability-card.png" : "sla-credit-email.html"}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/30" onClick={onClose}>
      <div className="w-full md:w-[min(980px,92vw)] h-full bg-paper border-l border-line flex flex-col shadow-[-30px_0_60px_-30px_rgb(16_19_24/0.4)]" onClick={(e) => e.stopPropagation()}>
        <div className="h-14 shrink-0 border-b border-line flex items-center gap-1 sm:gap-2 px-3 sm:px-5">
          {(["letter", "email", "card"] as const).map((o) => (
            <button key={o} onClick={() => o !== out && (setOut(o), setView(null))} className={`px-3 py-1.5 rounded-full text-[13.5px] font-semibold capitalize ${out === o ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
              {o}
            </button>
          ))}
          <div className="flex-1" />
          <button className="btn btn-ink" onClick={() => void download()} aria-label="Download">
            <Download01 size={16} /> <span className="hidden sm:inline">Download</span>
          </button>
          <button className="text-muted hover:text-ink ml-1" onClick={onClose} aria-label="Close">
            <XClose size={20} />
          </button>
        </div>
        <div className="flex-1 min-h-0 bg-grid flex">
          {view?.issues ? (
            <div className="m-6 rounded-lg bg-red-soft p-4 space-y-1 self-start">
              <p className="font-semibold text-red text-[14px]">The template refused this claim</p>
              {view.issues.map((m) => (
                <p key={m} className="text-[13px]">
                  {m}
                </p>
              ))}
            </div>
          ) : view?.url && out === "letter" ? (
            <iframe title="Letter" src={view.url} className="flex-1" />
          ) : view?.url ? (
            <div className="flex-1 grid place-items-center p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={view.url} alt="Reliability card" className="max-w-full border border-line shadow-[0_20px_40px_-20px_rgb(16_19_24/0.35)]" />
            </div>
          ) : view?.html ? (
            <iframe title="Email" srcDoc={view.html} className="flex-1" />
          ) : (
            <p className="m-auto text-[14px] text-muted">Rendering with Hyper Elements…</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Start({ loading, error, onLoad }: { loading: string | null; error: string | null; onLoad: (k: "snapshot" | "live" | "csv", arg: string, text?: string) => void }) {
  const [url, setUrl] = useState("");
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="min-h-dvh hair-grid grid place-items-center p-6">
      <div className="w-full max-w-[640px] bg-paper border border-line-strong shadow-[0_30px_60px_-30px_rgb(16_19_24/0.3)]">
        <div className="p-8 border-b border-line">
          <NextLink href="/" className="flex items-center gap-2 text-[18px] font-semibold">
            <Mark /> Owed
          </NextLink>
          <h1 className="mt-7 text-[34px] leading-tight font-light tracking-tight">Whose uptime are we checking?</h1>
          <p className="mt-2 text-[14.5px] text-muted leading-relaxed">Pick a vendor with a public status page, paste any Statuspage address, or upload an incident CSV.</p>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <p className="mono-label mb-2">Vendors</p>
            <div className="grid grid-cols-3 gap-2">
              {VENDORS.map((v) => (
                <button key={v.host} onClick={() => onLoad("live", v.host)} className="text-left border border-line hover:border-ink p-3.5 transition-colors">
                  <span className="block font-semibold">{v.label}</span>
                  <span className="block font-mono text-[11.5px] text-muted">{v.host}</span>
                </button>
              ))}
            </div>
            <button onClick={() => onLoad("snapshot", "snapshot")} className="mt-2 w-full text-left border border-dashed border-line-strong hover:border-ink p-3.5 transition-colors">
              <span className="block font-semibold text-[14px]">GitHub, frozen on 19 Nov 2026</span>
              <span className="block text-[12.5px] text-muted">A saved copy of githubstatus.com, so the numbers in the README match what you see.</span>
            </button>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (url.trim()) onLoad("live", url.trim());
            }}
          >
            <input className="input font-mono" placeholder="status.yourvendor.com" value={url} onChange={(e) => setUrl(e.target.value)} />
            <button className="btn btn-ink" disabled={!!loading}>
              Check
            </button>
          </form>
          <button onClick={() => file.current?.click()} className="w-full flex items-center justify-center gap-2 border border-line hover:border-ink py-3 text-[13.5px] font-semibold transition-colors">
            <Upload01 size={16} /> Upload an incident CSV (start, end, service)
          </button>
          <input
            ref={file}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) onLoad("csv", f.name, await f.text());
            }}
          />
          {loading ? <p className="text-[13px] text-muted font-mono">Reading {loading}…</p> : null}
          {error ? (
            <p className="text-[13px] text-red flex gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function OutButton({ icon, label, onClick, disabled, primary }: { icon: ReactNode; label: string; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button className={`btn ${primary ? "btn-ink" : "btn-line"}`} onClick={onClick} disabled={disabled}>
      {icon} {label}
    </button>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="p-5 border-b border-line space-y-3">
      <p className="mono-label !text-ink">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-[12px] font-semibold text-ink-2">{label}</span>
      <input className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function NumberField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="block space-y-1">
      <span className="text-[12px] font-semibold text-ink-2">{label}</span>
      <input className="input font-mono !text-[12.5px]" type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
