/**
 * The letter: an A4 PDF to the vendor's support. Page 1 is the request (or, before the period ends, the notice): which
 * SLA, which period, each service's uptime against the commitment, the credit its tier gives, and the deadline. Then
 * the evidence: every incident counted, from the vendor's own status page, with its link.
 */
import { Fragment } from "react";
import { Column, Document, Heading, LineBreak, PageBreak, PageFooter, PageNumber, Rect, Row, Span, Svg, Table, TableCell, TableRow, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { FONT_FILES, INK, INK2, LINE, MONO, MUTED, OK, RED, SANS, example, fields, hm, longDate, missed, pct, short, type Claim, type Evidence } from "./_shared/claim";

const W = 682; // A4 at 96 px/in (794) less 56 px margins
const ROWS = 24;
const label = { fontFamily: MONO, fontSize: 8, fontWeight: 400, letterSpacing: 0.5, textTransform: "uppercase", color: MUTED } as const;
const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Uptime as a bar from 99% to 100% with the commitment marked: small gaps become visible. */
function UptimeBar({ uptime, target, width }: { uptime: number; target: number; width: number }) {
  const lo = Math.min(99, Math.floor(uptime));
  const x = (v: number) => Math.round(((Math.max(lo, v) - lo) / (100 - lo)) * width);
  return (
    <Svg width={width} height={12} title={`${uptime.toFixed(3)}% against ${target}%`}>
      <Rect y={3} width={width} height={6} style={{ fill: "#EEF0F3" }} />
      <Rect y={3} width={x(uptime)} height={6} style={{ fill: uptime >= target ? OK : RED }} />
      <Rect x={Math.min(width - 1.5, x(target))} y={0} width={1.5} height={12} style={{ fill: INK }} />
    </Svg>
  );
}

export default template({
  id: "owed.Letter",
  version: "1.0.0",
  label: "SLA credit request (PDF)",
  guidance: "Send it to the vendor's support within the claim window. The figures are estimates from the public status page: ask for the vendor's own monitoring data if they differ.",
  root: "Document",
  formats: { a4: { size: "A4", orientation: "portrait" } },
  fields,
  example,
  render(v) {
    const c = v as unknown as Claim;
    const owed = missed(c);
    const pages: Evidence[][] = [];
    for (let i = 0; i < c.evidence.length; i += ROWS) pages.push(c.evidence.slice(i, i + ROWS));
    const subject = c.final ? `Service credit request under the ${c.slaName}, ${c.period}` : `Notice of uptime below the ${c.slaName}, ${c.period}`;

    return (
      <Document size="A4" margin={56} title={subject} fonts={FONT_FILES} style={{ fontFamily: SANS, fontSize: 10.5, color: INK, gap: 14 }}>
        <Row style={{ alignItems: "start" }}>
          <Column style={{ gap: 2 }}>
            <Text style={{ fontWeight: 600, fontSize: 11 }}>{c.customer}</Text>
            {c.account ? <Text style={{ fontSize: 9.5, color: MUTED }}>Account: {c.account}</Text> : null}
          </Column>
          <Column>
            <Text style={{ textAlign: "right", fontSize: 9.5, color: MUTED }}>{longDate(c.through)}</Text>
          </Column>
        </Row>
        <Column style={{ gap: 2 }}>
          <Text style={label}>To</Text>
          <Text style={{ fontSize: 10.5 }}>{c.vendor} Support</Text>
        </Column>
        <Heading level={1} style={{ fontWeight: 300, fontSize: 24, lineHeight: 1.2, letterSpacing: -0.4 }}>
          {subject}
        </Heading>

        <Text style={{ lineHeight: 1.6 }}>
          {c.final
            ? `Under the ${c.slaName}, ${c.vendor} commits to ${c.target}% uptime. In ${c.period} (${longDate(c.periodStart)} to ${longDate(c.periodEnd)}), ${owed.length} of the services we rely on fell below that commitment. We request the service credits below.`
            : `Under the ${c.slaName}, ${c.vendor} commits to ${c.target}% uptime per period. ${c.period} runs to ${longDate(c.periodEnd)}. Counting only the downtime already recorded to ${longDate(c.through)}, ${owed.length} of the services we rely on can no longer reach that commitment this period, even with no further downtime. We will request the credits below once the period ends.`}
        </Text>

        <Column style={{ gap: 0 }}>
          <Row style={{ padding: [0, 0, 6], border: { bottom: `1px solid ${INK}` } }}>
            <Column>
              <Text style={label}>Service</Text>
            </Column>
            <Column style={{ width: 70 }}>
              <Text style={{ ...label, textAlign: "right" }}>Downtime</Text>
            </Column>
            <Column style={{ width: 210, padding: [0, 0, 0, 18] }}>
              <Text style={label}>Uptime for {c.period} vs {c.target}%</Text>
            </Column>
            <Column style={{ width: 60 }}>
              <Text style={{ ...label, textAlign: "right" }}>Credit</Text>
            </Column>
          </Row>
          {c.services.map((s) => (
            <Row key={s.name} style={{ padding: [9, 0], border: { bottom: `0.75px solid ${LINE}` }, alignItems: "center" }}>
              <Column style={{ gap: 1 }}>
                <Text style={{ fontWeight: 600 }}>{s.name}</Text>
                <Text style={{ fontSize: 8.5, color: MUTED }}>
                  {s.incidents} {s.incidents === 1 ? "incident" : "incidents"}
                </Text>
              </Column>
              <Column style={{ width: 70 }}>
                <Text style={{ fontFamily: MONO, fontSize: 9.5, textAlign: "right" }}>{hm(s.downtimeMin)}</Text>
              </Column>
              <Column style={{ width: 210, gap: 3, padding: [0, 0, 0, 18] }}>
                <Text style={{ fontFamily: MONO, fontSize: 10, color: s.credit ? RED : OK }}>{pct(s.uptime)}</Text>
                <UptimeBar uptime={s.uptime} target={c.target} width={190} />
              </Column>
              <Column style={{ width: 60 }}>
                <Text style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, textAlign: "right", color: s.credit ? INK : MUTED }}>{s.credit ? `${s.credit}%` : "—"}</Text>
              </Column>
            </Row>
          ))}
          <Text style={{ fontSize: 8.5, color: MUTED, padding: [6, 0, 0] }}>
            Credit: the percentage of the applicable service fees for the period, per the SLA&apos;s credit table.
            {c.final ? "" : ` Uptime for ${c.period} assumes no further downtime after ${longDate(c.through)}: it is the best the period can still reach.`}
          </Text>
        </Column>

        <Column style={{ gap: 6, padding: [12, 14], border: `1px solid ${LINE}` }}>
          <Text style={label}>How these figures were made</Text>
          <Text style={{ fontSize: 9.5, lineHeight: 1.55, color: INK2 }}>
            Downtime is the time between the start and the resolution of each incident {c.vendor} published on {short(c.statusPage)} with a{" "}
            {c.countMinor ? "minor, major or critical" : "major or critical"} impact on the service, overlaps counted once, clipped to the period. They are
            estimates from {c.vendor}&apos;s public record. Where {c.vendor}&apos;s own monitoring measured differently, we ask for those figures.
          </Text>
        </Column>

        <Text style={{ lineHeight: 1.6 }}>
          {c.final
            ? `Please apply the credits to our account. We are sending this within the claim window, which closes on ${longDate(c.deadline)}. The incidents counted are listed on the following pages.`
            : `We will send the formal request after ${longDate(c.periodEnd)} and before the claim window closes on ${longDate(c.deadline)}. The incidents counted so far are listed on the following pages.`}
        </Text>
        <Column style={{ gap: 2, padding: [10, 0, 0] }}>
          <Text>{c.sender}</Text>
          <Text style={{ color: MUTED }}>{c.customer}</Text>
        </Column>
        {c.slaUrl ? <Text style={{ fontSize: 8.5, color: MUTED }}>SLA: {c.slaUrl}</Text> : null}

        {pages.map((rows, p) => (
          <Fragment key={p}>
            <PageBreak />
            <Text style={label}>Evidence{pages.length > 1 ? ` · ${p + 1} of ${pages.length}` : ""}</Text>
            <Heading level={2} style={{ fontWeight: 300, fontSize: 19, letterSpacing: -0.3 }}>
              Incidents counted, from {short(c.statusPage)}
            </Heading>
            <Table style={{ width: W, cellPadding: [5, 5], rowBorder: { width: 0.5, style: "solid", color: LINE } }}>
              <TableRow header>
                <TableCell style={{ ...label, width: 92 }}>Service</TableCell>
                <TableCell style={label}>Incident</TableCell>
                <TableCell style={{ ...label, width: 92 }}>Started (UTC)</TableCell>
                <TableCell style={{ ...label, width: 62 }}>Counted</TableCell>
                <TableCell style={{ ...label, width: 50 }}>Impact</TableCell>
              </TableRow>
              {rows.map((e, i) => (
                <TableRow key={i}>
                  <TableCell style={{ fontSize: 8.5, verticalAlign: "top" }}>{e.service}</TableCell>
                  <TableCell style={{ fontSize: 8.5, verticalAlign: "top" }}>
                    {cut(e.title, 78)}
                    {e.link ? (
                      <>
                        <LineBreak />
                        <Span style={{ fontFamily: MONO, fontSize: 7, color: MUTED }}>{short(e.link)}</Span>
                      </>
                    ) : null}
                  </TableCell>
                  <TableCell style={{ fontFamily: MONO, fontSize: 8, verticalAlign: "top" }}>{e.start}</TableCell>
                  <TableCell style={{ fontFamily: MONO, fontSize: 8, verticalAlign: "top" }}>{hm(e.minutes)}</TableCell>
                  <TableCell style={{ fontSize: 8.5, verticalAlign: "top", color: e.impact === "critical" ? RED : INK2 }}>{e.impact}</TableCell>
                </TableRow>
              ))}
            </Table>
          </Fragment>
        ))}

        <PageFooter style={{ padding: [10, 0, 0], border: { top: `0.75px solid ${LINE}` } }}>
          <Row>
            <Column>
              <Text style={{ fontSize: 7.5, color: MUTED }}>
                {c.customer} · {c.vendor} · {c.period}
              </Text>
            </Column>
            <Column>
              <Text style={{ fontSize: 7.5, color: MUTED, textAlign: "right" }}>
                Page <PageNumber /> of <PageNumber total />
              </Text>
            </Column>
          </Row>
        </PageFooter>
      </Document>
    );
  },
});
