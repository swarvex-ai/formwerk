import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const crate = defineAsset({
  id: "crate", category: "furniture",
  title: { de: "Kiste", en: "Crate" },
  description: { de: "Lattenkiste mit Eckpfosten, wählbarer Lattenzahl und Deckel.", en: "A slatted crate with corner posts, a choice of slats and a lid." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.2, max: 1.6, step: 0.01, default: 0.6, unit: "m" },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.15, max: 1.2, step: 0.01, default: 0.4, unit: "m" },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.2, max: 1.6, step: 0.01, default: 0.4, unit: "m" },
    slats: { type: "integer", label: { de: "Latten je Seite", en: "Slats per side" }, min: 2, max: 8, default: 4 },
    gap: { type: "number", label: { de: "Spalt", en: "Gap" }, min: 0, max: 0.04, step: 0.002, default: 0.012, unit: "m" },
    lid: { type: "boolean", label: { de: "Deckel", en: "Lid" }, default: false },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["wood", "plastic", "metal"], labels: { wood: { de: "Holz", en: "Wood" }, plastic: { de: "Kunststoff", en: "Plastic" }, metal: { de: "Metall", en: "Metal" } }, default: "wood" },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#b08050" },
  },
  budget: { triangles: 2500, drawCalls: 1 },
  build(p) {
    const m = material(p.material, p.color);
    const t = new Parts();
    const w = p.width, h = p.height, d = p.depth, s = 0.015, pf = 0.04;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.box(m, pf, h, pf, sx * (w / 2 - pf / 2), h / 2, sz * (d / 2 - pf / 2));
    t.box(m, w - 0.01, s, d - 0.01, 0, s / 2, 0);
    const lh = Math.max(0.01, (h - s - p.gap * (p.slats - 1)) / p.slats);
    for (let i = 0; i < p.slats; i++) {
      const y = s + lh / 2 + i * (lh + p.gap);
      for (const sz of [-1, 1]) t.box(m, w - 2 * pf, lh, s, 0, y, sz * (d / 2 - s / 2));
      for (const sx of [-1, 1]) t.box(m, s, lh, d - 2 * pf, sx * (w / 2 - s / 2), y, 0);
    }
    if (p.lid) {
      const n = p.slats, b = (d - p.gap * (n - 1)) / n;
      for (let i = 0; i < n; i++) t.box(m, w, s, Math.max(0.01, b), 0, h + s / 2, -d / 2 + b / 2 + i * (b + p.gap));
    }
    return t.group();
  },
});
