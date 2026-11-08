import { BoxGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

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
  budget: { triangles: 3000, drawCalls: 3 },
  build(p) {
    const holz = material("wood", p.wood), stoff = [material("paint", p.color1), material("paint", p.color2)], t = new Parts();
    const w = p.width, d = p.depth, h = p.height, vorn = d / 2, hinten = -d / 2, ueber = 0.25, pf = 0.08;
    const steig = p.roof === "sloped" ? 0.45 : p.roof === "peaked" ? 0.55 : 0;
    // Roof height at depth z; posts reach up to it
    const dach = (z: number) => (p.roof === "sloped" ? h + (steig * (vorn - z)) / d : p.roof === "peaked" ? h + steig * (1 - Math.abs(z) / vorn) : h);
    for (const x of [-w / 2 + pf / 2, w / 2 - pf / 2]) for (const z of [vorn - pf / 2, hinten + pf / 2]) t.box(holz, pf, dach(z), pf, x, dach(z) / 2, z);
    t.box(holz, w, 0.06, 0.6, 0, p.counter - 0.03, vorn - 0.3);
    t.box(holz, w - 2 * pf, p.counter - 0.06, 0.03, 0, (p.counter - 0.06) / 2, vorn - 0.03);
    t.box(holz, w - 2 * pf, 0.05, 0.05, 0, h - 0.06, vorn - pf / 2);
    // The cloth: strips across the width, in two colours, as one or two sloping planes
    const n = Math.max(1, p.stripes), b = (w + 0.2) / n;
    const flaeche = (z0: number, z1: number) => {
      const y0 = dach(z0), y1 = dach(z1), lang = Math.hypot(z1 - z0, y1 - y0), neig = Math.atan2(y1 - y0, z0 - z1);
      for (let i = 0; i < n; i++) {
        const g = new BoxGeometry(b, 0.015, lang).rotateX(neig).translate(-(w + 0.2) / 2 + b * (i + 0.5), (y0 + y1) / 2 + 0.03, (z0 + z1) / 2);
        t.add(stoff[p.stripes ? i % 2 : 0], g);
      }
    };
    if (p.roof === "peaked") { flaeche(vorn + ueber, 0); flaeche(0, hinten - 0.1); }
    else flaeche(vorn + ueber, hinten - 0.1);
    // A valance hanging from the front edge, striped like the roof
    for (let i = 0; i < n; i++) t.box(stoff[p.stripes ? i % 2 : 0], b, 0.18, 0.01, -(w + 0.2) / 2 + b * (i + 0.5), dach(vorn + ueber) - 0.06, vorn + ueber);
    return t.group();
  },
});
