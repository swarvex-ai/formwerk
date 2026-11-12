import { ConeGeometry, CylinderGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const anvil = defineAsset({
  id: "anvil", category: "props",
  title: { de: "Amboss", en: "Anvil" },
  description: { de: "Ein Schmiedeamboss: Bahn auf schmaler Taille mit Fuß und konischem Horn, auf einem Holzklumpen oder auf dem Boden.", en: "A blacksmith's anvil: the face on a pinched waist with a foot and a conical horn, standing on a wooden stump or on the floor." },
  params: {
    length: { type: "number", label: { de: "Bahnlänge", en: "Face length" }, min: 0.3, max: 0.9, step: 0.01, default: 0.5, unit: "m",
      describe: { de: "Länge der Bahn ohne Horn: 0,3 m Bankamboss, 0,5 m Schmiedeamboss, 0,9 m schwerer Amboss.", en: "Face length without the horn: 0.3 m a bench anvil, 0.5 m a forge anvil, 0.9 m a heavy anvil." } },
    faceWidth: { type: "number", label: { de: "Bahnbreite", en: "Face width" }, min: 0.08, max: 0.2, step: 0.01, default: 0.12, unit: "m",
      describe: { de: "Breite der Bahn von vorn nach hinten: 0,08 m klein, 0,12 m üblich, 0,2 m schwerer Amboss.", en: "Width of the face from front to back: 0.08 m small, 0.12 m usual, 0.2 m a heavy anvil." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.15, max: 0.4, step: 0.01, default: 0.25, unit: "m",
      describe: { de: "Höhe des Ambosskörpers vom Fuß bis zur Bahn: 0,15 m Bankamboss, 0,25 m üblich, 0,4 m schwerer Amboss.", en: "Height of the anvil body from foot to face: 0.15 m a bench anvil, 0.25 m usual, 0.4 m a heavy anvil." } },
    horn: { type: "number", label: { de: "Horn", en: "Horn" }, min: 0, max: 1, step: 0.05, default: 0.6,
      describe: { de: "Länge des konischen Horns als Anteil der Bahnlänge: 0 ohne Horn, 0,6 üblich, 1 so lang wie die Bahn.", en: "Length of the conical horn as a share of the face length: 0 no horn, 0.6 usual, 1 as long as the face." } },
    waist: { type: "number", label: { de: "Taille", en: "Waist" }, min: 0.3, max: 0.8, step: 0.05, default: 0.5,
      describe: { de: "Breite der schmalen Mitte als Anteil der Bahnbreite: 0,3 schlank, 0,5 üblich, 0,8 massig.", en: "Width of the narrow middle as a share of the face width: 0.3 slim, 0.5 usual, 0.8 stocky." } },
    stump: { type: "boolean", label: { de: "Holzklumpen", en: "Wooden stump" }, default: true,
      describe: { de: "Der Amboss steht auf einem 0,5 m hohen Holzklumpen, sonst steht der Fuß direkt auf dem Boden.", en: "The anvil stands on a wooden stump 0.5 m high, otherwise the foot rests directly on the floor." } },
    colour: { type: "color", label: { de: "Eisen", en: "Iron" }, default: "#3c3f44",
      describe: { de: "Farbe des Schmiedeeisens: #3c3f44 dunkles Eisen, #56595e polierte Bahn.", en: "Colour of the wrought iron: #3c3f44 dark iron, #56595e a polished face." } },
  },
  presets: {
    forge: { label: { de: "Schmiedeamboss", en: "Forge anvil" }, values: { horn: 0.6, stump: true } },
    "small-bench": { label: { de: "Bankamboss", en: "Bench anvil" }, values: { length: 0.3, faceWidth: 0.08, height: 0.15, horn: 0.4, stump: false } },
    heavy: { label: { de: "Schwerer Amboss", en: "Heavy anvil" }, values: { length: 0.8, faceWidth: 0.18, height: 0.35, horn: 0.7 } },
  },
  // A stump under the anvil fixes it in the level; the bare body is a prop that can be pushed.
  // The contract knows only one body per asset, so it follows the default (stump on).
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 300, drawCalls: 2 },
  build(p) {
    const eisen = material("metal", p.colour), holz = material("wood", "#6e4e30"), t = new Parts();
    const h = p.height, fussH = 0.2 * h, taille = p.waist * p.faceWidth, y0 = p.stump ? 0.5 : 0;
    if (p.stump) t.add(holz, new CylinderGeometry(0.6 * Math.max(p.length, p.faceWidth), 0.6 * Math.max(p.length, p.faceWidth), 0.5, 16).translate(0, 0.25, 0));
    // Foot, pinched waist and the top block with the face, the length along x
    t.box(eisen, p.length, fussH, 1.4 * p.faceWidth, 0, y0 + fussH / 2, 0);
    t.box(eisen, taille, 0.75 * h - fussH, taille, 0, y0 + (fussH + 0.75 * h) / 2, 0);
    t.box(eisen, p.length, h - 0.75 * h, p.faceWidth, 0, y0 + (0.75 * h + h) / 2, 0);
    // The horn: a cone lying along +x, its base at the end of the top block
    if (p.horn > 0.005) {
      const len = p.horn * p.length, r = p.faceWidth / 2;
      t.add(eisen, new ConeGeometry(r, len, 12).rotateZ(-Math.PI / 2).translate(p.length / 2 + len / 2, y0 + 0.85 * h, 0));
    }
    return t.group();
  },
});
