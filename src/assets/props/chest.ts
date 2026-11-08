import { CylinderGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const chest = defineAsset({
  id: "chest", category: "props",
  title: { de: "Truhe", en: "Chest" },
  description: { de: "Eine Truhe mit gewölbtem oder flachem Deckel, Metallbändern und Schloss; der Deckel klappt auf (bewegliches Teil „lid“).", en: "A chest with an arched or flat lid, metal bands and a lock; the lid opens (movable part \"lid\")." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.4, max: 1.2, step: 0.01, default: 0.7, unit: "m",
      describe: { de: "Breite von links nach rechts: 0,5 m ein Kästchen, 0,7 m eine Schatztruhe, 1,1 m eine Aussteuertruhe.", en: "Width from left to right: 0.5 m a casket, 0.7 m a treasure chest, 1.1 m a blanket chest." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.3, max: 0.8, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Tiefe von vorn nach hinten; beim gewölbten Deckel auch die Spannweite der Wölbung.", en: "Depth from front to back; with an arched lid also the span of the arch." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.2, max: 0.6, step: 0.01, default: 0.35, unit: "m",
      describe: { de: "Höhe des Kastens ohne Deckel.", en: "Height of the box without the lid." } },
    lid: { type: "choice", label: { de: "Deckel", en: "Lid" }, options: ["arched", "flat"], labels: { arched: { de: "Gewölbt", en: "Arched" }, flat: { de: "Flach", en: "Flat" } }, default: "arched",
      describe: { de: "Gewölbt wie eine Schatztruhe oder flach wie eine Werkzeugkiste.", en: "Arched like a treasure chest or flat like a tool chest." } },
    bands: { type: "integer", label: { de: "Bänder", en: "Bands" }, min: 0, max: 4, default: 2,
      describe: { de: "Metallbänder über Kasten und Deckel: 0 schlicht, 2 üblich, 4 schwer beschlagen.", en: "Metal bands over box and lid: 0 plain, 2 usual, 4 heavily bound." } },
    lock: { type: "boolean", label: { de: "Schloss", en: "Lock" }, default: true,
      describe: { de: "Ein Schloss vorn mit Überfall am Deckel.", en: "A lock at the front with a hasp on the lid." } },
    color: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#8a5a33",
      describe: { de: "Farbe des Holzes.", en: "Colour of the wood." } },
    metalColor: { type: "color", label: { de: "Beschläge", en: "Fittings" }, default: "#c9a548",
      describe: { de: "Farbe der Bänder und des Schlosses: Messing #c9a548, Eisen #4a4a4a.", en: "Colour of the bands and the lock: brass #c9a548, iron #4a4a4a." } },
  },
  presets: {
    treasure: { label: { de: "Schatztruhe", en: "Treasure chest" }, values: { lid: "arched", bands: 2, lock: true } },
    "tool-chest": { label: { de: "Werkzeugkiste", en: "Tool chest" }, values: { lid: "flat", bands: 0, width: 0.8, depth: 0.4, height: 0.4, color: "#5d6b4a", metalColor: "#4a4a4a" } },
    "blanket-chest": { label: { de: "Aussteuertruhe", en: "Blanket chest" }, values: { lid: "flat", width: 1.1, depth: 0.5, height: 0.45, bands: 4, color: "#6e4a2c", metalColor: "#4a4a4a" } },
  },
  rig: { lid: { label: { de: "Deckel", en: "Lid" }, type: "rotate", axis: [-1, 0, 0], min: 0, max: 110 } },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 2500, drawCalls: 4 },
  build(p) {
    const holz = material("wood", p.color, 1, 250), metall = material("metal", p.metalColor);
    const w = p.width, d = p.depth, h = p.height, t = new Parts(), dicke = 0.006, breit = 0.04;
    t.box(holz, w, h, d, 0, h / 2, 0);
    const deckel = t.moving("lid", 0, h, -d / 2);
    const bogen = Math.min(d / 2, 0.25) * 0.75;
    if (p.lid === "arched") {
      // Half a cylinder lying across the chest, flattened to a gentle arch
      deckel.add(holz, new CylinderGeometry(d / 2, d / 2, w, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).scale(1, bogen / (d / 2), 1).translate(0, h, 0));
    } else deckel.box(holz, w + 0.02, 0.05, d + 0.02, 0, h + 0.025, 0);
    // Bands over box and lid, evenly across
    for (let k = 0; k < p.bands; k++) {
      const x = -w / 2 + (w * (k + 1)) / (p.bands + 1);
      for (const sz of [-1, 1]) t.box(metall, breit, h, dicke, x, h / 2, sz * (d / 2 + dicke / 2));
      if (p.lid === "arched") deckel.add(metall, new CylinderGeometry(d / 2 + dicke, d / 2 + dicke, breit, 16, 1, true, 0, Math.PI).rotateZ(Math.PI / 2).scale(1, (bogen + dicke) / (d / 2 + dicke), 1).translate(x, h, 0));
      else deckel.box(metall, breit, dicke, d + 0.03, x, h + 0.05 + dicke / 2, 0);
    }
    if (p.lock) {
      t.box(metall, 0.08, 0.09, 0.02, 0, h - 0.06, d / 2 + 0.01);
      deckel.box(metall, 0.035, 0.07, 0.012, 0, h - 0.01, d / 2 + 0.026);
    }
    return t.group();
  },
});
