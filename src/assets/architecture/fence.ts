import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const fence = defineAsset({
  id: "fence", category: "architecture",
  title: { de: "Zaun", en: "Fence" },
  description: { de: "Zaun mit Pfosten, Riegeln und Latten, Riegeln allein oder Paneelen.", en: "A fence with posts, rails and pickets, rails only, or panels." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 1, max: 12, step: 0.1, default: 4, unit: "m" },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.4, max: 2.2, step: 0.05, default: 1, unit: "m" },
    postSpacing: { type: "number", label: { de: "Pfostenabstand", en: "Post spacing" }, min: 0.8, max: 3, step: 0.1, default: 1.8, unit: "m" },
    style: { type: "choice", label: { de: "Bauart", en: "Style" }, options: ["pickets", "rails", "panels"], labels: { pickets: { de: "Latten", en: "pickets" }, rails: { de: "Riegel", en: "rails" }, panels: { de: "Paneele", en: "panels" } }, default: "pickets" },
    pickets: { type: "number", label: { de: "Lattenabstand", en: "Picket spacing" }, min: 0.06, max: 0.3, step: 0.01, default: 0.12, unit: "m" },
    rails: { type: "integer", label: { de: "Riegel", en: "Rails" }, min: 1, max: 5, default: 2 },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["wood", "metal", "paint"], labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" }, paint: { de: "lackiert", en: "Painted" } }, default: "wood" },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#9b7653" },
  },
  budget: { triangles: 12000, drawCalls: 1 },
  build(p) {
    const m = material(p.material, p.color);
    const t = new Parts();
    const L = p.length, h = p.height, felder = Math.max(1, Math.round(L / p.postSpacing));
    for (let i = 0; i <= felder; i++) t.box(m, 0.08, h + 0.05, 0.08, -L / 2 + (i * L) / felder, (h + 0.05) / 2, 0);
    for (let r = 0; r < p.rails; r++) t.box(m, L, 0.06, 0.03, 0, h * (0.2 + (0.6 * r) / Math.max(1, p.rails - 1)), 0.05);
    if (p.style === "pickets") {
      const n = Math.floor(L / p.pickets);
      for (let i = 0; i < n; i++) t.box(m, Math.min(0.07, p.pickets * 0.7), h * 0.95, 0.02, -L / 2 + (i + 0.5) * (L / n), (h * 0.95) / 2, 0.075);
    } else if (p.style === "panels") {
      for (let i = 0; i < felder; i++) t.box(m, L / felder - 0.1, h * 0.85, 0.025, -L / 2 + (i + 0.5) * (L / felder), h * 0.47, 0.03);
    }
    return t.group();
  },
});
