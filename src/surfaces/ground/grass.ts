import { abs, color, float, max, mix, vec2, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, noise, ramp, voronoi } from "../noise";

export const grass = defineSurface({
  id: "grass", category: "ground",
  title: { de: "Gras", en: "Grass" },
  description: {
    de: "Rasen und Wiese von oben: dichte Halme in mehreren Grüntönen, auf Wunsch mit trockenen Stellen, Erde dazwischen und kleinen Blüten. Eine Kachel ist 2 × 2 m.",
    en: "Lawn and meadow from above: dense blades in several greens, with dry patches, soil showing through and small flowers if you like. One tile is 2 × 2 m.",
  },
  params: {
    density: { type: "number", min: 0, max: 1, step: 0.05, default: 0.8, label: { de: "Dichte", en: "Density" },
      describe: { de: "Wie dicht das Gras steht: 0,3 lückenhaft mit Erde, 0,8 ein Rasen, 1 eine satte Wiese.", en: "How dense the grass is: 0.3 patchy with soil, 0.8 a lawn, 1 a lush meadow." } },
    dryness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.15, label: { de: "Trockenheit", en: "Dryness" },
      describe: { de: "Trockene, gelbliche Stellen: 0 frisch, 0,3 Sommer, 1 verdorrt.", en: "Dry, yellowish patches: 0 fresh, 0.3 summer, 1 parched." } },
    flowers: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Blüten", en: "Flowers" },
      describe: { de: "Kleine Blüten im Gras: 0 keine, 0,3 ein paar Gänseblümchen, 1 eine Blumenwiese.", en: "Small flowers in the grass: 0 none, 0.3 a few daisies, 1 a flower meadow." } },
    color: { type: "color", default: "#4f7a32", label: { de: "Grün", en: "Green" },
      describe: { de: "Grundfarbe des Grases: Saftig #4f7a32, Dunkel #2f5a28, Steppe #8a8a4a.", en: "Base colour of the grass: lush #4f7a32, dark #2f5a28, steppe #8a8a4a." } },
    flowerColor: { type: "color", default: "#f4f1e8", label: { de: "Blütenfarbe", en: "Flower colour" },
      describe: { de: "Weiß #f4f1e8 wie Gänseblümchen, Gelb #f0c419 wie Löwenzahn, Lila #9a6ad8.", en: "White #f4f1e8 like daisies, yellow #f0c419 like dandelions, purple #9a6ad8." } },
  },
  presets: {
    lawn: { label: { de: "Rasen", en: "Lawn" }, values: { density: 0.9, dryness: 0.05 } },
    meadow: { label: { de: "Blumenwiese", en: "Meadow" }, values: { density: 1, flowers: 0.6, dryness: 0.2, color: "#5a8436" } },
    "dry-steppe": { label: { de: "Steppe", en: "Dry steppe" }, values: { density: 0.55, dryness: 0.85, color: "#7a7a40" } },
  },
  tile: 2, depth: 0.02,
  build(p, seed) {
    const gruen = color(p.color), trocken = vec3(0.42, 0.33, 0.12), erde = vec3(0.12, 0.08, 0.05), bluete = color(p.flowerColor);
    return (q, res) => {
      // Blades: very fine noise, stretched a little in two directions so it reads as strands, not dots
      const halmA = fbm(vec2(q.x, q.y), [160, 60], res, 0.65, seed + 1, 6).toVar(), halmB = fbm(q, [60, 160], res, 0.65, seed + 2, 6).toVar();
      const halme = max(halmA, halmB).toVar();
      const buesche = fbm(q, [8, 8], 256, 0.55, seed + 3, 4).toVar(), feld = fbm(q, [3, 3], 128, 0.5, seed + 4, 3).toVar();
      // Soil shows through where the clumps are thin; the denser the grass, the rarer
      const schwelle = -0.1 - p.density * 0.6, luecke = float(1).sub(ramp(buesche.add(halme.mul(0.5)), schwelle - 0.15, schwelle)).toVar();
      const duerre = ramp(feld.add(buesche.mul(0.4)), 0.55 - p.dryness * 1.3, 0.85 - p.dryness * 1.1).mul(p.dryness > 0 ? 1 : 0).toVar();
      const ton = gruen.mul(halme.mul(0.55).add(buesche.mul(0.25)).add(1)).mul(noise(q.mul(30), [30, 30], seed + 5).mul(0.08).add(1));
      let col = mix(mix(ton, trocken.mul(halme.mul(0.4).add(1)), duerre), erde.mul(halme.mul(0.3).add(1)), luecke);
      let height = halme.mul(0.35).add(0.55).mul(float(1).sub(luecke.mul(0.6))).add(buesche.mul(0.1));
      if (p.flowers > 0) {
        // Flowers: small round spots in some of the cells of a fine Voronoi pattern
        const v = voronoi(q.mul(70), 70, 1, seed + 6).toVar(), da = ramp(v.y, 1 - p.flowers * 0.25, 1.01 - p.flowers * 0.25).mul(float(1).sub(ramp(v.z, 0.12, 0.2)));
        col = mix(col, bluete.mul(abs(halme).mul(0.1).add(1)), da);
        height = height.add(da.mul(0.2));
      }
      return { height: height.clamp(0, 1), color: col, roughness: float(0.85).add(halme.mul(0.05)), metalness: float(0) };
    };
  },
});
