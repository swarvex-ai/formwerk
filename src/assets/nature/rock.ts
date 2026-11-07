import { IcosahedronGeometry } from "three";
import { fbm3 } from "../../core/noise";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const rock = defineAsset({
  id: "rock", category: "nature",
  title: { de: "Fels", en: "Rock" },
  description: { de: "Fels aus verformtem Ikosaeder; Rauheit, Abflachung und Seed formen ihn.", en: "A rock from a displaced icosahedron; roughness, flattening and the seed shape it." },
  params: {
    size: { type: "number", label: { de: "Größe", en: "Size" }, min: 0.1, max: 5, step: 0.05, default: 1, unit: "m" },
    detail: { type: "integer", label: { de: "Detail", en: "Detail" }, min: 1, max: 20, default: 6 },
    roughness: { type: "number", label: { de: "Rauheit", en: "Roughness" }, min: 0, max: 0.6, step: 0.01, default: 0.3 },
    flatten: { type: "number", label: { de: "Abflachung", en: "Flattening" }, min: 0, max: 0.8, step: 0.01, default: 0.3 },
    stretch: { type: "number", label: { de: "Streckung", en: "Stretch" }, min: 0.5, max: 2.5, step: 0.05, default: 1.3 },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a8d91" },
  },
  budget: { triangles: 9000, drawCalls: 1 },
  build(p, seed) {
    const m = material("stone", p.color, 2 / p.size);
    m.flatShading = true;
    const g = new IcosahedronGeometry(1, p.detail);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const f = 1 + p.roughness * (fbm3(x * 1.8 + 10, y * 1.8, z * 1.8, seed) - 0.5) * 2.2;
      pos.setXYZ(i, x * f * p.stretch, y * f * (1 - p.flatten), z * f);
    }
    g.computeVertexNormals();
    g.computeBoundingBox();
    const minY = g.boundingBox!.min.y;
    g.scale(p.size / 2, p.size / 2, p.size / 2);
    g.translate(0, -minY * (p.size / 2), 0);
    return new Parts().add(m, g).group();
  },
});
