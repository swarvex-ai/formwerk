import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

export const cart = defineAsset({
  id: "cart", category: "vehicles",
  title: { de: "Karren", en: "Cart" },
  description: { de: "Ein Holzkarren mit Speichenrädern: Handkarren auf zwei Rädern mit Deichsel, Leiterwagen auf vier oder flache Ladefläche.", en: "A wooden cart with spoked wheels: a hand cart on two wheels with shafts, a wagon on four, or a flatbed." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 0.8, max: 2.4, step: 0.05, default: 1.4, unit: "m",
      describe: { de: "Länge der Ladefläche: 1 m ein Handkarren, 1,4 m üblich, 2,2 m ein Leiterwagen.", en: "Length of the bed: 1 m a hand cart, 1.4 m usual, 2.2 m a wagon." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.6, max: 1.4, step: 0.05, default: 0.9, unit: "m",
      describe: { de: "Breite der Ladefläche ohne Räder.", en: "Width of the bed without the wheels." } },
    wheels: { type: "choice", label: { de: "Räder", en: "Wheels" }, options: ["two", "four"], labels: { two: { de: "Zwei", en: "Two" }, four: { de: "Vier", en: "Four" } }, default: "two",
      describe: { de: "Zwei Räder in der Mitte mit Deichsel zum Ziehen, oder vier Räder mit Zugstange.", en: "Two wheels in the middle with shafts to pull it, or four wheels with a pull bar." } },
    wheelRadius: { type: "number", label: { de: "Radradius", en: "Wheel radius" }, min: 0.2, max: 0.6, step: 0.01, default: 0.38, unit: "m",
      describe: { de: "Radius der Räder: 0,25 m klein, 0,38 m ein Handkarren, 0,55 m ein Bauernwagen.", en: "Radius of the wheels: 0.25 m small, 0.38 m a hand cart, 0.55 m a farm wagon." } },
    sides: { type: "number", label: { de: "Bordwände", en: "Sides" }, min: 0, max: 0.5, step: 0.01, default: 0.25, unit: "m",
      describe: { de: "Höhe der Bordwände: 0 eine flache Ladefläche, 0,25 m üblich, 0,45 m für Heu und Säcke.", en: "Height of the side boards: 0 a flatbed, 0.25 m usual, 0.45 m for hay and sacks." } },
    color: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#9a7148",
      describe: { de: "Farbe des Holzes.", en: "Colour of the wood." } },
    metalColor: { type: "color", label: { de: "Beschläge", en: "Fittings" }, default: "#3c3c3c",
      describe: { de: "Farbe von Reifen, Achse und Naben.", en: "Colour of the tyres, axle and hubs." } },
  },
  presets: {
    "hand-cart": { label: { de: "Handkarren", en: "Hand cart" }, values: { wheels: "two", length: 1.2, sides: 0.22 } },
    wagon: { label: { de: "Leiterwagen", en: "Wagon" }, values: { wheels: "four", length: 2.2, width: 1.2, wheelRadius: 0.45, sides: 0.4 } },
    flatbed: { label: { de: "Plattformwagen", en: "Flatbed" }, values: { wheels: "four", wheelRadius: 0.2, sides: 0, length: 1.2, width: 0.7, color: "#7d8a6a" } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 20000, drawCalls: 2 },
  build(p) {
    const holz = material("wood", p.color, 1, 450, { grain: "part" }), eisen = material("metal", p.metalColor), t = new Parts();
    const r = p.wheelRadius, L = p.length, W = p.width, boden = r + 0.06, d = 0.04;
    // The bed: boards along the cart with 4 mm joints, on two beams that carry it on the axles
    const bretter = Math.max(3, Math.round(W / 0.15)), bb = W / bretter;
    for (let i = 0; i < bretter; i++) t.add(holz, grained(rounded(bb - 0.004, d, L, 0.004, -W / 2 + bb * (i + 0.5), boden + d / 2, 0), "z"));
    for (const x of [-W * 0.3, W * 0.3]) t.add(holz, grained(rounded(0.07, 0.07, L, 0.006, x, boden - 0.035, 0), "z"));
    if (p.sides > 0.02) {
      // Side and end walls from boards 4 mm apart, a stake at each corner outside the side walls
      const reihen = Math.max(1, Math.ceil(p.sides / 0.14)), bh = p.sides / reihen, y0 = boden + d;
      for (let k = 0; k < reihen; k++) {
        const y = y0 + bh * (k + 0.5);
        for (const s of [-1, 1]) {
          t.add(holz, grained(rounded(d, bh - 0.004, L, 0.004, s * (W / 2 - d / 2), y, 0), "z"));
          t.add(holz, grained(rounded(W - 2 * d - 0.002, bh - 0.004, d, 0.004, 0, y, s * (L / 2 - d / 2)), "x"));
        }
      }
      for (const s of [-1, 1]) for (const z of [-L / 2 + 0.05, L / 2 - 0.05]) t.add(holz, rounded(0.05, p.sides + d + 0.06, 0.05, 0.006, s * (W / 2 + 0.025), boden + (p.sides + d + 0.06) / 2, z));
    }
    // A ring of rectangular section about the x axis: inner radius a, outer radius b, width w, centred at x
    const ring = (a: number, b: number, w: number, x: number, z: number) =>
      turned([[a, -w / 2], [b, -w / 2], [b, w / 2], [a, w / 2], [a, -w / 2]], 48).rotateZ(Math.PI / 2).translate(x, r, z);
    // Spoked wheels: iron tyre on a wooden felloe, 12 turned spokes, a turned hub with two iron bands
    const achsen = p.wheels === "two" ? [0] : [-(L / 2 - Math.min(r + 0.05, L * 0.25)), L / 2 - Math.min(r + 0.05, L * 0.25)];
    const spur = W / 2 + 0.07, fi = r - 0.012 - Math.max(0.04, r * 0.13);
    for (const z of achsen) {
      t.add(eisen, turned([[0, 0], [0.03, 0], [0.03, 2 * spur + 0.12], [0, 2 * spur + 0.12]], 12).rotateZ(Math.PI / 2).translate(spur + 0.06, r, z));
      for (const s of [-1, 1]) {
        const x = s * spur;
        t.add(eisen, ring(r - 0.012, r, 0.05, x, z));
        t.add(holz, ring(fi, r - 0.012, 0.045, x, z));
        const lang = fi - 0.055 + 0.01;
        for (let k = 0; k < 12; k++) {
          const sp = turned([[0, 0], [0.018, 0], [0.016, lang * 0.3], [0.012, lang], [0, lang]], 8, 0, 0.055);
          t.add(holz, sp.rotateX((k * Math.PI * 2) / 12).translate(x, r, z));
        }
        t.add(holz, turned([[0, -0.08], [0.042, -0.08], [0.058, -0.04], [0.064, 0], [0.058, 0.04], [0.042, 0.08], [0, 0.08]], 16).rotateZ(Math.PI / 2).translate(x, r, z));
        for (const o of [-0.055, 0.055]) t.add(eisen, ring(0.05, 0.066, 0.012, x + o, z));
      }
    }
    if (p.wheels === "two") {
      // Shafts reaching forward and down to the ground, joined by a bar to pull on
      const lang = 1, neig = Math.atan2(boden - 0.04, lang);
      for (const s of [-1, 1]) t.add(holz, grained(rounded(0.05, 0.05, Math.hypot(lang, boden - 0.04), 0.008).rotateX(neig).translate(s * W * 0.32, (boden + 0.04) / 2 + 0.01, L / 2 + lang / 2 - 0.05), "z"));
      t.add(holz, grained(rounded(W * 0.64 + 0.05, 0.04, 0.04, 0.008, 0, 0.12, L / 2 + lang - 0.15), "x"));
    } else {
      // A pull bar from the front axle down to the ground with a handle
      const lang = 0.9, z0 = L / 2, neig = Math.atan2(boden - 0.04, lang);
      t.add(eisen, rounded(0.035, 0.035, Math.hypot(lang, boden - 0.04), 0.006).rotateX(neig).translate(0, (boden + 0.04) / 2, z0 + lang / 2));
      t.add(eisen, rounded(0.3, 0.035, 0.035, 0.006, 0, 0.05, z0 + lang));
    }
    return t.group();
  },
});
