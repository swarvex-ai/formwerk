import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const chair = defineAsset({
  id: "chair", category: "furniture",
  title: { de: "Stuhl", en: "Chair" },
  description: { de: "Stuhl oder Hocker: Maße, Lehne, Beine und Material sind einstellbar.", en: "A chair or stool: size, back, legs and material can be set." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.35, max: 0.7, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Breite der Sitzfläche. Ein Esszimmerstuhl hat etwa 0,45 m, ein Sessel bis 0,7 m.", en: "Width of the seat. A dining chair is about 0.45 m, an armchair up to 0.7 m." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.35, max: 0.7, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Tiefe der Sitzfläche von vorn nach hinten.", en: "Depth of the seat from front to back." } },
    seatHeight: { type: "number", label: { de: "Sitzhöhe", en: "Seat height" }, min: 0.3, max: 0.8, step: 0.01, default: 0.46, unit: "m",
      describe: { de: "Höhe der Sitzfläche über dem Boden: 0,46 m am Esstisch, 0,75 m an der Bar, 0,3 m für Kinder.", en: "Height of the seat above the floor: 0.46 m at a dining table, 0.75 m at a bar, 0.3 m for children." } },
    back: { type: "choice", label: { de: "Lehne", en: "Back" }, options: ["slats", "solid", "frame", "none"],
      labels: { slats: { de: "Stäbe", en: "Slats" }, solid: { de: "Platte", en: "Panel" }, frame: { de: "Rahmen", en: "Frame" }, none: { de: "keine (Hocker)", en: "none (stool)" } }, default: "slats",
      describe: { de: "Form der Rückenlehne; „keine“ macht einen Hocker.", en: "Shape of the backrest; \"none\" makes a stool." } },
    backHeight: { type: "number", label: { de: "Lehnenhöhe", en: "Back height" }, min: 0.2, max: 0.8, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Höhe der Lehne über der Sitzfläche.", en: "Height of the backrest above the seat." } },
    slats: { type: "integer", label: { de: "Stäbe", en: "Slats" }, min: 2, max: 9, default: 5,
      describe: { de: "Anzahl senkrechter Stäbe, nur bei der Lehne „Stäbe“.", en: "Number of vertical slats, only for the \"slats\" back." } },
    legs: { type: "integer", label: { de: "Beine", en: "Legs" }, min: 3, max: 6, default: 4,
      describe: { de: "Anzahl der Beine, gleichmäßig unter der Sitzfläche verteilt; drei wackeln nie.", en: "Number of legs, spread evenly under the seat; three never wobble." } },
    legShape: { type: "choice", label: { de: "Beinform", en: "Leg shape" }, options: ["round", "square"], labels: { round: { de: "rund", en: "round" }, square: { de: "eckig", en: "square" } }, default: "round",
      describe: { de: "Querschnitt der Beine und Lehnenpfosten.", en: "Cross-section of the legs and back posts." } },
    legThickness: { type: "number", label: { de: "Beinstärke", en: "Leg thickness" }, min: 0.015, max: 0.06, step: 0.005, default: 0.035, unit: "m",
      describe: { de: "Durchmesser der Beine: 0,02 m wirkt filigran, 0,05 m rustikal.", en: "Diameter of the legs: 0.02 m looks delicate, 0.05 m rustic." } },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["wood", "metal", "paint"], labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" }, paint: { de: "lackiert", en: "Painted" } }, default: "wood",
      describe: { de: "Oberfläche: Holz mit Maserung, Metall oder lackiert.", en: "Surface: wood with grain, metal or painted." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a5a3c",
      describe: { de: "Grundfarbe des Materials.", en: "Base colour of the material." } },
  },
  presets: {
    "bar-stool": { label: { de: "Barhocker", en: "Bar stool" }, values: { seatHeight: 0.75, back: "none", legThickness: 0.03, material: "metal", color: "#4a4f57" } },
    "milking-stool": { label: { de: "Melkschemel", en: "Milking stool" }, values: { width: 0.35, depth: 0.35, seatHeight: 0.3, back: "none", legs: 3, color: "#9a6b45" } },
    "kitchen-chair": { label: { de: "Küchenstuhl", en: "Kitchen chair" }, values: { back: "frame", legShape: "square", material: "paint", color: "#e7e2d8" } },
  },
  physics: { body: "dynamic", collider: "hull" },
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
