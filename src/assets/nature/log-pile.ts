import { CircleGeometry, CylinderGeometry } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const logPile = defineAsset({
  id: "log-pile", category: "nature",
  title: { de: "Holzstapel", en: "Log pile" },
  description: { de: "Ein Stapel Brennholz: Scheite liegen in Reihen wie eine Pyramide, jedes in der Mulde zweier darunter, mit hellen Schnittflächen.", en: "A stack of firewood: logs lie in rows like a pyramid, each in the hollow between two below it, with pale cut ends." },
  params: {
    rows: { type: "integer", label: { de: "Lagen", en: "Rows" }, min: 1, max: 5, default: 3,
      describe: { de: "Zahl der Lagen übereinander: 1 eine Reihe am Boden, 3 ein Brennholzstapel, 5 ein hoher Haufen.", en: "Number of layers on top of each other: 1 a single row on the ground, 3 a firewood stack, 5 a tall heap." } },
    logs: { type: "integer", label: { de: "Scheite", en: "Logs" }, min: 2, max: 8, default: 5,
      describe: { de: "Scheite in der untersten Lage; jede Lage darüber hat eines weniger und entfällt, wenn keines bleibt.", en: "Logs in the bottom row; each row above has one less, and a row with none is left out." } },
    logLength: { type: "number", label: { de: "Scheitlänge", en: "Log length" }, min: 0.3, max: 2, step: 0.01, default: 0.6, unit: "m",
      describe: { de: "Länge eines Scheits: 0,35 m Anzündholz, 0,6 m Kaminholz, 1,8 m Stammholz.", en: "Length of one log: 0.35 m kindling, 0.6 m firewood, 1.8 m timber." } },
    diameter: { type: "number", label: { de: "Durchmesser", en: "Diameter" }, min: 0.06, max: 0.3, step: 0.005, default: 0.14, unit: "m",
      describe: { de: "Durchmesser eines Scheits: 0,06 m Anzündholz, 0,14 m Kaminholz, 0,28 m Stammholz.", en: "Diameter of one log: 0.06 m kindling, 0.14 m firewood, 0.28 m timber." } },
    variation: { type: "number", label: { de: "Unregelmäßigkeit", en: "Variation" }, min: 0, max: 1, step: 0.01, default: 0.4,
      describe: { de: "Wie unterschiedlich die Scheite sind: Durchmesser ±20 %, Länge ±15 %, Versatz entlang der Achse ±10 %; 0 ganz gleich, 1 sehr wild.", en: "How much the logs differ: diameter ±20 %, length ±15 %, push along the axis ±10 %; 0 identical, 1 very rough." } },
    colour: { type: "color", label: { de: "Rinde", en: "Bark" }, default: "#5b4532",
      describe: { de: "Farbe der Rinde.", en: "Colour of the bark." } },
    endColour: { type: "color", label: { de: "Schnittfläche", en: "Cut ends" }, default: "#c9a477",
      describe: { de: "Farbe der Schnittflächen an den Enden.", en: "Colour of the cut ends." } },
  },
  presets: {
    firewood: { label: { de: "Brennholz", en: "Firewood" }, values: { rows: 3, logs: 5 } },
    timber: { label: { de: "Stammholz", en: "Timber" }, values: { rows: 2, logs: 4, logLength: 1.8, diameter: 0.28, variation: 0.2 } },
    kindling: { label: { de: "Anzündholz", en: "Kindling" }, values: { rows: 4, logs: 7, logLength: 0.35, diameter: 0.06 } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 1500, drawCalls: 2 },
  build(p, seed) {
    const r = rng(seed), v = p.variation, d = p.diameter;
    const bark = material("wood", p.colour, 1), ends = material("wood", p.endColour, 1);
    const t = new Parts();
    const spread = () => (r() * 2 - 1) * v;
    for (let k = 0; k < p.rows; k++) {
      const n = p.logs - k;
      if (n < 1) break;
      for (let i = 0; i < n; i++) {
        const rad = (d / 2) * (1 + 0.2 * spread()), len = p.logLength * (1 + 0.15 * spread());
        const z = (i - (n - 1) / 2) * d, dx = 0.1 * p.logLength * spread();
        // the bottom row rests on the floor whatever its width; rows above sit in the hollows of the nominal grid
        const y = k === 0 ? rad : d / 2 + k * d * 0.866;
        t.add(bark, new CylinderGeometry(rad, rad, len, 10, 1, true).rotateZ(Math.PI / 2).translate(dx, y, z));
        for (const s of [-1, 1]) t.add(ends, new CircleGeometry(rad, 10).rotateY((s * Math.PI) / 2).translate(dx + (s * len) / 2, y, z));
      }
    }
    return t.group();
  },
});
