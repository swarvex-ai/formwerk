import { color, float, fract, max, min, mix, sin, vec2, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, noise, ramp } from "../noise";

export const corrugated = defineSurface({
  id: "corrugated", category: "metal",
  title: { de: "Wellblech", en: "Corrugated metal" },
  description: {
    de: "Wellblech für Dächer, Schuppen und Container: verzinkt oder lackiert, mit Stößen der Bahnen und Rostspuren, die herunterlaufen. Eine Kachel ist 2 × 2 m.",
    en: "Corrugated sheet for roofs, sheds and containers: galvanised or painted, with the overlaps of the sheets and rust streaks running down. One tile is 2 × 2 m.",
  },
  params: {
    waves: { type: "integer", min: 10, max: 40, default: 26, label: { de: "Wellen", en: "Waves" },
      describe: { de: "Wellen auf zwei Meter Breite: 14 breite Trapezwellen, 26 übliches Wellblech (7,6 cm), 40 fein.", en: "Waves across two metres: 14 wide, 26 usual corrugation (7.6 cm), 40 fine." } },
    sheets: { type: "integer", min: 1, max: 4, default: 2, label: { de: "Bahnen", en: "Sheets" },
      describe: { de: "Stöße der Blechbahnen von oben nach unten auf zwei Meter: 1 eine lange Bahn, 2 üblich, 4 kurze Stücke.", en: "Overlaps of the sheets from top to bottom across two metres: 1 one long sheet, 2 usual, 4 short pieces." } },
    paint: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Lack", en: "Paint" },
      describe: { de: "Wie viel Lack noch drauf ist: 0 blank verzinkt, 0,6 abgeblättert, 1 frisch lackiert.", en: "How much paint is left: 0 bare galvanised, 0.6 peeling, 1 freshly painted." } },
    rust: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Rost", en: "Rust" },
      describe: { de: "Rost und Rostfahnen: 0 neu, 0,3 ein Schuppen, 1 eine verlassene Hütte.", en: "Rust and rust streaks: 0 new, 0.3 a shed, 1 an abandoned shack." } },
    color: { type: "color", default: "#a63d32", label: { de: "Lackfarbe", en: "Paint colour" },
      describe: { de: "Farbe des Lacks: Rot #a63d32 wie ein Container, Grün #3f6b4a, Blau #2f5d8a.", en: "Colour of the paint: red #a63d32 like a container, green #3f6b4a, blue #2f5d8a." } },
  },
  presets: {
    galvanised: { label: { de: "Verzinkt", en: "Galvanised" }, values: { paint: 0, rust: 0.1 } },
    "shipping-container": { label: { de: "Container", en: "Shipping container" }, values: { waves: 14, paint: 1, rust: 0.25, color: "#a63d32" } },
    "rusty-shack": { label: { de: "Rostige Hütte", en: "Rusty shack" }, values: { paint: 0.4, rust: 0.9, color: "#3f6b4a" } },
  },
  tile: 2, depth: 0.018,
  build(p, seed) {
    const lack = color(p.color), zink = vec3(0.5, 0.52, 0.53), rostFarbe = vec3(0.16, 0.06, 0.02);
    return (q, res) => {
      // The wave across x; the overlaps of the sheets are steps along y
      const welle = sin(q.x.mul(p.waves * Math.PI * 2)).mul(0.5).add(0.5).toVar();
      const fy = fract(q.y.mul(p.sheets)), stoss = ramp(min(fy, float(1).sub(fy)).div(p.sheets).mul(2), 0.004, 0.01).toVar();
      const fein = fbm(q, [32, 32], res, 0.6, seed + 1).toVar(), fleck = fbm(q, [5, 5], 256, 0.55, seed + 2, 5).toVar();
      // Streaks: noise stretched downwards, strongest below the overlaps
      const fahne = ramp(noise(vec2(q.x.mul(40), q.y.mul(3)), [40, 3], seed + 3).add(fleck.mul(0.5)), 0.6 - p.rust * 0.7, 0.9 - p.rust * 0.5).toVar();
      const rost = p.rust > 0 ? max(fahne.mul(0.7), ramp(fleck.add(float(1).sub(stoss).mul(0.6)).add(welle.mul(-0.15)), 0.75 - p.rust * 1.1, 1 - p.rust * 0.8)).mul(p.rust > 0 ? 1 : 0) : float(0);
      const lackMaske = p.paint > 0 ? ramp(fbm(q, [8, 8], 512, 0.6, seed + 4, 5).add(p.paint * 1.6 - 0.8), -0.05, 0.05) : float(0);
      const blank = zink.mul(fein.mul(0.1).add(fleck.mul(0.08)).add(1)).mul(welle.mul(0.12).add(0.94));
      const col = mix(mix(blank, lack.mul(fein.mul(0.06).add(1)), lackMaske), rostFarbe.mul(fein.mul(0.6).add(1)), rost).mul(mix(float(0.4), float(1), stoss));
      const height = welle.mul(0.85).add(0.1).mul(stoss.mul(0.4).add(0.6)).add(fein.mul(0.01)).clamp(0, 1);
      const metalness = float(1).sub(max(lackMaske, rost));
      const roughness = mix(mix(float(0.38).add(fein.mul(0.08)), float(0.5), lackMaske), float(0.9), rost);
      return { height, color: col, roughness: roughness.clamp(0.05, 1), metalness };
    };
  },
});
