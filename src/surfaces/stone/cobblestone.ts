import { color, float, mix, vec2, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp, voronoi } from "../noise";

export const cobblestone = defineSurface({
  id: "cobblestone", category: "stone",
  title: { de: "Pflaster", en: "Cobblestones" },
  description: {
    de: "Pflaster aus unregelmäßigen Steinen mit Fugen aus Sand, auf Wunsch mit Moos: vom Altstadtpflaster bis zu flachen Steinplatten. Eine Kachel ist 1 × 1 m, jeder Seed legt andere Steine.",
    en: "Paving of irregular stones with sandy joints, mossy if you like: from old-town cobbles to flat flagstones. One tile is 1 × 1 m, every seed lays other stones.",
  },
  params: {
    stones: { type: "integer", min: 3, max: 14, default: 7, label: { de: "Steine pro Meter", en: "Stones per metre" },
      describe: { de: "Wie viele Steine auf einen Meter kommen: 4 große Platten, 7 Pflastersteine, 12 kleines Kopfsteinpflaster.", en: "How many stones fit into a metre: 4 large slabs, 7 paving stones, 12 small cobbles." } },
    joint: { type: "number", min: 0.02, max: 0.25, step: 0.01, default: 0.08, label: { de: "Fugenbreite", en: "Joint width" },
      describe: { de: "Breite der Fugen im Verhältnis zum Stein: 0,03 eng verlegte Platten, 0,08 Pflaster, 0,2 lose Steine in Erde.", en: "Width of the joints against a stone: 0.03 tightly laid slabs, 0.08 paving, 0.2 loose stones in soil." } },
    roundness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Wölbung", en: "Roundness" },
      describe: { de: "Wie rund die Steine gewölbt sind: 0 flache Platten mit Kante, 0,6 abgelaufenes Pflaster, 1 runde Feldsteine.", en: "How domed the stones are: 0 flat slabs with an edge, 0.6 worn paving, 1 round field stones." } },
    irregularity: { type: "number", min: 0, max: 1, step: 0.05, default: 0.8, label: { de: "Unregelmäßigkeit", en: "Irregularity" },
      describe: { de: "Wie ungleich die Steine sind: 0 ein fast regelmäßiges Raster, 1 wild verlegt.", en: "How uneven the stones are: 0 an almost regular grid, 1 laid wildly." } },
    variation: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Farbvielfalt", en: "Colour variation" },
      describe: { de: "Wie verschieden die Steine gefärbt sind: 0 alle gleich, 1 deutlich hell und dunkel gemischt.", en: "How different the stones are in colour: 0 all alike, 1 clearly mixed light and dark." } },
    moss: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Moos", en: "Moss" },
      describe: { de: "Moos in den Fugen und an den Rändern: 0 sauber, 0,4 ein schattiger Hof, 1 ein vergessener Weg.", en: "Moss in the joints and on the edges: 0 clean, 0.4 a shady yard, 1 a forgotten path." } },
    color: { type: "color", default: "#8c867c", label: { de: "Steinfarbe", en: "Stone colour" },
      describe: { de: "Grundfarbe der Steine: Grau für Granit, Beige für Sandstein, Rötlich für Porphyr.", en: "Base colour of the stones: grey for granite, beige for sandstone, reddish for porphyry." } },
    jointColor: { type: "color", default: "#7a6a52", label: { de: "Fugenfarbe", en: "Joint colour" },
      describe: { de: "Farbe von Sand oder Mörtel in den Fugen.", en: "Colour of the sand or mortar in the joints." } },
  },
  presets: {
    "old-town": { label: { de: "Altstadt", en: "Old town" }, values: { stones: 9, joint: 0.07, roundness: 0.75, irregularity: 0.6, color: "#7d7a76" } },
    flagstones: { label: { de: "Steinplatten", en: "Flagstones" }, values: { stones: 4, joint: 0.03, roundness: 0.1, irregularity: 1, color: "#9b9282", jointColor: "#5f5546" } },
    mossy: { label: { de: "Bemoost", en: "Mossy" }, values: { stones: 6, joint: 0.12, roundness: 0.8, moss: 0.8, color: "#6f6c64", jointColor: "#4e4636" } },
  },
  tile: 1, depth: 0.04,
  build(p, seed) {
    const n = p.stones, halb = p.joint / 2, stein = color(p.color), fuge = color(p.jointColor), moos = vec3(0.07, 0.13, 0.03);
    return (q, res) => {
      // Warped cells: stones with uneven sides; the warp tiles with the cells
      const w = vec2(fbm(q, [n, n], 64, 0.5, seed + 10, 3), fbm(q, [n, n], 64, 0.5, seed + 20, 3)).mul(0.18);
      const v = voronoi(q.mul(n).add(w), n, p.irregularity, seed).toVar();
      const rand = v.y, rand2 = v.y.mul(7.13).fract();
      const kante = ramp(v.x, halb, halb + 0.04 + 0.32 * p.roundness);
      const fein = fbm(q, [24, 24], res, 0.55, seed + 30).toVar(), poren = fbm(q, [96, 96], res, 0.7, seed + 40).toVar();
      const height = kante.mul(rand2.mul(0.25).add(0.75)).add(fein.mul(0.06)).add(poren.mul(0.03).mul(kante));
      const fugenAnteil = float(1).sub(ramp(v.x, halb * 0.7, halb + 0.02)).toVar();
      const moosMaske = p.moss > 0 ? ramp(fbm(q, [6, 6], 256, 0.5, seed + 50, 4).add(fugenAnteil.mul(0.8)).sub(kante.mul(0.3)), 0.9 - p.moss, 1.3 - p.moss) : float(0);
      const steinFarbe = stein.mul(rand.sub(0.5).mul(p.variation * 0.6).add(1)).mul(fein.mul(0.25).add(poren.mul(0.12)).add(0.95));
      const sand = fuge.mul(poren.mul(0.3).add(0.85));
      const col = mix(mix(steinFarbe, sand, fugenAnteil), moos.mul(fein.mul(0.4).add(1)), moosMaske);
      const roughness = mix(poren.mul(0.12).add(0.72), float(0.95), fugenAnteil.max(moosMaske));
      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
