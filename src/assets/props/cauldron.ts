import { CylinderGeometry, LatheGeometry, Quaternion, SphereGeometry, SplineCurve, TorusGeometry, Vector2, Vector3 } from "three";
import { rounded, turned } from "../shapes";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const cauldron = defineAsset({
  id: "cauldron", category: "props",
  title: { de: "Kessel", en: "Cauldron" },
  description: {
    de: "Ein eiserner Kochkessel für Lager, Küche und Hexen: bauchige Wand, engerer Rand, ein Deckel, der nach oben gleitet (bewegliches Teil „lid“), und ein Bügel über dem Rand; er steht auf glattem Boden, auf drei eisernen Füßen oder unter einem Stativ aus drei Holzstangen mit einer Kette.",
    en: "An iron cooking pot for camps, kitchens and witches: a bulging wall, a narrower rim, a lid that slides up (movable part \"lid\") and a bail over the rim; it sits on a flat bottom, on three iron feet, or under a tripod of three wooden poles with a chain.",
  },
  params: {
    diameter: { type: "number", label: { de: "Durchmesser", en: "Diameter" }, min: 0.3, max: 1.2, step: 0.01, default: 0.6, unit: "m",
      describe: { de: "Durchmesser an der weitesten Bauchstelle: 0,45 m ein hängender Topf, 0,6 m ein Kessel am Lagerfeuer, 1,2 m ein Braukessel.", en: "Diameter at the widest belly: 0.45 m a hanging pot, 0.6 m a campfire cauldron, 1.2 m a brewing cauldron." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.6, max: 1.2, step: 0.01, default: 0.8,
      describe: { de: "Höhe des Topfes als Anteil seines Durchmessers: 0,6 ein flacher Kessel, 0,8 ein bauchiger Topf, 1,2 ein hoher Vorratstopf.", en: "Height of the pot as a share of its diameter: 0.6 a shallow kettle, 0.8 a bulging pot, 1.2 a tall stockpot." } },
    legs: { type: "choice", label: { de: "Stand", en: "Legs" }, options: ["none", "three", "tripod"],
      labels: { none: { de: "Ohne Fuß", en: "None" }, three: { de: "Drei Füße", en: "Three feet" }, tripod: { de: "Stativ", en: "Tripod" } }, default: "three",
      describe: { de: "Ohne Fuß steht der Boden glatt auf, drei Füße sind kurze eiserne Stümpfe, das Stativ sind drei Holzstangen von 1,6 mal Topfhöhe, die über dem Topf zusammenlaufen und eine Kette zum Bügel tragen.", en: "None stands flat on its bottom, three feet are short iron stubs, the tripod is three wooden poles 1.6 times the pot height meeting above the pot and carrying a chain down to the bail." } },
    handle: { type: "boolean", label: { de: "Bügel", en: "Handle" }, default: true,
      describe: { de: "Ein Bügel aus einem halben Ring über dem Rand, um den Topf zu tragen oder an einem Haken aufzuhängen.", en: "A bail handle of half a ring standing over the rim, for carrying the pot or hanging it from a hook." } },
    colour: { type: "color", label: { de: "Eisen", en: "Iron" }, default: "#2f3133",
      describe: { de: "Farbe des schmiedeeisernen Topfes: geschwärztes Eisen #2f3133, Rostbraun #5a3a2a.", en: "Colour of the wrought iron pot: blackened iron #2f3133, rust brown #5a3a2a." } },
  },
  presets: {
    camp: { label: { de: "Lagerkessel", en: "Camp cauldron" }, values: { diameter: 0.6, legs: "three", handle: true } },
    witch: { label: { de: "Hexenkessel", en: "Witch's cauldron" }, values: { diameter: 1, depth: 0.9, legs: "three", handle: false } },
    hanging: { label: { de: "Hängend", en: "Hanging" }, values: { diameter: 0.45, legs: "tripod" } },
  },
  rig: { lid: { label: { de: "Deckel", en: "Lid" }, type: "slide", axis: [0, 1, 0], min: 0, max: 0.3 } },
  // The pot variants stand on the floor and ride on one cylinder; the tripod variant stands on its poles, so its
  // collider follows the poles and the whole thing stays a clean convex shell (the contract holds one collider per asset).
  physics: { body: "dynamic", collider: "cylinder" },
  budget: { triangles: 20000, drawCalls: 3 },
  build(p) {
    const d = p.diameter, hoehe = p.depth * d, R = d / 2, rand = 0.6 * R;
    const boden = 0.5 * R, wand = Math.max(0.006, 0.03 * R);
    // Cast iron with small rust patches: the pattern is scaled down to the size of a pot; effective density for a hollow pot
    const eisen = material("iron", p.colour, 5, 1500, { rust: 0.25 });
    const stuetzen: [number, number][] = [[0, boden], [0.16, 0.8 * R], [0.42, R], [0.7, 0.5 * (R + rand)], [1, rand]];
    const aussen = (x: number) => {
      const s = Math.max(0, Math.min(1, x));
      for (let k = 1; k < stuetzen.length; k++) {
        const [t1, r1] = stuetzen[k];
        if (s <= t1) { const [t0, r0] = stuetzen[k - 1]; return r0 + (r1 - r0) * ((s - t0) / (t1 - t0)); }
      }
      return rand;
    };
    const fuss = p.legs === "three" ? Math.max(0.035, 0.07 * hoehe) : 0;
    const t = new Parts();
    const y = (anteil: number) => fuss + hoehe * anteil;
    // The wall is a spline through the support points: widest at 42 % of the height, narrowing to the rim; inside it
    // stays open down to a tenth
    const bauch = new SplineCurve(stuetzen.map(([t1, r1]) => new Vector2(r1, y(t1)))).getPoints(24);
    const profil = [
      new Vector2(0, fuss), ...bauch,
      ...bauch.slice().reverse().filter((q) => q.y >= y(0.1)).map((q) => new Vector2(q.x - wand, q.y)), new Vector2(0, y(0.1)),
    ];
    t.add(eisen, new LatheGeometry(profil, 32));
    // The thick rolled rim: a torus around the top edge of the wall; the lid sits on it
    const rolle = wand * 1.3, rolleY = y(1) - rolle * 0.35;
    t.add(eisen, new TorusGeometry(rand - wand / 2, rolle, 8, 32).rotateX(Math.PI / 2).translate(0, rolleY, 0));
    if (p.legs === "three") {
      // Three short cast legs: a flared foot, a waist and a shoulder that sits in the thick bottom
      const fussR = Math.max(0.02, 0.075 * R), hl = fuss + 0.01;
      for (let k = 0; k < 3; k++) {
        const wink = (k * 2 * Math.PI) / 3 + Math.PI / 2;
        t.add(eisen, turned([[0.001, 0], [fussR * 0.85, 0], [fussR, hl * 0.12], [fussR * 0.62, hl * 0.5], [fussR * 0.8, hl * 0.9], [fussR * 0.8, hl], [0.001, hl]], 12, Math.cos(wink) * 0.6 * boden, 0, Math.sin(wink) * 0.6 * boden));
      }
    }
    // Tripod: three poles 1.6 × the pot height meeting above the pot; the feet are spread as far as needed to keep
    // the poles close to the pot
    let fussR = 0, spitze = 0;
    if (p.legs === "tripod") {
      const laenge = 1.6 * hoehe, stabR = Math.max(0.011, 0.015 * hoehe);
      let beste = R + 0.04, tiefst = Infinity;
      for (let k = 0; k < 49; k++) {
        const a = R + 0.04 + (0.85 * laenge - R - 0.04) * (k / 48);
        const A = Math.sqrt(Math.max(laenge * laenge - a * a, 1e-6));
        let tauchen = A < hoehe + 0.05 ? 1 + hoehe - A : 0;
        for (let m = 0; m <= 14; m++) {
          const anteil = 0.15 + (0.85 * m) / 14;
          tauchen = Math.max(tauchen, aussen(anteil) + stabR + 0.004 - a * (1 - (hoehe * anteil) / A));
        }
        if (tauchen < tiefst) { tiefst = tauchen; beste = a; }
      }
      fussR = beste;
      spitze = Math.sqrt(Math.max(laenge * laenge - fussR * fussR, 1e-6));
      const holz = material("wood", "#6e4a2c", 1, undefined, { grain: "y" });
      const hoch = new Vector3(0, 1, 0), richtung = new Vector3(), q = new Quaternion();
      const stabLaenge = Math.hypot(fussR, spitze), sinken = stabR * (fussR / stabLaenge);
      for (let k = 0; k < 3; k++) {
        const wink = (k * 2 * Math.PI) / 3 + Math.PI / 2;
        const fussPunkt = new Vector3(Math.cos(wink) * fussR, 0, Math.sin(wink) * fussR);
        const stab = new CylinderGeometry(stabR * 0.62, stabR, stabLaenge, 12);
        richtung.set(-fussPunkt.x, spitze, -fussPunkt.z).normalize();
        // lift by the dip of the tilted foot circle so the pole stands on the floor with its lowest point
        stab.applyQuaternion(q.setFromUnitVectors(hoch, richtung)).translate(fussPunkt.x / 2, spitze / 2 + sinken, fussPunkt.z / 2);
        t.add(holz, stab);
      }
      // The iron knob where the poles cross, with the chain hanging from it
      t.add(eisen, new SphereGeometry(stabR * 1.5, 16, 10).translate(0, spitze, 0));
    }
    // The bail: half a ring standing upright over the rim; under the pole crossing it may only be as tall as is left
    const henkelR = p.legs === "tripod" ? Math.min(rand + 0.027, Math.max(0.03, spitze - fuss - hoehe - 0.05)) : rand + 0.027;
    if (p.handle) {
      const rohr = Math.max(0.007, 0.026 * R);
      t.add(eisen, new TorusGeometry(henkelR, rohr, 8, 24, Math.PI).translate(0, y(1), 0));
      // Two cast lugs on the wall just under the rim, reaching out to the ends of the bail
      if (p.legs !== "tripod") for (const seite of [-1, 1]) t.add(eisen, rounded(0.034, 0.05, 0.026, 0.005, seite * (rand + 0.012), y(1) - 0.02, 0));
    }
    // The lid: a flat disc on a slide with a small knob; its geometry rests on the rolled rim above the pivot
    const staerke = 0.024 + 0.012 * R, lidY = fuss + hoehe + rolle * 0.65 + 0.002, lidR = rand + wand * 0.4;
    if (p.legs === "tripod") {
      // The chain hangs from the crossing down to the bail, or to the lid when the pot has none
      const ende = fuss + hoehe + (p.handle ? henkelR : staerke + rolle * 0.65 + 0.014);
      const kette = Math.max(0.02, spitze - ende), glieder = Math.max(1, Math.ceil(kette / 0.02));
      // Oval links alternately turned by a quarter, each hooked into the next
      for (let k = 0; k < glieder; k++) {
        const g = new TorusGeometry(0.0085, 0.0032, 6, 10).scale(1, 1.5, 1);
        if (k % 2) g.rotateY(Math.PI / 2);
        t.add(eisen, g.translate(0, spitze - 0.012 - (k + 0.5) * (kette - 0.012) / glieder, 0));
      }
    }
    const deckel = t.moving("lid", 0, fuss + hoehe, 0);
    deckel.add(eisen, turned([[0.001, 0], [lidR, 0], [lidR + 0.004, staerke * 0.5], [lidR - 0.003, staerke], [0.022, staerke], [0.02, staerke + 0.014], [0.001, staerke + 0.014]], 32, 0, lidY, 0));
    return (p.legs === "tripod" ? t.cylinder(fussR, spitze) : t.cylinder(R + 0.01, fuss + hoehe)).group();
  },
});
