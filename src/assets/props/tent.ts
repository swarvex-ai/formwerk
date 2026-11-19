import { BufferGeometry, DoubleSide, Vector3 } from "three";
import { material } from "../../materials";
import { grid, turned } from "../shapes";
import { defineAsset, Parts } from "../define";

type V = [number, number, number];

/**
 * A cloth panel between the bottom corners a, b and the top corners c (above b) and d (above a; d = c: a triangle up
 * to an apex), 10 × 10 steps, sagging towards `inside` in its middle by 0.015 × its shorter side; every edge stays
 * on the straight line between its corners.
 */
function bahn(a: V, b: V, c: V, d: V, inside: Vector3): BufferGeometry {
  const [A, B, C, D] = [a, b, c, d].map((v) => new Vector3(...v));
  const kurz = Math.min(Math.max(A.distanceTo(B), D.distanceTo(C)), Math.max(A.distanceTo(D), B.distanceTo(C)));
  const mitte = A.clone().add(B).add(C).add(D).multiplyScalar(0.25);
  const n = B.clone().sub(A).cross(C.clone().add(D).multiplyScalar(0.5).sub(mitte)).normalize();
  if (n.dot(inside.clone().sub(mitte)) < 0) n.negate();
  const sag = 0.015 * kurz;
  return grid(10, 10, (u, v) => A.clone().lerp(B, u).lerp(D.clone().lerp(C, u), v).addScaledVector(n, sag * Math.sin(Math.PI * u) * Math.sin(Math.PI * v)),
    (q) => q.clone().sub(inside));
}

export const tent = defineAsset({
  id: "tent", category: "props",
  title: { de: "Zelt", en: "Tent" },
  description: { de: "Ein Campingzelt als Firstzelt oder Pyramide mit Eingangsklappe vorn (bewegliches Teil „flap“) und optionalen Holzstangen, für Lager, Expeditionen und Märkte.", en: "A camping tent as a ridge tent or a pyramid, with an entrance flap at the front (movable part \"flap\") and optional wooden poles, for camps, expeditions and markets." },
  params: {
    shape: { type: "choice", label: { de: "Form", en: "Shape" }, options: ["ridge", "pyramid"], labels: { ridge: { de: "First", en: "Ridge" }, pyramid: { de: "Pyramide", en: "Pyramid" } }, default: "ridge",
      describe: { de: "Firstzelt (Giebel mit waagrechtem First) oder Pyramide (vier Seiten zu einer Spitze).", en: "Ridge tent (A-frame with a horizontal ridge) or pyramid (four sides to one point)." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 1.2, max: 4, step: 0.05, default: 2, unit: "m",
      describe: { de: "Breite am Eingang: 1,6 m ein Zweimannzelt, 2 m üblich, 3,5 m ein Pavillon.", en: "Width across the entrance: 1.6 m a two-person tent, 2 m usual, 3.5 m a pavilion." } },
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 1.5, max: 5, step: 0.05, default: 2.4, unit: "m",
      describe: { de: "Länge von vorn nach hinten: 2,4 m üblich, 3,8 m ein Expeditionszelt; bei der Pyramide ohne Wirkung (sie nutzt die Breite).", en: "Length from front to back: 2.4 m usual, 3.8 m an expedition tent; no effect on the pyramid (it uses the width)." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1, max: 3, step: 0.05, default: 1.5, unit: "m",
      describe: { de: "Höhe bis zum First oder zur Spitze: 1,4 m niedrig, 1,5 m üblich, 2,8 m ein Pavillon.", en: "Height to the ridge or the top: 1.4 m low, 1.5 m usual, 2.8 m a pavilion." } },
    poles: { type: "boolean", label: { de: "Stangen", en: "Poles" }, default: true,
      describe: { de: "Zwei Holzstangen (bei der Pyramide eine), die 0,1 m über First oder Spitze ragen.", en: "Two wooden poles (one on the pyramid) sticking 0.1 m out above the ridge or the top." } },
    color: { type: "color", label: { de: "Stoff", en: "Cloth" }, default: "#b9a57a",
      describe: { de: "Farbe des Zeltstoffs: Sand #b9a57a, Leinen #e8e2d0, Oliv #7d8b4e.", en: "Colour of the cloth: sand #b9a57a, linen #e8e2d0, olive #7d8b4e." } },
  },
  presets: {
    scout: { label: { de: "Pfadfinder", en: "Scout" }, values: { shape: "ridge" } },
    pavilion: { label: { de: "Pavillon", en: "Pavilion" }, values: { shape: "pyramid", width: 3.5, height: 2.8, color: "#e8e2d0" } },
    expedition: { label: { de: "Expedition", en: "Expedition" }, values: { width: 2.6, length: 3.8, height: 1.4, color: "#7d8b4e" } },
  },
  rig: { flap: { label: { de: "Eingangsklappe", en: "Entrance flap" }, type: "rotate", axis: [-1, 0, 0], min: 0, max: 110 } },
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 1500, drawCalls: 3 },
  build(p) {
    const cloth = material("paint", p.color, 1, 40), wood = material("wood", "#8a6440"), t = new Parts();
    cloth.side = DoubleSide;
    const h = p.height, hw = p.width / 2, pyramid = p.shape === "pyramid", hl = pyramid ? hw : p.length / 2, k = 0.9;
    const inside = new Vector3(0, h * 0.3, 0);
    // Walls: the front is open; the rest is cloth down to the floor
    const walls: V[][] = pyramid
      ? [[[hw, 0, -hl], [-hw, 0, -hl], [0, h, 0]], [[-hw, 0, hl], [-hw, 0, -hl], [0, h, 0]], [[hw, 0, -hl], [hw, 0, hl], [0, h, 0]]]
      : [[[-hw, 0, hl], [-hw, 0, -hl], [0, h, -hl], [0, h, hl]], [[hw, 0, -hl], [hw, 0, hl], [0, h, hl], [0, h, -hl]], [[hw, 0, -hl], [-hw, 0, -hl], [0, h, -hl]]];
    for (const [a, b, c, d] of walls) t.add(cloth, bahn(a, b, c, d ?? c, inside));
    // Front: the flap covers the entrance below the hinge, a small triangle of cloth closes the top
    const zf = (y: number) => (pyramid ? hl * (1 - y / h) : hl), xf = (y: number) => hw * (1 - y / h), hy = h * k;
    const top: V = [0, h, pyramid ? 0 : hl];
    t.add(cloth, bahn([xf(hy), hy, zf(hy)], [-xf(hy), hy, zf(hy)], top, top, inside));
    const flap = bahn([hw, 0, hl], [-hw, 0, hl], [-xf(hy), hy, zf(hy)], [xf(hy), hy, zf(hy)], inside);
    // Swing out as far as the lowest point of the cloth stays above the floor (closed, it rests on the floor; turning
    // about -x, a point below the hinge rises and swings out)
    const pos = flap.getAttribute("position");
    let max = 110;
    for (let a = 1; a <= 110; a++) {
      const r = (a * Math.PI) / 180;
      let tief = Infinity;
      for (let i = 0; i < pos.count; i++) tief = Math.min(tief, hy + (pos.getY(i) - hy) * Math.cos(r) + (pos.getZ(i) - zf(hy)) * Math.sin(r));
      if (tief < 0) { max = Math.max(0, a - 1); break; }
    }
    t.moving("flap", 0, hy, zf(hy), { max }).add(cloth, flap);
    // A seam along the ridge hides the crease; the pyramid gets a cap on its apex
    if (pyramid) t.add(cloth, turned([[0, -0.04], [0.03, -0.04], [0.032, -0.02], [0.022, -0.002], [0.012, 0.008], [0, 0.012]], 12, 0, h, 0));
    else t.add(cloth, turned([[0, 0], [0.012, 0], [0.012, 2 * hl], [0, 2 * hl]], 12).rotateX(Math.PI / 2).translate(0, h, -hl));
    // Poles with a rounded top: a quarter circle of 0.01 m
    const H = h + 0.1, kopf: [number, number][] = [];
    for (let i = 0; i <= 4; i++) { const w = (i * Math.PI) / 8; kopf.push([0.015 + 0.01 * Math.cos(w), H - 0.01 + 0.01 * Math.sin(w)]); }
    if (p.poles) for (const z of pyramid ? [0] : [-hl + 0.02, hl - 0.02]) t.add(wood, turned([[0, 0], [0.025, 0], ...kopf, [0, H]], 12, 0, 0, z));
    return t.group();
  },
});
