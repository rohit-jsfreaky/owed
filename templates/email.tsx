/**
 * The email to the vendor's support: the same request as the letter, short, with the letter attached as evidence.
 */
import { Column, Email, Heading, Row, Section, Text, token } from "@hyper-elements/react";
import { lint } from "@hyper-elements/lint";
import { template } from "@hyper-elements/react/template";
import { FONT_URLS, MONO, OK, RED, example, fields, hm, longDate, missed, pct, short, theme, type Claim } from "./_shared/claim";

const LABEL = { fontFamily: MONO, fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase", color: "#636B78" } as const;

export default template({
  id: "owed.Email",
  version: "1.0.0",
  label: "SLA credit request email",
  guidance: "Attach the PDF letter: it carries the incident list.",
  root: "Email",
  fields,
  rules: { plugins: { lint: lint() }, require: { lint: ["lang", "contrast", "link-text"] }, root: { previewText: true } },
  example,
  render(v) {
    const c = v as unknown as Claim;
    const owed = missed(c);
    const subject = c.final ? `Service credit request: ${c.period}, ${c.customer}` : `Uptime below SLA so far in ${c.period}: ${c.customer}`;
    return (
      <Email theme={theme} lang="en" width={600} fonts={FONT_URLS} title={subject} previewText={`${owed.length} services under ${c.target}% in ${c.period}, per ${short(c.statusPage)}.`} style={{ gap: 0 }}>
        <Section style={{ padding: [28, 24, 14] }}>
          <Text style={LABEL}>
            {c.customer}
            {c.account ? ` · ${c.account}` : ""}
          </Text>
        </Section>
        <Column style={{ apply: ["sheet"] }}>
          <Heading level={1}>{c.final ? `Service credit request for ${c.period}` : `Uptime below your SLA so far in ${c.period}`}</Heading>
          <Text>Hello {c.vendor} Support,</Text>
          <Text>
            {c.final
              ? `Under the ${c.slaName} (${c.target}% uptime), these services we rely on fell short in ${c.period}. We request the service credits listed.`
              : `Under the ${c.slaName} (${c.target}% uptime), these services we rely on can no longer reach the commitment in ${c.period}, counting only the downtime recorded to ${longDate(c.through)}. We'll send the formal request after the period ends.`}
          </Text>
          <Column style={{ gap: 0 }}>
            {c.services.map((s) => (
              <Row key={s.name} style={{ padding: [10, 0], border: { top: { width: 1, style: "solid", color: token("colors.border") } } }}>
                <Column>
                  <Text style={{ fontWeight: 600 }}>{s.name}</Text>
                  <Text style={{ fontSize: 14, color: token("colors.muted") }}>{hm(s.downtimeMin)} down</Text>
                </Column>
                <Column style={{ width: 170 }}>
                  <Text style={{ textAlign: "right", fontFamily: MONO, color: s.credit ? RED : OK }}>{pct(s.uptime)}</Text>
                  <Text style={{ textAlign: "right", fontSize: 14, fontWeight: 600 }}>{s.credit ? `${s.credit}% credit` : "Met"}</Text>
                </Column>
              </Row>
            ))}
          </Column>
          <Text style={{ fontSize: 15, color: token("colors.muted") }}>
            Figures are estimates from the incidents you published on {short(c.statusPage)} (major and critical, overlaps counted once). If your
            monitoring measured differently, please share those figures. The attached letter lists every incident counted.
          </Text>
          <Text>
            {c.final ? `We're within the claim window, which closes on ${longDate(c.deadline)}.` : `The claim window closes on ${longDate(c.deadline)}.`} Thank you.
          </Text>
          <Text>
            {c.sender}
          </Text>
        </Column>
        <Section style={{ padding: [20, 24, 32] }}>
          <Text style={{ fontSize: 14, color: token("colors.muted") }}>
            {c.slaName}{c.slaUrl ? `: ${c.slaUrl}` : ""}
          </Text>
        </Section>
      </Email>
    );
  },
});
