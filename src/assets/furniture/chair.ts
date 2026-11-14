import { BoxGeometry, CylinderGeometry, Matrix4, type BufferGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

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
  budget: { triangles: 20000, drawCalls: 1 },
  build(p) {
    // One material: wood grain runs upright on legs and slats and along the seat by itself ("auto")
    const m = material(p.material, p.color);
    const t = new Parts();
    const dicke = 0.03, r = p.legThickness / 2, w = p.width, d = p.depth, sh = p.seatHeight, eckig = p.legShape === "square";
    // Seat with rounded edges, slightly overhanging the legs
    t.add(m, rounded(w, dicke, d, 0.009, 0, sh - dicke / 2, 0, 3));
    // Legs on a circle mapped onto the seat (corners for four legs)
    const fuesse: [number, number][] = [];
    for (let i = 0; i < p.legs; i++) {
      const a = (i / p.legs) * Math.PI * 2 + Math.PI / p.legs;
      const k = Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
      fuesse.push([(Math.cos(a) / k) * (w / 2 - r - 0.012), (Math.sin(a) / k) * (d / 2 - r - 0.012)]);
    }
    const bein = (x: number, z: number, y0: number, h: number, rr: number) => {
      if (eckig) { t.add(m, rounded(rr * 2, h, rr * 2, Math.min(0.004, rr * 0.3), x, y0 + h / 2, z, 2)); return; }
      // Turned: a slim foot, a taper up to a bead below the apron, a straight block where the apron joins
      t.add(m, turned([[0.001, 0], [rr * 0.72, 0], [rr * 0.78, h * 0.02], [rr * 0.74, h * 0.05], [rr * 0.82, h * 0.45], [rr * 0.95, h * 0.68],
        [rr * 1.12, h * 0.71], [rr * 1.12, h * 0.735], [rr * 0.92, h * 0.765], [rr, h * 0.8], [rr, h], [0.001, h]], 16, x, y0, z));
    };
    for (const [x, z] of fuesse) bein(x, z, 0, sh - dicke, r);
    // Apron under the seat and stretchers low between the legs, along the edges of the leg polygon
    const zarge = Math.min(0.065, (sh - dicke) * 0.22), quer = Math.min(0.16, sh * 0.32), rs = Math.max(0.006, r * 0.42);
    for (let i = 0; i < p.legs; i++) {
      const [x0, z0] = fuesse[i], [x1, z1] = fuesse[(i + 1) % p.legs];
      const laenge = Math.hypot(x1 - x0, z1 - z0) - 2 * r * 0.9, winkel = -Math.atan2(z1 - z0, x1 - x0);
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      // Apron board, set in a little from the leg centres towards the inside
      const innen = Math.hypot(mx, mz) || 1, ein = Math.min(0.006, r * 0.3);
      t.add(m, rounded(laenge, zarge, Math.max(0.016, r * 0.6), 0.003).rotateY(winkel).translate(mx - (mx / innen) * ein, sh - dicke - zarge / 2, mz - (mz / innen) * ein));
      if (sh > 0.32) t.add(m, new CylinderGeometry(rs, rs, laenge, 12).rotateZ(Math.PI / 2).rotateY(winkel).translate(mx, quer, mz));
    }
    if (p.back !== "none") {
      // The back leans 6° and its rails curve 2 cm backwards: built upright, then turned about the back edge of the seat
      const y0 = sh, h = p.backHeight, zb = -d / 2 + Math.max(r, 0.015) + 0.002, bogen = Math.min(0.02, w * 0.04);
      const lehne: BufferGeometry[] = [];
      const gebogen = (bw: number, bh: number, bt: number, x: number, y: number) => {
        const g = new BoxGeometry(bw, bh, bt, 16, 1, 1), pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) { const u = (pos.getX(i) + x) / (w / 2); pos.setZ(i, pos.getZ(i) - bogen * (1 - u * u)); }
        g.translate(x, y, 0);
        g.computeVertexNormals();
        return g;
      };
      const px = w / 2 - Math.max(r, 0.015) - 0.012, pr = Math.max(r * 0.85, 0.013);
      if (p.back === "solid") lehne.push(gebogen(w - 0.02, h - 0.01, 0.022, 0, h / 2));
      else {
        for (const sx of [-1, 1]) lehne.push(eckig ? rounded(pr * 2, h, pr * 2, 0.004, sx * px, h / 2, 0) : turned([[0.001, 0], [pr, 0], [pr * 0.9, h * 0.5], [pr, h * 0.92], [pr * 1.15, h * 0.96], [pr * 0.6, h], [0.001, h]], 14, sx * px, 0, 0));
        lehne.push(gebogen(2 * px, 0.06, 0.024, 0, h - 0.045));
        if (p.back === "frame") lehne.push(gebogen(2 * px, 0.04, 0.02, 0, h * 0.42));
        if (p.back === "slats") for (let i = 0; i < p.slats; i++) {
          const x = p.slats === 1 ? 0 : -px + 0.05 + (i * (2 * px - 0.1)) / Math.max(1, p.slats - 1);
          const u = x / (w / 2), b = Math.min(0.032, ((2 * px - 0.08) / p.slats) * 0.6);
          lehne.push(rounded(b, h - 0.08, 0.016, 0.004, x, (h - 0.08) / 2 + 0.005, -bogen * (1 - u * u)));
        }
      }
      const kipp = new Matrix4().makeTranslation(0, y0, zb).multiply(new Matrix4().makeRotationX(-0.1));
      for (const g of lehne) t.add(m, g.applyMatrix4(kipp));
    }
    return t.group();
  },
});
