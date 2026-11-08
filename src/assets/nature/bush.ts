import { IcosahedronGeometry } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const bush = defineAsset({
  id: "bush", category: "nature",
  title: { de: "Busch", en: "Bush" },
  description: { de: "Ein Busch aus Laubballen, von einem kleinen Strauch bis zur Hecke, auf Wunsch blühend; jeder Seed wächst anders.", en: "A bush of leaf clusters, from a small shrub to a hedge, flowering if you like; every seed grows differently." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.4, max: 3, step: 0.05, default: 1.2, unit: "m",
      describe: { de: "Breite: 0,5 m ein kleiner Strauch, 1,2 m ein Busch, 3 m ein Stück Hecke.", en: "Width: 0.5 m a small shrub, 1.2 m a bush, 3 m a piece of hedge." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.3, max: 2, step: 0.05, default: 0.9, unit: "m",
      describe: { de: "Höhe: 0,4 m bodennah, 0,9 m kniehoch bis hüfthoch, 1,8 m mannshoch.", en: "Height: 0.4 m low, 0.9 m knee to hip high, 1.8 m as tall as a person." } },
    clusters: { type: "integer", label: { de: "Laubballen", en: "Clusters" }, min: 3, max: 24, default: 10,
      describe: { de: "Zahl der Laubballen: 4 locker, 10 üblich, 24 dicht wie eine Hecke.", en: "Number of leaf clusters: 4 loose, 10 usual, 24 dense like a hedge." } },
    flowers: { type: "number", label: { de: "Blüten", en: "Flowers" }, min: 0, max: 1, step: 0.05, default: 0,
      describe: { de: "Wie viele Blüten: 0 keine, 0,4 einige, 1 in voller Blüte.", en: "How many flowers: 0 none, 0.4 some, 1 in full bloom." } },
    leafColor: { type: "color", label: { de: "Laub", en: "Leaves" }, default: "#3f7d3a",
      describe: { de: "Farbe des Laubs.", en: "Colour of the leaves." } },
    flowerColor: { type: "color", label: { de: "Blüten", en: "Flowers" }, default: "#e05a8a",
      describe: { de: "Farbe der Blüten: Rosa #e05a8a, Weiß #f4f1e8, Gelb #f0c419.", en: "Colour of the flowers: pink #e05a8a, white #f4f1e8, yellow #f0c419." } },
  },
  presets: {
    shrub: { label: { de: "Strauch", en: "Shrub" }, values: { width: 0.7, height: 0.6, clusters: 6 } },
    hedge: { label: { de: "Hecke", en: "Hedge" }, values: { width: 3, height: 1.4, clusters: 24, leafColor: "#2f6a35" } },
    flowering: { label: { de: "Blühend", en: "Flowering" }, values: { flowers: 0.7, leafColor: "#4a8a3e" } },
  },
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 8000, drawCalls: 2 },
  build(p, seed) {
    const r = rng(seed), laub = material("leaf", p.leafColor), bluete = material("paint", p.flowerColor), t = new Parts();
    laub.flatShading = true;
    const W = p.width, H = p.height, basis = Math.min(W * 0.5, H) * 0.42;
    const ballen: [number, number, number, number][] = [];
    for (let i = 0; i < p.clusters; i++) {
      // The first cluster sits on the ground in the middle; the rest fill an ellipsoid above and around it
      const rad = basis * (0.7 + 0.5 * r()), x = i ? (r() - 0.5) * (W - 2 * rad) : 0, z = i ? (r() - 0.5) * Math.max(0, Math.min(W, H * 1.5) - 2 * rad) : 0;
      // (an icosahedron's lowest corner is a little above its radius: rest it on that)
      const g = new IcosahedronGeometry(rad, 1);
      g.computeBoundingBox();
      const boden = -g.boundingBox!.min.y, oben = Math.max(boden, H - rad), y = i ? boden + r() * (oben - boden) * (1 - (2 * Math.abs(x)) / Math.max(W, 0.01)) : boden;
      ballen.push([x, y, z, rad]);
      // Face normals in the geometry itself, so the faceted look survives the export (glTF has no flat shading)
      g.translate(x, y, z).computeVertexNormals();
      t.add(laub, g);
    }
    // Flowers on the upper surface of the clusters
    const n = Math.round(p.flowers * p.clusters * 7);
    for (let k = 0; k < n; k++) {
      const [x, y, z, rad] = ballen[Math.floor(r() * ballen.length)], u = r() * Math.PI * 2, v = r() * Math.PI * 0.45;
      t.add(bluete, new IcosahedronGeometry(0.025 + 0.02 * r(), 0).translate(x + rad * Math.sin(v) * Math.cos(u), y + rad * Math.cos(v), z + rad * Math.sin(v) * Math.sin(u)));
    }
    return t.group();
  },
});
