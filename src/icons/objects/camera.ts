import { circle, line, onCircle, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, detail, stroke, type Part } from "../define";
import { CLEAR, EDGE, largest } from "../shared";

export const camera = defineIcon({
  id: "camera", category: "objects",
  title: { de: "Kamera", en: "Camera" },
  description: {
    de: "Eine Kamera für Foto, Aufnahme und Bild: ein Gehäuse mit Linse in der Mitte, dazu ein Sucher oben oder ein Blitz.",
    en: "A camera for photo, capture and picture: a body with a lens in the middle, plus a viewfinder bump on top or a flash.",
  },
  params: {
    lens: { type: "number", min: 2.5, max: 5, step: 0.25, default: 4, label: { de: "Linse", en: "Lens" },
      describe: { de: "Radius der Linse in Rasterpunkten (von 24): 2,5 klein wie bei einem Handy, 4 üblich, 5 groß wie bei einer Spiegelreflex; sie passt sich dem Gehäuse an.", en: "Radius of the lens in grid units (of 24): 2.5 small like a phone, 4 usual, 5 big like an SLR; it adapts to the body." } },
    viewfinder: { type: "choice", options: ["none", "bump", "flash"], default: "bump", label: { de: "Sucher", en: "Viewfinder" },
      labels: { none: { de: "Ohne", en: "None" }, bump: { de: "Buckel", en: "Bump" }, flash: { de: "Blitz", en: "Flash" } },
      describe: { de: "Oben links: ein kleiner eckiger Buckel für den Sucher, ein Blitz für Aufnahmen bei Dunkelheit, oder nichts für ein schlichtes Gehäuse.", en: "At the top left: a small square bump for the viewfinder, a flash for shots in the dark, or nothing for a plain body." } },
    corner: { type: "number", min: 0, max: 4, step: 0.5, default: 2.5, label: { de: "Ecken", en: "Corner" },
      describe: { de: "Radius der Gehäuseecken: 0 kantig wie eine alte Kamera, 2,5 üblich, 4 weich wie ein Handy.", en: "Radius of the body corners: 0 square like an old camera, 2.5 usual, 4 soft like a phone." } },
  },
  presets: {
    photo: { label: { de: "Foto", en: "Photo" }, values: { viewfinder: "bump", lens: 4, corner: 2.5 } },
    flash: { label: { de: "Mit Blitz", en: "With flash" }, values: { viewfinder: "flash", lens: 3, corner: 3 } },
    phone: { label: { de: "Handy", en: "Phone" }, values: { viewfinder: "none", lens: 3, corner: 4 } },
  },
  build(p, pen) {
    const hw = pen.width / 2, w = Math.min(20, 24 - 2 * EDGE - pen.width), r = pen.corners === "round" ? Math.min(p.corner, 4) : 0;
    const kamera = (h: number): Part[] => {
      // One outline: the body from the top left corner clockwise, with the bump in its top edge
      const x0 = -w / 2, x1 = w / 2, y0 = 0, y1 = h, pts: Pt[] = [];
      const ecke = (c: Pt, von: number) => { if (r > 0) for (let i = 0; i <= 6; i++) pts.push(onCircle(c, r, von + 15 * i)); else pts.push(c); };
      const bw = 5, bh = 2.5, bx = x0 + r + 1.5;
      if (r > 0) ecke([x0 + r, y0 + r], 270); else pts.push([x0, y0]);
      if (p.viewfinder === "bump") pts.push([bx, y0], [bx, y0 - bh], [bx + bw, y0 - bh], [bx + bw, y0]);
      if (r > 0) { ecke([x1 - r, y0 + r], 0); ecke([x1 - r, y1 - r], 90); ecke([x0 + r, y1 - r], 180); } else pts.push([x1, y0], [x1, y1], [x0, y1]);
      const teile: Part[] = [area(polygon(...pts))];
      const lens = Math.min(p.lens, h / 2 - pen.width - CLEAR);
      teile.push(detail(circle([0, h / 2], lens)));
      if (p.viewfinder === "flash") {
        // A zigzag bolt above the body with clear room
        const fuss = y0 - hw - CLEAR - hw, x = x0 + r + 3.5;
        teile.push(stroke(line([x + 1.2, fuss - 3], [x - 1, fuss - 1.2], [x + 1, fuss - 1.2], [x - 1.2, fuss])));
      }
      return teile;
    };
    return largest(8, 14, pen, kamera);
  },
});
