import { TorusGeometry } from "three";
import { rounded, turned } from "../shapes";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

// The flame core: the flame colour mixed towards white
const aufhellen = (hex: string) => "#" + [1, 3, 5].map((i) => {
  const v = parseInt(hex.slice(i, i + 2), 16);
  return Math.round(v + (255 - v) * 0.6).toString(16).padStart(2, "0");
}).join("");

export const torch = defineAsset({
  id: "torch", category: "props",
  title: { de: "Fackel", en: "Torch" },
  description: { de: "Eine Fackel: Schaft mit breitem Eisen oben und Flamme aus Glühmaterial, stehend auf einem Eisenteller oder am Wandbügel geführt.", en: "A torch: a shaft with a wide iron bowl on top and a flame of glowing material, standing on an iron plate or led by a wall bracket." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.4, max: 2.2, step: 0.05, default: 1.6, unit: "m",
      describe: { de: "Höhe bis zum oberen Rand des Eisens: 0,4 m Handfackel auf dem Tisch, 1,6 m stehende Fackel am Weg, 2,2 m am Burgtor.", en: "Height to the rim of the iron bowl: 0.4 m a hand torch on a table, 1.6 m a standing torch by a path, 2.2 m at a castle gate." } },
    headSize: { type: "number", label: { de: "Eisenteller", en: "Bowl" }, min: 0.08, max: 0.3, step: 0.01, default: 0.16, unit: "m",
      describe: { de: "Durchmesser des Feuereisens: 0,1 m an der schmalen Fackel, 0,16 m üblich, 0,3 m am großen Feuerkorb.", en: "Diameter of the iron bowl: 0.1 m on a slim torch, 0.16 m usual, 0.3 m on a big brazier." } },
    flameHeight: { type: "number", label: { de: "Flammenhöhe", en: "Flame height" }, min: 0, max: 0.5, step: 0.01, default: 0.25, unit: "m",
      describe: { de: "Höhe der Flamme über dem Eisen: 0 aus, 0,15 m kleine ruhige Flamme, 0,4 m helle Flamme wie am Lagerfeuer.", en: "Height of the flame above the bowl: 0 unlit, 0.15 m a small quiet flame, 0.4 m a bright flame like at a campfire." } },
    mount: { type: "choice", label: { de: "Halterung", en: "Mount" }, options: ["standing", "wall-bracket"], labels: { standing: { de: "Stehfuß", en: "Standing foot" }, "wall-bracket": { de: "Wandbügel", en: "Wall bracket" } }, default: "standing",
      describe: { de: "Stehend auf einem Eisenteller am Boden, oder am Wandbügel: dort steht der Schaft auf dem Boden und die flache Rückplatte liegt an der Wand an.", en: "Standing on an iron plate on the floor, or on a wall bracket: there the shaft stands on the floor and the flat back plate leans against the wall." } },
    poleRadius: { type: "number", label: { de: "Schaft", en: "Shaft radius" }, min: 0.015, max: 0.06, step: 0.005, default: 0.03, unit: "m",
      describe: { de: "Radius des Schafts: 0,02 m Handfackel, 0,03 m üblich, 0,05 m schwerer Pfosten.", en: "Radius of the shaft: 0.02 m a hand torch, 0.03 m usual, 0.05 m a heavy pole." } },
    flameColor: { type: "color", label: { de: "Flamme", en: "Flame" }, default: "#ff8c2b",
      describe: { de: "Farbe der Flamme: #ff8c2b Holzfeuer, #ffdf6e heißes Fettfeuer, #4f8cff eine magisch blaue Flamme.", en: "Colour of the flame: #ff8c2b wood fire, #ffdf6e a hot grease fire, #4f8cff a magical blue flame." } },
  },
  presets: {
    "standing-torch": { label: { de: "Stehende Fackel", en: "Standing torch" }, values: { mount: "standing", height: 1.6, flameHeight: 0.25 } },
    "wall-sconce": { label: { de: "Wandleuchter", en: "Wall sconce" }, values: { mount: "wall-bracket", height: 1.5, headSize: 0.12, poleRadius: 0.02, flameHeight: 0.2 } },
    "brazier-stick": { label: { de: "Feuerpfanne", en: "Brazier stick" }, values: { height: 1.9, headSize: 0.28, poleRadius: 0.045, flameHeight: 0.4 } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 2700, drawCalls: 4 },
  build(p) {
    // Forged iron on a small object: the rust in small patches
    const holz = material("wood", "#6b4a2e"), eisen = material("iron", "#40454b", 5, undefined, { rust: 0.25 }), t = new Parts();
    const h = p.height, kopf = p.headSize, r = p.poleRadius, eisenH = 0.14, y0 = h - eisenH;
    // The iron bowl on top, turned and open: a socket around the shaft, the wall flaring to a rolled lip at the rim,
    // then down into an inner wall and a floor 3 cm below the rim
    const sockel = Math.max(r * 1.5, 0.03), lippe = 0.004, rand = kopf - lippe, boden = eisenH - 0.03;
    const aussen = (y: number) => y <= 0.025 ? sockel : sockel + (rand - sockel) * Math.min(1, (y - 0.025) / (eisenH - lippe - 0.025));
    const innen = Math.min(aussen(boden) - 0.006, kopf - 2 * lippe);
    const roll: [number, number][] = [];
    for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + (Math.PI * 3 / 2) * (i / 8); roll.push([rand + lippe * Math.cos(a), eisenH - lippe + lippe * Math.sin(a)]); }
    t.add(eisen, turned([[0.001, 0], [sockel - 0.003, 0], [sockel, 0.004], [sockel, 0.025], ...roll, [kopf - 2 * lippe, eisenH - 0.008], [innen, boden], [0, boden]], 24, 0, y0, 0));
    // The wooden shaft, a little thicker at the foot, rounded below; 1 cm deep in the bowl socket and in the foot socket
    const unten = p.mount === "standing" ? 0.04 : 0, lang = y0 + 0.01 - unten, rf = r * 1.15;
    const schaft = (y: number) => rf + (r - rf) * (y / lang);
    t.add(holz, turned([[0.001, 0], [rf * 0.6, 0.002], [rf * 0.9, 0.006], [schaft(0.014), 0.014], [r, lang], [0.001, lang]], 16, 0, unten, 0));
    if (p.mount === "standing") {
      // Iron foot on the floor: a plate with a chamfered edge and a socket collar 4 cm tall, open at the top
      const fuss = Math.max(0.11, kopf * 0.8), loch = rf + 0.002, kragen = loch + 0.006;
      t.add(eisen, turned([[0.001, 0], [fuss - 0.002, 0], [fuss, 0.003], [fuss, 0.005], [fuss - 0.006, 0.01], [kragen + 0.006, 0.01], [kragen, 0.016],
        [kragen, 0.046], [kragen - 0.002, 0.05], [loch + 0.001, 0.05], [loch, 0.048], [loch, 0.035], [0.001, 0.035]], 24));
    } else {
      // Wall bracket: the shaft stands on the floor and is led by a ring; the flat plate leans against the wall
      const rueck = -(r + 0.1), y = h * 0.6, front = rueck + 0.01;
      t.add(eisen, rounded(0.05, h - 0.08, 0.02, 0.002, 0, h / 2, rueck));
      for (const yr of [0.07, h - 0.07]) t.add(eisen, turned([[0.001, -0.002], [0.008, -0.002], [0.008, 0.0005], [0.006, 0.003], [0.001, 0.004]], 10).rotateX(Math.PI / 2).translate(0, yr, front));
      // The ring around the shaft, its inner edge 2 mm clear
      const ring = schaft(y) + 0.002 + 0.006;
      t.add(eisen, new TorusGeometry(ring, 0.006, 8, 16).rotateX(Math.PI / 2).translate(0, y, 0));
      // The arm from the plate into the ring, the strut from lower on the plate up into the ring
      const z0 = front - 0.003, z1 = -ring - 0.002;
      t.add(eisen, rounded(0.03, 0.03, z1 - z0, 0.002, 0, y, (z0 + z1) / 2));
      const a: [number, number] = [y - 0.13, front - 0.0094], b: [number, number] = [y - 0.004, -ring - 0.004];
      const dy = b[0] - a[0], dz = b[1] - a[1];
      t.add(eisen, rounded(0.026, Math.hypot(dy, dz), 0.016, 0.002).rotateX(Math.atan2(dz, dy)).translate(0, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2));
    }
    if (p.flameHeight > 0.005) {
      // Two turned teardrops standing in the bowl: the flame and its taller, brighter core, kept inside the bowl wall
      const flamme = material("glow", p.flameColor), kern = material("glow", aufhellen(p.flameColor));
      const yb = h - eisenH * 0.55, tropfen: [number, number][] = [[0.06, 0.55], [0.16, 0.86], [0.28, 1], [0.42, 0.96], [0.56, 0.84], [0.7, 0.66], [0.82, 0.45], [0.92, 0.24], [0.97, 0.11]];
      const form = (breite: number, hoch: number) => turned([[0.001, 0], ...tropfen.map(([v, u]): [number, number] => {
        const yl = yb - y0 + v * hoch, w = breite * u;
        return [yl < eisenH ? Math.min(w, aussen(yl) - 0.006, kopf - 2 * lippe - 0.001) : w, v * hoch];
      }), [0.001, hoch]], 12, 0, yb, 0);
      t.add(flamme, form(kopf * 0.62, p.flameHeight * 0.65));
      t.add(kern, form(kopf * 0.3, p.flameHeight).rotateY(0.5));
    }
    return t.group();
  },
});
