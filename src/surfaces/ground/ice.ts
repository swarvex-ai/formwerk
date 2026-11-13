import { color, float, mix, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp, voronoi } from "../noise";
import type { F } from "../noise";

export const ice = defineSurface({
  id: "ice", category: "ground",
  title: { de: "Eis", en: "Ice" },
  description: {
    de: "Gefrorene Oberfläche eines Teichs oder Sees: glatt und glänzend, mit weißen Rissen zwischen Schollen, kleinen Lufteinschlüssen und Reifstellen. Eine Kachel ist 2 × 2 m.",
    en: "Frozen surface of a pond or lake: smooth and glossy, with white cracks between plates, small trapped air bubbles and patches of frost. One tile is 2 × 2 m.",
  },
  params: {
    cracks: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Risse", en: "Cracks" },
      describe: { de: "Wie stark die weißen Risse hervortreten: 0 keine, 0,5 üblich, 1 stark zersprungen.", en: "How strong the white cracks are: 0 none, 0.5 usual, 1 heavily cracked." } },
    plates: { type: "integer", min: 3, max: 10, default: 5, label: { de: "Schollen", en: "Plates" },
      describe: { de: "Eisschollen über die Kachel: 3 große Schollen, 10 kleine.", en: "Crack cells across the tile: 3 large plates, 10 small ones." } },
    bubbles: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Blasen", en: "Bubbles" },
      describe: { de: "Kleine weiße Lufteinschlüsse im Eis: 0 keine, 0,3 üblich, 1 viele Blasen.", en: "Small white air bubbles trapped in the ice: 0 none, 0.3 usual, 1 many bubbles." } },
    frost: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Reif", en: "Frost" },
      describe: { de: "Matte weiße Reifstellen auf der Oberfläche: 0 klares Eis, 0,3 üblich, 1 stark überreift.", en: "Matt white patches of frost: 0 clear ice, 0.3 usual, 1 heavily frosted." } },
    color: { type: "color", default: "#9cc4dc", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe des klaren Eises: Hellblau #9cc4dc, Schwarzeis #4a6274.", en: "Colour of the clear ice: pale blue #9cc4dc, black ice #4a6274." } },
  },
  presets: {
    pond: { label: { de: "Teich", en: "Pond" }, values: { cracks: 0.5 } },
    "black-ice": { label: { de: "Schwarzeis", en: "Black ice" }, values: { color: "#4a6274", cracks: 0.2, bubbles: 0.1, frost: 0 } },
    frosted: { label: { de: "Überreift", en: "Frosted" }, values: { frost: 0.85, cracks: 0.3 } },
    glacier: { label: { de: "Gletscher", en: "Glacier" }, values: { color: "#7fb8e0", plates: 3, cracks: 0.8, bubbles: 0.6 } },
  },
  tile: 2, depth: 0.01,
  build(p, seed) {
    return (q, res) => {
      const fein = fbm(q, [32, 32], res, 0.55, seed + 1).toVar();
      const lage = fbm(q, [3, 3], 256, 0.55, seed + 2, 5).toVar();

      const v = voronoi(q.mul(p.plates), p.plates, 0.9, seed + 3).toVar();
      const riss = float(1).sub(ramp(v.x, 0, 0.15)).pow(3).mul(p.cracks).toVar();

      let blase: F = float(0);
      if (p.bubbles > 0) {
        const b = voronoi(q.mul(40), 40, 1, seed + 4).toVar();
        blase = ramp(b.z, 0.18, 0.08).mul(ramp(b.y, 1 - p.bubbles * 0.5, 1.001 - p.bubbles * 0.5)).toVar();
      }

      const reif = p.frost > 0
        ? ramp(lage.add(fein.mul(0.3)), 0.6 - p.frost * 1.2, 0.8 - p.frost * 1.2).toVar()
        : float(0);

      let col = color(p.color).mul(lage.mul(0.12).add(fein.mul(0.04)).add(1));
      col = mix(col, vec3(0.9, 0.95, 0.98), riss);
      col = mix(col, vec3(0.92, 0.96, 1), blase.mul(0.7));
      col = mix(col, vec3(0.94, 0.96, 0.98), reif.mul(0.85));

      const height = float(0.6).add(fein.mul(0.04)).sub(riss.mul(0.3)).add(reif.mul(0.1)).clamp(0, 1);
      const roughness = mix(mix(float(0.06), float(0.35), riss), float(0.75), reif).clamp(0.03, 1);

      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
