import { onCircle, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, type Part } from "../define";
import { largest } from "../shared";

export const heart = defineIcon({
  id: "heart", category: "status",
  title: { de: "Herz", en: "Heart" },
  description: {
    de: "Ein Herz für Gefällt mir, Favoriten und Gesundheit, schmal oder breit, mit flacher oder tiefer Kerbe.",
    en: "A heart for like, favourites and health, slim or wide, with a shallow or deep cleft.",
  },
  params: {
    width: { type: "number", min: 14, max: 21, step: 0.5, default: 20, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite über beide Bögen in Rasterpunkten (von 24): 16 schmal, 20 üblich, 21 breit.", en: "Width across both lobes in grid units (of 24): 16 slim, 20 usual, 21 wide." } },
    height: { type: "number", min: 0.75, max: 1, step: 0.025, default: 0.88, label: { de: "Höhe", en: "Height" },
      describe: { de: "Höhe von den Bögen bis zur Spitze im Verhältnis zur Breite: 0,8 rundlich, 0,88 üblich, 1 lang und spitz.", en: "Height from the lobes to the point relative to the width: 0.8 round, 0.88 usual, 1 long and pointed." } },
    cleft: { type: "number", min: 0.5, max: 0.95, step: 0.05, default: 0.8, label: { de: "Kerbe", en: "Cleft" },
      describe: { de: "Wie weit die Bögen auseinander stehen: 0,5 flache Kerbe, 0,8 üblich, 0,95 tiefe Kerbe mit zwei deutlichen Rundungen.", en: "How far apart the lobes stand: 0.5 a shallow cleft, 0.8 usual, 0.95 a deep cleft with two distinct curves." } },
  },
  presets: {
    like: { label: { de: "Gefällt mir", en: "Like" }, values: { style: "filled" } },
    favourite: { label: { de: "Favorit", en: "Favourite" }, values: { width: 19, cleft: 0.85 } },
    health: { label: { de: "Gesundheit", en: "Health" }, values: { width: 19, height: 0.95, cleft: 0.65 } },
  },
  build(p, pen) {
    const umriss = (w: number): Part[] => {
      // Two circles side by side, joined by their tangents to the point at the bottom
      const r = w / (2 * (1 + p.cleft)), d = r * p.cleft, unten: Pt = [12, 12 + w * p.height - r];
      const kerbe = (Math.atan2(-d, Math.sqrt(r * r - d * d)) * 180) / Math.PI;
      const c: Pt = [12 + d, 12], dx = unten[0] - c[0], dy = unten[1] - c[1], D = Math.hypot(dx, dy);
      // Angle of the tangent point on the right circle (degrees clockwise from 12 o'clock)
      const zurSpitze = (Math.atan2(dx, -dy) * 180) / Math.PI;
      let beruehr = zurSpitze - (Math.acos(r / D) * 180) / Math.PI;
      if (beruehr < kerbe) beruehr += 360;
      const n = 14, bogen = Array.from({ length: n + 1 }, (_, i) => onCircle(c, r, kerbe + ((beruehr - kerbe) * i) / n));
      const spiegel = bogen.map(([x, y]): Pt => [24 - x, y]).reverse();
      return [area(polygon(...bogen, unten, ...spiegel.slice(0, -1)))];
    };
    return largest(10, p.width, pen, umriss);
  },
});
