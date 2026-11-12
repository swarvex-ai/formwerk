import { CylinderGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const table = defineAsset({
  id: "table", category: "furniture",
  title: { de: "Tisch", en: "Table" },
  description: { de: "Tisch mit eckiger, runder oder ovaler Platte und Beinen, Bock oder Säule, auf Wunsch mit Schublade.", en: "A table with a rectangular, round or oval top and legs, trestles or a pedestal, optionally with a drawer." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.5, max: 3, step: 0.01, default: 1.4, unit: "m",
      describe: { de: "Länge der Platte, bei runder Platte der Durchmesser. Vier Personen brauchen etwa 1,2 m.", en: "Length of the top, the diameter for a round top. Four people need about 1.2 m." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.4, max: 1.6, step: 0.01, default: 0.8, unit: "m",
      describe: { de: "Tiefe der Platte (bei runder Platte ohne Wirkung).", en: "Depth of the top (no effect on a round top)." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.35, max: 1.1, step: 0.01, default: 0.75, unit: "m",
      describe: { de: "Höhe bis Oberkante Platte: Esstisch 0,75 m, Couchtisch 0,4 m, Stehtisch 1,1 m.", en: "Height to the top surface: 0.75 m for dining, 0.4 m for a coffee table, 1.1 m for a standing table." } },
    top: { type: "choice", label: { de: "Platte", en: "Top" }, options: ["rect", "round", "oval"], labels: { rect: { de: "eckig", en: "rectangular" }, round: { de: "rund", en: "round" }, oval: { de: "oval", en: "oval" } }, default: "rect",
      describe: { de: "Form der Tischplatte.", en: "Shape of the top." } },
    thickness: { type: "number", label: { de: "Plattenstärke", en: "Top thickness" }, min: 0.015, max: 0.1, step: 0.005, default: 0.04, unit: "m",
      describe: { de: "Stärke der Platte: 0,02 m modern, 0,06 m massiv.", en: "Thickness of the top: 0.02 m looks modern, 0.06 m solid." } },
    base: { type: "choice", label: { de: "Gestell", en: "Base" }, options: ["legs", "trestle", "pedestal"], labels: { legs: { de: "vier Beine", en: "four legs" }, trestle: { de: "Böcke", en: "trestles" }, pedestal: { de: "Säule", en: "pedestal" } }, default: "legs",
      describe: { de: "Unterbau: vier Beine, zwei Böcke mit Querstrebe oder eine Mittelsäule.", en: "Support: four legs, two trestles with a stretcher, or a central pedestal." } },
    inset: { type: "number", label: { de: "Einzug der Beine", en: "Leg inset" }, min: 0.02, max: 0.3, step: 0.01, default: 0.06, unit: "m",
      describe: { de: "Abstand der Beine oder Böcke von der Plattenkante.", en: "Distance of the legs or trestles from the edge of the top." } },
    drawer: { type: "boolean", label: { de: "Schublade", en: "Drawer" }, default: false,
      describe: { de: "Schublade unter der Platte, die sich nach vorn herausziehen lässt (bewegliches Teil „drawer“).", en: "A drawer under the top that slides out to the front (movable part \"drawer\")." } },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["wood", "metal", "paint", "stone"], labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" }, paint: { de: "lackiert", en: "Painted" }, stone: { de: "Stein", en: "Stone" } }, default: "wood",
      describe: { de: "Oberfläche von Platte und Gestell.", en: "Surface of the top and the base." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#a0703f",
      describe: { de: "Grundfarbe des Materials.", en: "Base colour of the material." } },
  },
  presets: {
    "coffee-table": { label: { de: "Couchtisch", en: "Coffee table" }, values: { width: 1.1, depth: 0.6, height: 0.42 } },
    bistro: { label: { de: "Bistrotisch", en: "Bistro table" }, values: { top: "round", width: 0.7, base: "pedestal", material: "metal", color: "#3d4248" } },
    "trestle-table": { label: { de: "Bocktisch", en: "Trestle table" }, values: { width: 2, height: 0.9, thickness: 0.06, base: "trestle", drawer: true, color: "#b98b55" } },
  },
  rig: { drawer: { label: { de: "Schublade", en: "Drawer" }, type: "slide", axis: [0, 0, 1], min: 0, max: 0.5 } },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 3000, drawCalls: 2 },
  build(p) {
    const m = material(p.material, p.color);
    const t = new Parts();
    const w = p.width, d = p.top === "round" ? p.width : p.depth, ht = p.height - p.thickness;
    if (p.top === "rect") t.box(m, w, p.thickness, d, 0, p.height - p.thickness / 2, 0);
    else {
      const g = new CylinderGeometry(w / 2, w / 2, p.thickness, 48);
      g.scale(1, 1, d / w);
      g.translate(0, p.height - p.thickness / 2, 0);
      t.add(m, g);
    }
    const ix = w / 2 - p.inset, iz = d / 2 - p.inset, rund = p.top !== "rect" ? Math.SQRT1_2 : 1;
    if (p.base === "legs") {
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) t.post(m, 0.03, ht, sx * Math.max(0.05, ix * rund), 0, sz * Math.max(0.05, iz * rund), 10, p.material !== "metal");
    } else if (p.base === "trestle") {
      for (const sx of [1, -1]) {
        const x = sx * Math.max(0.1, ix * rund);
        t.box(m, 0.05, ht, 0.05, x, ht / 2, 0).box(m, 0.06, 0.05, Math.max(0.2, d * 0.8), x, 0.025, 0).box(m, 0.06, 0.05, Math.max(0.2, d * 0.8), x, ht - 0.025, 0);
      }
      t.box(m, Math.max(0.1, 2 * ix * rund), 0.05, 0.04, 0, ht * 0.35, 0);
    } else {
      t.post(m, 0.06, ht, 0, 0, 0, 16);
      const fuss = new CylinderGeometry(Math.min(w, d) * 0.3, Math.min(w, d) * 0.33, 0.04, 32);
      fuss.translate(0, 0.02, 0);
      t.add(m, fuss);
    }
    if (p.drawer) {
      // Schublade vorn unter der Platte, zwischen den Beinen; vor der Säule endet sie
      const front = (p.top === "rect" ? d / 2 : d / 2 * 0.8) - 0.02;
      const breite = Math.min(0.6, w * 0.4), hoch = Math.min(0.12, ht * 0.25), y = ht - 0.005 - hoch / 2, s = 0.015;
      const tief = p.base === "pedestal" ? Math.max(0.08, Math.min(d * 0.6, front - 0.08)) : d * 0.6;
      const s1 = t.moving("drawer", 0, y, front, { max: Math.round(tief * 0.75 * 100) / 100 });
      s1.box(m, breite + 0.02, hoch, 0.02, 0, y, front - 0.01);
      s1.box(m, breite - 0.01, s, tief - 0.02, 0, y - hoch / 2 + s / 2 + 0.005, front - tief / 2 - 0.01);
      for (const sx of [-1, 1]) s1.box(m, s, hoch - 0.02, tief - 0.02, sx * (breite / 2 - s / 2 - 0.005), y - 0.005, front - tief / 2 - 0.01);
      s1.box(m, breite - 0.01, hoch - 0.02, s, 0, y - 0.005, front - tief + s / 2);
    }
    return t.group();
  },
});
