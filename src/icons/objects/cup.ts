import { line, onCircle, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, stroke, type Part } from "../define";
import { CLEAR, inkRadius, largest } from "../shared";

export const cup = defineIcon({
  id: "cup", category: "objects",
  title: { de: "Tasse", en: "Cup" },
  description: {
    de: "Eine Tasse oder ein Becher von der Seite mit Henkel und aufsteigendem Dampf, für Kaffee, Tee, Pausen, Cafés und Bäckereien.",
    en: "A cup or mug seen from the side with a handle and rising steam, for coffee, tea, breaks, cafés and bakeries.",
  },
  params: {
    height: { type: "number", min: 9, max: 15, step: 0.5, default: 12, label: { de: "Höhe", en: "Height" },
      describe: { de: "Höhe des Tassenkörpers in Rasterpunkten (von 24): 9 niedrig wie eine Espressotasse, 12 üblich, 15 hoch wie ein Becher.", en: "Height of the cup body in grid units (of 24): 9 low like an espresso cup, 12 usual, 15 tall like a mug." } },
    taper: { type: "number", min: 0, max: 0.3, step: 0.05, default: 0.1, label: { de: "Verjüngung", en: "Taper" },
      describe: { de: "Wie viel schmaler der Boden als der Rand ist, als Anteil der Randbreite: 0 ein gerader Becher, 0,1 üblich, 0,3 eine konische Café-Tasse.", en: "How much narrower the bottom is than the rim, as a share of the rim width: 0 a straight mug, 0.1 usual, 0.3 a tapered café cup." } },
    handle: { type: "choice", options: ["none", "loop", "ear"], default: "loop", label: { de: "Henkel", en: "Handle" },
      labels: { none: { de: "Ohne", en: "None" }, loop: { de: "Bügel", en: "Loop" }, ear: { de: "Öhrchen", en: "Ear" } },
      describe: { de: "Henkel rechts: keiner (Becher oder Glas), ein runder Bügel wie am Kaffeebecher oder ein kleines Öhrchen dicht am Körper wie an einer Teetasse.", en: "Handle on the right: none (a beaker or glass), a round loop like on a coffee mug, or a small ear close to the body like on a teacup." } },
    steam: { type: "choice", options: ["0", "1", "2", "3"], default: "2", label: { de: "Dampf", en: "Steam" },
      labels: { "0": { de: "Kein", en: "None" }, "1": { de: "Eine Linie", en: "One line" }, "2": { de: "Zwei Linien", en: "Two lines" }, "3": { de: "Drei Linien", en: "Three lines" } },
      describe: { de: "Anzahl der gewellten Dampflinien über dem Rand: 0 für ein kaltes Getränk, 2 üblich für heißen Kaffee, 3 dampfend heiß.", en: "Number of wavy steam lines above the rim: 0 for a cold drink, 2 usual for hot coffee, 3 steaming hot." } },
  },
  presets: {
    coffee: { label: { de: "Kaffee", en: "Coffee" }, values: { steam: "2" } },
    tea: { label: { de: "Tee", en: "Tea" }, values: { taper: 0.25, steam: "1", handle: "ear" } },
    cold: { label: { de: "Kalt", en: "Cold" }, values: { steam: "0" } },
    mug: { label: { de: "Becher", en: "Mug" }, values: { height: 14, taper: 0, steam: "3" } },
  },
  build(p, pen) {
    const hw = pen.width / 2, n = Number(p.steam);
    const tasse = (h: number): Part[] => {
      // Rim at y = 0, bottom at y = h; the sides run in from the rim to the narrower bottom
      const w = h * 0.85, b = (w / 2) * (1 - p.taper), r = Math.min(2, h * 0.2);
      const seite = (y: number) => w / 2 - (w / 2 - b) * (y / h);
      const ecke = (s: number) => Array.from({ length: 5 }, (_, i): Pt => {
        const [x, y] = onCircle([b - r, h - r], r, 90 + i * 22.5);
        return [s * x, y];
      });
      const koerper = polygon([-w / 2, 0], [w / 2, 0], ...ecke(1), ...ecke(-1).reverse());
      const teile: Part[] = [area(koerper)];
      if (p.handle !== "none") {
        const ohr = p.handle === "ear";
        const rx = ohr ? pen.width + 1.9 : Math.max(0.38 * h, pen.width + 2.6);
        // It ends above the rounded bottom corner, and the ear starts level with the rim: no narrow gap opens between them
        const oben = ohr ? 0 : 0.15 * h, ry = Math.min(ohr ? Math.max(0.18 * h, pen.width + 0.6) : Math.max(0.3 * h, pen.width + 1.2), (h - r - hw - oben) / 2);
        const ym = oben + ry;
        const k = (w / 2 - b) / h, nx = 1 / Math.hypot(1, k), ny = k / Math.hypot(1, k);
        // A D shape: it leaves the side at a right angle to it (also on a tapered cup), its caps end inside the outline, so no
        // thin wedge or sliver breaks off at 24 px
        teile.push(stroke(line(...Array.from({ length: 17 }, (_, i): Pt => {
          const [dx, dy] = onCircle([0, 0], 1, i * 11.25), y = ym + ry * dy, ab = hw / 4 + (rx - hw / 4) * Math.pow(Math.max(0, dx), 0.3);
          return [seite(y) + ab * nx, y + ab * ny];
        }))));
      }
      if (n > 0) {
        // Identical S-shaped lines; spaced so the gap across their slant stays clear even at the boldest pen
        const hoehe = Math.max(3.5, 0.35 * h), a = 0.55, neigung = Math.atan((2 * Math.PI * a) / hoehe);
        const abstand = Math.max(w * 0.3, (pen.width + CLEAR) / Math.cos(neigung));
        const unten = -(hw + inkRadius(pen) + CLEAR);
        for (let k = 0; k < n; k++) {
          const x0 = (k - (n - 1) / 2) * abstand;
          teile.push(stroke(line(...Array.from({ length: 9 }, (_, i): Pt => [x0 + a * Math.sin((Math.PI * i) / 4), unten - (hoehe * i) / 8]))));
        }
      }
      return teile;
    };
    return largest(6, p.height, pen, tasse);
  },
});
