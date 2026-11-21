import { color, float, max, mix, vec2 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp } from "../noise";

export const straw = defineSurface({
  id: "straw", category: "ground",
  title: { de: "Stroheinstreu", en: "Straw bedding" },
  description: {
    de: "Lockeres Stroh auf einem Stallboden: goldene Halme in alle Richtungen übereinander liegend, der Boden zeigt sich dort, wo die Einstreu dünn ist, und dunklere, getrampelte und feuchte Flecken. Eine Kachel ist 1 × 1 m.",
    en: "Loose straw on a stable floor: golden strands lying in every direction over each other, the floor showing through where the bedding is thin, and darker trampled damp patches. One tile is 1 × 1 m.",
  },
  params: {
    coverage: { type: "number", min: 0, max: 1, step: 0.05, default: 0.85, label: { de: "Bedeckung", en: "Coverage" },
      describe: { de: "Wie dicht die Strohschicht den Boden bedeckt: 0,4 eine dünne Schicht mit viel sichtbarem Boden, 0,85 ein dickes frisches Bett, 1 vollständig bedeckt.", en: "How densely the straw covers the floor: 0.4 a thin layer with much floor visible, 0.85 a thick fresh bed, 1 fully covered." } },
    strandLength: { type: "number", min: 0.02, max: 0.15, step: 0.01, default: 0.07, unit: "m", label: { de: "Halmlänge", en: "Strand length" },
      describe: { de: "Wie lang die einzelnen Halme sind: 0,03 m gehacktes Kurzhahnstroh, 0,07 m gewöhnliches Stroh, 0,12 m langes Stroh.", en: "How long the individual strands are: 0.03 m chopped short straw, 0.07 m ordinary straw, 0.12 m long straw." } },
    trampled: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Getrampelt", en: "Trampled" },
      describe: { de: "Dunklere, flachere, feuchte Stellen wo Tiere stehen: 0 keine, 0,3 einige Stellen, 0,8 stark getrampelter Stall.", en: "Darker, flatter, damp patches where animals stand: 0 none, 0.3 a few patches, 0.8 a heavily trampled stable." } },
    colour: { type: "color", default: "#d4b25a", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe des frischen Strohs: Goldgelb #d4b25a, altes Stroh #a88e52.", en: "Colour of fresh straw: golden #d4b25a, old straw #a88e52." } },
    floorColour: { type: "color", default: "#5a4632", label: { de: "Bodenfarbe", en: "Floor colour" },
      describe: { de: "Farbe des Bodens zwischen den Halmen: Gestampfte Erde #5a4632, Dielen #7a5a3a.", en: "Colour of the floor between the strands: packed earth #5a4632, floorboards #7a5a3a." } },
  },
  presets: {
    "fresh-bed": { label: { de: "Frisches Bett", en: "Fresh bed" }, values: { coverage: 0.85 } },
    "thin-layer": { label: { de: "Dünne Schicht", en: "Thin layer" }, values: { coverage: 0.45 } },
    "old-stall": { label: { de: "Alter Stall", en: "Old stall" }, values: { trampled: 0.8, colour: "#a88e52" } },
    chopped: { label: { de: "Gehackt", en: "Chopped" }, values: { strandLength: 0.03 } },
  },
  tile: 1, depth: 0.02,
  build(p, seed) {
    const stroh = color(p.colour), erde = color(p.floorColour);
    return (q, res) => {
      const dehnen = p.strandLength / 0.07;
      const lang = 80, quer = Math.round(Math.min(80, Math.max(12, 80 / (dehnen * 2.7))));
      // Strands: two stretched fbm layers crossing each other, the stretch ratio comes from strandLength
      const halmA = fbm(vec2(q.x, q.y), [lang, quer], res, 0.65, seed + 1, 6).toVar(), halmB = fbm(q, [quer, lang], res, 0.65, seed + 2, 6).toVar();
      const halme = max(halmA, halmB).toVar();
      // Trampled patches: large-scale fbm, darker and flatter where animals stand
      const fleck = fbm(q, [4, 4], 256, 0.5, seed + 3, 4).toVar();
      const schwelle = 0.25 - p.coverage * 0.6;
      const luecke = float(1).sub(ramp(fleck.add(halme.mul(0.3)), schwelle - 0.3, schwelle)).toVar();
      const getrampelt = ramp(fleck, 0.1 - p.trampled * 0.5, 0.4 - p.trampled * 0.5).mul(p.trampled > 0 ? 1 : 0).toVar();
      const ton = stroh.mul(halme.mul(0.4).add(1)).mul(float(1).sub(getrampelt.mul(0.45)));
      const col = mix(ton, erde.mul(halme.mul(0.3).add(1)), luecke);
      const height = halme.mul(0.25).add(0.6).mul(float(1).sub(getrampelt.mul(0.3))).mul(float(1).sub(luecke.mul(0.6))).add(fleck.mul(0.1));
      const roughness = mix(float(0.9).add(halme.mul(0.05)), float(0.6), luecke);
      return { height: height.clamp(0, 1), color: col, roughness, metalness: float(0) };
    };
  },
});
