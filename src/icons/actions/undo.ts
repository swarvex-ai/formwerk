import { arc, line, onCircle, polygon, type Pen, type Pt } from "../../core/vector";
import { area, defineIcon, dot, stroke, type Part } from "../define";
import { centre } from "../shared";

export type Curve = { sweep: number; head: string; radius: number };

/** A curved arrow whose head sits outside the lower end of the arc, pointing along its tangent: left for undo, right
 *  for redo. The open arc stops about a cap short of the head's back, so the round cap does not poke into the chevron. */
export function curveParts(p: Curve, pen: Pen, dir: -1 | 1): Part[] {
  const hw = pen.width / 2, r = p.radius, c: Pt = [12, 12];
  const l = Math.max(4.2, Math.min(4.8, r * 0.68));
  const d = p.head === "open" ? (Math.asin(Math.min(1, hw / r)) * 180) / Math.PI : 0, s = p.sweep;
  const bogen = dir < 0 ? arc(c, r, 180 - s, 180 - d) : arc(c, r, 180 + d, 180 + s);
  const back = onCircle(c, r, 180), a: Pt = [back[0], back[1] - l], b: Pt = [back[0], back[1] + l];
  const tip: Pt = [back[0] + dir * l, back[1]];
  const form = polygon(a, tip, b);
  const kopf = p.head === "open" ? [stroke(line(a, tip, b))] : [area(form), dot(form)];
  return centre([stroke(bogen), ...kopf], pen);
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
