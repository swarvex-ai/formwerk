import { arc, line, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, detail, stroke, type Part } from "../define";
import { EDGE, inkRadius, largest } from "../shared";

export const basket = defineIcon({
  id: "basket", category: "objects",
  title: { de: "Korb", en: "Basket" },
  description: {
    de: "Ein Einkaufskorb mit Henkel und Latten für Shop, Warenkorb, Bestellungen und Kasse: oben weiter als unten, mit einem Bogen oder zwei kurzen Griffen.",
    en: "A shopping basket with a handle and slats for shop, cart, orders and checkout: wider at the top than at the bottom, with an arch or two short handles.",
  },
  params: {
    width: { type: "number", min: 16, max: 21, step: 0.5, default: 19, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite des Korbrands in Rasterpunkten (von 24): 16 schmal, 19 üblich, 21 fast randlos.", en: "Width of the basket's rim in grid units (of 24): 16 narrow, 19 usual, 21 nearly edge to edge." } },
    depth: { type: "number", min: 7, max: 12, step: 0.5, default: 9, label: { de: "Tiefe", en: "Depth" },
      describe: { de: "Höhe des Korbs vom Rand bis zum Boden in Rasterpunkten: 7 flach, 9 üblich, 12 tief.", en: "Height of the body from rim to bottom in grid units: 7 shallow, 9 usual, 12 deep." } },
    taper: { type: "number", min: 0, max: 0.3, step: 0.05, default: 0.15, label: { de: "Verjüngung", en: "Taper" },
      describe: { de: "Wie viel schmaler der Boden ist als der Rand, als Anteil der Breite je Seite: 0 gerade Wände, 0,15 üblich, 0,3 eine tiefe Schale.", en: "How much narrower the bottom is than the rim, as a share of the width per side: 0 straight walls, 0.15 usual, 0.3 a deep bowl shape." } },
    slats: { type: "choice", options: ["0", "2", "3"], default: "3", label: { de: "Latten", en: "Slats" },
      labels: { "0": { de: "Keine", en: "None" }, "2": { de: "Zwei", en: "Two" }, "3": { de: "Drei", en: "Three" } },
      describe: { de: "Anzahl der senkrechten Latten im Korb: 0 ein glatter Korb, 3 üblich.", en: "Number of vertical slats inside the body: 0 a plain body, 3 usual." } },
    handle: { type: "choice", options: ["arch", "ears"], default: "arch", label: { de: "Henkel", en: "Handle" },
      labels: { arch: { de: "Bogen", en: "Arch" }, ears: { de: "Griffe", en: "Ears" } },
      describe: { de: "Ein Bogen von Randende zu Randende über den Korb, oder zwei kurze Griffe als kleine Bögen an den Randenden.", en: "One arch from rim end to rim end over the top, or two short handles as small arcs at the rim ends." } },
  },
  presets: {
    basket: { label: { de: "Korb", en: "Basket" }, values: { width: 19, depth: 9, taper: 0.15, slats: "3", handle: "arch" } },
    deep: { label: { de: "Tief", en: "Deep" }, values: { depth: 12, taper: 0.05 } },
    plain: { label: { de: "Schlicht", en: "Plain" }, values: { slats: "0", handle: "ears" } },
  },
  build(p, pen) {
    const hw = pen.width / 2, e = inkRadius(pen), n = Number(p.slats), over = 0.75;
    // The rim band reaches `over` beyond the body on each side; its ends and caps stay inside the live area
    const a = Math.min(p.width, 24 - 2 * EDGE - 2 * e - 2 * over) / 2, rand = a + over;
    // Clear room around a slat: across to a wall (caps may be square), along to the rim and the bottom
    const quer = hw + e + 1.1, laengs = pen.width + 1;
    const korb = (d: number): Part[] => {
      const oben = laengs, untenMax = d - laengs;
      const lang = Math.min(0.5, Math.max(0.25, untenMax - oben));
      // Upright slats, spaced by the body's width where they end: as low as the walls leave them room (`tief`),
      // and where even that is too short, the bottom stays wider
      const tief = (b: number) => {
        const noetig = (((n + 1) / 2) * quer * Math.hypot(d, a - b)) / d;
        return a - b > 1e-9 ? ((a - noetig) * d) / (a - b) : Infinity;
      };
      let b = a * (1 - 2 * p.taper);
      if (n && tief(b) < oben + lang) {
        let lo = b, hi = a;
        for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (tief(m) < oben + lang) lo = m; else hi = m; }
        b = hi;
      }
      const unten = Math.max(oben + lang, Math.min(untenMax, tief(b)));
      const halb = (y: number) => a - ((a - b) * y) / d;
      const teile: Part[] = [area(polygon([-a, 0], [a, 0], [b, d], [-b, d])), stroke(line([-rand, 0], [rand, 0]))];
      for (let i = 0; i < n; i++) {
        const f = (2 * (i + 1)) / (n + 1) - 1;
        teile.push(detail(line([f * halb(unten), oben], [f * halb(unten), unten])));
      }
      if (p.handle === "arch") {
        // A flat arch from rim end to rim end
        const h = 0.36 * 2 * rand, r = (rand * rand + h * h) / (2 * h), c: Pt = [0, r - h], w = (Math.asin(rand / r) * 180) / Math.PI;
        teile.push(stroke(arc(c, r, 360 - w, 360 + w)));
      } else {
        const r = pen.width + 1.6;
        for (const s of [-1, 1]) teile.push(stroke(arc([s * (rand - r), 0], r, 270, 450)));
      }
      return teile;
    };
    return largest(6, p.depth, pen, korb);
  },
});
