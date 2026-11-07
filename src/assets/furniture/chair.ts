import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const chair = defineAsset({
  id: "chair", category: "furniture",
  title: { de: "Stuhl", en: "Chair" },
  description: { de: "Stuhl oder Hocker: Maße, Lehne, Beine und Material sind einstellbar.", en: "A chair or stool: size, back, legs and material can be set." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.35, max: 0.7, step: 0.01, default: 0.45, unit: "m" },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.35, max: 0.7, step: 0.01, default: 0.45, unit: "m" },
    seatHeight: { type: "number", label: { de: "Sitzhöhe", en: "Seat height" }, min: 0.3, max: 0.8, step: 0.01, default: 0.46, unit: "m" },
    back: { type: "choice", label: { de: "Lehne", en: "Back" }, options: ["slats", "solid", "frame", "none"],
      labels: { slats: { de: "Stäbe", en: "Slats" }, solid: { de: "Platte", en: "Panel" }, frame: { de: "Rahmen", en: "Frame" }, none: { de: "keine (Hocker)", en: "none (stool)" } }, default: "slats" },
    backHeight: { type: "number", label: { de: "Lehnenhöhe", en: "Back height" }, min: 0.2, max: 0.8, step: 0.01, default: 0.45, unit: "m" },
    slats: { type: "integer", label: { de: "Stäbe", en: "Slats" }, min: 2, max: 9, default: 5 },
    legs: { type: "integer", label: { de: "Beine", en: "Legs" }, min: 3, max: 6, default: 4 },
    legShape: { type: "choice", label: { de: "Beinform", en: "Leg shape" }, options: ["round", "square"], labels: { round: { de: "rund", en: "round" }, square: { de: "eckig", en: "square" } }, default: "round" },
    legThickness: { type: "number", label: { de: "Beinstärke", en: "Leg thickness" }, min: 0.015, max: 0.06, step: 0.005, default: 0.035, unit: "m" },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["wood", "metal", "paint"], labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" }, paint: { de: "lackiert", en: "Painted" } }, default: "wood" },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a5a3c" },
  },
  budget: { triangles: 4000, drawCalls: 1 },
  build(p) {
    const m = material(p.material, p.color);
    const t = new Parts();
    const dicke = 0.035, r = p.legThickness / 2, w = p.width, d = p.depth;
    t.box(m, w, dicke, d, 0, p.seatHeight - dicke / 2, 0);
    // Beine auf einem Kreis, auf die Sitzfläche abgebildet (Ecken bei vier Beinen)
    for (let i = 0; i < p.legs; i++) {
      const a = (i / p.legs) * Math.PI * 2 + Math.PI / p.legs;
      const k = Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
      t.post(m, r, p.seatHeight - dicke, (Math.cos(a) / k) * (w / 2 - r - 0.01), 0, (Math.sin(a) / k) * (d / 2 - r - 0.01), 10, p.legShape === "square");
    }
    if (p.back !== "none") {
      const y0 = p.seatHeight, h = p.backHeight, z = -d / 2 + 0.015;
      const pfosten = (x: number) => t.post(m, 0.015, h, x, y0, z, 8, p.legShape === "square");
      if (p.back === "solid") t.box(m, w, h, 0.025, 0, y0 + h / 2, z);
      else {
        pfosten(-w / 2 + 0.02); pfosten(w / 2 - 0.02);
        t.box(m, w, 0.05, 0.025, 0, y0 + h - 0.025, z);
        if (p.back === "slats") for (let i = 0; i < p.slats; i++) {
          const x = -w / 2 + 0.06 + (i * (w - 0.12)) / Math.max(1, p.slats - 1);
          t.box(m, Math.min(0.03, (w - 0.12) / p.slats * 0.6), h - 0.06, 0.018, p.slats === 1 ? 0 : x, y0 + (h - 0.06) / 2, z);
        }
      }
    }
    return t.group();
  },
});
