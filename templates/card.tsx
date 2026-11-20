/**
 * The reliability card: 1200 × 630, for the team channel. Each service's uptime against the SLA line, the credit owed.
 */
import { Canvas, Column, Rect, Row, Svg, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { FONT_FILES, INK, LINE, MONO, MUTED, OK, PAPER, RED, SANS, example, fields, hm, longDate, missed, pct, short, topCredit, type Claim } from "./_shared/claim";

const W = 1200;
const H = 630;
const PAD = 60;

export default template({
  id: "owed.Card",
  version: "1.0.0",
  label: "Vendor reliability card",
  guidance: "Post it where the team decides on vendors. Up to seven services fit.",
  root: "Canvas",
  formats: { og: { width: W, height: H, scale: 1 } },
  fields,
  rules: { require: { core: ["image/overflow", "image/glyph", "image/fit"] } },
  example,
  render(v) {
    const c = v as unknown as Claim;
    const shown = c.services.slice(0, 7);
    const barW = 470;
    const lo = Math.min(99, Math.floor(Math.min(...shown.map((s) => s.uptime))));
    const x = (u: number) => Math.round(((Math.max(lo, u) - lo) / (100 - lo)) * barW);
    const rowH = Math.min(52, Math.floor(340 / shown.length));
    const credit = topCredit(c);
    return (
      <Canvas width={W} height={H} fonts={FONT_FILES} style={{ backgroundColor: PAPER, fontFamily: SANS, color: INK, padding: 0, gap: 0 }}>
        <Row style={{ padding: [44, PAD, 0], alignItems: "start", gap: 40, width: W }}>
          <Column style={{ width: 560, gap: 10 }}>
            <Text style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 1, textTransform: "uppercase", color: MUTED }}>
              {c.vendor} · {c.period}
            </Text>
            <Text fit={{ sizes: [52, 46, 40, 34], maxLines: 2 }} style={{ width: 560, fontWeight: 300, lineHeight: 1.1, letterSpacing: -1.5 }}>
              {missed(c).length
                ? `${missed(c).length} of ${c.services.length} services under the ${c.target}% SLA`
                : `Every service met the ${c.target}% SLA`}
            </Text>
          </Column>
          <Column style={{ width: W - PAD * 2 - 600, alignItems: "end", gap: 0 }}>
            <Text style={{ width: W - PAD * 2 - 600, textAlign: "right", fontFamily: MONO, fontSize: 16, textTransform: "uppercase", color: MUTED }}>Credit owed, up to</Text>
            <Text style={{ width: W - PAD * 2 - 600, textAlign: "right", fontWeight: 300, fontSize: 96, lineHeight: 1, color: credit ? RED : OK }}>{credit}%</Text>
            <Text style={{ width: W - PAD * 2 - 600, textAlign: "right", fontSize: 17, color: MUTED }}>of the period&apos;s fees</Text>
          </Column>
        </Row>
        <Column style={{ padding: [28, PAD, 0], gap: 0, width: W }}>
          {shown.map((s) => (
            <Row key={s.name} style={{ height: rowH, alignItems: "center", gap: 20, border: { top: `1px solid ${LINE}` } }}>
              <Text fit={{ sizes: [21, 19, 17], maxLines: 1 }} style={{ width: 230, fontWeight: 500 }}>
                {s.name}
              </Text>
              <Svg width={barW} height={18} title={`${s.uptime}%`}>
                <Rect y={5} width={barW} height={8} style={{ fill: "#EEF0F3" }} />
                <Rect y={5} width={x(s.uptime)} height={8} style={{ fill: s.credit ? RED : OK }} />
                <Rect x={Math.min(barW - 2, x(c.target))} y={0} width={2} height={18} style={{ fill: INK }} />
              </Svg>
              <Text style={{ width: 150, fontFamily: MONO, fontSize: 19, textAlign: "right", color: s.credit ? RED : OK }}>{pct(s.uptime)}</Text>
              <Text style={{ width: 120, fontFamily: MONO, fontSize: 17, textAlign: "right", color: MUTED }}>{hm(s.downtimeMin)}</Text>
            </Row>
          ))}
        </Column>
        <Row style={{ padding: [16, PAD, 0], width: W }}>
          <Text style={{ width: W - PAD * 2, fontSize: 15, color: MUTED }}>
            {c.final ? "" : `Uptime for the period if nothing else goes down after ${longDate(c.through)}. `}From incidents on {short(c.statusPage)}. Bar scale {lo}–100%, line at {c.target}%.
          </Text>
        </Row>
      </Canvas>
    );
  },
});
