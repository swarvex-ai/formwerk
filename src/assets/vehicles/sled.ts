import { TorusGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const sled = defineAsset({
  id: "sled", category: "vehicles",
  title: { de: "Schlitten", en: "Sled" },
  description: { de: "Ein Holzschlitten auf zwei Metallkufen, deren vordere Enden nach oben gebogen sind, mit Querlatten und optionaler Lehne.", en: "A wooden sled on two metal runners whose front ends curl up to the deck, with slats across the top and an optional backrest." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 0.8, max: 2, step: 0.05, default: 1.1, unit: "m",
      describe: { de: "Länge der Kufen: 0,8 m ein Kinderschlitten, 1,1 m üblich, 1,9 m ein Lastenschlitten.", en: "Length of the runners: 0.8 m a child's sled, 1.1 m usual, 1.9 m a cargo sled." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.35, max: 0.8, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Äußere Breite über den Kufen: 0,35 m schmal, 0,45 m üblich, 0,7 m eine breite Standfläche.", en: "Outer width over the runners: 0.35 m narrow, 0.45 m usual, 0.7 m a wide standing deck." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.12, max: 0.35, step: 0.01, default: 0.2, unit: "m",
      describe: { de: "Höhe der Deckoberkante über dem Schnee: 0,14 m ein flacher Rennschlitten, 0,2 m üblich, 0,3 m ein Sitzschlitten.", en: "Height of the deck top above the snow: 0.14 m a flat racer, 0.2 m usual, 0.3 m a seat sled." } },
    slats: { type: "integer", label: { de: "Latten", en: "Slats" }, min: 3, max: 8, default: 5,
      describe: { de: "Anzahl der Querlatten auf dem Deck: 3 auf einem kurzen, 5 üblich, 8 auf einem langen Schlitten.", en: "Number of boards across the deck: 3 on a short sled, 5 usual, 8 on a long one." } },
    backrest: { type: "boolean", label: { de: "Rückenlehne", en: "Backrest" }, default: false,
      describe: { de: "Eine aufrechte Lehne am hinteren Ende, an der man beim Fahren Halt findet.", en: "An upright board at the rear that gives hold while riding." } },
    color: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#a0703c",
      describe: { de: "Farbe von Deck, Latten und Lehne.", en: "Colour of the deck, the slats and the backrest." } },
    metalColor: { type: "color", label: { de: "Kufen", en: "Runners" }, default: "#3c3c3c",
      describe: { de: "Farbe der Metallkufen.", en: "Colour of the metal runners." } },
  },
  presets: {
    "kids-sled": { label: { de: "Kinderschlitten", en: "Kids sled" }, values: { length: 0.8 } },
    "cargo-sled": { label: { de: "Lastenschlitten", en: "Cargo sled" }, values: { length: 1.9, width: 0.7, height: 0.3, slats: 8 } },
    racer: { label: { de: "Rennschlitten", en: "Racer" }, values: { length: 0.9, width: 0.38, height: 0.14, slats: 4 } },
    "chair-sled": { label: { de: "Stuhlschlitten", en: "Chair sled" }, values: { backrest: true, height: 0.26 } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 2000, drawCalls: 2 },
  build(p) {
    const holz = material("wood", p.color, 1, 450), eisen = material("metal", p.metalColor), t = new Parts();
    const L = p.length, W = p.width, H = p.height;
    const rc = (H - 0.012) / 2, zc = L / 2 - rc, xr = W / 2 - 0.03, deck = L - rc;
    // Runner bar on the snow, the half ring that curls its front end up to the deck, the rail and three posts
    for (const s of [-1, 1]) {
      const x = s * xr;
      t.box(eisen, 0.025, 0.024, zc + L / 2, x, 0.012, (zc - L / 2) / 2);
      t.add(eisen, new TorusGeometry(rc, 0.012, 6, 12, Math.PI).rotateZ(-Math.PI / 2).rotateY(-Math.PI / 2).translate(x, rc + 0.012, zc));
      t.box(holz, 0.04, 0.03, deck, x, H - 0.035, -L / 2 + deck / 2);
      for (const z of [-L / 2 + 0.06, -L / 2 + deck / 2, zc - 0.04]) t.box(holz, 0.03, H - 0.074, 0.04, x, 0.024 + (H - 0.074) / 2, z);
    }
    const n = p.slats, d = Math.min(0.08, (deck / n) * 0.8);
    for (let i = 0; i < n; i++) t.box(holz, W, 0.02, d, 0, H - 0.01, -L / 2 + d / 2 + 0.01 + (i * (deck - d - 0.02)) / Math.max(1, n - 1));
    if (p.backrest) t.box(holz, W - 0.06, 0.25, 0.025, 0, H + 0.125, -L / 2 + 0.0125);
    return t.group();
  },
});
