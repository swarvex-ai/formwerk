import { BufferGeometry, Quaternion, Vector3 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded } from "../shapes";

/**
 * A closed, lofted wall slab for a trough whose walls lean outward: at the height y the wall runs along its long
 * axis from -s(y) to +s(y) and across its thickness from the outer face u(y) to the inner face i(y). All six faces
 * are plane quads (trapezes), so the wall is a closed solid and its inside shows when the lid is open.
 */
function wand(y0: number, y1: number, s: (y: number) => number, u: (y: number) => number, i: (y: number) => number, achse: "x" | "z"): BufferGeometry {
  const mitt = (y0 + y1) / 2;
  // The side the outer face looks to: away from the inner face, along the cross axis
  const quer = Math.sign(u(mitt) - i(mitt));
  const raus = (k: number) => (achse === "x" ? new Vector3(0, 0, k) : new Vector3(k, 0, 0));
  const punkt = (y: number, a: number, v: number) => {
    const q = u(y) + (i(y) - u(y)) * v;
    return achse === "x" ? new Vector3(a * s(y), y, q) : new Vector3(q, y, a * s(y));
  };
  const hoeh = (vv: number) => y0 + (y1 - y0) * vv;
  return mergeGeometries([
    grid(1, 1, (uu, vv) => punkt(hoeh(vv), 2 * uu - 1, 0), () => raus(quer)),
    grid(1, 1, (uu, vv) => punkt(hoeh(vv), 2 * uu - 1, 1), () => raus(-quer)),
    grid(1, 1, (uu, vv) => punkt(y1, 2 * uu - 1, vv), () => new Vector3(0, 1, 0)),
    grid(1, 1, (uu, vv) => punkt(y0, 2 * uu - 1, vv), () => new Vector3(0, -1, 0)),
    grid(1, 1, (uu, vv) => punkt(hoeh(vv), 1, uu), () => (achse === "x" ? new Vector3(1, 0, 0) : new Vector3(0, 0, 1))),
    grid(1, 1, (uu, vv) => punkt(hoeh(vv), -1, uu), () => (achse === "x" ? new Vector3(-1, 0, 0) : new Vector3(0, 0, -1))),
  ])!;
}

export const doughTrough = defineAsset({
  id: "dough-trough", category: "props",
  title: { de: "Backtrog", en: "Dough trough" },
  description: { de: "Ein langer Backtrog der Bäcker auf vier Beinen: die vier Wandbretter lehnen nach außen, der Brettdeckel hängt hinten und dient geschlossen als Arbeitsfläche; der Deckel klappt auf (bewegliches Teil „lid“).", en: "A baker's long dough trough on four legs: the four wall boards lean outward, the board lid hangs at the back and serves as a work top when closed; the lid opens (movable part \"lid\")." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 0.8, max: 1.8, step: 0.05, default: 1.2, unit: "m",
      describe: { de: "Länge des Trogs am oberen Rand entlang x: 0,9 m in der Bauernküche, 1,2 m in der Dorfbäckerei, 1,7 m in einer großen Bäckerei.", en: "Length of the trough at the top rim along x: 0.9 m in a farm kitchen, 1.2 m in a village bakery, 1.7 m in a large bakery." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.4, max: 0.8, step: 0.02, default: 0.56, unit: "m",
      describe: { de: "Breite am oberen Rand, vorn nach hinten: 0,45 m ein schmaler Trog, 0,56 m üblich, 0,8 m für große Teige.", en: "Width at the top rim, front to back: 0.45 m a narrow trough, 0.56 m usual, 0.8 m for large doughs." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.65, max: 0.95, step: 0.05, default: 0.8, unit: "m",
      describe: { de: "Höhe des Randes über dem Boden, die Arbeitshöhe: 0,65 m für kurze Bäcker, 0,8 m üblich, 0,95 m für lange.", en: "Height of the rim above the floor, the working height: 0.65 m for short bakers, 0.8 m usual, 0.95 m for tall ones." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.2, max: 0.4, step: 0.02, default: 0.28, unit: "m",
      describe: { de: "Tiefe des Kastens vom Rand bis zu seinem Boden: 0,2 m flach, 0,28 m üblich, 0,4 m für große Teigmengen.", en: "Depth of the box from the rim down to its bottom: 0.2 m shallow, 0.28 m usual, 0.4 m for large amounts of dough." } },
    flare: { type: "number", label: { de: "Neigung", en: "Flare" }, min: 0, max: 25, step: 1, default: 12, unit: "°",
      describe: { de: "Wie weit die vier Wände vom Lot nach außen lehnen: 0 ein gerader Kasten, 12 ein üblicher Trog, 25 eine weite Wannenform; wird begrenzt, damit der Boden mindestens 0,12 m breit bleibt.", en: "How far the four walls lean outward from vertical: 0 a straight box, 12 a usual trough, 25 a wide tub-like trough; limited so the bottom stays at least 0.12 m wide." } },
    legs: { type: "choice", label: { de: "Beine", en: "Legs" }, options: ["splayed", "straight"], labels: { splayed: { de: "Gespreizt", en: "Splayed" }, straight: { de: "Gerade", en: "Straight" } }, default: "splayed",
      describe: { de: "Gespreizt: vier um 8° nach außen geneigte Beine, vorn und hinten je von einer Querleiste entlang der Länge verbunden; Gerade: vier senkrechte Beine mit einer Zarge unter dem Kasten.", en: "Splayed: four legs leaning 8° outward, joined front and back each by a stretcher along the length; Straight: four upright legs with an apron under the box." } },
    wood: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#8a6a48",
      describe: { de: "Farbe des Holzes: #8a6a48 Fichte, #6a4a2e dunkle Eiche.", en: "Colour of the wood: #8a6a48 spruce, #6a4a2e dark oak." } },
  },
  presets: {
    bakery: { label: { de: "Bäckerei", en: "Bakery" }, values: { length: 1.4, depth: 0.3 } },
    "farm-kitchen": { label: { de: "Bauernküche", en: "Farm kitchen" }, values: { length: 0.9, width: 0.48, legs: "straight" } },
    tub: { label: { de: "Wannenform", en: "Tub" }, values: { flare: 22, depth: 0.34 } },
  },
  rig: { lid: { label: { de: "Deckel", en: "Lid" }, type: "rotate", axis: [-1, 0, 0], min: 0, max: 110 } },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 4000, drawCalls: 2 },
  build(p) {
    const L = p.length, W = p.width, H = p.height, D = p.depth, t = 0.03;
    // The bottom sits inset by depth × tan(flare) on every side; clamp so it never falls under 0.12 m wide
    const B = Math.min(D * Math.tan((Math.PI / 180) * p.flare), (W - 0.12) / 2);
    const y0 = H - D; // bottom face of the box, the top ends of the legs
    const halbl = (y: number) => L / 2 - (B * (H - y)) / D, halbw = (y: number) => W / 2 - (B * (H - y)) / D;
    const a0 = halbl(y0), b0 = halbw(y0);
    const holz = material("wood", p.wood, 1, 600, { grain: "part" });
    const t1 = new Parts();
    // The box: two long walls over the full outer length, the end walls between them and biting 8 mm into the long
    // walls, so the corners close without gaps at any flare; the bottom board bites into the walls too
    const ov = 0.008;
    for (const s of [-1, 1]) {
      t1.add(holz, grained(wand(y0, H, halbl, (y) => s * halbw(y), (y) => s * (halbw(y) - t), "x"), "x"));
      t1.add(holz, grained(wand(y0, H, (y) => halbw(y) - t + ov, (y) => s * halbl(y), (y) => s * (halbl(y) - t), "z"), "z"));
    }
    t1.add(holz, grained(rounded(2 * (a0 - t + ov + 0.004), t, 2 * (b0 - t + ov + 0.004), 0.0015, 0, y0 + t / 2, 0, 1), "x"));

    // Four legs under the corners (inset 0.05 m), from the floor to the bottom of the box, which at height 0.65 and
    // depth 0.4 leaves them 0.25 m; their foot corners are trimmed to stand on the floor
    const ins = 0.05, lw = 0.06, sp = y0 * Math.tan((Math.PI / 180) * 8);
    const hoch = new Vector3(0, 1, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const tx = sx * (a0 - ins), tz = sz * (b0 - ins); // at the box bottom, inset from the corner
      const fx = tx + sx * sp, fz = tz + sz * sp; // the foot, splayed outward
      const Richtung = new Vector3(tx - fx, y0 + 0.015, tz - fz).normalize(); // foot to top, 15 mm into the bottom board
      const len = new Vector3(fx - tx, y0 + 0.015, fz - tz).length();
      const g = rounded(lw, len, lw, 0.002, 0, 0, 0, 1).applyQuaternion(new Quaternion().setFromUnitVectors(hoch, Richtung));
      g.translate((tx + fx) / 2, (y0 + 0.015) / 2, (tz + fz) / 2);
      g.computeBoundingBox();
      g.translate(0, -g.boundingBox!.min.y, 0); // feet on the floor, the top stays inside the bottom board
      t1.add(holz, grained(g, "y"));
    }
    if (p.legs === "splayed") {
      // One stretcher along x on each side, low between the splayed legs, reaching into them at both ends
      const hy = y0 * 0.42, spH = sp * (1 - 0.42);
      for (const sz of [-1, 1]) {
        const zc = sz * (b0 - ins + spH);
        t1.add(holz, grained(rounded(2 * (a0 - ins + spH) + 0.1, 0.05, 0.045, 0.002, 0, hy, zc, 1), "x"));
      }
    } else {
      // An apron of boards under the box, along the length and across the ends, tenoned into the upright legs
      for (const sz of [-1, 1]) t1.add(holz, grained(rounded(2 * (a0 - ins) + 0.04, 0.09, 0.024, 0.0015, 0, y0 - 0.042, sz * (b0 - ins), 1), "x"));
      for (const sx of [-1, 1]) t1.add(holz, grained(rounded(0.024, 0.09, 2 * (b0 - ins) + 0.04, 0.0015, sx * (a0 - ins), y0 - 0.042, 0, 1), "z"));
    }

    // The lid turns about its back edge on the rim; its parts are built where they sit when closed: boards across
    // the rim with two battens underneath that drop just inside the opening, overhanging the rim by 0.02 m
    const deckel = t1.moving("lid", 0, H, -W / 2);
    const ue = 0.02, lt = 0.03, fuge = 0.003, LD = W + 2 * ue, LW = L + 2 * ue;
    const n = Math.min(3, Math.max(2, Math.round(LD / 0.22)));
    for (let k = 0; k < n; k++) {
      const z0 = -LD / 2 + (LD * k) / n + (k ? fuge / 2 : 0), z1 = -LD / 2 + (LD * (k + 1)) / n - (k < n - 1 ? fuge / 2 : 0);
      deckel.add(holz, grained(rounded(LW, lt, z1 - z0, 0.002, 0, H + 0.002 + lt / 2, (z0 + z1) / 2, 1), "x"));
    }
    for (const sx of [-1, 1]) deckel.add(holz, grained(rounded(0.09, 0.018, W - 0.1, 0.0015, sx * (L / 2 - 0.11), H - 0.005, 0, 1), "z"));
    return t1.group();
  },
});
