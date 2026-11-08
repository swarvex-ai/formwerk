import { abs, color, float, mix, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp, voronoi } from "../noise";
import type { F } from "../noise";

export const dirt = defineSurface({
  id: "dirt", category: "ground",
  title: { de: "Erde", en: "Dirt" },
  description: {
    de: "Erdboden: lockere Erde mit Steinchen, nasser Schlamm mit Pfützen oder trockener, rissiger Lehm. Eine Kachel ist 2 × 2 m.",
    en: "Bare ground: loose soil with small stones, wet mud with puddles, or dry, cracked clay. One tile is 2 × 2 m.",
  },
  params: {
    stones: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Steinchen", en: "Stones" },
      describe: { de: "Kleine Steine in der Erde: 0 keine, 0,3 ein Feldweg, 1 steiniger Boden.", en: "Small stones in the soil: 0 none, 0.3 a dirt road, 1 stony ground." } },
    moisture: { type: "number", min: 0, max: 1, step: 0.05, default: 0.2, label: { de: "Nässe", en: "Moisture" },
      describe: { de: "Wie nass: 0 trocken, 0,4 feucht, 1 Schlamm mit Pfützen.", en: "How wet: 0 dry, 0.4 damp, 1 mud with puddles." } },
    cracks: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Risse", en: "Cracks" },
      describe: { de: "Trockenrisse wie in ausgedörrtem Lehm: 0 keine, 0,5 deutlich, 1 tief.", en: "Drying cracks like in parched clay: 0 none, 0.5 clear, 1 deep." } },
    color: { type: "color", default: "#6b4f36", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Braune Erde #6b4f36, roter Lehm #8a4a2f, grauer Boden #6a645a.", en: "Brown soil #6b4f36, red clay #8a4a2f, grey ground #6a645a." } },
  },
  presets: {
    "dirt-road": { label: { de: "Feldweg", en: "Dirt road" }, values: { stones: 0.4, moisture: 0.1 } },
    mud: { label: { de: "Schlamm", en: "Mud" }, values: { stones: 0.1, moisture: 1, color: "#4f3a28" } },
    "cracked-clay": { label: { de: "Rissiger Lehm", en: "Cracked clay" }, values: { stones: 0, moisture: 0, cracks: 0.8, color: "#9a6a45" } },
  },
  tile: 2, depth: 0.03,
  build(p, seed) {
    const erde = color(p.color), stein = vec3(0.32, 0.3, 0.27), wasser = vec3(0.05, 0.05, 0.045);
    return (q, res) => {
      const krume = fbm(q, [48, 48], res, 0.65, seed + 1).toVar(), lage = fbm(q, [4, 4], 256, 0.55, seed + 2, 5).toVar();
      let steinMaske: F = float(0);
      if (p.stones > 0) {
        const v = voronoi(q.mul(28), 28, 1, seed + 3).toVar();
        steinMaske = ramp(v.y, 1 - p.stones * 0.45, 1.01 - p.stones * 0.45).mul(float(1).sub(ramp(v.z, 0.2, 0.38))).toVar();
      }
      let riss: F = float(0);
      if (p.cracks > 0) {
        const r = voronoi(q.mul(8), 8, 0.9, seed + 4).toVar();
        // Cracks run along the borders of large cells
        riss = float(1).sub(ramp(r.x, 0.0, 0.015 + 0.03 * p.cracks)).mul(p.cracks).toVar();
      }
      // Puddles sit in the low parts of the ground
      const pfuetze = p.moisture > 0.5 ? ramp(lage.mul(-1), 1.1 - (p.moisture - 0.5) * 1.6, 1.2 - (p.moisture - 0.5) * 1.6) : float(0);
      const nass = float(p.moisture * 0.6).add(pfuetze.mul(0.4));
      const boden = erde.mul(krume.mul(0.25).add(lage.mul(0.12)).add(1)).mul(float(1).sub(nass.mul(0.45)));
      let col = mix(boden, stein.mul(abs(krume).mul(0.6).add(0.75)), steinMaske);
      col = mix(col, boden.mul(0.35), riss);
      col = mix(col, wasser.add(boden.mul(0.15)), pfuetze);
      const height = float(0.45).add(krume.mul(0.12)).add(lage.mul(0.15)).add(steinMaske.mul(0.3)).sub(riss.mul(0.35)).mul(float(1).sub(pfuetze.mul(0.5))).clamp(0, 1);
      const roughness = mix(float(0.95).add(krume.mul(0.03)), float(0.4), nass.mul(0.6)).mul(float(1).sub(pfuetze.mul(0.9))).add(pfuetze.mul(0.05));
      return { height, color: col, roughness: roughness.clamp(0.04, 1), metalness: float(0) };
    };
  },
});
