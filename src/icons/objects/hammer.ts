import { line, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, gap, type Part } from "../define";
import { largest, turn } from "../shared";

export const hammer = defineIcon({
  id: "hammer", category: "objects",
  title: { de: "Hammer", en: "Hammer" },
  description: {
    de: "Ein Hammer für Bauen, Reparieren, Basteln, Werkzeuge und Einstellungen: ein gerader Stiel mit dem Kopf quer über seinem oberen Ende, als Klauenhammer oder Vorschlaghammer.",
    en: "A hammer for build, repair, craft, tools and settings: a straight handle with the head across its top end, as a claw hammer or a sledgehammer.",
  },
  params: {
    tilt: { type: "number", min: 0, max: 60, step: 5, default: 45, label: { de: "Neigung", en: "Tilt" },
      describe: { de: "Winkel des ganzen Hammers in Grad: 0 steht der Stiel aufrecht mit dem Kopf oben, 45 die übliche Diagonale, 60 stark geneigt.", en: "Angle of the whole hammer in degrees: 0 the handle stands upright with the head at the top, 45 the usual diagonal, 60 leaning far." } },
    head: { type: "choice", options: ["claw", "sledge"], default: "claw", label: { de: "Kopf", en: "Head" },
      labels: { claw: { de: "Klaue", en: "Claw" }, sledge: { de: "Vorschlag", en: "Sledge" } },
      describe: { de: "Ein Klauenhammer mit Schlagfläche auf der einen und gebogener, gespaltener Klaue auf der anderen Seite, oder ein Vorschlaghammer mit gleichmäßigem Block und zwei flachen Enden.", en: "A claw hammer with a striking face on one side and a curved split claw on the other, or a sledgehammer with a symmetric block and both ends flat." } },
    handle: { type: "number", min: 0.55, max: 0.8, step: 0.05, default: 0.7, label: { de: "Stiel", en: "Handle" },
      describe: { de: "Länge des Stiels als Anteil der größten Ausdehnung des Zeichens: 0,55 ein kurzer Handhammer, 0,7 üblich, 0,8 ein langer Vorschlaghammer.", en: "Handle length as a share of the icon's longest extent: 0.55 a short hand hammer, 0.7 usual, 0.8 a long sledge." } },
  },
  presets: {
    "claw-hammer": { label: { de: "Klauenhammer", en: "Claw hammer" }, values: { head: "claw", tilt: 45 } },
    sledgehammer: { label: { de: "Vorschlaghammer", en: "Sledgehammer" }, values: { head: "sledge", handle: 0.8, tilt: 30 } },
    upright: { label: { de: "Aufrecht", en: "Upright" }, values: { tilt: 0 } },
  },
  build(p, pen) {
    const klaue = p.head === "claw";
    // The handle is wide enough that its outline keeps clear paper inside at every stroke
    const breit = Math.max(2.5, pen.width + 1.5), b = breit / 2;
    const hammer = (L: number): Part[] => {
      // Upright, y down: the head's bottom edge at y = 0, the handle hanging below it, the hammer turned about the origin
      const stiel = p.handle * L, hoch = Math.max(pen.width + 2.25, (klaue ? 0.2 : 0.28) * L);
      const drehen = (pts: Pt[]) => turn(pts, p.tilt, [0, 0]);
      const teile: Part[] = [area(polygon(...drehen([[-b, 0], [b, 0], [b, stiel], [-b, stiel]])))];
      if (!klaue) {
        const w = 0.3 * L, f = Math.min(0.6, hoch * 0.12);
        teile.push(area(polygon(...drehen([[-w, -hoch + f], [-w + f, -hoch], [w - f, -hoch], [w, -hoch + f], [w, -f], [w - f, 0], [-w + f, 0], [-w, -f]]))));
        return teile;
      }
      // Striking face on the right, the claw on the left: a band along a curve that bends down and tapers to a blunt end
      const face = 0.28 * L, wurzel = -b - 0.25, lang = Math.max(2, 0.38 * L - b), fall = 0.35 * lang, spitze = 2.9;
      const P0: Pt = [wurzel, -hoch / 2], P1: Pt = [wurzel - 0.6 * lang, -hoch / 2], P2: Pt = [wurzel - lang, -hoch / 2 + fall];
      const n = 12, oben: Pt[] = [], unten: Pt[] = [], mitte: Pt[] = [];
      let ende: Pt = P2, aus: Pt = [-1, 0];
      for (let i = 0; i <= n; i++) {
        const t = i / n, u = 1 - t;
        const q: Pt = [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]];
        const dx = 2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]), dy = 2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]), l = Math.hypot(dx, dy);
        const d: Pt = [dx / l, dy / l], nrm: Pt = [-d[1], d[0]], dick = (hoch + (spitze - hoch) * t) / 2;
        oben.push([q[0] + nrm[0] * dick, q[1] + nrm[1] * dick]);
        unten.push([q[0] - nrm[0] * dick, q[1] - nrm[1] * dick]);
        mitte.push(q); ende = q; aus = d;
      }
      teile.push(area(polygon(...drehen([[face, -hoch], ...oben, ...unten.reverse(), [face, 0]]))));
      // The split: a slot along the middle of the claw from beyond its end, ending inside the claw
      const tief = Math.min(0.45 * lang, 2.5), schritte = Math.max(1, Math.round((tief / lang) * n));
      teile.push(gap(line(...drehen([[ende[0] + aus[0] * 1.5, ende[1] + aus[1] * 1.5], ...mitte.slice(n - schritte).reverse()])), 0.2));
      return teile;
    };
    return largest(10, 24, pen, hammer);
  },
});
