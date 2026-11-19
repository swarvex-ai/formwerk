import { Vector3 } from "three";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded } from "../shapes";

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
  budget: { triangles: 8000, drawCalls: 2 },
  build(p) {
    const holz = material("wood", p.color, 1, 450, { grain: "part" }), eisen = material("metal", p.metalColor), t = new Parts();
    const L = p.length, W = p.width, H = p.height;
    // The runner: a flat bar 25 × 12 mm, one piece bent from the snow up round the front and back under the rail
    const bw = 0.025, bt = 0.012, xr = W / 2 - 0.03, yT = H - 0.05 - bt / 2, rc = (yT - bt / 2) / 2, zc = L / 2 - rc - bt / 2;
    const zFront = zc - 0.03, deck = zc + 0.02 + L / 2;
    // Centre line of the bar in (z, y) and its direction, s from 0 (back end) to 1 (bolted under the rail)
    const gerade = zc - (-L / 2 + 0.04), bogen = Math.PI * rc, heck = (Math.PI / 2) * 0.04, rueck = 0.12, ges = heck + gerade + bogen + rueck;
    const bahn = (s: number): [number, number, number, number] => {
      let d = s * ges;
      if (d < heck) { const a = Math.PI + d / 0.04; return [-L / 2 + 0.04 + 0.04 * Math.cos(a), bt / 2 + 0.04 + 0.04 * Math.sin(a), -Math.sin(a), Math.cos(a)]; }
      d -= heck;
      if (d < gerade) return [-L / 2 + 0.04 + d, bt / 2, 1, 0];
      d -= gerade;
      if (d < bogen) { const a = d / rc; return [zc + rc * Math.sin(a), bt / 2 + rc - rc * Math.cos(a), Math.cos(a), Math.sin(a)]; }
      d -= bogen;
      return [zc - d, yT, -1, 0];
    };
    // Rounded-rectangle cross-section (radius 3 mm), 16 points round
    const ecke = 0.003, quer: [number, number][] = [];
    for (let k = 0; k < 4; k++) for (let i = 0; i <= 3; i++) {
      const a = (k + i / 3) * (Math.PI / 2), sx = k === 0 || k === 3 ? 1 : -1, sy = k < 2 ? 1 : -1;
      quer.push([sx * (bw / 2 - ecke) + ecke * Math.cos(a), sy * (bt / 2 - ecke) + ecke * Math.sin(a)]);
    }
    // rings only where the bar bends: 4 on the rear upturn, 16 round the front, none along the straight parts
    const n = 4 * 4, ringe: number[] = [];
    for (let i = 0; i <= 4; i++) ringe.push((heck * i) / 4 / ges);
    for (let i = 0; i <= 16; i++) ringe.push((heck + gerade + (bogen * i) / 16) / ges);
    ringe.push(1);
    const schritte = ringe.length - 1;
    const punkt = (x0: number, i: number, s: number, k = 1) => {
      const [z, y, dz, dy] = bahn(s), [qx, qn] = quer[i % n];
      return new Vector3(x0 + k * qx, y + k * qn * dz, z - k * qn * dy);
    };
    for (const sg of [-1, 1]) {
      const x = sg * xr;
      // The bar and its two end caps
      t.add(eisen, grid(n, schritte, (u, v) => punkt(x, Math.round(u * n), ringe[Math.round(v * schritte)]), (q) => { const [z, y] = bahn(0.5); return new Vector3(q.x - x, q.y - y, q.z - z); }));
      for (const s of [0, 1]) t.add(eisen, grid(n, 1, (u, v) => punkt(x, Math.round(u * n), s, 1 - v), () => { const [, , dz, dy] = bahn(s); return new Vector3(0, s ? dy : -dy, s ? dz : -dz); }));
      // Rail along the deck and three posts standing on the bar
      t.add(holz, grained(rounded(0.04, 0.03, deck, 0.004, x, H - 0.035, -L / 2 + deck / 2), "z"));
      for (const z of [-L / 2 + 0.06, (-L / 2 + zFront - 0.06) / 2, zFront - 0.12]) t.add(holz, rounded(0.03, H - 0.05 - bt + 0.004, 0.04, 0.004, x, bt - 0.002 + (H - 0.05 - bt + 0.004) / 2, z));
    }
    // Slats across the rails
    const m = p.slats, d = Math.min(0.08, (deck / m) * 0.8);
    for (let i = 0; i < m; i++) t.add(holz, grained(rounded(W, 0.02, d, 0.004, 0, H - 0.01, -L / 2 + d / 2 + 0.01 + (i * (deck - d - 0.02)) / Math.max(1, m - 1)), "x"));
    if (p.backrest) {
      // Two uprights outside the rails and a board between them
      for (const sg of [-1, 1]) t.add(holz, rounded(0.025, 0.3, 0.03, 0.004, sg * (xr + 0.0325), H - 0.05 + 0.15, -L / 2 + 0.03));
      t.add(holz, grained(rounded(W - 0.02, 0.12, 0.02, 0.004, 0, H + 0.17, -L / 2 + 0.025), "x"));
    }
    return t.group();
  },
});
