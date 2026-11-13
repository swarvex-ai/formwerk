import { color, float, mix } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp } from "../noise";

export const moss = defineSurface({
  id: "moss", category: "ground",
  title: { de: "Moos", en: "Moss" },
  description: {
    de: "Weiche Moospolster über dunkler Erde: Waldboden, Gartenwege, schattige Steine und Ruinen. Eine Kachel ist 1 × 1 m.",
    en: "Soft moss cushions over dark soil: forest floors, garden paths, shady stones and ruins. One tile is 1 × 1 m.",
  },
  params: {
    coverage: { type: "number", min: 0, max: 1, step: 0.05, default: 0.65, label: { de: "Bedeckung", en: "Coverage" },
      describe: { de: "Anteil der Kachel unter Moos: 0,3 Flecken, 0,65 ein Waldboden, 1 ein geschlossener Teppich.", en: "Share of the tile covered by moss: 0.3 patches, 0.65 a forest floor, 1 a closed carpet." } },
    clumps: { type: "integer", min: 2, max: 8, default: 4, label: { de: "Polster", en: "Clumps" },
      describe: { de: "Polster über die Kachel: 2 wenige große, 4 üblich, 8 viele kleine.", en: "Cushions across the tile: 2 a few large ones, 4 usual, 8 many small ones." } },
    puff: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Wölbung", en: "Puff" },
      describe: { de: "Wie hoch sich die Polster wölben: 0 ein flacher Film, 0,5 weiche Polster, 1 dicke runde Kissen.", en: "How high the cushions dome: 0 a flat film, 0.5 soft cushions, 1 thick round cushions." } },
    colour: { type: "color", default: "#4a6a2a", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Grundfarbe des Mooses: sattes Grün #4a6a2a, trockenes Moos #6a6a30, dunkles Waldmoos #2e4a22.", en: "Base colour of the moss: lush green #4a6a2a, dry moss #6a6a30, dark forest moss #2e4a22." } },
    tipColour: { type: "color", default: "#8aa040", label: { de: "Spitzenfarbe", en: "Tip colour" },
      describe: { de: "Farbe der helleren Spitzen: frisches Gelbgrün #8aa040, trockenes Beige #a09a50, kühles Grün #6a9050.", en: "Colour of the lighter tips: fresh yellow-green #8aa040, dry beige #a09a50, cool green #6a9050." } },
    soilColour: { type: "color", default: "#3a3020", label: { de: "Erdfarbe", en: "Soil colour" },
      describe: { de: "Farbe der Erde zwischen den Polstern: dunkle Erde #3a3020, Humus #2a2218, lehmig #5a4630.", en: "Colour of the soil between the cushions: dark soil #3a3020, humus #2a2218, loamy #5a4630." } },
  },
  presets: {
    "forest-floor": { label: { de: "Waldboden", en: "Forest floor" }, values: { coverage: 0.65 } },
    carpet: { label: { de: "Teppich", en: "Carpet" }, values: { coverage: 1, puff: 0.8 } },
    patchy: { label: { de: "Fleckig", en: "Patchy" }, values: { coverage: 0.3, clumps: 6 } },
    "dry-moss": { label: { de: "Trockenes Moos", en: "Dry moss" }, values: { colour: "#6a6a30", tipColour: "#a09a50", puff: 0.3 } },
  },
  tile: 1, depth: 0.03,
  build(p, seed) {
    const moos = color(p.colour), spitze = color(p.tipColour), erde = color(p.soilColour);
    const thr = 0.35 - 0.7 * p.coverage;
    return (q, res) => {
      // Large noise decides where cushions grow, fine noise is the bristles and the soil grain
      const feld = fbm(q, [p.clumps, p.clumps], 256, 0.55, seed + 1, 5).toVar();
      const fuzz = fbm(q, [96, 96], res, 0.7, seed + 2).toVar();
      const krume = fbm(q, [48, 48], res, 0.6, seed + 3).toVar();
      const m = ramp(feld, thr - 0.05, thr + 0.12).toVar();
      const kissen = ramp(feld, thr, thr + 0.35).toVar();
      const height = float(0.3).add(kissen.mul(0.45 * p.puff)).add(fuzz.mul(0.05).mul(m)).add(krume.mul(0.02).mul(float(1).sub(m))).clamp(0, 1);
      const soil = erde.mul(krume.mul(0.15).add(1));
      const top = mix(moos, spitze, ramp(fuzz, 0, 0.6).mul(0.7).add(kissen.mul(0.2)));
      const roughness = mix(float(0.9), float(0.95), m);
      return { height, color: mix(soil, top, m), roughness, metalness: float(0) };
    };
  },
});
