import { ConeGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from "three";
import { rounded, turned } from "../shapes";
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
    wear: { type: "number", label: { de: "Abnutzung", en: "Wear" }, min: 0, max: 1, step: 0.05, default: 0.4,
      describe: { de: "Rost am Rahmen: 0 blank (Messing, neu lackiert), 0,4 eine alte Laterne, 0,9 lange im Regen.", en: "Rust on the frame: 0 bare (brass, fresh paint), 0.4 an old lantern, 0.9 left out in the rain." } },
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
  budget: { triangles: 14000, drawCalls: 4 },
  build(p) {
    // Rust in patches a few centimetres across: the pattern scaled to the size of a lantern
    const metall = material("iron", p.frameColour, 4, undefined, { rust: p.wear }), t = new Parts();
    const wachs = material("paint", "#ece2c6");
    const w = p.width, h = p.height, post = Math.max(0.007, w * 0.055);
    const baseH = Math.min(0.022, h * 0.075);
    const roofH = p.roof === "flat" ? Math.min(0.012, h * 0.05, w * 0.12) : Math.min(w * 0.46, h * 0.28);
    const roofBase = h - roofH;
    // A stepped base plate with rounded edges
    t.add(metall, rounded(w, baseH * 0.6, w, 0.003, 0, baseH * 0.3, 0));
    t.add(metall, rounded(w * 0.9, baseH * 0.45, w * 0.9, 0.003, 0, baseH * 0.6 + baseH * 0.2, 0));
    const px = w / 2 - post / 2, postH = roofBase - baseH;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(metall, rounded(post, postH, post, post * 0.25, sx * px, baseH + postH / 2, sz * px));
    // A lip under the roof, wider than the frame
    t.add(metall, rounded(w + 0.014, Math.min(0.008, roofH * 0.4), w + 0.014, 0.002, 0, roofBase + 0.002, 0));
    if (p.roof === "pyramid") {
      const r = (w / 2 + 0.008) * Math.SQRT2;
      t.add(metall, new ConeGeometry(r, roofH, 4, 2).rotateY(Math.PI / 4).translate(0, roofBase + roofH / 2 + 0.004, 0));
      const kr = Math.max(0.006, w * 0.06);
      t.add(metall, turned([[kr, 0], [kr * 1.4, kr * 0.6], [kr * 0.9, kr * 1.2], [kr * 1.2, kr * 1.9], [0.001, kr * 2.4]], 12, 0, h - kr * 0.8, 0));
    } else if (p.roof === "dome") {
      const r = (w / 2 + 0.006) * Math.SQRT2;
      t.add(metall, new SphereGeometry(r, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, roofH / r, 1).translate(0, roofBase + 0.002, 0));
    } else {
      t.add(metall, rounded(w + 0.012, roofH, w + 0.012, Math.min(0.003, roofH * 0.3), 0, roofBase + roofH / 2, 0));
    }
    const tube = Math.min(0.005, w * 0.04);
    if (p.handle === "ring") {
      const r = Math.min(0.045, Math.max(0.022, w * 0.28));
      t.add(metall, new TorusGeometry(r, tube, 8, 28).translate(0, h + r + tube * 0.5, 0));
    } else {
      const r = w / 2 + 0.005;
      t.add(metall, new TorusGeometry(r, tube, 8, 28, Math.PI).translate(0, roofBase + 0.002, 0));
      for (const sx of [-1, 1]) t.add(metall, rounded(0.006, 0.022, 0.012, 0.002, sx * (w / 2 + 0.005), roofBase - 0.006, 0));
    }
    // Guard rods across the three fixed sides
    const rod = Math.max(0.0025, w * 0.018), innen = w - 2 * post;
    for (const k of [0.36, 0.68]) {
      const y = baseH + postH * k;
      t.add(metall, new CylinderGeometry(rod, rod, innen, 8).rotateZ(Math.PI / 2).translate(0, y, -px));
      for (const sx of [-1, 1]) t.add(metall, new CylinderGeometry(rod, rod, innen, 8).rotateX(Math.PI / 2).translate(sx * px, y, 0));
    }
    const bar = Math.min(0.008, w * 0.08), barD = 0.006, z = w / 2 + barD / 2, openingH = roofBase - baseH;
    const tuer = t.moving("door", -w / 2, baseH, w / 2);
    tuer.add(metall, rounded(bar, openingH, barD, 0.0015, -w / 2 + bar / 2, baseH + openingH / 2, z));
    tuer.add(metall, rounded(bar, openingH, barD, 0.0015, w / 2 - bar / 2, baseH + openingH / 2, z));
    tuer.add(metall, rounded(w, bar, barD, 0.0015, 0, baseH + bar / 2, z));
    tuer.add(metall, rounded(w, bar, barD, 0.0015, 0, roofBase - bar / 2, z));
    // The latch on the side away from the hinge
    tuer.add(metall, turned([[0.001, 0], [0.004, 0], [0.005, 0.004], [0.0035, 0.007], [0.001, 0.008]], 10).rotateX(Math.PI / 2).translate(w / 2 - bar / 2, baseH + openingH * 0.5, z + barD / 2));
    // A candle on a small dish; lit, a flame above the wick
    const kr = Math.max(0.012, w / 7), kh = openingH * 0.45, schale = Math.min(0.006, baseH * 0.3);
    t.add(metall, turned([[0.001, 0], [kr * 1.7, 0], [kr * 1.9, schale], [kr * 1.75, schale], [0.001, schale * 0.5]], 20, 0, baseH, 0));
    t.add(wachs, turned([[0.001, 0], [kr, 0], [kr, kh * 0.94], [kr * 0.9, kh], [kr * 0.3, kh * 0.97], [0.001, kh * 0.98]], 20, 0, baseH + schale * 0.5, 0));
    if (p.lit) {
      const glas = material("glow", p.lightColour), fh = Math.min(openingH * 0.22, kr * 3);
      t.add(glas, turned([[0.001, 0], [kr * 0.32, fh * 0.18], [kr * 0.36, fh * 0.35], [kr * 0.22, fh * 0.7], [0.001, fh]], 14, 0, baseH + schale * 0.5 + kh, 0));
    }
    return t.group();
  },
});
