import { color, float, mix, vec2, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp, voronoi } from "../noise";

export const gravel = defineSurface({
  id: "gravel", category: "ground",
  title: { de: "Kies", en: "Gravel" },
  description: {
    de: "Loses Kiesbett aus runden Flusskieseln oder kantigem Schotter auf dunklem Grund. Eine Kachel ist 1 × 1 m.",
    en: "Loose bed of gravel with rounded pebbles or crushed stone on a dark ground. One tile is 1 × 1 m.",
  },
  params: {
    stoneSize: { type: "number", min: 0.005, max: 0.06, step: 0.005, default: 0.02, label: { de: "Steingröße", en: "Stone size" },
      describe: { de: "Durchschnittliche Größe der Steine in Metern: 0,01 m feiner Zierkies, 0,02 m Gartenweg, 0,04 m Gleisschotter.", en: "Average size of the stones in metres: 0.01 m fine pea gravel, 0.02 m garden path, 0.04 m railway ballast." } },
    coverage: { type: "number", min: 0.4, max: 1, step: 0.05, default: 0.85, label: { de: "Bedeckung", en: "Coverage" },
      describe: { de: "Anteil des Bodens, der mit Steinen bedeckt ist: 0,5 lückenhaft gestreut, 0,85 dichtes Kiesbett, 1 geschlossene Steinschicht.", en: "Share of the ground covered by stones: 0.5 sparse scattering, 0.85 dense gravel bed, 1 solid stone layer." } },
    shape: { type: "choice", options: ["pebbles", "crushed"], default: "pebbles", label: { de: "Form", en: "Shape" },
      labels: { pebbles: { de: "Kiesel", en: "Pebbles" }, crushed: { de: "Schotter", en: "Crushed" } },
      describe: { de: "Form der Steine: Kiesel mit runder Wölbung oder gebrochener Schotter mit flachen Facetten.", en: "Stone shape: rounded pebbles with domed tops or crushed angular ballast with flat facets." } },
    colorA: { type: "color", default: "#b8b2a8", label: { de: "Farbe A", en: "Colour A" },
      describe: { de: "Erste Grundfarbe der Steine zur natürlichen Farbmischung.", en: "First stone colour for a natural colour mix." } },
    colorB: { type: "color", default: "#7e7870", label: { de: "Farbe B", en: "Colour B" },
      describe: { de: "Zweite Grundfarbe der Steine zur natürlichen Farbmischung.", en: "Second stone colour for a natural colour mix." } },
  },
  presets: {
    "garden-path": { label: { de: "Gartenweg", en: "Garden path" }, values: { shape: "pebbles", stoneSize: 0.02, coverage: 0.85, colorA: "#c8c2b6", colorB: "#9e968a" } },
    "railway-ballast": { label: { de: "Gleisschotter", en: "Railway ballast" }, values: { shape: "crushed", stoneSize: 0.04, coverage: 0.9, colorA: "#5a5856", colorB: "#3a3836" } },
    "river-pebbles": { label: { de: "Flusskiesel", en: "River pebbles" }, values: { shape: "pebbles", stoneSize: 0.025, coverage: 0.85, colorA: "#a68a72", colorB: "#5e666c" } },
  },
  tile: 1, depth: 0.035,
  build(p, seed) {
    // Map stoneSize [0.005, 0.06] to an integer grid cell count between 16 and 8
    const n = Math.max(8, Math.min(16, Math.round(1 / (p.stoneSize * 4))));
    const colA = color(p.colorA), colB = color(p.colorB), bodenFarbe = vec3(0.12, 0.1, 0.08);
    const isPebble = p.shape === "pebbles";
    const gap = (1 - p.coverage) * 0.25 + 0.04;
    return (q, res) => {
      const w = vec2(
        fbm(q, [n, n], 64, 0.5, seed + 10, 3),
        fbm(q, [n, n], 64, 0.5, seed + 20, 3),
      ).mul(0.18);
      const v = voronoi(q.mul(n).add(w), n, 0.8, seed).toVar();
      const edge = v.x, rand = v.y;
      const rand2 = rand.mul(7.13).fract();

      const kante = isPebble
        ? ramp(edge, gap, gap + 0.3)
        : ramp(edge, gap, gap + 0.16);

      const fein = fbm(q, [24, 24], res, 0.55, seed + 30).toVar();
      const poren = fbm(q, [96, 96], res, 0.7, seed + 40).toVar();

      const height = kante.mul(rand2.mul(0.25).add(0.75)).add(fein.mul(0.04)).add(poren.mul(0.02).mul(kante)).clamp(0, 1);

      const bodenAnteil = float(1).sub(ramp(edge, gap * 0.7, gap + 0.02)).toVar();

      const steinMix = mix(colA, colB, rand);
      const steinFarbe = steinMix.mul(fein.mul(0.2).add(poren.mul(0.1)).add(0.95));
      const boden = bodenFarbe.mul(poren.mul(0.3).add(0.85));
      const col = mix(steinFarbe, boden, bodenAnteil);

      const roughness = mix(poren.mul(0.12).add(0.82), float(0.95), bodenAnteil).clamp(0.8, 0.95);

      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
