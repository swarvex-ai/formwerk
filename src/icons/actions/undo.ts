import { arc, line, onCircle, polygon, type Pen, type Pt } from "../../core/vector";
import { area, defineIcon, dot, stroke, type Part } from "../define";
import { largest } from "../shared";

export type Curve = { sweep: number; head: string; radius: number };

/** A curved arrow whose head sits outside the lower end of the arc, pointing along its tangent: left for undo, right
 *  for redo. The open arc stops about a cap short of the head's back, so the round cap does not poke into the chevron. */
export function curveParts(p: Curve, pen: Pen, dir: -1 | 1): Part[] {
  const hw = pen.width / 2, c: Pt = [12, 12], s = p.sweep;
  return largest(5, p.radius, pen, (rad) => {
    const l0 = Math.max(4.2, Math.min(4.8, rad * 0.68));
    const l = p.head === "open" ? l0 + Math.max(0, (1.25 - pen.width) * 1.6) : l0;
    const d = p.head === "open" ? (Math.asin(Math.min(1, hw / rad)) * 180) / Math.PI : 0;
    const bg = dir < 0 ? arc(c, rad, 180 - s, 180 - d) : arc(c, rad, 180 + d, 180 + s);
    const bk = onCircle(c, rad, 180), a: Pt = [bk[0], bk[1] - l], b: Pt = [bk[0], bk[1] + l];
    const tip: Pt = [bk[0] + dir * l, bk[1]];
    const fm = polygon(a, tip, b);
    const kp = p.head === "open" ? [stroke(line(a, tip, b))] : [area(fm), dot(fm)];
    return [stroke(bg), ...kp];
  });
}

export const undo = defineIcon({
  id: "undo", category: "actions",
  title: { de: "Rückgängig", en: "Undo" },
  description: {
    de: "Ein geschwungener Pfeil, der nach links zurückdreht, für Rückgängig und Zurück; mit offener oder gefüllter Spitze.",
    en: "A curved arrow turning back to the left for undo and back, with an open or a filled head.",
  },
  params: {
    sweep: { type: "number", min: 90, max: 270, step: 10, default: 180, label: { de: "Bogen", en: "Sweep" },
      describe: { de: "Wie weit der Bogen um den Mittelpunkt läuft: 90 ein Viertelkreis, 180 ein Halbkreis, 270 fast ein ganzer Kreis.", en: "How far the arc runs around its centre: 90 a quarter circle, 180 a half circle, 270 almost a full circle." } },
    head: { type: "choice", options: ["open", "filled"], default: "filled", label: { de: "Spitze", en: "Head" },
      labels: { open: { de: "Offen", en: "Open" }, filled: { de: "Gefüllt", en: "Filled" } },
      describe: { de: "Eine offene Spitze aus zwei Strichen wie ein Pfeil oder eine gefüllte Dreiecksspitze für kräftige Werkzeugleisten.", en: "An open head of two strokes like an arrow or a solid triangular head for bold toolbars." } },
    radius: { type: "number", min: 6, max: 7.5, step: 0.25, default: 6.5, label: { de: "Radius", en: "Radius" },
      describe: { de: "Radius des Bogens in Rasterpunkten: 6 eng und kompakt, 6,5 üblich, 7,5 weit und ausholend.", en: "Radius of the arc in grid units: 6 tight and compact, 6.5 usual, 7.5 wide and sweeping." } },
  },
  presets: {
    "full-turn": { label: { de: "Ganze Drehung", en: "Full turn" }, values: { sweep: 270 } },
    "open-head": { label: { de: "Offene Spitze", en: "Open head" }, values: { head: "open" } },
  },
  build(p, pen) {
    return curveParts(p as Curve, pen, -1);
  },
});
