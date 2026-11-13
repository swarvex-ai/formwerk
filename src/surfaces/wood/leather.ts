import { abs, color, float, mix, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp, voronoi } from "../noise";

export const leather = defineSurface({
  id: "leather", category: "wood",
  title: { de: "Leder", en: "Leather" },
  description: {
    de: "Körniges Leder mit feinen Knickfalten und gescheuerten Kanten: von der Ledergarnitur bis zum Sattel. Eine Kachel ist 25 × 25 cm, jeder Seed legt ein anderes Bild.",
    en: "Pebbled leather with fine creases and worn edges: from sofa upholstery to a saddle. One tile is 25 × 25 cm, every seed lays another hide.",
  },
  params: {
    grainSize: { type: "integer", min: 8, max: 32, default: 16, label: { de: "Körner pro Kachel", en: "Grains per tile" },
      describe: { de: "Wie viele Körner über eine Kachel von 25 cm laufen: 8 grobes Rindsleder, 16 gewöhnliches Sattelleder, 32 feines Ziegenleder.", en: "How many grains run across a tile of 25 cm: 8 coarse cowhide, 16 usual saddle leather, 32 fine goat skin." } },
    wear: { type: "number", min: 0, max: 1, step: 0.05, default: 0.2, label: { de: "Abnutzung", en: "Wear" },
      describe: { de: "Wie gespielt das Leder ist: 0 neu und steif, 0,4 eine gebrauchte Tasche, 1 ein durchgesessenes Sofa mit hellen, flachen Kanten.", en: "How worked-in the leather is: 0 new and stiff, 0.4 a used bag, 1 a worn sofa with pale, flat crests." } },
    creaseDepth: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Faltentiefe", en: "Crease depth" },
      describe: { de: "Tiefe der feinen Knickfalten zwischen den Körnern: 0 glattes Lackleder, 0,4 eine weiche Tasche, 1 stark geknicktes altes Leder.", en: "Depth of the fine creases between the grains: 0 smooth glazed leather, 0.4 a soft bag, 1 much creased old leather." } },
    color: { type: "color", default: "#6e4a2e", label: { de: "Lederfarbe", en: "Leather colour" },
      describe: { de: "Grundfarbe des Leders: Naturbraun für pflanzlich gegerbtes, Dunkelbraun für Sättel, Schwarz für Handschuhe.", en: "Base colour of the leather: natural brown for vegetable-tanned, dark brown for saddles, black for gloves." } },
  },
  presets: {
    "cowhide-brown": { label: { de: "Rindsleder braun", en: "Brown cowhide" }, values: { grainSize: 12, wear: 0.1, creaseDepth: 0.3, color: "#7c5330" } },
    "black-saddle": { label: { de: "Schwarzer Sattel", en: "Black saddle" }, values: { grainSize: 20, wear: 0.3, creaseDepth: 0.55, color: "#2c2620" } },
    "worn-sofa": { label: { de: "Abgenutztes Sofa", en: "Worn sofa" }, values: { grainSize: 26, wear: 0.85, creaseDepth: 0.5, color: "#8a6a50" } },
  },
  tile: 0.25, depth: 0.001,
  build(p, seed) {
    const leder = color(p.color);
    return (q, res) => {
      const n = p.grainSize;
      const v = voronoi(q.mul(n), n, 0.9, seed).toVar();
      // Pebbled grain: every cell rises like a dome, its edges sink into the crease between the grains
      const beule = float(1).sub(ramp(v.z, 0.2, 0.95)).toVar();
      const ritze = ramp(v.z, 0.45, 0.95).toVar();
      // Large folds at a fixed resolution (the same shape at every bake size), creases as ridged fbm, pores on the grains
      const falten = fbm(q, [3, 3], 128, 0.55, seed + 10, 4).toVar();
      const knick = float(1).sub(abs(fbm(q, [12, 12], res, 0.5, seed + 20, 5))).toVar();
      const knicke = knick.mul(knick).mul(knick).toVar();
      const poren = fbm(q, [n * 4, n * 4], res, 0.6, seed + 30).toVar();
      const height = float(0.5).add(falten.mul(0.12))
        .add(beule.mul(0.4).mul(float(1).sub(p.wear * 0.55)))
        .add(poren.mul(0.04).mul(float(1).sub(p.wear * 0.6)))
        .sub(knicke.mul(p.creaseDepth * 0.35)).clamp(0, 1);
      const ton = leder.mul(v.y.mul(0.18).sub(0.09).add(1)).mul(float(1).sub(ritze.mul(0.5))).mul(falten.mul(0.06).add(poren.mul(0.06)).add(1));
      const gescheuert = ramp(beule, 0.5, 0.85).mul(p.wear).toVar();
      const col = mix(ton, ton.mul(1.45).add(vec3(0.05, 0.04, 0.03)), gescheuert);
      const roughness = mix(float(0.55).add(poren.mul(0.06)), float(0.82), ritze).sub(gescheuert.mul(0.2)).clamp(0.05, 1);
      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
