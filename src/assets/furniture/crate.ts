import { Color, CylinderGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded } from "../shapes";

export const crate = defineAsset({
  id: "crate", category: "furniture",
  title: { de: "Kiste", en: "Crate" },
  description: { de: "Lattenkiste mit Eckpfosten, wählbarer Lattenzahl und aufklappbarem Deckel.", en: "A slatted crate with corner posts, a choice of slats and a hinged lid." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.2, max: 1.6, step: 0.01, default: 0.6, unit: "m",
      describe: { de: "Außenbreite von links nach rechts.", en: "Outer width from left to right." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.15, max: 1.2, step: 0.01, default: 0.4, unit: "m",
      describe: { de: "Außenhöhe ohne Deckel.", en: "Outer height without the lid." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.2, max: 1.6, step: 0.01, default: 0.4, unit: "m",
      describe: { de: "Außentiefe von vorn nach hinten.", en: "Outer depth from front to back." } },
    slats: { type: "integer", label: { de: "Latten je Seite", en: "Slats per side" }, min: 2, max: 8, default: 4,
      describe: { de: "Latten je Seitenwand übereinander; zugleich die Zahl der Deckelbretter.", en: "Slats stacked in each side wall; also the number of lid boards." } },
    gap: { type: "number", label: { de: "Spalt", en: "Gap" }, min: 0, max: 0.04, step: 0.002, default: 0.012, unit: "m",
      describe: { de: "Spalt zwischen den Latten; 0 ergibt geschlossene Wände.", en: "Gap between the slats; 0 makes closed walls." } },
    lid: { type: "boolean", label: { de: "Deckel", en: "Lid" }, default: false,
      describe: { de: "Deckel, an der Hinterkante angeschlagen und aufklappbar (bewegliches Teil „lid“).", en: "A lid hinged at the back edge that opens (movable part \"lid\")." } },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["wood", "plastic", "metal"], labels: { wood: { de: "Holz", en: "Wood" }, plastic: { de: "Kunststoff", en: "Plastic" }, metal: { de: "Metall", en: "Metal" } }, default: "wood",
      describe: { de: "Holz mit Maserung, Kunststoff oder Metall.", en: "Wood with grain, plastic or metal." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#b08050",
      describe: { de: "Grundfarbe des Materials.", en: "Base colour of the material." } },
  },
  presets: {
    "fruit-crate": { label: { de: "Obstkiste", en: "Fruit crate" }, values: { width: 0.5, height: 0.3, depth: 0.35, slats: 3, gap: 0.02 } },
    "shipping-crate": { label: { de: "Transportkiste", en: "Shipping crate" }, values: { width: 1.2, height: 0.8, depth: 0.8, slats: 6, gap: 0.004, lid: true, color: "#a87c4f" } },
    "storage-bin": { label: { de: "Lagerbox", en: "Storage bin" }, values: { slats: 3, gap: 0, lid: true, material: "plastic", color: "#3b6ea5" } },
  },
  rig: { lid: { label: { de: "Deckel", en: "Lid" }, type: "rotate", axis: [-1, 0, 0], min: 0, max: 110 } },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 7500, drawCalls: 4 },
  build(p) {
    const holz = p.material === "wood";
    // Two tones of the same wood, boards alternate: real crates are nailed together from boards of different trees
    const ton = (k: number) => { const c = new Color(p.color); c.multiplyScalar(k); return `#${c.getHexString()}`; };
    const a = material(p.material, p.color, 1, undefined, { grain: "level" }), b = holz ? material(p.material, ton(0.86), 1, undefined, { grain: "level" }) : a;
    const nagel = material("iron", "#3a3a3a", 4);
    const t = new Parts();
    const w = p.width, h = p.height, d = p.depth, s = 0.015, pf = 0.035, r = 0.003;
    const bx = w / 2 - s - pf / 2, bz = d / 2 - s - pf / 2;
    // Battens inside the corners; the slats are nailed to their outer faces
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(a, rounded(pf, h, pf, r, sx * bx, h / 2, sz * bz, 1));
    t.add(a, rounded(w - 2 * s - 0.004, s, d - 2 * s - 0.004, r, 0, s / 2, 0, 1));
    const lh = Math.max(0.01, (h - p.gap * (p.slats - 1)) / p.slats);
    const kopf = (x: number, y: number, z: number, achse: "x" | "z") => {
      const g = new CylinderGeometry(0.004, 0.004, 0.003, 8);
      t.add(nagel, (achse === "z" ? g.rotateX(Math.PI / 2) : g.rotateZ(Math.PI / 2)).translate(x, y, z));
    };
    for (let i = 0; i < p.slats; i++) {
      const y = lh / 2 + i * (lh + p.gap);
      for (const sz of [-1, 1]) {
        t.add((i + (sz > 0 ? 1 : 0)) % 2 ? b : a, rounded(w, lh, s, r, 0, y, sz * (d / 2 - s / 2), 1));
        if (holz) for (const sx of [-1, 1]) kopf(sx * bx, y, sz * (d / 2 + 0.0005), "z");
      }
      for (const sx of [-1, 1]) {
        t.add((i + (sx > 0 ? 0 : 1)) % 2 ? a : b, rounded(s, lh, d - 2 * s, r, sx * (w / 2 - s / 2), y, 0, 1));
        if (holz) for (const sz of [-1, 1]) kopf(sx * (w / 2 + 0.0005), y, sz * bz, "x");
      }
    }
    if (p.lid) {
      // Scharnier an der hinteren Oberkante; die Bretter laufen quer, zusammengehalten von zwei Leisten
      const deckel = t.moving("lid", 0, h, -d / 2);
      const n = p.slats, bb = Math.max(0.01, (d - p.gap * (n - 1)) / n);
      for (let i = 0; i < n; i++) deckel.add(a, rounded(w, s, bb, r, 0, h + s / 2, -d / 2 + bb / 2 + i * (bb + p.gap), 1));
      for (const sx of [-1, 1]) deckel.add(a, rounded(0.04, s, d - 0.02, r, sx * (w / 2 - pf - 0.03), h + s * 1.5, 0, 1));
    }
    return t.group();
  },
});
