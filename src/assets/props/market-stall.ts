import { DoubleSide, ExtrudeGeometry, Shape, Vector3 } from "three";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded } from "../shapes";

export const marketStall = defineAsset({
  id: "market-stall", category: "props",
  title: { de: "Marktstand", en: "Market stall" },
  description: { de: "Ein Marktstand mit Theke und gestreiftem Stoffdach: schräg, als Giebel oder flach, für Märkte, Basare und Städte.", en: "A market stall with a counter and a striped cloth roof: sloped, peaked or flat, for markets, bazaars and towns." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 1.5, max: 4, step: 0.05, default: 2.4, unit: "m",
      describe: { de: "Breite der Front: 1,8 m ein kleiner Stand, 2,4 m üblich, 3,5 m ein großer Stand.", en: "Width of the front: 1.8 m a small stall, 2.4 m usual, 3.5 m a big stall." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 1, max: 2.4, step: 0.05, default: 1.5, unit: "m",
      describe: { de: "Tiefe von der Theke bis zur Rückseite.", en: "Depth from the counter to the back." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 2, max: 2.8, step: 0.05, default: 2.2, unit: "m",
      describe: { de: "Höhe der Dachkante vorn: 2,1 m üblich, 2,6 m für hohe Waren.", en: "Height of the roof edge at the front: 2.1 m usual, 2.6 m for tall goods." } },
    counter: { type: "number", label: { de: "Theke", en: "Counter" }, min: 0.75, max: 1.1, step: 0.01, default: 0.9, unit: "m",
      describe: { de: "Höhe der Theke: 0,8 m zum Auslegen, 0,9 m üblich, 1,05 m wie ein Tresen.", en: "Height of the counter: 0.8 m for displaying goods, 0.9 m usual, 1.05 m like a bar." } },
    roof: { type: "choice", label: { de: "Dach", en: "Roof" }, options: ["sloped", "peaked", "flat"], labels: { sloped: { de: "Schräg", en: "Sloped" }, peaked: { de: "Giebel", en: "Peaked" }, flat: { de: "Flach", en: "Flat" } }, default: "sloped",
      describe: { de: "Schräg nach hinten ansteigend, als Giebel mit First in der Mitte oder flach.", en: "Rising towards the back, peaked with a ridge in the middle, or flat." } },
    stripes: { type: "integer", label: { de: "Streifen", en: "Stripes" }, min: 0, max: 12, default: 6,
      describe: { de: "Zahl der Stoffbahnen in zwei Farben im Wechsel: 0 einfarbig, 6 üblich, 12 fein gestreift.", en: "Number of cloth strips alternating in two colours: 0 plain, 6 usual, 12 fine stripes." } },
    color1: { type: "color", label: { de: "Stoff 1", en: "Cloth 1" }, default: "#c8443a",
      describe: { de: "Erste Farbe des Stoffdachs (auch die Farbe ohne Streifen).", en: "First colour of the cloth roof (also the colour without stripes)." } },
    color2: { type: "color", label: { de: "Stoff 2", en: "Cloth 2" }, default: "#f1e6d0",
      describe: { de: "Zweite Farbe der Streifen.", en: "Second colour of the stripes." } },
    wood: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#8a6440",
      describe: { de: "Farbe von Pfosten und Theke.", en: "Colour of the posts and the counter." } },
  },
  presets: {
    "fruit-stand": { label: { de: "Obststand", en: "Fruit stand" }, values: { roof: "sloped", stripes: 6 } },
    bazaar: { label: { de: "Basar", en: "Bazaar" }, values: { roof: "peaked", stripes: 8, color1: "#2f5fa8", color2: "#e8c547", width: 3 } },
    plain: { label: { de: "Schlicht", en: "Plain" }, values: { roof: "flat", stripes: 0, color1: "#4c7a46" } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 15000, drawCalls: 3 },
  build(p) {
    // One wood: boards, bearers and the rail lie level (grained along their length), the posts stand ("auto")
    const holz = material("wood", p.wood, 1, undefined, { grain: "part" }), stoff = [material("paint", p.color1), material("paint", p.color2)], t = new Parts();
    for (const s of stoff) s.side = DoubleSide;
    const w = p.width, d = p.depth, h = p.height, vorn = d / 2, hinten = -d / 2, ueber = 0.25, pf = 0.08, fuge = 0.003;
    const steig = p.roof === "sloped" ? 0.45 : p.roof === "peaked" ? 0.55 : 0;
    // Roof height at depth z; posts reach up to it
    const dach = (z: number) => (p.roof === "sloped" ? h + (steig * (vorn - z)) / d : p.roof === "peaked" ? h + steig * (1 - Math.abs(z) / vorn) : h);
    const pfosten = [-w / 2 + pf / 2, w / 2 - pf / 2].flatMap((x) => [vorn - pf / 2, hinten + pf / 2].map((z) => [x, z]));
    for (const [x, z] of pfosten) t.add(holz, rounded(pf, dach(z), pf, 0.008, x, dach(z) / 2, z));
    // Counter top: boards along x with 3 mm joints, 3 mm in from the post faces, on two bearers running front to back
    const k = Math.round(0.6 / 0.15), bt = (0.6 - 0.003 - (k - 1) * fuge) / k;
    for (let i = 0; i < k; i++) t.add(holz, grained(rounded(w - 0.006, 0.04, bt, 0.006, 0, p.counter - 0.02, vorn - 0.003 - bt / 2 - i * (bt + fuge)), "x"));
    // Counter front: upright boards between the posts, closed from behind by a lining 2 mm back
    const innen = w - 2 * pf, fh = p.counter - 0.04, m = Math.max(1, Math.round(innen / 0.12)), fb = (innen - (m - 1) * fuge) / m;
    for (let i = 0; i < m; i++) t.add(holz, rounded(fb, fh, 0.02, 0.004, -innen / 2 + fb / 2 + i * (fb + fuge), fh / 2, vorn - 0.03));
    const futter = vorn - 0.04 - 0.002 - 0.006;
    t.add(holz, grained(rounded(innen, fh, 0.012, 0.002, 0, fh / 2, futter), "x"));
    const tr0 = vorn - 0.6 + 0.02, tr1 = futter - 0.006;
    for (const s of [-1, 1]) t.add(holz, grained(rounded(0.05, 0.05, tr1 - tr0, 0.006, s * (innen / 2 - 0.03), p.counter - 0.065, (tr0 + tr1) / 2), "z"));
    t.add(holz, grained(rounded(innen, 0.05, 0.05, 0.008, 0, h - 0.06, vorn - pf / 2), "x"));
    // The cloth: strips across the width, in two colours, each sagging between the two lines of the roof planes
    const n = Math.max(1, p.stripes), b = (w + 0.2) / n, x0 = -(w + 0.2) / 2;
    const flaechen: [number, number][] = p.roof === "peaked" ? [[vorn + ueber, 0], [0, hinten - 0.1]] : [[vorn + ueber, hinten - 0.1]];
    const tuch = ([z0, z1]: [number, number], v: number) => {
      const y0 = dach(z0), y1 = dach(z1), lang = Math.hypot(z1 - z0, y1 - y0);
      return y0 + (y1 - y0) * v + 0.03 - 0.03 * lang * Math.sin(Math.PI * v);
    };
    // The cloth rests on the posts: lift it where the sag would reach a post top
    let heben = 0;
    for (const [, z] of pfosten) for (let j = -2; j <= 2; j++) {
      const zz = z + (j * pf) / 4, f = flaechen.find(([a, c]) => (zz - a) * (zz - c) <= 0)!;
      heben = Math.max(heben, dach(z) + 0.004 - tuch(f, (zz - f[0]) / (f[1] - f[0])));
    }
    for (const f of flaechen) for (let i = 0; i < n; i++) {
      const g = grid(2, 8, (u, v) => new Vector3(x0 + b * (i + u), tuch(f, v) + heben, f[0] + (f[1] - f[0]) * v), () => new Vector3(0, 1, 0));
      t.add(stoff[p.stripes ? i % 2 : 0], g);
    }
    // A valance hanging from the front edge, striped like the roof, ending in rounded tongues (wide strips get several)
    const oben = dach(vorn + ueber) + 0.03 + heben, zungen = Math.ceil(b / 0.45 - 1e-6), zb = b / zungen, r = zb / 2;
    for (let i = 0; i < n; i++) for (let j = 0; j < zungen; j++) {
      const s = new Shape().moveTo(-r, 0).lineTo(-r, -0.12);
      s.absarc(0, -0.12, r, Math.PI, 2 * Math.PI, false);
      s.lineTo(r, 0).closePath();
      t.add(stoff[p.stripes ? i % 2 : 0], new ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: false, curveSegments: 8 }).translate(x0 + b * i + zb * (j + 0.5), oben, vorn + ueber - 0.005));
    }
    return t.group();
  },
});
