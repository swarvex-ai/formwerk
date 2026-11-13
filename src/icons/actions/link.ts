import { polygon, type Pt } from "../../core/vector";
import { area, defineIcon, gap } from "../define";
import { centre, turn } from "../shared";

const BREITE = 8; // how thick a ring is, so both read as chain links and not as threads

export const link = defineIcon({
  id: "link", category: "actions",
  title: { de: "Link", en: "Link" },
  description: {
    de: "Zwei ineinandergreifende Ringe für Verbindung, Link und Referenz: der vordere ganz, der hintere nur an den Übergängen frei.",
    en: "Two interlocking rings for a connection, a link and a reference: the front ring whole, the back one cleared where it passes under.",
  },
  params: {
    angle: { type: "number", min: 0, max: 90, step: 5, default: 45, unit: "°", label: { de: "Winkel", en: "Angle" },
      describe: { de: "Neigung der Kette in Grad: 0 waagerecht, 45 wie üblich, 90 senkrecht.", en: "Tilt of the chain in degrees: 0 level, 45 as usual, 90 upright." } },
    linkLength: { type: "number", min: 8.5, max: 10.5, step: 0.5, default: 9.5, label: { de: "Ringlänge", en: "Link length" },
      describe: { de: "Länge eines Rings in Rasterpunkten (von 24): 8,5 gedrungen, 9,5 üblich, 10,5 lang.", en: "Length of one ring in grid units (of 24): 8.5 stubby, 9.5 usual, 10.5 long." } },
    gap: { type: "number", min: 3, max: 5, step: 0.5, default: 4, label: { de: "Überschneidung", en: "Overlap" },
      describe: { de: "Wie weit die beiden Ringe sich überschneiden in Rasterpunkten: 3 knapp, 4 üblich, 5 tief; grosser Wert lässt den hinteren Ring tiefer in den vorderen greifen.", en: "How far the two rings overlap in grid units: 3 tight, 4 usual, 5 deep; a big value lets the back ring reach deeper into the front one." } },
  },
  presets: {
    chain: { label: { de: "Kette", en: "Chain" }, values: { angle: 45, linkLength: 10.5, gap: 4.5 } },
    attach: { label: { de: "Anhängen", en: "Attach" }, values: { angle: 0, linkLength: 9, gap: 3 } },
  },
  build(p, pen) {
    const a = p.linkLength / 2, b = BREITE / 2, d = p.linkLength - p.gap;
    // A ring as a closed outline: two half circles at the ends, joined by the straight sides between them
    const kapsel = (cx: number): Pt[] => {
      const rechts = cx + a - b, links = cx - a + b, pts: Pt[] = [];
      for (let i = 0; i <= 12; i++) { const t = ((-90 + i * 15) * Math.PI) / 180; pts.push([rechts + b * Math.cos(t), b * Math.sin(t)]); }
      for (let i = 0; i <= 12; i++) { const t = ((90 + i * 15) * Math.PI) / 180; pts.push([links + b * Math.cos(t), b * Math.sin(t)]); }
      return pts;
    };
    const drehe = (pts: Pt[]): Pt[] => turn(pts, -p.angle, [0, 0]).map(([x, y]): Pt => [x + 12, y + 12]);
    // The lower left ring lies in front: its outline stays whole, the back ring is cut only where it passes under
    const vorn = polygon(...drehe(kapsel(-d / 2))), hinten = polygon(...drehe(kapsel(d / 2)));
    return centre([area(hinten), gap(vorn, 1, false), area(vorn)], pen);
  },
});
