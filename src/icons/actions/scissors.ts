import { circle, line, polygon, reach, type Pt, type Shape } from "../../core/vector";
import { area, defineIcon, dot, gap, hole, stroke, type Part } from "../define";
import { CLEAR, largest } from "../shared";

export const scissors = defineIcon({
  id: "scissors", category: "actions",
  title: { de: "Schere", en: "Scissors" },
  description: {
    de: "Eine offene Schere für Ausschneiden, Schneidern, Nähen und Basteln: zwei Griffringe unten, zwei gerade Klingen, die sich am Drehpunkt kreuzen und nach oben öffnen.",
    en: "Open scissors for cut, tailoring, sewing and crafts: two handle rings at the bottom, two straight blades crossing at a pivot and opening towards the top.",
  },
  params: {
    open: { type: "number", min: 25, max: 60, step: 5, default: 40, unit: "°", label: { de: "Öffnung", en: "Opening" },
      describe: { de: "Winkel zwischen den Klingen in Grad: 25 fast geschlossen, 40 üblich, 60 weit offen.", en: "Angle between the blades in degrees: 25 nearly closed, 40 usual, 60 wide open." } },
    handles: { type: "choice", options: ["round", "oval"], default: "round", label: { de: "Griffe", en: "Handles" },
      labels: { round: { de: "Rund", en: "Round" }, oval: { de: "Oval", en: "Oval" } },
      describe: { de: "Runde Griffringe wie bei einer Haushaltsschere oder längere ovale Ringe wie bei einer Schneiderschere.", en: "Round rings like household scissors, or longer oval rings like tailor's shears." } },
    blade: { type: "number", min: 0.5, max: 0.7, step: 0.05, default: 0.6, label: { de: "Klingenanteil", en: "Blade share" },
      describe: { de: "Anteil der Klingen an der Länge von der Spitze bis unter die Ringe: 0,5 kurze Bastelschere, 0,6 üblich, 0,7 lange Schneiderschere.", en: "The blades' share of the length from the tip to the bottom of the rings: 0.5 short craft scissors, 0.6 usual, 0.7 long shears." } },
    tilt: { type: "choice", options: ["upright", "diagonal"], default: "upright", label: { de: "Lage", en: "Tilt" },
      labels: { upright: { de: "Aufrecht", en: "Upright" }, diagonal: { de: "Diagonal", en: "Diagonal" } },
      describe: { de: "Spitzen nach oben, oder die ganze Schere um 45° gedreht (Spitzen nach oben rechts), wie oft für Ausschneiden.", en: "Tips pointing up, or the whole scissors turned 45° (tips to the top right), as often used for cut." } },
  },
  presets: {
    cut: { label: { de: "Ausschneiden", en: "Cut" }, values: { tilt: "diagonal" } },
    shears: { label: { de: "Schneiderschere", en: "Shears" }, values: { handles: "oval", blade: 0.7, open: 30 } },
  },
  build(p, pen) {
    const hw = pen.width / 2, rad = Math.PI / 180, half = (p.open / 2) * rad, extra = 1;
    // Rings: the hole inside the stroke stays at least 1.5 wide in radius; oval rings are longer, not narrower
    const rx = 1.75 + hw, ry = p.handles === "oval" ? rx * 1.35 : rx;
    // The pivot is a small hole; the front piece keeps a clear margin around it, its blade and its shank
    const rh = hw + 0.5, frei = rh + hw + extra;
    const wb = 2.4, wt = 1, heel = 0.5;
    const spin = p.tilt === "diagonal" ? 45 * rad : 0, cs = Math.cos(spin), sn = Math.sin(spin);
    const at = ([x, y]: Pt): Pt => [x * cs - y * sn, x * sn + y * cs];
    const turned = (s: Shape): Shape => s.kind === "circle" ? circle(at(s.c), s.r)
      : s.kind === "line" ? (s.closed ? polygon(...s.points.map(at)) : line(...s.points.map(at))) : s;
    // Ring centres: far enough apart to read as two, and so low that the margin the front piece clears around the
    // pivot leaves a stub of the back shank; shorter handles than that give the rest to the blades
    const cx = rx + hw + CLEAR / 2 + 0.5;
    const toward = (cy: number) => 1 / Math.hypot(cx / Math.hypot(cx, cy) / rx, cy / Math.hypot(cx, cy) / ry);
    let tief = 0;
    while (Math.hypot(cx, tief) - toward(tief) - hw < frei + 0.75) tief += 0.05;
    const bauen = (l: number): Part[] => {
      const b = p.blade * l, cy = Math.max(l - b - ry, tief);
      const piece = (seite: -1 | 1) => {
        // The blade points up on the side `seite`, its ring sits below on the other side
        const u: Pt = [seite * Math.sin(half), -Math.cos(half)], n: Pt = [-u[1], u[0]];
        const pt = (s: number, q: number): Pt => [u[0] * s + n[0] * q, u[1] * s + n[1] * q];
        // The ink of the flat tip reaches beyond its corners: the blade's length is measured to the ink
        const ecke = 90 + (Math.atan((wb - wt) / 2 / (b + heel)) / rad);
        const spitze = b - reach(pen, ecke);
        const klinge = polygon(pt(-heel, -wb / 2), pt(spitze, -wt / 2), pt(spitze, wt / 2), pt(-heel, wb / 2));
        const c: Pt = [-seite * cx, cy], d = Math.hypot(cx, cy), e: Pt = [c[0] / d, c[1] / d], r = toward(cy);
        const ring = p.handles === "oval"
          ? polygon(...Array.from({ length: 32 }, (_, i): Pt => [c[0] + rx * Math.cos((i * Math.PI) / 16), c[1] + ry * Math.sin((i * Math.PI) / 16)]))
          : circle(c, rx);
        return { klinge, schaft: line([0, 0], [c[0] - e[0] * r, c[1] - e[1] * r]), ring };
      };
      const back = piece(1), front = piece(-1);
      return [
        area(back.klinge), dot(back.klinge), stroke(back.schaft), stroke(back.ring),
        // The front piece lies over the back one: a clear margin along its blade, shank and pivot
        gap(front.klinge, extra), gap(front.schaft, extra), gap(circle([0, 0], rh), extra, true),
        area(front.klinge), dot(front.klinge), stroke(front.schaft), stroke(front.ring),
        hole(circle([0, 0], rh)),
      ].map((t) => ({ ...t, shape: turned(t.shape) }));
    };
    return largest(10, 24, pen, bauen);
  },
});
