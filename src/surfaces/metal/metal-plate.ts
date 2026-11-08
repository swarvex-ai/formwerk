import { abs, color, float, floor, fract, max, min, mix, sqrt, vec2, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, noise, ramp, wrap, type F, type V2 } from "../noise";

const RIFFEL = 26; // tread cells per metre

export const metalPlate = defineSurface({
  id: "metal-plate", category: "metal",
  title: { de: "Metallplatte", en: "Metal plate" },
  description: {
    de: "Platten aus Stahl mit Nähten und Nieten, auf Wunsch mit Riffelmuster, Lack und Rost: vom Werkstattboden bis zur rostigen Schiffswand. Eine Kachel ist 1 × 1 m.",
    en: "Steel plates with seams and rivets, with tread, paint and rust if you like: from a workshop floor to a rusty ship hull. One tile is 1 × 1 m.",
  },
  params: {
    panels: { type: "integer", min: 1, max: 4, default: 2, label: { de: "Platten pro Meter", en: "Plates per metre" },
      describe: { de: "Wie viele Platten auf einen Meter kommen: 1 große Bleche, 2 Bodenplatten, 4 kleine Paneele.", en: "How many plates fit into a metre: 1 large sheets, 2 floor plates, 4 small panels." } },
    rivets: { type: "integer", min: 0, max: 10, default: 5, label: { de: "Nieten pro Kante", en: "Rivets per edge" },
      describe: { de: "Wie viele Nieten an jeder Kante einer Platte sitzen: 0 geschweißt, 5 genietet, 10 dicht genietet wie ein alter Kessel.", en: "How many rivets sit on each edge of a plate: 0 welded, 5 riveted, 10 densely riveted like an old boiler." } },
    tread: { type: "boolean", default: false, label: { de: "Riffelblech", en: "Tread plate" },
      describe: { de: "Erhabenes Rautenmuster gegen Ausrutschen, wie auf Treppen und Ladeflächen.", en: "A raised diamond pattern against slipping, as on stairs and truck beds." } },
    paint: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Lack", en: "Paint" },
      describe: { de: "Wie viel Lack noch auf dem Blech ist: 0 blanker Stahl, 0,6 abgeplatzt an Kanten und Kratzern, 1 frisch lackiert.", en: "How much paint is left on the steel: 0 bare steel, 0.6 chipped at edges and scratches, 1 freshly painted." } },
    rust: { type: "number", min: 0, max: 1, step: 0.05, default: 0.15, label: { de: "Rost", en: "Rust" },
      describe: { de: "Wie stark es rostet, zuerst an Nähten und Nieten: 0 neu, 0,3 ein Hafen, 0,9 ein Wrack.", en: "How much it rusts, first at seams and rivets: 0 new, 0.3 a harbour, 0.9 a wreck." } },
    scratches: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Kratzer", en: "Scratches" },
      describe: { de: "Wie zerkratzt die Oberfläche ist: 0 neu, 0,5 benutzt, 1 ein Werkstattboden nach Jahren.", en: "How scratched the surface is: 0 new, 0.5 used, 1 a workshop floor after years." } },
    color: { type: "color", default: "#3f5a70", label: { de: "Lackfarbe", en: "Paint colour" },
      describe: { de: "Farbe des Lacks, wo er noch hält.", en: "Colour of the paint where it still holds." } },
  },
  presets: {
    "steel-floor": { label: { de: "Stahlboden", en: "Steel floor" }, values: { tread: true, panels: 2, rivets: 0, rust: 0.05, scratches: 0.6 } },
    "painted-hull": { label: { de: "Lackierte Wand", en: "Painted hull" }, values: { paint: 0.8, color: "#4c5e3c", rivets: 8, rust: 0.3 } },
    wreck: { label: { de: "Wrack", en: "Wreck" }, values: { rust: 0.9, paint: 0.3, color: "#6b2f22", scratches: 0.2, rivets: 6 } },
  },
  tile: 1, depth: 0.006,
  build(p, seed) {
    const n = p.panels, lack = color(p.color), stahl = vec3(0.56, 0.57, 0.58), rostFarbe = vec3(0.15, 0.052, 0.017);
    const raute = (q: V2): F => {
      // Raised lozenges, alternately turned: the classic tread plate
      const z = q.mul(RIFFEL), c = floor(z), f = fract(z).sub(0.5).toVar();
      const kipp = fract(c.x.add(c.y).mul(0.5)).mul(2); // 0 or 1 in a chequer
      const a = mix(f.x.add(f.y), f.x.sub(f.y), kipp).mul(0.7071), b = mix(f.x.sub(f.y), f.x.add(f.y), kipp).mul(0.7071);
      return float(1).sub(ramp(abs(a).mul(0.32).add(abs(b).mul(1.6)), 0.14, 0.2));
    };
    return (q, res) => {
      const z = q.mul(n), lokal = fract(z).toVar();
      const platte = cell(wrap(floor(z), vec2(n, n)), seed).toVar();
      const rand = min(min(lokal.x, float(1).sub(lokal.x)), min(lokal.y, float(1).sub(lokal.y))).div(n).toVar(); // metres to the seam
      const naht = ramp(rand, 0.0015, 0.005).toVar();
      // Rivets: a row along each edge, 3 cm in from the seam
      let niete: F = float(0);
      if (p.rivets > 0) {
        // Evenly from corner to corner, so the rows of two edges share the corner rivet
        const groesse = 1 / n, einzug = 0.03 / groesse, r = 0.009, abstand = p.rivets > 1 ? (1 - 2 * einzug) / (p.rivets - 1) : 1;
        const reihe = (entlang: F, quer: F) => {
          const k = p.rivets > 1 ? floor(entlang.sub(einzug).div(abstand).add(0.5)).clamp(0, p.rivets - 1) : float(0);
          const mitte = p.rivets > 1 ? k.mul(abstand).add(einzug) : float(0.5);
          const d = vec2(entlang.sub(mitte), quer.sub(einzug)).mul(groesse);
          return sqrt(max(float(0), float(1).sub(d.dot(d).div(r * r))));
        };
        niete = max(max(reihe(lokal.x, lokal.y), reihe(lokal.x, float(1).sub(lokal.y))), max(reihe(lokal.y, lokal.x), reihe(lokal.y, float(1).sub(lokal.x)))).toVar();
      }
      const riffel = p.tread ? raute(q) : float(0);
      const kratzerX = ramp(abs(noise(vec2(q.x.mul(4), q.y.mul(420)), [4, 420], seed + 1)), 0.06, 0.0);
      const kratzerY = ramp(abs(noise(vec2(q.x.mul(380), q.y.mul(5)), [380, 5], seed + 2)), 0.05, 0.0);
      const kratzer = max(kratzerX, kratzerY).mul(ramp(fbm(q, [4, 4], 128, 0.5, seed + 3, 3), -0.2, 0.4)).mul(p.scratches).toVar();
      const fleck = fbm(q, [6, 6], res, 0.55, seed + 4).toVar();
      const rostMaske = ramp(fleck.add(float(1).sub(naht).mul(0.5)).add(niete.mul(0.4)).add(platte.mul(0.2)), 0.85 - p.rust * 1.4, 1.05 - p.rust * 1.1).mul(p.rust > 0 ? 1 : 0).toVar();
      const lackMaske = ramp(fbm(q, [10, 10], 512, 0.6, seed + 5, 5).add(p.paint * 1.6 - 0.8).sub(kratzer.mul(2)).sub(float(1).sub(naht).mul(0.6)), -0.05, 0.05).mul(p.paint > 0 ? 1 : 0).toVar();
      const poren = fbm(q, [64, 64], res, 0.7, seed + 6).toVar();
      const height = float(0.4).mul(naht).add(niete.mul(0.45)).add(riffel.mul(0.35)).add(rostMaske.mul(poren.abs()).mul(0.12)).sub(kratzer.mul(0.04)).add(0.1);
      const blank = stahl.mul(platte.mul(0.12).add(0.92)).mul(fleck.mul(0.08).add(1)).add(kratzer.mul(0.08));
      const rost = rostFarbe.mul(poren.mul(0.6).add(1)).mul(fleck.mul(0.3).add(1));
      const col = mix(mix(blank, lack.mul(poren.mul(0.06).add(1)), lackMaske), rost, rostMaske).mul(mix(float(0.35), float(1), naht));
      const metalness = float(1).sub(max(lackMaske, rostMaske));
      const roughness = mix(mix(float(0.32).add(poren.mul(0.06)).sub(kratzer.mul(0.12)), float(0.55), lackMaske), float(0.92), rostMaske);
      return { height: height.clamp(0, 1), color: col, roughness: roughness.clamp(0.05, 1), metalness };
    };
  },
});
