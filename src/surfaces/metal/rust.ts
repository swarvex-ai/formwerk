import { color, float, mix } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp } from "../noise";

export const rust = defineSurface({
  id: "rust", category: "metal",
  title: { de: "Rostiger Stahl", en: "Rusted steel" },
  description: {
    de: "Stahl mit Rostflecken: blanker Stahl ist metallisch und glatt, Rost orangebraun, rau, unmetallisch und leicht erhaben, auf Wunsch abblätternd und mit Laufspuren. Eine Kachel ist 1 × 1 m.",
    en: "Steel with patches of rust: bare steel is metallic and smooth, rust is orange-brown, rough, non-metallic and slightly raised, flaking and streaked if you like. One tile is 1 × 1 m.",
  },
  params: {
    amount: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Rostanteil", en: "Rust amount" },
      describe: { de: "Welcher Anteil der Fläche rostet: 0 blanker Stahl, 0,15 leichter Anlauf, 0,5 verwittert, 0,9 verfallen, 1 ganz verrostet.", en: "Share of the surface that is rusted: 0 bare steel, 0.15 light tarnish, 0.5 weathered, 0.9 derelict, 1 fully rusted." } },
    patchSize: { type: "number", min: 0.02, max: 0.5, step: 0.01, default: 0.2, label: { de: "Fleckgröße", en: "Patch size" },
      describe: { de: "Größe der Rostflecken in Metern: 0,03 m feine Pünktchen, 0,2 m handtellergroß, 0,5 m große Flächen.", en: "Size of the rust patches in metres: 0.03 m fine specks, 0.2 m palm-sized, 0.5 m large areas." } },
    flaking: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Abblättern", en: "Flaking" },
      describe: { de: "Wie stark der Rost abplatzt, mit Höhenstufen an den Fleckrändern: 0 glatte Schicht, 0,4 rissig, 0,8 blättert in Schuppen ab.", en: "How much the rust peels, with height steps at the patch edges: 0 smooth layer, 0.4 cracked, 0.8 peeling in scales." } },
    streaks: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Laufspuren", en: "Streaks" },
      describe: { de: "Senkrechte Rostspuren unter den Flecken, wie nach Regen: 0 keine, 0,3 leicht, 1 lange Streifen.", en: "Vertical run-off streaks below the patches, as after rain: 0 none, 0.3 light, 1 long stripes." } },
    steelColor: { type: "color", default: "#8f9396", label: { de: "Stahlfarbe", en: "Steel colour" },
      describe: { de: "Farbe des blanken Stahls, zum Beispiel #8f9396 grauer Stahl, #6c7176 dunkel.", en: "Colour of the bare steel, for example #8f9396 grey steel, #6c7176 dark." } },
    rustColor: { type: "color", default: "#8a3d17", label: { de: "Rostfarbe", en: "Rust colour" },
      describe: { de: "Farbe des Rosts, zum Beispiel #8a3d17 orangebraun, #5a2a14 dunkler, alter Rost.", en: "Colour of the rust, for example #8a3d17 orange-brown, #5a2a14 dark, old rust." } },
  },
  presets: {
    "light-tarnish": { label: { de: "Leichter Anlauf", en: "Light tarnish" }, values: { amount: 0.15 } },
    weathered: { label: { de: "Verwittert", en: "Weathered" }, values: { amount: 0.5 } },
    derelict: { label: { de: "Verfallen", en: "Derelict" }, values: { amount: 0.9, flaking: 0.8 } },
  },
  tile: 1, depth: 0.01,
  build(p, seed) {
    const n = Math.max(2, Math.min(50, Math.round(1 / p.patchSize)));
    const steel = color(p.steelColor), rostFarbe = color(p.rustColor);
    return (q, res) => {
      const fleck = fbm(q, [n, n], res, 0.5, seed + 1, 6).toVar();
      const lauf = fbm(q, [n, 1], res, 0.5, seed + 2, 6).toVar(); // long along y: run-off
      const korn = fbm(q, [48, 48], res, 0.6, seed + 3).toVar();
      // Streaks push the field up so rust trails out below the patches; 0 and 1 are exact
      const feld = fleck.add(lauf.mul(p.streaks * 0.5));
      const maske = p.amount <= 0 ? float(0) : p.amount >= 1 ? float(1)
        : ramp(feld, 0.45 - p.amount * 0.9 + 0.1, 0.45 - p.amount * 0.9 - 0.1).toVar();
      // Flaking: scales raised above the layer, stepped where the mask crosses a threshold
      const stufe = ramp(maske, 0.45, 0.55).mul(p.flaking).mul(ramp(korn, -0.05, 0.05).mul(0.5).add(0.5));
      const height = float(0.25).add(maske.mul(0.3)).add(stufe.mul(0.35)).add(korn.mul(0.04).mul(maske));
      const blank = steel.mul(korn.mul(0.08).add(1)).mul(fleck.mul(0.1).add(1));
      const rost = rostFarbe.mul(korn.mul(0.35).add(1)).mul(lauf.mul(0.2).add(1));
      return {
        height: height.clamp(0, 1), color: mix(blank, rost, maske),
        roughness: mix(float(0.3).add(korn.mul(0.04)), float(0.9), maske).clamp(0.05, 1),
        metalness: float(1).sub(maske),
      };
    };
  },
});
