import { Float32BufferAttribute, IcosahedronGeometry, Vector3, type BufferGeometry } from "three";
import { mergeVertices, toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { fbm3 } from "../../core/noise";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const rock = defineAsset({
  id: "rock", category: "nature",
  title: { de: "Fels", en: "Rock" },
  description: { de: "Gebrochener Fels mit Bruchflächen und Standfläche; Rauheit, Abflachung und Seed formen ihn.", en: "A broken rock with fracture faces and a flat base; roughness, flattening and the seed shape it." },
  params: {
    size: { type: "number", label: { de: "Größe", en: "Size" }, min: 0.1, max: 5, step: 0.05, default: 1, unit: "m",
      describe: { de: "Grundgröße in Metern; die Streckung macht ihn länger.", en: "Base size in metres; stretch makes it longer." } },
    detail: { type: "integer", label: { de: "Detail", en: "Detail" }, min: 1, max: 20, default: 6,
      describe: { de: "Unterteilung der Grundform: niedrig wirkt kantig (Low Poly), hoch rund.", en: "Subdivision of the base shape: low looks faceted (low poly), high looks round." } },
    roughness: { type: "number", label: { de: "Rauheit", en: "Roughness" }, min: 0, max: 0.6, step: 0.01, default: 0.3,
      describe: { de: "Wie stark die Oberfläche verbeult ist.", en: "How strongly the surface is dented." } },
    flatten: { type: "number", label: { de: "Abflachung", en: "Flattening" }, min: 0, max: 0.8, step: 0.01, default: 0.3,
      describe: { de: "Drückt den Fels flach; hohe Werte ergeben Platten.", en: "Squashes the rock; high values make slabs." } },
    stretch: { type: "number", label: { de: "Streckung", en: "Stretch" }, min: 0.5, max: 2.5, step: 0.05, default: 1.3,
      describe: { de: "Streckt den Fels in der Länge (x).", en: "Stretches the rock along its length (x)." } },
    moss: { type: "number", label: { de: "Moos", en: "Moss" }, min: 0, max: 1, step: 0.05, default: 0.3,
      describe: { de: "Moos und Flechten auf den Flächen, die nach oben zeigen: 0 kahler Fels, 0,3 ein Stein im Wald, 0,8 dicht bewachsen.", en: "Moss and lichen on the faces that look up: 0 bare rock, 0.3 a stone in a forest, 0.8 thickly overgrown." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a8d91",
      describe: { de: "Grundfarbe des Gesteins.", en: "Base colour of the stone." } },
  },
  presets: {
    boulder: { label: { de: "Findling", en: "Boulder" }, values: { size: 2.5, roughness: 0.35 } },
    pebble: { label: { de: "Kiesel", en: "Pebble" }, values: { size: 0.15, detail: 3, roughness: 0.1, flatten: 0.5 } },
    slab: { label: { de: "Steinplatte", en: "Slab" }, values: { roughness: 0.15, flatten: 0.7, stretch: 2 } },
    "low-poly": { label: { de: "Low Poly", en: "Low poly" }, values: { detail: 1, roughness: 0.4 } },
  },
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 100000, drawCalls: 1 },
  build(p, seed) {
    const m = material("stone", p.color, 2 / p.size, undefined, { moss: p.moss });
    // Low detail stays a faceted low-poly rock; from 4 on the rock is smooth and finely subdivided
    const facettiert = p.detail <= 3;
    m.flatShading = facettiert;
    const stufe = facettiert ? p.detail : p.detail * 3 + 6;
    let g: BufferGeometry = new IcosahedronGeometry(1, stufe);
    g.deleteAttribute("normal");
    g.deleteAttribute("uv");
    g = mergeVertices(g);
    // Fracture planes: a rock is broken stone, so a few random planes cut flat faces into the round shape
    const r = rng(seed * 7 + 3), ebenen: { n: Vector3; d: number }[] = [];
    for (let k = 0; k < 12; k++) {
      const n = new Vector3(r() * 2 - 1, (r() * 2 - 1) * 0.7, r() * 2 - 1).normalize();
      ebenen.push({ n, d: 0.52 + r() * 0.3 });
    }
    const pos = g.attributes.position, v = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const f = 1 + p.roughness * (fbm3(v.x * 1.8 + 10, v.y * 1.8, v.z * 1.8, seed) - 0.5) * 1.6 + p.roughness * 0.3 * (fbm3(v.x * 6, v.y * 6, v.z * 6, seed + 5) - 0.5);
      v.multiplyScalar(f);
      // Cut after the swelling, so the fracture faces stay flat and meet the rest at an edge
      for (const { n, d } of ebenen) { const s = v.dot(n) - d; if (s > 0) v.addScaledVector(n, -s); }
      // It sits in the ground: the lowest part is cut flat
      v.y = Math.max(v.y, -0.55);
      pos.setXYZ(i, v.x * p.stretch, v.y * (1 - p.flatten), v.z);
    }
    // Smooth where the stone is round, a hard edge where faces meet at more than 50° (the fractures)
    if (facettiert) { g = g.toNonIndexed(); g.computeVertexNormals(); } else g = toCreasedNormals(g, (50 * Math.PI) / 180);
    // Spherical uv: the primitives' attribute set (the bake lays out its own)
    const uv = new Float32Array(g.attributes.position.count * 2);
    for (let i = 0; i < g.attributes.position.count; i++) { v.fromBufferAttribute(g.attributes.position, i).normalize(); uv[2 * i] = 0.5 + Math.atan2(v.z, v.x) / (2 * Math.PI); uv[2 * i + 1] = 0.5 + Math.asin(Math.max(-1, Math.min(1, v.y))) / Math.PI; }
    g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    g.computeBoundingBox();
    const minY = g.boundingBox!.min.y;
    g.scale(p.size / 2, p.size / 2, p.size / 2);
    g.translate(0, -minY * (p.size / 2), 0);
    return new Parts().add(m, g).group();
  },
});
