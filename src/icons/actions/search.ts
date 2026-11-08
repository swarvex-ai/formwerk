import { circle, line } from "../../core/vector";
import { area, defineIcon, detail, stroke, type Part } from "../define";

export const search = defineIcon({
  id: "search", category: "actions",
  title: { de: "Lupe", en: "Search" },
  description: {
    de: "Eine Lupe für Suchen und Finden, auch mit Plus und Minus zum Vergrößern und Verkleinern.",
    en: "A magnifying glass for search and find, also with plus and minus to zoom in and out.",
  },
  params: {
    lens: { type: "number", min: 4, max: 8, step: 0.25, default: 6.5, label: { de: "Glas", en: "Lens" },
      describe: { de: "Radius des Glases in Rasterpunkten: 5 mit langem Griff, 6,5 üblich, 8 für eine große Lupe.", en: "Radius of the lens in grid units: 5 with a long handle, 6.5 usual, 8 for a big magnifier." } },
    handle: { type: "number", min: 2, max: 8, step: 0.25, default: 5, label: { de: "Griff", en: "Handle" },
      describe: { de: "Länge des Griffs in Rasterpunkten: 3 kurz und kompakt, 5 üblich, 7 lang wie eine Leselupe.", en: "Length of the handle in grid units: 3 short and compact, 5 usual, 7 long like a reading glass." } },
    angle: { type: "number", min: 0, max: 90, step: 1, default: 45, unit: "°", label: { de: "Richtung", en: "Angle" },
      describe: { de: "Wohin der Griff zeigt: 0° nach rechts, 45° nach rechts unten wie üblich, 90° nach unten.", en: "Where the handle points: 0° to the right, 45° down to the right as usual, 90° down." } },
    zoom: { type: "choice", options: ["none", "in", "out"], default: "none", label: { de: "Zoom", en: "Zoom" },
      labels: { none: { de: "Ohne", en: "None" }, in: { de: "Plus (vergrößern)", en: "Plus (zoom in)" }, out: { de: "Minus (verkleinern)", en: "Minus (zoom out)" } },
      describe: { de: "Ein Plus oder Minus im Glas für Vergrößern und Verkleinern; ohne ist es die Suche.", en: "A plus or minus in the lens to zoom in and out; without it is search." } },
  },
  presets: {
    "zoom-in": { label: { de: "Vergrößern", en: "Zoom in" }, values: { zoom: "in", lens: 7, handle: 4 } },
    "zoom-out": { label: { de: "Verkleinern", en: "Zoom out" }, values: { zoom: "out", lens: 7, handle: 4 } },
    find: { label: { de: "Finden", en: "Find" }, values: { lens: 5, handle: 7, angle: 50 } },
  },
  build(p, pen) {
    const a = (p.angle * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
    // A square cap at an angle reaches further out than a round one
    const hw = pen.width / 2, m = 1 + (pen.corners === "sharp" ? hw * (dx + dy) : hw);
    // Fit lens and handle into the room and centre the pair
    const breite = p.lens + Math.max(p.lens, (p.lens + p.handle) * dx), hoehe = p.lens + Math.max(p.lens, (p.lens + p.handle) * dy);
    const k = Math.min(1, (24 - 2 * m) / breite, (24 - 2 * m) / hoehe), r = p.lens * k, l = p.handle * k;
    const cx = 12 - (breite * k) / 2 + r, cy = 12 - (hoehe * k) / 2 + r;
    const teile: Part[] = [area(circle([cx, cy], r)), stroke(line([cx + dx * r, cy + dy * r], [cx + dx * (r + l), cy + dy * (r + l)]))];
    const z = Math.min(r * 0.48, r - pen.width - 1.25 - (pen.corners === "sharp" ? hw : 0));
    if (p.zoom !== "none" && z > 0.75) {
      teile.push(detail(line([cx - z, cy], [cx + z, cy])));
      if (p.zoom === "in") teile.push(detail(line([cx, cy - z], [cx, cy + z])));
    }
    return teile;
  },
});
