import { BoxGeometry, CylinderGeometry, TorusGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

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
  budget: { triangles: 9000, drawCalls: 2 },
  build(p) {
    const holz = material("wood", p.color, 1, 450), eisen = material("metal", p.metalColor), t = new Parts();
    const r = p.wheelRadius, L = p.length, W = p.width, boden = r + 0.06, d = 0.04;
    t.box(holz, W, d, L, 0, boden + d / 2, 0);
    // Two beams under the bed carry it on the axles
    for (const x of [-W * 0.3, W * 0.3]) t.box(holz, 0.07, 0.07, L, x, boden - 0.035, 0);
    if (p.sides > 0.02) {
      const y = boden + d + p.sides / 2;
      for (const s of [-1, 1]) t.box(holz, d, p.sides, L, s * (W / 2 - d / 2), y, 0).box(holz, W - 2 * d, p.sides, d, 0, y, s * (L / 2 - d / 2));
      for (const s of [-1, 1]) for (const z of [-L / 2 + 0.05, L / 2 - 0.05]) t.box(holz, 0.05, p.sides + 0.06, 0.05, s * (W / 2 + 0.025), y + 0.03, z);
    }
    // Spoked wheels: a tyre, a rim, spokes and a hub, the axle between them
    const achsen = p.wheels === "two" ? [0] : [-(L / 2 - Math.min(r + 0.05, L * 0.25)), L / 2 - Math.min(r + 0.05, L * 0.25)];
    const spur = W / 2 + 0.07;
    for (const z of achsen) {
      t.add(eisen, new CylinderGeometry(0.03, 0.03, 2 * spur + 0.1, 8).rotateZ(Math.PI / 2).translate(0, r, z));
      for (const s of [-1, 1]) {
        const x = s * spur;
        t.add(eisen, new TorusGeometry(r - 0.025, 0.025, 6, 24).rotateY(Math.PI / 2).translate(x, r, z));
        t.add(holz, new TorusGeometry(r - 0.065, 0.03, 4, 20).rotateY(Math.PI / 2).translate(x, r, z));
        for (let k = 0; k < 6; k++) t.add(holz, new BoxGeometry(0.03, 2 * (r - 0.07), 0.035).rotateX((k * Math.PI) / 6).translate(x, r, z));
        t.add(eisen, new CylinderGeometry(0.06, 0.06, 0.12, 10).rotateZ(Math.PI / 2).translate(x, r, z));
      }
    }
    if (p.wheels === "two") {
      // Shafts reaching forward and down to the ground, joined by a bar to pull on
      const lang = 1, neig = Math.atan2(boden - 0.04, lang);
      for (const s of [-1, 1]) t.add(holz, new BoxGeometry(0.05, 0.05, Math.hypot(lang, boden - 0.04)).rotateX(neig).translate(s * W * 0.32, (boden + 0.04) / 2 + 0.01, L / 2 + lang / 2 - 0.05));
      t.box(holz, W * 0.64 + 0.05, 0.04, 0.04, 0, 0.12, L / 2 + lang - 0.15);
    } else {
      // A pull bar from the front axle down to the ground with a handle
      const lang = 0.9, z0 = L / 2, neig = Math.atan2(boden - 0.04, lang);
      t.add(eisen, new BoxGeometry(0.035, 0.035, Math.hypot(lang, boden - 0.04)).rotateX(neig).translate(0, (boden + 0.04) / 2, z0 + lang / 2));
      t.box(eisen, 0.3, 0.035, 0.035, 0, 0.05, z0 + lang);
    }
    return t.group();
  },
});
