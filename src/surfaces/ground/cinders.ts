import { color, float, mix, vec2 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp, voronoi } from "../noise";

export const cinders = defineSurface({
  id: "cinders", category: "ground",
  title: { de: "Schlacke und Asche", en: "Cinders and ash" },
  description: {
    de: "Schmiedeboden: poröse schwarze und dunkelgraue Schlackenklumpen in feiner grauer Asche mit kleinen stumpfen Eisenschuppen. Eine Kachel ist 0,25 × 0,25 m.",
    en: "Smithy floor: porous black and dark grey clinker lumps in fine grey ash with small dull iron scale flecks. One tile is 0.25 × 0.25 m.",
  },
  params: {
    lumpSize: { type: "number", min: 0.01, max: 0.03, step: 0.002, default: 0.018, unit: "m", label: { de: "Klumpengröße", en: "Lump size" },
      describe: { de: "Durchschnittliche Größe der Schlackenklumpen in Metern: 0,01 m feiner Cinderweg, 0,018 m Schmiedeboden, 0,03 m grobe Schlackehalde.", en: "Average clinker size in metres: 0.01 m fine cinder path, 0.018 m smithy floor, 0.03 m coarse slag heap." } },
    coverage: { type: "number", min: 0.3, max: 1, step: 0.05, default: 0.7, label: { de: "Bedeckung", en: "Coverage" },
      describe: { de: "Anteil des Bodens, der mit Klumpen bedeckt ist: 0,3 verstreute Klumpen in Asche, 0,7 geschlossener Boden, 1 fast durchgehende Schlacke mit nur schmalen Aschenähten.", en: "Share of the ground covered by lumps: 0.3 scattered lumps in ash, 0.7 a closed floor, 1 nearly solid slag with only thin ash seams." } },
    porosity: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Porosität", en: "Porosity" },
      describe: { de: "Wie sehr die Klumpen von kleinen Gruben durchzogen sind: 0 glatt, 0,5 einige Gruben, 1 die Klumpen sind voller kleiner Löcher und dunkler darin.", en: "How much the lumps are pitted by small holes: 0 smooth, 0.5 a few pits, 1 lumps full of small holes and darker inside them." } },
    scale: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Eisenschuppen", en: "Iron scale" },
      describe: { de: "Anteil kleiner stumpfer Metallpunkte im Boden: 0 keine, 0,3 wenige Stellen, 1 viele glänzende Flecken mit Metalligkeit 0,6 und Rauheit 0,45.", en: "Share of small dull metal flecks in the ground: 0 none, 0.3 a few spots, 1 many bright flecks with metalness 0.6 and roughness 0.45." } },
    cinder: { type: "color", default: "#2a2826", label: { de: "Schlacke", en: "Cinder" },
      describe: { de: "Farbe der Schlackenklumpen: schwarzgrau #2a2826, geröstet #3a2e28.", en: "Colour of the clinker lumps: black grey #2a2826, roasted #3a2e28." } },
    ash: { type: "color", default: "#8a8680", label: { de: "Asche", en: "Ash" },
      describe: { de: "Farbe der feinen Asche zwischen den Klumpen: mittelgrau #8a8680, hell #a6a096.", en: "Colour of the fine ash between the lumps: mid grey #8a8680, light #a6a096." } },
  },
  presets: {
    "smithy-floor": { label: { de: "Schmiedeboden", en: "Smithy floor" }, values: { lumpSize: 0.018, coverage: 0.7, porosity: 0.5, scale: 0.3, cinder: "#2a2826", ash: "#8a8680" } },
    "cinder-path": { label: { de: "Cinderweg", en: "Cinder path" }, values: { lumpSize: 0.01, coverage: 0.9, scale: 0 } },
    "slag-heap": { label: { de: "Schlackehalde", en: "Slag heap" }, values: { lumpSize: 0.03, coverage: 1, porosity: 0.9, cinder: "#3a2e28" } },
  },
  tile: 0.25, depth: 0.006,
  build(p, seed) {
    const n = Math.max(8, Math.min(24, Math.round(0.25 / p.lumpSize)));
    const colCinder = color(p.cinder), colAsh = color(p.ash);
    return (q, res) => {
      const fein = fbm(q, [24, 24], res, 0.55, seed + 30).toVar();
      const poren = fbm(q, [96, 96], res, 0.7, seed + 40).toVar();
      const schupp = fbm(q, [48, 48], res, 0.5, seed + 50).mul(0.5).add(0.5).toVar();
      const w = vec2(
        fbm(q, [n, n], 64, 0.5, seed + 10, 3),
        fbm(q, [n, n], 64, 0.5, seed + 20, 3),
      ).mul(0.18);
      const v = voronoi(q.mul(n).add(w), n, 0.8, seed).toVar();
      const edge = v.x, rand = v.y;
      const rand2 = rand.mul(7.13).fract();

      const gap = (1 - p.coverage) * 0.2 + 0.02;
      const klumpen = ramp(edge, gap, gap + 0.15).toVar();

      const grube = ramp(poren, 0.45, 0.65).toVar();
      const fleck = ramp(schupp, 0.6, 0.68).toVar();

      const hoehe = klumpen.mul(rand2.mul(0.25).add(0.75))
        .add(fein.mul(0.04).mul(klumpen))
        .sub(grube.mul(p.porosity * 0.6).mul(klumpen))
        .clamp(0, 1);

      const cinderTon = colCinder.mul(rand.mul(0.3).add(0.85));
      const cinderFarbe = cinderTon.mul(float(1).sub(grube.mul(p.porosity * 0.4).mul(klumpen))).mul(float(1).sub(fleck.mul(p.scale).mul(0.3)));
      const ashFarbe = colAsh.mul(poren.mul(0.15).add(0.85));
      const col = mix(ashFarbe, cinderFarbe, klumpen);

      const rauheit = mix(float(0.9), float(0.86), poren.mul(0.08)).clamp(0.85, 0.95);
      const rauheitFleck = mix(rauheit, float(0.45), fleck.mul(p.scale));

      return { height: hoehe, color: col, roughness: rauheitFleck, metalness: fleck.mul(p.scale).mul(0.6) };
    };
  },
});
