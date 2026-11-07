import { BoxGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const stairs = defineAsset({
  id: "stairs", category: "architecture",
  title: { de: "Treppe", en: "Stairs" },
  description: { de: "Gerade Treppe, massiv oder offen, mit Geländer links, rechts oder beidseitig.", en: "A straight staircase, solid or open, with a railing on the left, right or both sides." },
  params: {
    steps: { type: "integer", label: { de: "Stufen", en: "Steps" }, min: 2, max: 24, default: 12 },
    rise: { type: "number", label: { de: "Stufenhöhe", en: "Rise" }, min: 0.12, max: 0.22, step: 0.005, default: 0.17, unit: "m" },
    tread: { type: "number", label: { de: "Auftritt", en: "Tread" }, min: 0.2, max: 0.4, step: 0.005, default: 0.28, unit: "m" },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.6, max: 3, step: 0.05, default: 1, unit: "m" },
    style: { type: "choice", label: { de: "Bauart", en: "Style" }, options: ["solid", "open"], labels: { solid: { de: "massiv", en: "solid" }, open: { de: "offen mit Wangen", en: "open with stringers" } }, default: "solid" },
    railing: { type: "choice", label: { de: "Geländer", en: "Railing" }, options: ["none", "left", "right", "both"], labels: { none: { de: "keins", en: "none" }, left: { de: "links", en: "left" }, right: { de: "rechts", en: "right" }, both: { de: "beidseitig", en: "both" } }, default: "right" },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["stone", "wood", "metal"], labels: { stone: { de: "Stein", en: "Stone" }, wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" } }, default: "stone" },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#9a958c" },
  },
  budget: { triangles: 6000, drawCalls: 2 },
  build(p) {
    const m = material(p.material, p.color), gel = material("metal", "#3a3d42");
    const t = new Parts();
    const n = p.steps, w = p.width, lang = n * p.tread, hoch = n * p.rise;
    for (let i = 0; i < n; i++) {
      const z = lang / 2 - (i + 0.5) * p.tread, y = (i + 1) * p.rise;
      if (p.style === "solid") t.box(m, w, y, p.tread, 0, y / 2, z);
      else t.box(m, w - 0.08, 0.04, p.tread, 0, y - 0.02, z);
    }
    if (p.style === "open") {
      const lw = Math.hypot(lang, hoch), a = Math.atan2(hoch, lang);
      for (const sx of [-1, 1]) {
        // so gedreht, dass das untere Ende genau auf dem Boden steht
        t.add(m, new BoxGeometry(0.04, 0.25, lw).rotateX(a).translate(sx * (w / 2 - 0.02), hoch / 2 + 0.125 * Math.cos(a), 0));
      }
    }
    const seiten = p.railing === "both" ? [-1, 1] : p.railing === "left" ? [-1] : p.railing === "right" ? [1] : [];
    for (const sx of seiten) {
      const x = sx * (w / 2 - 0.05);
      for (let i = 0; i < n; i += Math.max(1, Math.round(n / 6))) {
        const z = lang / 2 - (i + 0.5) * p.tread, y = (i + 1) * p.rise;
        t.post(gel, 0.015, 0.9, x, y, z, 8);
      }
      const lw = Math.hypot(lang, hoch), a = Math.atan2(hoch, lang);
      t.add(gel, new BoxGeometry(0.04, 0.04, lw).rotateX(a).translate(x, hoch / 2 + 0.9 + p.rise / 2, 0));
    }
    return t.group();
  },
});
