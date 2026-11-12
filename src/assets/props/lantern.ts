import { ConeGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const lantern = defineAsset({
  id: "lantern", category: "props",
  title: { de: "Handlaterne", en: "Lantern" },
  description: { de: "Eine Handlaterne mit quadratischem Metallrahmen, Pyramidendach, Kuppel oder flacher Platte und einem Ring oder Bügel zum Tragen; die vordere Tür schwingt auf und innen leuchtet warmes Licht.", en: "A hand lantern with a square metal frame, a pyramid, dome or flat roof and a ring or bail handle; the front door swings open and a warm light glows inside." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.2, max: 0.6, step: 0.01, default: 0.32, unit: "m",
      describe: { de: "Höhe vom Boden bis zur Dachspitze: 0,2 m eine kleine Tischlaterne, 0,32 m eine Handlaterne, 0,55 m eine Straßenlaterne.", en: "Height from the floor to the top of the roof: 0.2 m a small table lantern, 0.32 m a hand lantern, 0.55 m a street lantern." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.1, max: 0.3, step: 0.01, default: 0.15, unit: "m",
      describe: { de: "Breite des quadratischen Rahmens: 0,1 m schmal, 0,15 m eine Handlaterne, 0,26 m eine große Straßenlaterne.", en: "Width across the square frame: 0.1 m slim, 0.15 m a hand lantern, 0.26 m a large street lantern." } },
    roof: { type: "choice", label: { de: "Dach", en: "Roof" }, options: ["pyramid", "dome", "flat"], labels: { pyramid: { de: "Pyramide", en: "Pyramid" }, dome: { de: "Kuppel", en: "Dome" }, flat: { de: "Flach", en: "Flat" } }, default: "pyramid",
      describe: { de: "Pyramide wie eine alte Laterne, Kuppel wie eine Sturmlaterne, flache Platte wie eine moderne Leuchte.", en: "Pyramid like an old lantern, dome like a storm lantern, flat plate like a modern light." } },
    handle: { type: "choice", label: { de: "Griff", en: "Handle" }, options: ["ring", "bail"], labels: { ring: { de: "Ring", en: "Ring" }, bail: { de: "Bügel", en: "Bail" } }, default: "ring",
      describe: { de: "Ring oben zum Hängen an einen Haken, oder ein Bügel über dem Dach zum Tragen und Schwingen.", en: "A ring on top for hanging on a hook, or a bail over the roof for carrying and swinging." } },
    lit: { type: "boolean", label: { de: "Beleuchtet", en: "Lit" }, default: true,
      describe: { de: "Ein Glühkern innen leuchtet; aus bleibt die Laterne dunkel.", en: "A glowing core inside lights up; off leaves the lantern dark." } },
    frameColour: { type: "color", label: { de: "Rahmen", en: "Frame" }, default: "#2f3236",
      describe: { de: "Farbe des Metallrahmens: #2f3236 dunkles Eisen, #b08a3e Messing, #4f6b4a grün lackiert.", en: "Colour of the metal frame: #2f3236 dark iron, #b08a3e brass, #4f6b4a painted green." } },
    lightColour: { type: "color", label: { de: "Licht", en: "Light" }, default: "#ffc46b",
      describe: { de: "Farbe des Lichts: #ffc46b warm wie eine Kerze, #e6f0ff kalt wie eine LED.", en: "Colour of the light: #ffc46b warm like a candle, #e6f0ff cold like an LED." } },
  },
  presets: {
    "hand-lantern": { label: { de: "Handlaterne", en: "Hand lantern" }, values: { height: 0.32, width: 0.15, roof: "pyramid", handle: "ring" } },
    "storm-lantern": { label: { de: "Sturmlaterne", en: "Storm lantern" }, values: { roof: "dome", handle: "bail", height: 0.3, width: 0.18 } },
    "street-lantern": { label: { de: "Straßenlaterne", en: "Street lantern" }, values: { height: 0.55, width: 0.26, roof: "pyramid", handle: "ring" } },
  },
  rig: { door: { label: { de: "Tür", en: "Door" }, type: "rotate", axis: [0, -1, 0], min: 0, max: 120 } },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 2000, drawCalls: 3 },
  build(p) {
    const metall = material("metal", p.frameColour), t = new Parts();
    const w = p.width, h = p.height, post = 0.008;
    const baseH = Math.min(0.018, h * 0.07);
    const roofH = p.roof === "flat" ? Math.min(0.012, h * 0.05, w * 0.12) : Math.min(w * 0.46, h * 0.28);
    const roofBase = h - roofH;
    t.box(metall, w, baseH, w, 0, baseH / 2, 0);
    const px = w / 2 - post / 2, postH = roofBase - baseH;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.box(metall, post, postH, post, sx * px, baseH + postH / 2, sz * px);
    if (p.roof === "pyramid") {
      const r = (w / 2 + 0.006) * Math.SQRT2;
      t.add(metall, new ConeGeometry(r, roofH, 4).rotateY(Math.PI / 4).translate(0, roofBase + roofH / 2, 0));
    } else if (p.roof === "dome") {
      const r = (w / 2 + 0.004) * Math.SQRT2;
      t.add(metall, new SphereGeometry(r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, roofH / r, 1).translate(0, roofBase, 0));
    } else {
      t.box(metall, w + 0.012, roofH, w + 0.012, 0, roofBase + roofH / 2, 0);
    }
    const tube = Math.min(0.005, w * 0.04);
    if (p.handle === "ring") {
      const r = Math.min(0.045, Math.max(0.022, w * 0.28));
      t.add(metall, new TorusGeometry(r, tube, 6, 16).translate(0, h + r, 0));
    } else {
      const r = w / 2 + 0.005;
      t.add(metall, new TorusGeometry(r, tube, 6, 20, Math.PI).translate(0, roofBase + 0.002, 0));
    }
    const bar = Math.min(0.008, w * 0.08), barD = 0.006, z = w / 2 + barD / 2, openingH = roofBase - baseH;
    const tuer = t.moving("door", -w / 2, baseH, w / 2);
    tuer.box(metall, bar, openingH, barD, -w / 2 + bar / 2, baseH + openingH / 2, z);
    tuer.box(metall, bar, openingH, barD, w / 2 - bar / 2, baseH + openingH / 2, z);
    tuer.box(metall, w, bar, barD, 0, baseH + bar / 2, z);
    tuer.box(metall, w, bar, barD, 0, roofBase - bar / 2, z);
    if (p.lit) {
      const glas = material("glow", p.lightColour), gr = w / 6, gh = openingH * 0.55;
      t.add(glas, new CylinderGeometry(gr, gr, gh, 12).translate(0, baseH + gh / 2, 0));
    }
    return t.group();
  },
});
