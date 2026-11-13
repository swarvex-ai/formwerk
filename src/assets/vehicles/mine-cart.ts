import { CylinderGeometry, SphereGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const mineCart = defineAsset({
  id: "mine-cart", category: "vehicles",
  title: { de: "Loren", en: "Mine cart" },
  description: {
    de: "Eine kleine Lore auf vier Spurkranzrädern für Minenstollen, Zwergenhallen, Steinbrüche und Grubenbahnen, wahlweise mit Gleis und Erzladung.",
    en: "A small open tub on four flanged wheels for mine tunnels, dwarf halls, quarries and railways, optionally on track with an ore heap.",
  },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 0.8, max: 1.6, step: 0.05, default: 1, unit: "m",
      describe: { de: "Länge des Kastens: 0,8 m ein Handkarren, 1 m üblich, 1,6 m ein großer Förderkasten.", en: "Length of the tub: 0.8 m a hand tub, 1 m usual, 1.6 m a large hopper." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.5, max: 1, step: 0.01, default: 0.7, unit: "m",
      describe: { de: "Außenbreite des Kastens.", en: "Outer width of the tub." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.3, max: 0.7, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Höhe der Kastenwände.", en: "Height of the tub walls." } },
    wheelRadius: { type: "number", label: { de: "Radradius", en: "Wheel radius" }, min: 0.1, max: 0.2, step: 0.005, default: 0.14, unit: "m",
      describe: { de: "Radius der Räder.", en: "Radius of the wheels." } },
    body: { type: "choice", label: { de: "Kasten", en: "Body" }, options: ["wood", "metal"], labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" } }, default: "wood",
      describe: { de: "Geplankter Holzkasten oder genieteter Stahlkasten.", en: "Planked wooden tub or riveted steel tub." } },
    rails: { type: "boolean", label: { de: "Gleis", en: "Rails" }, default: true,
      describe: { de: "Ein Stück Schiene mit Holzschwellen unter der Lore.", en: "A piece of track with sleepers under the cart." } },
    load: { type: "number", label: { de: "Ladung", en: "Load" }, min: 0, max: 1, step: 0.05, default: 0.6,
      describe: { de: "Haufen im Kasten: 0 leer, 0,6 üblich, 1 über den Rand gehäuft.", en: "Heap in the tub: 0 empty, 0.6 usual, 1 heaped over the rim." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#7a5a3a",
      describe: { de: "Farbe des Kastens.", en: "Colour of the tub." } },
    metalColor: { type: "color", label: { de: "Metall", en: "Metal" }, default: "#3c3c3c",
      describe: { de: "Farbe von Rädern, Achsen, Eckbeschlägen und Schienen.", en: "Colour of wheels, axles, corner irons and rails." } },
    loadColor: { type: "color", label: { de: "Ladungsfarbe", en: "Load colour" }, default: "#4a4642",
      describe: { de: "Farbe der Füllung: Gestein oder Kohle.", en: "Colour of the fill: rock or coal." } },
  },
  presets: {
    "ore-cart": { label: { de: "Erzlore", en: "Ore cart" }, values: { load: 0.6, rails: true } },
    "coal-tub": { label: { de: "Kohlelore", en: "Coal tub" }, values: { body: "metal", color: "#5a5e62", loadColor: "#1e1e20", load: 0.9 } },
    "big-hopper": { label: { de: "Großförderkasten", en: "Big hopper" }, values: { length: 1.6, width: 1, depth: 0.7, wheelRadius: 0.2 } },
    empty: { label: { de: "Leer", en: "Empty" }, values: { load: 0, rails: false } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 2500, drawCalls: 4 },
  build(p) {
    const L = p.length, W = p.width, D = p.depth, r = p.wheelRadius, g = W * 0.7;
    const wanne = material(p.body === "wood" ? "wood" : "metal", p.color);
    const eisen = material("metal", p.metalColor);
    const balken = material("wood", "#5e4630", 1, 450);
    const t = new Parts();
    const base = p.rails ? 0.07 : 0;
    const yb = base + 2 * r + 0.03;

    if (p.rails) {
      const n = Math.ceil((L + 0.6) / 0.35);
      for (let i = 0; i < n; i++) {
        t.box(balken, g + 0.3, 0.04, 0.12, 0, 0.02, -(L + 0.6) / 2 + 0.06 + (i * (L + 0.6 - 0.12)) / (n - 1));
      }
      for (const s of [-1, 1]) {
        t.box(eisen, 0.03, 0.03, L + 0.6, (s * g) / 2, 0.055, 0);
      }
    }

    const az = Math.max(r + 0.02, L / 2 - r - 0.08);
    for (const z of [-az, az]) {
      t.add(eisen, new CylinderGeometry(0.02, 0.02, g + 0.06, 8).rotateZ(Math.PI / 2).translate(0, base + r, z));
      for (const s of [-1, 1]) {
        t.add(eisen, new CylinderGeometry(r, r, 0.05, 16).rotateZ(Math.PI / 2).translate((s * g) / 2, base + r, z));
        if (p.rails) {
          t.add(eisen, new CylinderGeometry(r + 0.012, r + 0.012, 0.012, 16).rotateZ(Math.PI / 2).translate(s * (g / 2 - 0.031), base + r, z));
        }
      }
    }

    for (const s of [-1, 1]) {
      t.box(balken, 0.06, yb - base - r, L * 0.9, s * (g / 2 - 0.06), base + r + (yb - base - r) / 2, 0);
    }

    t.box(wanne, W, 0.03, L, 0, yb + 0.015, 0);
    for (const s of [-1, 1]) {
      t.box(wanne, 0.03, D, L, s * (W / 2 - 0.015), yb + D / 2, 0);
      t.box(wanne, W - 0.06, D, 0.03, 0, yb + D / 2, s * (L / 2 - 0.015));
    }
    for (const s of [-1, 1]) {
      for (const zs of [-1, 1]) {
        t.box(eisen, 0.04, D + 0.01, 0.04, s * (W / 2 - 0.01), yb + (D + 0.01) / 2, zs * (L / 2 - 0.01));
      }
    }

    if (p.load > 0.02) {
      const erz = material("stone", p.loadColor);
      const steig = (D - 0.03) * p.load * 0.8;
      t.box(erz, W - 0.06, steig, L - 0.06, 0, yb + 0.03 + steig / 2, 0);
      t.add(
        erz,
        new SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2)
          .scale(W / 2 - 0.035, D * 0.3 * p.load + 0.02, L / 2 - 0.035)
          .translate(0, yb + 0.03 + steig, 0),
      );
    }

    return t.group();
  },
});
