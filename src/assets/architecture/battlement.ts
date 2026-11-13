import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const battlement = defineAsset({
  id: "battlement", category: "architecture",
  title: { de: "Zinnenmauer", en: "Battlement" },
  description: { de: "Ein Stück Burgmauer mit Wehrgang und Zinnen, wahlweise mit vorkragendem Gesims.", en: "A section of castle wall with a wall walk and merlons, optionally with a projecting corbel course." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 2, max: 8, step: 0.1, default: 4, unit: "m",
      describe: { de: "Länge des Mauerabschnitts; 4 m zwischen zwei Türmen, 8 m als lange Wehrmauer.", en: "Length of the wall section; 4 m between two towers, 8 m for a long curtain wall." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1, max: 8, step: 0.1, default: 4, unit: "m",
      describe: { de: "Höhe bis zum Wehrgang ohne Zinnen; 2 m Gartenmauer, 4 m Burgmauer, 8 m Stadtmauer.", en: "Height up to the wall walk without merlons; 2 m garden wall, 4 m castle wall, 8 m city wall." } },
    thickness: { type: "number", label: { de: "Dicke", en: "Thickness" }, min: 0.6, max: 3, step: 0.05, default: 1.5, unit: "m",
      describe: { de: "Mauerdicke; 0,8 m schmale Mauer, 1,5 m Burgmauer, 3 m Festungswall.", en: "Wall thickness; 0.8 m narrow wall, 1.5 m castle wall, 3 m fortress rampart." } },
    merlons: { type: "integer", label: { de: "Zinnen", en: "Merlons" }, min: 2, max: 12, default: 4,
      describe: { de: "Anzahl der Zinnen entlang der Mauer, typischerweise etwa eine pro Meter.", en: "Number of merlons along the wall, typically about one per metre." } },
    merlonWidth: { type: "number", label: { de: "Zinnenbreite", en: "Merlon width" }, min: 0.3, max: 0.8, step: 0.05, default: 0.6,
      describe: { de: "Anteil jeder Zinne an ihrem Feld, der Rest bleibt als Zinnenlücke frei.", en: "Share of each merlon in its bay, the rest remains as the gap." } },
    merlonHeight: { type: "number", label: { de: "Zinnenhöhe", en: "Merlon height" }, min: 0.4, max: 1.4, step: 0.05, default: 0.9, unit: "m",
      describe: { de: "Höhe der Zinnen über dem Wehrgang; 0,9 m deckt eine Person bis zur Brust.", en: "Height of the merlons above the wall walk; 0.9 m covers a person to the chest." } },
    corbels: { type: "boolean", label: { de: "Kragsteine", en: "Corbels" }, default: true,
      describe: { de: "Vorkragendes Gesims unter den Zinnen an der Außenseite.", en: "A projecting band below the merlons on the outer face." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#9a958c",
      describe: { de: "Grundfarbe des Steinmaterials: Grauer Kalkstein #9a958c, Sandstein #b39b7a, Granit #6e6a66.", en: "Base colour of the stone: grey limestone #9a958c, sandstone #b39b7a, granite #6e6a66." } },
  },
  presets: {
    "castle-wall": { label: { de: "Burgmauer", en: "Castle wall" }, values: { length: 4, height: 4, merlons: 4 } },
    "city-wall": { label: { de: "Stadtmauer", en: "City wall" }, values: { length: 8, height: 7, thickness: 2.2, merlons: 8, merlonHeight: 1.1, color: "#b39b7a" } },
    "garden-wall": { label: { de: "Gartenmauer", en: "Garden wall" }, values: { length: 3, height: 1.6, thickness: 0.6, merlons: 6, merlonWidth: 0.5, merlonHeight: 0.4, corbels: false } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 400, drawCalls: 1 },
  build(p) {
    const m = material("stone", p.color, 1);
    const t = new Parts();
    const L = p.length, H = p.height, T = p.thickness;
    t.box(m, L, H, T, 0, H / 2, 0);
    const ueber = p.corbels ? 0.15 : 0;
    const tiefe = Math.min(0.5, T * 0.4);
    const zVorn = T / 2 + ueber;
    if (p.corbels) {
      t.box(m, L, 0.3, tiefe + ueber, 0, H - 0.15, zVorn - (tiefe + ueber) / 2);
    }
    const feld = L / p.merlons;
    const breite = feld * p.merlonWidth;
    for (let i = 0; i < p.merlons; i++) {
      t.box(m, breite, p.merlonHeight, tiefe, -L / 2 + feld * (i + 0.5), H + p.merlonHeight / 2, zVorn - tiefe / 2);
    }
    return t.group();
  },
});
