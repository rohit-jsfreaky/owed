// Where incidents come from: a vendor's Atlassian Statuspage (public JSON API, CORS-open), or a CSV export.
import type { Impact, Incident } from "../../templates/_shared/sla.ts";

export const WHOLE = "Whole service";

/**
 * `complete`: the feed holds every incident there is, so where it starts doesn't matter: a CSV export, or a Statuspage
 * with fewer incidents than its API's page of 50 (nothing older was cut off).
 */
export type Feed = { vendor: string; page: string; services: string[]; incidents: Incident[]; from: string | null; complete: boolean; fetchedAt: string };

const IMPACTS = new Set<Impact>(["none", "minor", "major", "critical", "maintenance"]);

/** A Statuspage site ("www.githubstatus.com" or its URL): its components and its latest incidents. */
export async function fromStatuspage(site: string): Promise<Feed> {
  const host = site.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) throw new Error("That doesn't look like a status page address.");
  const get = (path: string) =>
    fetch(`https://${host}/api/v2/${path}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${host} answered ${r.status}. Is it an Atlassian Statuspage?`))));
  const [inc, comp] = await Promise.all([get("incidents.json"), get("components.json").catch(() => ({ components: [] }))]);
  return readStatuspage(host, inc, comp);
}

/** Statuspage's incidents.json and components.json, read into a feed. */
export function readStatuspage(host: string, inc: { page?: { name?: string }; incidents: unknown[] }, comp: { components?: unknown[] }): Feed {
  type Raw = { id: string; name: string; impact: string; started_at?: string; created_at: string; resolved_at: string | null; shortlink?: string; components?: Array<{ name: string }> };
  const incidents: Incident[] = (inc.incidents as Raw[]).map((i) => ({
    id: i.id,
    title: i.name,
    impact: (IMPACTS.has(i.impact as Impact) ? i.impact : "minor") as Impact,
    start: i.started_at ?? i.created_at,
    end: i.resolved_at,
    services: i.components?.length ? i.components.map((c) => c.name) : [WHOLE],
    link: i.shortlink,
  }));
  type RawC = { name: string; group?: boolean; group_id?: string | null; description?: string | null };
  const named = ((comp.components ?? []) as RawC[]).filter((c) => !c.group && !/^visit |for more information/i.test(c.name)).map((c) => c.name);
  const services = unique([...named, ...incidents.flatMap((i) => i.services)]);
  return {
    vendor: inc.page?.name ?? host,
    page: `https://${host}`,
    services,
    incidents,
    from: incidents.length ? incidents.map((i) => i.start).sort()[0] : null,
    complete: incidents.length < 50,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * An incident CSV with a header row: start, end, service (or component), and optionally title, impact, link.
 * Times in ISO 8601. Missing impact counts as major (the export lists downtime).
 */
export function fromCsv(text: string, vendor: string): Feed {
  const rows = parseCsv(text.trim());
  if (rows.length < 2) throw new Error("The CSV needs a header row and at least one incident.");
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (...names: string[]) => head.findIndex((h) => names.includes(h));
  const [s, e, svc, t, imp, link] = [col("start", "started", "started_at", "from"), col("end", "ended", "resolved_at", "to"), col("service", "component", "monitor"), col("title", "name", "incident"), col("impact", "severity"), col("link", "url")];
  if (s < 0 || e < 0) throw new Error("The CSV needs a start and an end column.");
  const incidents: Incident[] = rows.slice(1).flatMap((r, n) => {
    const start = r[s]?.trim();
    if (!start || Number.isNaN(Date.parse(start))) return [];
    const end = r[e]?.trim() || null;
    const impact = (r[imp]?.trim().toLowerCase() as Impact) || "major";
    return [{ id: `csv-${n}`, title: r[t]?.trim() || "Downtime", impact: IMPACTS.has(impact) ? impact : "major", start: new Date(start).toISOString(), end: end && !Number.isNaN(Date.parse(end)) ? new Date(end).toISOString() : null, services: [r[svc]?.trim() || WHOLE], link: r[link]?.trim() || undefined }];
  });
  if (!incidents.length) throw new Error("No rows with a valid start time.");
  return { vendor, page: "", services: unique(incidents.flatMap((i) => i.services)), incidents, from: incidents.map((i) => i.start).sort()[0], complete: true, fetchedAt: new Date().toISOString() };
}

function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      out.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell);
  out.push(row);
  return out.filter((r) => r.some((x) => x.trim()));
}

const unique = (xs: string[]) => [...new Set(xs)];
