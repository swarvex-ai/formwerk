import { Color } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, roundBoards, turned } from "../shapes";

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
  budget: { triangles: 7000, drawCalls: 4 },
  build(p) {
    // Legs, trestles and pedestal on one material (grain upright); top and apron boards lie level, two tones alternate
    const m = material(p.material, p.color);
    const wood = p.material === "wood";
    const b1 = wood ? material("wood", p.color, 1, undefined, { grain: "level" }) : m;
    const b2 = wood ? material("wood", `#${new Color(p.color).offsetHSL(0, 0, 0.025).getHexString()}`, 1, undefined, { grain: "level" }) : m;
    const t = new Parts();
    const w = p.width, d = p.top === "round" ? p.width : p.depth, th = p.thickness, ht = p.height - th, r = 0.03, fuge = 0.002;
    // Top: glued boards along x with a fine joint and eased edges
    if (p.top === "rect") {
      const n = Math.max(2, Math.min(10, Math.round(d / 0.14))), bw = (d - (n - 1) * fuge) / n;
      for (let i = 0; i < n; i++) t.add(i % 2 ? b2 : b1, rounded(w, th, bw, Math.min(0.003, th * 0.2), 0, p.height - th / 2, -d / 2 + bw / 2 + i * (bw + fuge)));
    } else {
      const n = Math.max(3, Math.min(9, Math.round(w / 0.14)));
      t.add(b1, roundBoards(w / 2, n, fuge, th, 12).rotateY(Math.PI / 2).scale(1, 1, p.top === "oval" ? p.depth / w : 1).translate(0, p.height, 0));
    }
    const ix = w / 2 - p.inset, iz = d / 2 - p.inset, rund = p.top !== "rect" ? Math.SQRT1_2 : 1;
    const lx = Math.max(0.05, ix * rund), lz = Math.max(0.05, iz * rund);
    const hoch = Math.min(0.12, ht * 0.25), breite = Math.min(0.6, w * 0.4);
    const zh = p.drawer ? hoch + 0.01 : Math.min(0.09, ht * 0.2), ad = 0.02, aussen = r - 0.006;
    if (p.base === "legs") {
      const eckig = p.material === "metal" || p.material === "paint", h = ht - zh - 0.01;
      for (const sx of [1, -1]) for (const sz of [1, -1]) {
        // Square legs have a chamfer, turned ones a taper, a bead and a straight block where the apron joins
        if (eckig) t.add(m, rounded(r * 2, ht, r * 2, 0.004, sx * lx, ht / 2, sz * lz, 2));
        else t.add(m, turned([[0.001, 0], [r * 0.72, 0], [r * 0.78, h * 0.02], [r * 0.74, h * 0.05], [r * 0.82, h * 0.45], [r * 0.95, h * 0.68], [r * 1.12, h * 0.71], [r * 1.12, h * 0.735],
          [r * 0.92, h * 0.765], [r, h * 0.8], [r, ht], [0.001, ht]], 16, sx * lx, 0, sz * lz));
      }
      // Apron boards between the legs, flush with the outside of the legs; the drawer takes part of the front
      const ay = ht - zh / 2, rest = lx - breite / 2 - 0.012;
      for (const s of [-1, 1]) {
        t.add(b1, rounded(ad, zh, 2 * lz, 0.003, s * (lx + aussen - ad / 2), ay, 0));
        if (s < 0 || !p.drawer) t.add(b1, rounded(2 * lx, zh, ad, 0.003, 0, ay, -(lz + aussen - ad / 2)));
        if (p.drawer && rest > 0.01) t.add(b1, rounded(rest, zh, ad, 0.003, s * (lx + breite / 2 + 0.012) / 2, ay, lz + aussen - ad / 2));
      }
      if (!p.drawer) t.add(b1, rounded(2 * lx, zh, ad, 0.003, 0, ay, lz + aussen - ad / 2));
    } else if (p.base === "trestle") {
      const L = Math.max(0.2, d * 0.8);
      for (const sx of [1, -1]) {
        const x = sx * Math.max(0.1, ix * rund);
        t.add(m, rounded(0.05, ht, 0.05, 0.004, x, ht / 2, 0));
        t.add(m, rounded(0.06, 0.05, L, 0.004, x, 0.025, 0));
        t.add(m, rounded(0.06, 0.05, L, 0.004, x, ht - 0.025, 0));
      }
      t.add(m, rounded(Math.max(0.1, 2 * ix * rund), 0.05, 0.04, 0.004, 0, ht * 0.35, 0));
    } else {
      const R = Math.min(w, d) * 0.32, c = 0.06, y1 = Math.min(0.12, ht * 0.4);
      t.add(m, turned([[0.001, 0], [R, 0], [R, 0.022], [R * 0.9, 0.035], [R * 0.45, 0.05], [c * 1.6, y1 * 0.55], [c * 1.2, y1], [c, y1 + 0.03], [c, ht - 0.05], [c * 1.2, ht - 0.03], [c * 1.5, ht - 0.01], [c * 1.5, ht], [0.001, ht]], 32));
    }
    if (p.drawer) {
      // Drawer at the front under the top, between the legs; in front of a pedestal it stops short of the column
      const front = p.base === "legs" ? lz + aussen : (p.top === "rect" ? d / 2 : d / 2 * 0.8) - 0.02;
      const y = ht - 0.005 - hoch / 2, s = 0.015;
      const tief = p.base === "pedestal" ? Math.max(0.08, Math.min(d * 0.6, front - 0.08)) : d * 0.6;
      const s1 = t.moving("drawer", 0, y, front, { max: Math.round(tief * 0.75 * 100) / 100 });
      s1.add(m, rounded(breite + 0.02, hoch, 0.02, 0.003, 0, y, front - 0.01));
      // small turned knob on the front
      s1.add(m, turned([[0.001, 0], [0.005, 0], [0.004, 0.01], [0.012, 0.016], [0.013, 0.022], [0.001, 0.026]], 8).rotateX(Math.PI / 2).translate(0, y, front));
      s1.add(m, rounded(breite - 0.01, s, tief - 0.02, 0.002, 0, y - hoch / 2 + s / 2 + 0.005, front - tief / 2 - 0.01, 1));
      for (const sx of [-1, 1]) s1.add(m, rounded(s, hoch - 0.02, tief - 0.02, 0.002, sx * (breite / 2 - s / 2 - 0.005), y - 0.005, front - tief / 2 - 0.01, 1));
      s1.add(m, rounded(breite - 0.01, hoch - 0.02, s, 0.002, 0, y - 0.005, front - tief + s / 2, 1));
    }
    return t.group();
  },
});
