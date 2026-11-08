import { circle, polygon, reach, type Pt } from "../../core/vector";
import { area, defineIcon, hole } from "../define";

export const gear = defineIcon({
  id: "gear", category: "objects",
  title: { de: "Zahnrad", en: "Gear" },
  description: {
    de: "Ein Zahnrad für Einstellungen, Technik und Werkstatt: Zähne, Zahntiefe, Zahnbreite und Loch frei wählbar.",
    en: "A gear for settings, machines and workshops: teeth, tooth depth, tooth width and hole as you like.",
  },
  params: {
    teeth: { type: "integer", min: 5, max: 12, default: 8, label: { de: "Zähne", en: "Teeth" },
      describe: { de: "Anzahl der Zähne: 6 grob und gut lesbar, 8 üblich für Einstellungen, 12 fein wie ein Uhrwerk (bei kräftigem Strich werden es weniger, damit die Lücken offen bleiben).", en: "Number of teeth: 6 coarse and legible, 8 usual for settings, 12 fine like clockwork (a bold stroke gets fewer, so the gaps stay open)." } },
    depth: { type: "number", min: 1, max: 3.5, step: 0.25, default: 2.25, label: { de: "Zahntiefe", en: "Tooth depth" },
      describe: { de: "Wie weit die Zähne vorstehen, in Rasterpunkten: 1,5 flach wie ein Rädchen, 2,25 üblich, 3,5 tief wie ein Kettenrad.", en: "How far the teeth stand out, in grid units: 1.5 flat like a cog, 2.25 usual, 3.5 deep like a sprocket." } },
    toothWidth: { type: "number", min: 0.3, max: 0.6, step: 0.05, default: 0.45, label: { de: "Zahnbreite", en: "Tooth width" },
      describe: { de: "Anteil eines Zahns am Umfang: 0,3 spitze Zähne, 0,45 üblich, 0,6 breite Klötze mit schmalen Lücken.", en: "Share of a tooth in the circumference: 0.3 pointed teeth, 0.45 usual, 0.6 wide blocks with narrow gaps." } },
    hole: { type: "number", min: 1.5, max: 4.5, step: 0.25, default: 3, label: { de: "Loch", en: "Hole" },
      describe: { de: "Radius des Lochs in der Mitte: 2 klein wie eine Achse, 3 üblich, 4,5 groß wie ein Ring.", en: "Radius of the hole in the middle: 2 small like an axle, 3 usual, 4.5 large like a ring." } },
  },
  presets: {
    settings: { label: { de: "Einstellungen", en: "Settings" }, values: { teeth: 8, depth: 2.25, toothWidth: 0.45, hole: 3 } },
    cog: { label: { de: "Rädchen", en: "Cog" }, values: { teeth: 12, depth: 1.5, toothWidth: 0.5, hole: 2.5 } },
    sprocket: { label: { de: "Kettenrad", en: "Sprocket" }, values: { teeth: 6, depth: 3.25, toothWidth: 0.35, hole: 4 } },
  },
  build(p, pen) {
    // Shallower teeth when the smallest hole would touch the root: the ring between them stays open
    const c: Pt = [12, 12], aussen = 12 - Math.max(2, 1 + reach(pen, 100)), minLoch = pen.width / 2 + 1.25;
    let innen = Math.max(aussen - p.depth, minLoch + pen.width + 1.5);
    // Fewer teeth until the gaps between them, their tips and their necks stay open under the stroke
    const offen = pen.width + 1.25, sehne = (r: number, halbGrad: number) => 2 * r * Math.sin((halbGrad * Math.PI) / 180);
    const minHalb = (r: number) => (Math.asin(Math.min(1, offen / 2 / r)) * 180) / Math.PI;
    const zahn = (z: number) => {
      const teilung = 360 / z, kopf = Math.min(Math.max((teilung * p.toothWidth * 0.8) / 2, minHalb(aussen)), teilung * 0.3);
      // Teeth get narrower where the gap between them would close
      const fuss = Math.min(Math.max((teilung * p.toothWidth * 1.2) / 2, kopf + 2, minHalb(innen)), teilung / 2 - minHalb(innen));
      return { teilung, kopf: Math.min(kopf, fuss - 1), fuss, passt: sehne(aussen, Math.min(kopf, fuss - 1)) >= offen - 1e-9 && sehne(innen, teilung / 2 - fuss) >= offen - 1e-9 && sehne(innen, fuss) >= offen - 1e-9 };
    };
    let n = p.teeth;
    while (n > 5 && !zahn(n).passt) n--;
    while (!zahn(n).passt && innen < aussen - 1) innen += 0.25;
    const { teilung, kopf, fuss } = zahn(n);
    const punkt = (r: number, deg: number): Pt => [c[0] + r * Math.sin((deg * Math.PI) / 180), c[1] - r * Math.cos((deg * Math.PI) / 180)];
    const umriss: Pt[] = [];
    for (let z = 0; z < n; z++) {
      const mitte = z * teilung;
      umriss.push(punkt(innen, mitte - fuss), punkt(aussen, mitte - kopf), punkt(aussen, mitte + kopf), punkt(innen, mitte + fuss));
      // The root between two teeth follows the circle
      const von = mitte + fuss, bis = mitte + teilung - fuss;
      for (let s = 1; s < 3; s++) umriss.push(punkt(innen, von + ((bis - von) * s) / 3));
    }
    const loch = Math.max(minLoch, Math.min(p.hole, innen - pen.width - 1.5));
    return [area(polygon(...umriss)), hole(circle(c, loch))];
  },
});
