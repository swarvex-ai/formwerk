import { arc, circle, line, onCircle, type Pt } from "../../core/vector";
import { area, defineIcon, detail, stroke, type Part } from "../define";
import { CLEAR, inkRadius, largest } from "../shared";

export const yarn = defineIcon({
  id: "yarn", category: "objects",
  title: { de: "Wollknäuel", en: "Yarn" },
  description: {
    de: "Ein Wollknäuel für Stricken, Handarbeiten und Wolle: eine runde Kugel mit zwei bis vier geschlungenen Umwicklungen und einem losen Faden, der unten abgeht und entlang des Bodens nach rechts läuft.",
    en: "A ball of yarn for knitting, crafts and wool: a round ball with two to four curved wraps and a loose thread dropping from the bottom and running off to the right along the floor.",
  },
  params: {
    wraps: { type: "integer", min: 2, max: 4, step: 1, default: 3, label: { de: "Umwicklungen", en: "Wraps" },
      describe: { de: "Geschlungene Umwicklungen über die Kugel: 2 schlicht, 3 üblich, 4 nur bei dünnen Strichen.", en: "Wraps across the ball: 2 plain, 3 usual, 4 only at thin strokes." } },
    tilt: { type: "number", min: 0, max: 90, step: 15, default: 45, unit: "°", label: { de: "Neigung", en: "Tilt" },
      describe: { de: "Richtung der Umwicklungen in Grad: 0 waagerecht wie Bänder, 45 schräg wie das übliche Zeichen, 90 hoch.", en: "Direction the wraps lean, in degrees: 0 the wraps lie level as bands, 45 diagonal as the usual icon, 90 upright." } },
    bend: { type: "number", min: 0, max: 0.6, step: 0.1, default: 0.4, label: { de: "Biegung", en: "Bend" },
      describe: { de: "Wie stark die Umwicklungen die Kugel krümmen: 0 gerade Linien, 0,4 üblich, 0,6 enge Kurven.", en: "How strongly the wraps curve around the ball: 0 straight lines, 0.4 usual, 0.6 tight curves." } },
    thread: { type: "boolean", default: true, label: { de: "Faden", en: "Thread" },
      describe: { de: "Der lose Faden, der unten vom Knäuel abgeht und entlang des Bodens nach rechts läuft.", en: "The loose thread from the bottom of the ball along the floor to the right." } },
  },
  presets: {
    yarn: { label: { de: "Garn", en: "Yarn" }, values: { wraps: 3, thread: true } },
    plain: { label: { de: "Schlicht", en: "Plain" }, values: { wraps: 2, thread: false, bend: 0.2 } },
    wool: { label: { de: "Wolle", en: "Wool" }, values: { tilt: 0, bend: 0.3 } },
  },
  build(p, pen) {
    const hw = pen.width / 2, e = inkRadius(pen), s = pen.width + CLEAR;
    const c: Pt = [12, 12];
    const baue = (R: number): Part[] => {
      const teile: Part[] = [area(circle(c, R))];
      const rin = R - hw - 1.0 - e;
      let n = p.wraps;
      while (n > 2 && ((n - 1) / 2) * s > rin - 1.2) n--;
      const u = onCircle([0, 0], 1, p.tilt);
      for (let k = 0; k < n; k++) {
        const off = (k - (n - 1) / 2) * s;
        if (Math.abs(off) > rin - 0.5) continue;
        if (p.bend === 0) {
          const h = Math.sqrt(Math.max(0, rin * rin - off * off));
          const q: Pt = [c[0] - u[0] * off, c[1] - u[1] * off];
          teile.push(detail(line([q[0] - u[1] * h, q[1] + u[0] * h], [q[0] + u[1] * h, q[1] - u[0] * h])));
        } else {
          const D = rin / p.bend, rho = D + off;
          const phi = Math.acos(Math.max(-1, Math.min(1, (rho * rho + D * D - rin * rin) / (2 * rho * D)))) * 180 / Math.PI;
          teile.push(detail(arc([c[0] + u[0] * D, c[1] + u[1] * D], rho, p.tilt + 180 - phi, p.tilt + 180 + phi)));
        }
      }
      if (p.thread) {
        const y = c[1] + R + 2 * hw + CLEAR + 1.2;
        const a = onCircle(c, R, 180), b: Pt = [a[0], y], d: Pt = [c[0] + R + 3.5, y];
        const pts: Pt[] = [];
        for (let i = 0; i <= 12; i++) {
          const t = i / 12;
          pts.push([(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * d[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * d[1]]);
        }
        teile.push(stroke(line(...pts)));
      }
      return teile;
    };
    return largest(4, 10, pen, baue);
  },
});
