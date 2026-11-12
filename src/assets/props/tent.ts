import { BufferGeometry, DoubleSide, Float32BufferAttribute, Vector3 } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

type V = [number, number, number];

/** Cloth faces as hand-built triangles with normals and uv, listed clockwise seen from outside. */
function stoff(faces: V[][]): BufferGeometry {
  const pos: number[] = [], nor: number[] = [], uv: number[] = [];
  for (const f of faces) for (let i = 1; i < f.length - 1; i++) {
    const [a, b, c] = [f[0], f[i], f[i + 1]].map((v) => new Vector3(...v));
    const n = c.clone().sub(a).cross(b.clone().sub(a)).normalize();
    for (const v of [a, c, b]) { pos.push(v.x, v.y, v.z); nor.push(n.x, n.y, n.z); uv.push(v.x + v.z, v.y); }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  return g;
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
  budget: { triangles: 400, drawCalls: 3 },
  build(p) {
    const cloth = material("paint", p.color, 1, 40), wood = material("wood", "#8a6440"), t = new Parts();
    cloth.side = DoubleSide;
    const h = p.height, hw = p.width / 2, pyramid = p.shape === "pyramid", hl = pyramid ? hw : p.length / 2, k = 0.9;
    // Walls: the front is open; the rest is cloth down to the floor
    const faces: V[][] = pyramid
      ? [[[hw, 0, -hl], [-hw, 0, -hl], [0, h, 0]], [[-hw, 0, hl], [-hw, 0, -hl], [0, h, 0]], [[hw, 0, -hl], [hw, 0, hl], [0, h, 0]]]
      : [[[-hw, 0, hl], [-hw, 0, -hl], [0, h, -hl], [0, h, hl]], [[hw, 0, -hl], [hw, 0, hl], [0, h, hl], [0, h, -hl]], [[hw, 0, -hl], [0, h, -hl], [-hw, 0, -hl]]];
    // Front: the flap covers the entrance below the hinge, a small triangle of cloth closes the top
    const zf = (y: number) => (pyramid ? hl * (1 - y / h) : hl), xf = (y: number) => hw * (1 - y / h), hy = h * k;
    faces.push([[xf(hy), hy, zf(hy)], [-xf(hy), hy, zf(hy)], [0, h, pyramid ? 0 : hl]]);
    t.add(cloth, stoff(faces));
    const flap = [[hw, 0, hl], [-hw, 0, hl], [-xf(hy), hy, zf(hy)], [xf(hy), hy, zf(hy)]] as V[];
    // Swing out as far as the lowest corner stays above the floor (the pyramid's flap leans out as it opens)
    let max = 110;
    for (let a = 0; a <= 110; a++) {
      const r = (a * Math.PI) / 180;
      if (flap.some(([, y, z]) => hy + (y - hy) * Math.cos(r) - (z - zf(hy)) * Math.sin(r) < 0.02)) { max = Math.max(0, a - 1); break; }
    }
    t.moving("flap", 0, hy, zf(hy), { max }).add(cloth, stoff([flap]));
    if (p.poles) for (const z of pyramid ? [0] : [-hl + 0.02, hl - 0.02]) t.post(wood, 0.025, h + 0.1, 0, 0, z, 8);
    return t.group();
  },
});
