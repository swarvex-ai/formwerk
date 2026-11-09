import { BoxGeometry, ConeGeometry, CylinderGeometry } from "three";
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
  budget: { triangles: 500, drawCalls: 4 },
  build(p) {
    const holz = material("wood", "#6b4a2e"), eisen = material("metal", "#40454b"), t = new Parts();
    const h = p.height, kopf = p.headSize, r = p.poleRadius, eisenH = 0.14;
    // The iron bowl on top: a cone flaring from the shaft to the rim
    t.add(eisen, new CylinderGeometry(kopf, Math.max(r * 1.5, 0.03), eisenH, 10).translate(0, h - eisenH / 2, 0));
    if (p.mount === "standing") {
      // Iron foot on the floor, the shaft stands in it up to the bowl
      const fuss = Math.max(0.11, kopf * 0.8);
      t.add(eisen, new CylinderGeometry(fuss * 0.7, fuss, 0.05, 10).translate(0, 0.025, 0));
      t.post(holz, r, h - eisenH - 0.05, 0, 0.05, 0);
    } else {
      // Wall bracket: the shaft stands on the floor and is led by a ring; the flat plate leans against the wall
      t.post(holz, r, h - eisenH, 0, 0, 0);
      const rueck = -(r + 0.1), y = h * 0.6;
      t.box(eisen, 0.05, h - 0.08, 0.02, 0, h / 2, rueck);
      t.box(eisen, 0.03, 0.03, -rueck, 0, y, rueck / 2);
      t.add(eisen, new BoxGeometry(0.026, 0.15, 0.026).rotateX(Math.atan2(0.08, 0.115)).translate(0, y - 0.072, rueck + 0.06));
      t.post(eisen, r + 0.02, 0.05, 0, y - 0.025, 0);
    }
    if (p.flameHeight > 0.005) {
      // Low-poly flame: a wide cone of the flame colour with a taller, brighter core standing in the bowl
      const flamme = material("glow", p.flameColor), kern = material("glow", aufhellen(p.flameColor));
      const yb = h - eisenH * 0.55;
      t.add(flamme, new ConeGeometry(kopf * 0.62, p.flameHeight * 0.65, 6).translate(0, yb + (p.flameHeight * 0.65) / 2, 0));
      t.add(kern, new ConeGeometry(kopf * 0.3, p.flameHeight, 6).rotateY(0.5).translate(0, yb + p.flameHeight / 2, 0));
    }
    return t.group();
  },
});
