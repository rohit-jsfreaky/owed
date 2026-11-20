/**
 * What every Owed template shares: the claim's fields, the look, and the sample.
 * A claim is one vendor, one SLA period: the services the customer relies on, each one's uptime (estimated from the
 * vendor's own status page), the credit its tier gives, and the incidents behind it.
 */
import { defineTheme, prop } from "@hyper-elements/react";
import { formatDate } from "@hyper-elements/react/template";
import sample from "./example";

export const fields = {
  vendor: prop.text({ label: "Vendor", required: true, maxLength: 60 }),
  statusPage: prop.text({ label: "Status page", required: true, maxLength: 200, pattern: "^https?://" }),
  slaName: prop.text({ label: "SLA", required: true, maxLength: 80 }),
  slaUrl: prop.text({ label: "SLA link", maxLength: 300, pattern: "^https?://" }),
  target: prop.number({ label: "Uptime commitment (%)", required: true, min: 90, max: 100 }),
  period: prop.text({ label: "Period", required: true, maxLength: 30 }),
  periodStart: prop.date({ label: "Period start", required: true }),
  periodEnd: prop.date({ label: "Period end (last day)", required: true }),
  through: prop.date({ label: "Data through", required: true }),
  final: prop.boolean({ label: "Period has ended", default: false, guidance: "Before the period ends, the letter is a notice; after, it's the claim." }),
  deadline: prop.date({ label: "Claim by", required: true }),
  customer: prop.text({ label: "Customer", required: true, maxLength: 80 }),
  sender: prop.text({ label: "Signed by", required: true, maxLength: 80 }),
  account: prop.text({ label: "Account / organisation", maxLength: 80 }),
  countMinor: prop.boolean({ label: "Minor incidents counted", default: false }),
  services: prop.list(
    prop.object(
      {
        name: prop.text({ label: "Service", required: true, maxLength: 80 }),
        uptime: prop.number({ label: "Uptime for the period (%)", required: true, min: 0, max: 100 }),
        soFar: prop.number({ label: "Uptime so far (%)", min: 0, max: 100 }),
        downtimeMin: prop.number({ label: "Downtime (min)", required: true, min: 0 }),
        incidents: prop.number({ label: "Incidents", required: true, min: 0, integer: true }),
        credit: prop.number({ label: "Credit (%)", required: true, min: 0, max: 100 }),
      },
      { label: "Service" },
    ),
    { label: "Services", required: true, min: 1, max: 20 },
  ),
  evidence: prop.list(
    prop.object(
      {
        service: prop.text({ label: "Service", required: true, maxLength: 80 }),
        title: prop.text({ label: "Incident", required: true, maxLength: 200 }),
        start: prop.text({ label: "Started (UTC)", required: true, maxLength: 25 }),
        end: prop.text({ label: "Resolved (UTC)", maxLength: 25 }),
        minutes: prop.number({ label: "Minutes in period", required: true, min: 0 }),
        impact: prop.choice(["minor", "major", "critical"], { label: "Impact", required: true }),
        link: prop.text({ label: "Link", maxLength: 300 }),
      },
      { label: "Incident" },
    ),
    { label: "Evidence", max: 400 },
  ),
};

export type Service = { name: string; uptime: number; soFar?: number; downtimeMin: number; incidents: number; credit: number };
export type Evidence = { service: string; title: string; start: string; end?: string; minutes: number; impact: "minor" | "major" | "critical"; link?: string };
export type Claim = {
  vendor: string;
  statusPage: string;
  slaName: string;
  slaUrl?: string;
  target: number;
  period: string;
  periodStart: string;
  periodEnd: string;
  through: string;
  final: boolean;
  deadline: string;
  customer: string;
  sender: string;
  account?: string;
  countMinor: boolean;
  services: Service[];
  evidence: Evidence[];
};

/** The sample: GitHub's real public status data, Q4 2026 through 19 November, claimed by a made-up customer. */
export const example = sample as unknown as Claim;

/* ---------- look ---------- */

export const INK = "#101318";
export const INK2 = "#3A404B";
export const MUTED = "#636B78";
export const FAINT = "#9AA1AC";
export const LINE = "#E6E8EC";
export const GRID = "#F1F3F5";
export const PAPER = "#FFFFFF";
export const RED = "#C42B23";
export const RED_SOFT = "#FCEDEC";
export const OK = "#1E7A4E";

export const SANS = "'Albert Sans', 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'Red Hat Mono', Menlo, Consolas, monospace";

export const FONT_FILES = [
  { family: "Albert Sans", src: "../fonts/AlbertSans-300.woff", weight: 300 },
  { family: "Albert Sans", src: "../fonts/AlbertSans-400.woff", weight: 400 },
  { family: "Albert Sans", src: "../fonts/AlbertSans-500.woff", weight: 500 },
  { family: "Albert Sans", src: "../fonts/AlbertSans-600.woff", weight: 600 },
  { family: "Albert Sans", src: "../fonts/AlbertSans-700.woff", weight: 700 },
  { family: "Red Hat Mono", src: "../fonts/RedHatMono-400.woff", weight: 400 },
  { family: "Red Hat Mono", src: "../fonts/RedHatMono-500.woff", weight: 500 },
];
const CDN = "https://cdn.jsdelivr.net/npm/@fontsource";
export const FONT_URLS = [
  { family: "Albert Sans", src: `${CDN}/albert-sans@5.3.0/files/albert-sans-latin-300-normal.woff2`, weight: 300 },
  { family: "Albert Sans", src: `${CDN}/albert-sans@5.3.0/files/albert-sans-latin-400-normal.woff2`, weight: 400 },
  { family: "Albert Sans", src: `${CDN}/albert-sans@5.3.0/files/albert-sans-latin-600-normal.woff2`, weight: 600 },
  { family: "Red Hat Mono", src: `${CDN}/red-hat-mono@5.3.0/files/red-hat-mono-latin-400-normal.woff2`, weight: 400 },
];

export const theme = defineTheme({
  colors: { background: GRID, foreground: INK, primary: INK, primaryForeground: PAPER, muted: MUTED, border: LINE, paper: PAPER, red: RED },
  fonts: { body: SANS, heading: SANS },
  fontSizes: { body: 16 },
  lineHeights: { body: 1.6 },
  elements: {
    Heading: { fontWeight: 400, letterSpacing: -0.5, lineHeight: 1.15, by: { level: { 1: { fontSize: 30, mobile: { fontSize: 25 } }, 2: { fontSize: 19, fontWeight: 600 } } } },
    Button: { fontWeight: 600, fontSize: 15, padding: [13, 22], borderRadius: 999 },
  },
  styles: {
    label: { fontFamily: MONO, fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase", color: MUTED },
    sheet: { backgroundColor: PAPER, padding: 32, gap: 18, border: `1px solid ${LINE}`, borderRadius: 4 },
  },
});

/* ---------- helpers ---------- */

export const longDate = (iso: string) => formatDate(iso, "en-GB", { day: "numeric", month: "long", year: "numeric" });
export const pct = (v: number) => `${v.toFixed(3)}%`;
export const hm = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h ${String(Math.round(min % 60)).padStart(2, "0")} min` : `${Math.round(min)} min`);
export const short = (s: string) => s.replace(/^https?:\/\//, "").replace(/\/$/, "");
export const missed = (c: Pick<Claim, "services">) => c.services.filter((s) => s.credit > 0);
export const topCredit = (c: Pick<Claim, "services">) => Math.max(0, ...c.services.map((s) => s.credit));
