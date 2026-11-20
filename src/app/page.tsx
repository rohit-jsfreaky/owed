import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, FileCheck02, Globe02, Image01, Mail01, Upload01 } from "@untitledui/icons";
import { Mark } from "@/components/Mark";

const WRAP = "mx-auto max-w-[1180px] px-6";
const SLA = "https://github.com/customer-terms/github-online-services-sla";

export default function Home() {
  return (
    <div className="bg-paper text-ink">
      <Nav />
      <Hero />
      <Promise />
      <How />
      <Outputs />
      <Honest />
      <Sources />
      <Faq />
      <Close />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-line">
      <div className={`${WRAP} h-16 flex items-center gap-8`}>
        <Link href="/" className="flex items-center gap-2 text-[19px] font-semibold tracking-tight">
          <Mark /> Owed
        </Link>
        <nav className="hidden md:flex gap-6 text-[14px] text-muted">
          <a href="#promise" className="hover:text-ink">The promise</a>
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#outputs" className="hover:text-ink">What you send</a>
          <a href="#honest" className="hover:text-ink">The maths</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <div className="flex-1" />
        <Link href="/claim" className="btn btn-ink">
          Check a vendor <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 hair-grid opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" aria-hidden="true" />
      <div className={`${WRAP} relative pt-20 md:pt-28`}>
        <p className="mono-label">For teams that pay for SaaS with an uptime SLA</p>
        <h1 className="mt-6 font-light text-[48px] md:text-[86px] leading-[1.02] tracking-[-0.035em] max-w-[1040px]">
          Your vendor missed its SLA. <span className="text-red">Here&apos;s what it owes you.</span>
        </h1>
        <div className="mt-8 grid md:grid-cols-[1fr_auto] gap-8 items-end">
          <p className="text-[18px] md:text-[19px] leading-relaxed text-ink-2 max-w-[600px]">
            Point Owed at a vendor&apos;s status page. It works out each service&apos;s uptime against the SLA, the credit its tier gives, and writes the
            claim letter, the email to support and a card for your team.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/claim" className="btn btn-ink !px-5 !py-3 !text-[15px]">
              Check a vendor <ArrowRight size={17} />
            </Link>
            <a href="/landing/sample-letter.pdf" className="btn btn-line !px-5 !py-3 !text-[15px]">
              Sample letter (PDF)
            </a>
          </div>
        </div>
        <Frame className="mt-14 border-b-0 rounded-b-none">
          <Image
            src="/landing/ledger.png"
            alt="Owed reading GitHub's real status page for Q4 2026: up to 10% owed, five of six services below 99.9%, each with its uptime bar against the SLA line"
            width={1440}
            height={900}
            priority
            className="w-full h-auto"
          />
        </Frame>
      </div>
    </section>
  );
}

const TIERS = [
  ["99.5% to 99.9%", "5%"],
  ["99.0% to 99.5%", "10%"],
  ["under 99.0%", "25%"],
];

const RECORD = [
  ["Pull Requests", 99.3, "15 h 28 min", "10%"],
  ["Webhooks", 99.321, "15 h 00 min", "10%"],
  ["Pages", 99.588, "9 h 06 min", "5%"],
  ["Issues", 99.849, "3 h 19 min", "5%"],
  ["Git Operations", 99.873, "2 h 48 min", "5%"],
  ["API Requests", 99.909, "2 h 00 min", "—"],
] as const;

function Promise() {
  return (
    <section id="promise" className="border-b border-line">
      <div className={`${WRAP} py-24 md:py-32`}>
        <Head n="01" eyebrow="The promise" title="The SLA promises credits. Nobody claims them.">
          Vendors owe a credit when they miss their uptime commitment, but only if you ask in writing, in time, with the numbers. Developers see the
          misses and still ask{" "}
          <a className="underline underline-offset-2 hover:text-ink" href="https://news.ycombinator.com/item?id=47490020">
            on Hacker News
          </a>
          : &ldquo;Is there a meaningful fallout when these services fail to meet their SLAs?&rdquo;
        </Head>

        <div className="mt-14 grid md:grid-cols-2 border border-line">
          <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-line">
            <p className="mono-label">What GitHub&apos;s SLA says</p>
            <p className="mt-5 text-[26px] font-light leading-snug tracking-tight">
              &ldquo;GitHub commits to maintain at least <span className="font-mono text-[24px]">99.9%</span> Uptime&rdquo; per calendar quarter.
            </p>
            <div className="mt-6 border-t border-ink">
              {TIERS.map(([band, credit]) => (
                <div key={band} className="flex justify-between py-3 border-b border-line text-[15px]">
                  <span className="text-ink-2">Uptime {band}</span>
                  <span className="font-mono">{credit} credit</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[14px] text-muted leading-relaxed">
              Credits are redeemed &ldquo;only upon written request within thirty (30) days of the end of the Applicable Period.&rdquo;{" "}
              <a className="underline underline-offset-2 hover:text-ink" href={SLA}>
                GitHub Online Services SLA
              </a>
              , June 2026 version.
            </p>
          </div>
          <div className="p-6 md:p-8 bg-grid/60">
            <p className="mono-label">What its status page says, Q4 2026 to 18 Nov</p>
            <div className="mt-5 flex flex-col">
              {RECORD.map(([name, up, down, credit]) => (
                <div key={name} className="grid grid-cols-[1fr_auto] gap-x-4 py-2.5 border-b border-line last:border-0">
                  <span className="text-[15px] font-medium">{name}</span>
                  <span className={`font-mono text-[14px] text-right ${credit === "—" ? "text-ok" : "text-red"}`}>
                    {up.toFixed(3)}% · {credit}
                  </span>
                  <Bar uptime={up} />
                  <span className="font-mono text-[12px] text-muted text-right">{down} down</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-muted leading-relaxed">
              Best uptime each service can still reach this quarter, from the major and critical incidents GitHub published on githubstatus.com. Our
              calculation, 19 Nov 2026.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The ledger's uptime bar: 99% to 100%, with the 99.9% line. */
function Bar({ uptime }: { uptime: number }) {
  const w = Math.max(0, Math.min(100, (uptime - 99) * 100));
  return (
    <span className="relative mt-1.5 h-1.5 bg-line/70 self-center" aria-hidden="true">
      <span className={`absolute inset-y-0 left-0 ${uptime >= 99.9 ? "bg-ok" : "bg-red"}`} style={{ width: `${w}%` }} />
      <span className="absolute -top-1 -bottom-1 w-[2px] bg-ink" style={{ left: "90%" }} />
    </span>
  );
}

function How() {
  const steps = [
    ["Pick the vendor", "GitHub, OpenAI and Cloudflare are one click. Paste any other Atlassian Statuspage address, or upload an incident CSV from your own monitoring."],
    ["Read the ledger", "Every service the vendor lists, its downtime this period, its uptime against the SLA line and the credit its tier gives. Open a row to see each incident on a timeline."],
    ["Send the claim", "Tick the services you rely on, add who you are, and download the letter, the email and the card. Before the period ends it's a notice; after, it's the claim."],
  ];
  return (
    <section id="how" className="border-b border-line bg-grid/50">
      <div className={`${WRAP} py-24 md:py-32`}>
        <Head n="02" eyebrow="How it works" title="Three steps, all on one screen." />
        <ol className="mt-14 grid md:grid-cols-3 border border-line bg-paper">
          {steps.map(([t, d], i) => (
            <li key={t} className="p-6 md:p-8 border-b md:border-b-0 md:border-r last:border-0 border-line">
              <span className="font-mono text-[13px] text-red">0{i + 1}</span>
              <h3 className="mt-4 text-[24px] font-normal tracking-tight">{t}</h3>
              <p className="mt-2 text-[15px] text-ink-2 leading-relaxed">{d}</p>
            </li>
          ))}
        </ol>
        <Frame className="mt-6">
          <Image
            src="/landing/timeline.png"
            alt="The Webhooks row opened: eight incidents in red on the quarter's timeline, the rest of the quarter hatched, and each incident with its impact, start time, minutes counted and link"
            width={1061}
            height={449}
            className="w-full h-auto"
          />
        </Frame>
        <p className="mt-3 text-[13px] text-muted">GitHub&apos;s Webhooks, Q4 2026: every red mark is an incident GitHub published, linked to its page.</p>
      </div>
    </section>
  );
}

function Outputs() {
  return (
    <section id="outputs" className="border-b border-line">
      <div className={`${WRAP} py-24 md:py-32`}>
        <Head n="03" eyebrow="What you send" title="A claim support can't wave away.">
          The same numbers in three forms, rendered from shared templates with Hyper Elements: in the app, or from the command line.
        </Head>
        <div className="mt-14 grid md:grid-cols-12 border border-line">
          <Tile className="md:col-span-7 md:row-span-2 md:border-r" icon={<FileCheck02 size={17} />} name="The letter" note="A4 PDF · the request, then every incident as evidence">
            <div className="grid grid-cols-2 gap-3">
              <Image src="/landing/letter-1.png" alt="Letter page 1: each service's uptime against 99.9% and the credit owed" width={1241} height={1754} className="w-full h-auto border border-line shadow-[0_12px_28px_-16px_rgb(16_19_24/0.35)]" />
              <Image src="/landing/letter-2.png" alt="Letter page 2: the incidents counted, with start time, minutes and link" width={1241} height={1754} className="w-full h-auto border border-line shadow-[0_12px_28px_-16px_rgb(16_19_24/0.35)]" />
            </div>
          </Tile>
          <Tile className="md:col-span-5 border-t md:border-t-0" icon={<Image01 size={17} />} name="The card" note="1200 × 630 PNG · for the team channel">
            <Image src="/landing/card.png" alt="Card: each service's uptime against the SLA line and the credit owed" width={1200} height={630} className="w-full h-auto border border-line" />
          </Tile>
          <Tile className="md:col-span-5 border-t" icon={<Mail01 size={17} />} name="The email" note="To the vendor's support, with the letter attached">
            <div className="h-[250px] overflow-hidden border border-line bg-grid">
              <Image src="/landing/email.png" alt="Email to support listing each service's uptime and credit" width={745} height={1090} className="w-full h-auto" />
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ className = "", icon, name, note, children }: { className?: string; icon: ReactNode; name: string; note: string; children: ReactNode }) {
  return (
    <div className={`min-w-0 border-line p-5 md:p-6 flex flex-col gap-5 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-8 border border-line-strong rounded-md text-ink">{icon}</span>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-[12.5px] text-muted">{note}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

const RULES = [
  ["Downtime", "Start to resolution of each incident the vendor published, overlaps counted once, clipped to the period."],
  ["What counts", "Major and critical incidents. Minor ones (degraded performance) only if you switch them on."],
  ["Before the period ends", "Uptime “at best”: the most the period can still reach with no more downtime. The letter is a notice, not a claim."],
  ["Which services", "Only what the SLA covers by time. GitHub measures Actions and Packages by failed runs, not minutes, so they start unticked."],
  ["Missing history", "A status page's feed holds its latest 50 incidents. If they don't reach back to the period's start, Owed says so and won't write a letter."],
  ["Who's right", "The figures are estimates from the vendor's public record. The letter asks for the vendor's own monitoring data if it differs."],
];

function Honest() {
  return (
    <section id="honest" className="border-b border-line bg-grid/50">
      <div className={`${WRAP} py-24 md:py-32`}>
        <Head n="04" eyebrow="The maths" title="Honest numbers, or no letter.">
          A claim with inflated numbers gets ignored. Owed counts the way a careful engineer would, and every letter says how.
        </Head>
        <dl className="mt-14 grid md:grid-cols-3 border-l border-t border-line bg-paper">
          {RULES.map(([t, d]) => (
            <div key={t} className="p-6 md:p-7 border-r border-b border-line">
              <dt className="mono-label !text-ink">{t}</dt>
              <dd className="mt-3 text-[15px] text-ink-2 leading-relaxed">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Sources() {
  return (
    <section className="border-b border-line">
      <div className={`${WRAP} py-24 md:py-32 grid md:grid-cols-[1fr_1.1fr] gap-12 items-start`}>
        <div>
          <Head n="05" eyebrow="Any vendor" title="Reads the status page your vendor already runs." />
          <ul className="mt-10 border-t border-line">
            <Source icon={<Globe02 size={18} />} title="Any Atlassian Statuspage">
              GitHub, OpenAI, Cloudflare and many other vendors publish incidents at <code className="font-mono text-[13px]">/api/v2/incidents.json</code>. Owed reads it in your
              browser.
            </Source>
            <Source icon={<Upload01 size={18} />} title="Your own monitoring">
              Upload a CSV with <code className="font-mono text-[13px]">start, end, service</code> columns (title, impact and link optional), from your uptime checker or a
              spreadsheet.
            </Source>
            <Source icon={<FileCheck02 size={18} />} title="Your own SLA terms">
              GitHub&apos;s terms come built in. For any other vendor, set the commitment, the period (month or quarter), the credit tiers and the claim window.
            </Source>
          </ul>
        </div>
        <Frame>
          <Image src="/landing/start.png" alt="Owed's start screen: GitHub, OpenAI and Cloudflare, a saved GitHub snapshot, a box for any status page and a CSV upload" width={680} height={600} className="w-full h-auto" />
        </Frame>
      </div>
    </section>
  );
}

function Source({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-4 py-5 border-b border-line">
      <span className="mt-0.5 text-ink">{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-[15px] text-ink-2 leading-relaxed">{children}</p>
      </div>
    </li>
  );
}

const FAQ = [
  ["Which vendors work?", "Any vendor whose status page runs on Atlassian Statuspage, like GitHub, OpenAI, Cloudflare and Atlassian. Paste its address. For anything else, upload an incident CSV."],
  ["Are the numbers what the vendor will pay?", "They're estimates from the vendor's own public incident record. The vendor's SLA usually says its internal monitoring decides, so the letter says where the figures come from and asks for the vendor's data if it differs. That's the honest way to open the conversation."],
  ["Why is GitHub Actions unticked?", "GitHub's SLA measures Actions by executions that failed to run, and Packages by failed storage transactions, not by minutes of downtime. A status page can't give you that, so Owed leaves them out of the claim unless you tick them yourself."],
  ["Can I claim before the quarter ends?", "No, and Owed won't pretend you can. Mid-period it shows the best uptime each service can still reach and writes a notice. Once the period ends, the same letter becomes the formal request, with the deadline on it."],
  ["What if the status page doesn't go back far enough?", "A Statuspage feed holds the vendor's latest 50 incidents. When they don't reach back to the period's start, Owed shows “Not enough data for this period” and turns the letter off. Use your own monitoring export instead."],
  ["Is my data sent anywhere?", "The status page is fetched by your browser. When you render a letter, email or card, the claim's values go to the app's own render route. Nothing is stored."],
  ["Can I render the letter without the app?", "Yes. The templates are plain Hyper Elements templates. npm run claims renders the letter PDF, the email and the card from a JSON file with the Hyper Elements command line tool."],
] as const;

function Faq() {
  return (
    <section id="faq" className="border-b border-line">
      <div className={`${WRAP} py-24 md:py-32 grid md:grid-cols-[360px_1fr] gap-12`}>
        <div className="md:sticky md:top-28 self-start">
          <Head n="06" eyebrow="FAQ" title="Before you send it." />
        </div>
        <div className="border-t border-ink">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[19px] tracking-tight">
                {q}
                <span className="grid place-items-center size-7 shrink-0 border border-line-strong rounded-full font-mono text-[15px] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-6 pr-12 text-[15.5px] text-ink-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Close() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 hair-grid opacity-60 [mask-image:linear-gradient(to_top,black,transparent_80%)]" aria-hidden="true" />
        <div className={`${WRAP} relative py-24 md:py-32 grid md:grid-cols-[1fr_auto] gap-8 items-end`}>
          <div>
            <h2 className="font-light text-[40px] md:text-[64px] leading-[1.02] tracking-[-0.03em] max-w-[760px]">
              Downtime cost you. <span className="text-red">Get the credit back.</span>
            </h2>
            <p className="mt-5 text-[17px] text-ink-2 max-w-[520px]">Try it on GitHub&apos;s live status page, or a saved copy from 19 November 2026.</p>
          </div>
          <Link href="/claim" className="btn btn-ink !px-6 !py-3.5 !text-[15px]">
            Check a vendor <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <footer className={`${WRAP} py-10 flex flex-col md:flex-row gap-3 justify-between text-[13px] text-muted`}>
        <span className="flex items-center gap-2 text-[17px] font-semibold text-ink">
          <Mark size={20} /> Owed
        </span>
        <p className="max-w-[720px] md:text-right">
          Built with{" "}
          <a className="underline underline-offset-2 hover:text-ink inline-flex items-center gap-0.5" href="https://github.com/hyper-elements/hyper-elements">
            Hyper Elements <ArrowUpRight size={12} />
          </a>
          . Not affiliated with any vendor shown. Northwind Labs in the sample is made up; GitHub&apos;s incidents are real, from githubstatus.com.
        </p>
      </footer>
    </>
  );
}

function Frame({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`border border-line-strong bg-paper p-2 shadow-[0_24px_60px_-36px_rgb(16_19_24/0.45)] ${className}`}>{children}</div>;
}

function Head({ n, eyebrow, title, children }: { n: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-[760px]">
      <p className="mono-label">
        <span className="text-red">{n}</span> — {eyebrow}
      </p>
      <h2 className="mt-4 font-light text-[36px] md:text-[54px] leading-[1.04] tracking-[-0.03em]">{title}</h2>
      {children ? <p className="mt-5 text-[17px] leading-relaxed text-ink-2">{children}</p> : null}
    </div>
  );
}
