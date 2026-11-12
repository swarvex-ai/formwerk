import { color, float, floor, max, mix, vec2 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, ramp, wrap1 } from "../noise";

export const bark = defineSurface({
  id: "bark", category: "wood",
  title: { de: "Baumrinde", en: "Tree bark" },
  description: {
    de: "Rinde mit senkrechten Rippen, Furchen und waagrechten Rissen: von der glatten Birke bis zur tief gefurchten Eiche. Eine Kachel ist 1 × 1 m, jeder Seed gibt andere Rinde.",
    en: "Bark with vertical ridges, furrows and horizontal cracks: from smooth birch to deeply furrowed oak. One tile is 1 × 1 m, every seed gives other bark.",
  },
  params: {
    ridges: { type: "integer", min: 2, max: 12, default: 6, label: { de: "Rippen", en: "Ridges" },
      describe: { de: "Wie viele senkrechte Rippen auf einen Meter kommen: 3 dicke Eiche, 6 Kiefer, 10 feine Rinde.", en: "How many vertical ridges fit in a metre: 3 thick oak, 6 pine, 10 fine bark." } },
    depth: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Furchentiefe", en: "Furrow depth" },
      describe: { de: "Wie tief die Furchen schneiden: 0,1 glatte Birke, 0,6 Kiefer, 0,9 alte Eiche.", en: "How deep the furrows cut: 0.1 smooth birch, 0.6 pine, 0.9 old oak." } },
    roughness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Zerklüftung", en: "Ruggedness" },
      describe: { de: "Wie unregelmäßig die Rippen sind: 0 glatte Buche, 0,5 Kiefer, 1 zerrissene Eiche.", en: "How irregular the ridges are: 0 smooth beech, 0.5 pine, 1 cracked oak." } },
    plates: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Platten", en: "Plates" },
      describe: { de: "Wie viele waagrechte Risse die Rippen in Platten teilen: 0 keine, 0,4 einzelne, 1 Kiefer mit Schuppen.", en: "How many horizontal cracks break the ridges into plates: 0 none, 0.4 some, 1 scaly pine." } },
    color: { type: "color", default: "#6b5a48", label: { de: "Rindenfarbe", en: "Bark colour" },
      describe: { de: "Farbe der Rippen: Graubraun für Eiche, Cremeweiß für Birke, Rotbraun für Kiefer.", en: "Colour of the ridges: grey-brown for oak, cream for birch, red-brown for pine." } },
    furrowColor: { type: "color", default: "#241a13", label: { de: "Furchenfarbe", en: "Furrow colour" },
      describe: { de: "Farbe in Furchen und Rissen: fast Schwarz für Eiche, Dunkelgrau für Birke.", en: "Colour in furrows and cracks: almost black for oak, dark grey for birch." } },
  },
  presets: {
    oak: { label: { de: "Eiche", en: "Oak" }, values: { ridges: 5, depth: 0.9, roughness: 0.9, plates: 0.3, color: "#6b5a48", furrowColor: "#1c140e" } },
    birch: { label: { de: "Birke", en: "Birch" }, values: { ridges: 3, depth: 0.1, roughness: 0.1, plates: 0.45, color: "#d9d4c7", furrowColor: "#2b2724" } },
    pine: { label: { de: "Kiefer", en: "Pine" }, values: { ridges: 6, depth: 0.6, roughness: 0.5, plates: 1, color: "#8a5238", furrowColor: "#2e1a12" } },
  },
  tile: 1, depth: 0.04,
  build(p, seed) {
    const R = p.ridges, m = Math.max(2, Math.round(R / 2)), rau = p.roughness, tief = p.depth;
    const rinde = color(p.color), furche = color(p.furrowColor);
    return (q, res) => {
      // Furrow centres at whole numbers of x': one per ridge, wandering along y by a wrapped noise (at most 0.3 ridge)
      const w = fbm(vec2(float(0.3), q.y), [1, 4], res, 0.5, seed, 4).mul(0.3 * (0.15 + 0.85 * rau)).toVar();
      const xs = q.x.mul(R).add(w).toVar();
      const spalte = wrap1(floor(xs.add(0.5)), R).toVar();
      const d = xs.sub(floor(xs.add(0.5))).abs().toVar();
      // Ridge profile: 0 in the furrow, 1 on the ridge; wider furrows when the bark is rugged
      const grat = ramp(d, 0.03, 0.2 + 0.15 * rau).toVar();
      // Horizontal cracks across a column: m per tile, each column shifted; plates decides which ones are open
      const ys = q.y.mul(m).add(cell(vec2(spalte, 0), seed + 7).mul(m)).toVar();
      const nr = floor(ys.add(0.5)), dy = ys.sub(nr).abs().div(m);
      const offen = cell(vec2(spalte, wrap1(nr, m)), seed + 8).lessThan(p.plates).select(float(1), float(0));
      const riss = float(1).sub(ramp(dy, 0.004, 0.012 + 0.012 * rau)).mul(offen).toVar();
      const fein = fbm(q, [R * 2, 6], res, 0.6, seed + 3, 6).toVar();
      const oben = grat.mul(float(1).sub(riss)).toVar();
      const height = mix(float(1 - tief), float(1), oben).add(fein.mul(0.04 + 0.06 * rau)).clamp(0, 1);
      const farbe = rinde.mul(fein.mul(0.3).add(1).mul(cell(vec2(spalte, 1), seed + 9).mul(0.2).add(0.9)));
      const col = mix(furche, farbe, ramp(oben, 0.05, 0.9));
      const roughness = max(mix(float(1), float(0.78), oben), float(0)).add(fein.mul(0.05));
      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
