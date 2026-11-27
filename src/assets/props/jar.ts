import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { turned } from "../shapes";

export const jar = defineAsset({
  id: "jar", category: "props",
  title: { de: "Vorratsgefäß", en: "Jar" },
  description: { de: "Ein gedrehtes Apothekergefäß aus glasiertem Steinzeug für Apotheken, Alchemistenstuben, Küchen und Speisekammern: ein Albarello mit Taille oder ein runder Topf, kurzer Hals mit Rand, ein Deckel, der sich nach oben abheben lässt (bewegliches Teil „lid“), und auf Wunsch ein bemaltes Band um den Bauch.", en: "A turned apothecary jar of glazed stoneware for apothecaries, alchemy labs, kitchens and pantries: a waisted albarello or a round pot, a short neck with a rim, a lid that lifts straight off (movable part \"lid\") and an optional painted band round the belly." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.08, max: 0.4, step: 0.01, default: 0.2, unit: "m",
      describe: { de: "Höhe des Gefäßes ohne Deckel: 0,1 m ein Gewürzglas, 0,2 m ein Kräutergefäß, 0,35 m ein großes Vorratsgefäß.", en: "Height of the body without the lid: 0.1 m a spice jar, 0.2 m a herb jar, 0.35 m a large storage jar." } },
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.03, max: 0.15, step: 0.005, default: 0.06, unit: "m",
      describe: { de: "Radius an der weitesten Stelle: 0,04 m ein Gewürzglas, 0,06 m ein Kräutergefäß, 0,13 m ein Vorratstopf.", en: "Radius at the widest point: 0.04 m a spice jar, 0.06 m a herb jar, 0.13 m a storage pot." } },
    shape: { type: "choice", label: { de: "Form", en: "Shape" }, options: ["albarello", "round"],
      labels: { albarello: { de: "Albarello", en: "Albarello" }, round: { de: "Rund", en: "Round" } }, default: "albarello",
      describe: { de: "Albarello: fast gerade Wand mit einer Taille von 85 % des Radius auf halber Höhe; rund: Bauch auf 45 % der Höhe, die Schulter zieht sich zum Hals ein.", en: "Albarello: an almost straight wall with a waist of 85 % of the radius at half height; round: the belly at 45 % of the height, the shoulder drawing in to the neck." } },
    neck: { type: "number", label: { de: "Hals", en: "Neck" }, min: 0.5, max: 0.9, step: 0.05, default: 0.7,
      describe: { de: "Halsradius als Anteil des Radius: 0,6 ein enger Vorratstopf, 0,7 ein Kräutergefäß, 0,9 eine weite Öffnung.", en: "Neck radius as a share of the radius: 0.6 a narrow storage pot, 0.7 a herb jar, 0.9 a wide mouth." } },
    knob: { type: "choice", label: { de: "Knauf", en: "Knob" }, options: ["button", "ball", "none"],
      labels: { button: { de: "Scheibe", en: "Button" }, ball: { de: "Kugel", en: "Ball" }, none: { de: "Ohne", en: "None" } }, default: "button",
      describe: { de: "Griff auf dem Deckel: eine flache gedrehte Scheibe von 12 mm Höhe, ein kugeliger Knauf oder ein flacher Deckel ohne Griff.", en: "Handle on top of the lid: a flat turned disc 12 mm high, a ball-like knob or a flat lid without one." } },
    band: { type: "boolean", label: { de: "Band", en: "Band" }, default: true,
      describe: { de: "Ein bemaltes Band um die weiteste Stelle, 30 % der Höhe breit, wie auf Apothekergefäßen.", en: "A painted band round the widest part, 30 % of the height tall, as on apothecary jars." } },
    colour: { type: "color", label: { de: "Glasur", en: "Glaze" }, default: "#d9d2c0",
      describe: { de: "Farbe der Glasur: Creme #d9d2c0, Braun #8a5a3c, Weiß #eeeae0.", en: "Colour of the glaze: cream #d9d2c0, brown #8a5a3c, white #eeeae0." } },
    bandColour: { type: "color", label: { de: "Bandfarbe", en: "Band colour" }, default: "#2f4f86",
      describe: { de: "Farbe des bemalten Bandes: Kobaltblau #2f4f86, Ocker #b8862e, Grün #3f6b45.", en: "Colour of the painted band: cobalt blue #2f4f86, ochre #b8862e, green #3f6b45." } },
  },
  presets: {
    "herb-jar": { label: { de: "Kräutergefäß", en: "Herb jar" }, values: { shape: "albarello" } },
    "spice-jar": { label: { de: "Gewürzglas", en: "Spice jar" }, values: { height: 0.1, radius: 0.04, knob: "ball", band: false } },
    "storage-jar": { label: { de: "Vorratstopf", en: "Storage jar" }, values: { height: 0.35, radius: 0.13, shape: "round", neck: 0.6, colour: "#8a5a3c", band: false } },
  },
  rig: { lid: { label: { de: "Deckel", en: "Lid" }, type: "slide", axis: [0, 1, 0], min: 0, max: 0.15 } },
  physics: { body: "dynamic", collider: "cylinder" },
  budget: { triangles: 6000, drawCalls: 3 },
  build(p) {
    const h = p.height, R = p.radius, rn = R * p.neck, seg = R < 0.05 ? 16 : 24;
    // Hollow stoneware drawn as a solid-looking volume: effective density for its mass; a glaze is smooth
    const glasur = material("paint", p.colour, 1, 400);
    // Foot ring 6 mm high, wall 5 mm, inner floor 12 mm above the ground; a short neck, then a rolled lip 2 mm proud of it
    const fuss = 0.006, mulde = 0.003, boden = 0.012, wand = 0.005, yHals = h - Math.max(0.015, 0.1 * h);
    const rl = 0.0035, rr = rn + 0.002;
    // Key points of the wall (height, radius); the albarello is widest above and below its waist at half height
    const oben = 0.5 * h + 0.6 * (yHals - 0.5 * h), unten = h - oben;
    const keys: [number, number][] = p.shape === "albarello"
      ? [[fuss, 0.92 * R], [unten, R], [0.5 * h, 0.85 * R], [oben, R], [yHals, rn]]
      : [[fuss, 0.72 * R], [0.45 * h, R], [yHals - 0.35 * (yHals - 0.45 * h), rn + 0.55 * (R - rn)], [yHals, rn]];
    // Monotone cubic through the keys: no overshoot, so the wall never bulges past R or dips under the neck
    const steig = keys.slice(1).map(([y, r], i) => (r - keys[i][1]) / (y - keys[i][0]));
    const tang = keys.map((_, i) => {
      if (i === 0) return steig[0];
      if (i === keys.length - 1) return steig[i - 1];
      const a = steig[i - 1], b = steig[i];
      return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
    });
    const radiusBei = (y: number) => {
      const q = Math.min(keys[keys.length - 1][0], Math.max(fuss, y));
      let i = 0;
      while (i < keys.length - 2 && q > keys[i + 1][0]) i++;
      const [y0, r0] = keys[i], [y1, r1] = keys[i + 1], d = y1 - y0, s = (q - y0) / d;
      return (2 * s ** 3 - 3 * s * s + 1) * r0 + (s ** 3 - 2 * s * s + s) * d * tang[i] + (-2 * s ** 3 + 3 * s * s) * r1 + (s ** 3 - s * s) * d * tang[i + 1];
    };
    // Five steps per segment between the keys: the heights rise strictly, so even the flat dish has no inverted segment
    const ys: number[] = [];
    for (let i = 0; i < keys.length - 1; i++) for (let k = 0; k < 5; k++) ys.push(keys[i][0] + ((keys[i + 1][0] - keys[i][0]) * k) / 5);
    ys.push(yHals);
    const aussen = ys.map((y): [number, number] => [radiusBei(y), y]);
    const rf = aussen[0][0] - 0.003, ring = Math.min(0.008, rf * 0.4);
    const profil: [number, number][] = [
      [0.001, mulde], [rf - ring, mulde], [rf - ring + 0.0015, 0], [rf - 0.0015, 0], [rf, 0.0015], [rf, fuss - 0.001],
      ...aussen, [rn, h - rl - 0.004], [rr, h - rl],
    ];
    // Rolled lip: a half-round from the outside over the top (y = h) to the inner wall 5 mm in from the neck
    for (let i = 1; i <= 5; i++) {
      const a = (Math.PI * i) / 5;
      profil.push([rr - rl + rl * Math.cos(a), h - rl + rl * Math.sin(a)]);
    }
    // Down the inner wall to the floor: the jar stays open inside the neck, inner faces point inward
    profil.push([rn - wand, yHals]);
    for (const [x, y] of aussen.slice().reverse()) if (y < yHals - 0.001 && y > boden + 0.002) profil.push([x - wand, y]);
    profil.push([radiusBei(boden) - wand, boden], [0.001, boden]);
    const t = new Parts().add(glasur, turned(profil, seg));

    // The painted band: its own ring 1 mm proud of the wall, following the same profile (the waist on the albarello)
    if (p.band) {
      const mitte = p.shape === "albarello" ? 0.5 * h : 0.45 * h, y0 = mitte - 0.15 * h, y1 = mitte + 0.15 * h;
      const bandProfil: [number, number][] = [[radiusBei(y0) - 0.001, y0]];
      for (let k = 0; k <= 10; k++) { const y = y0 + ((y1 - y0) * k) / 10; bandProfil.push([radiusBei(y) + 0.001, y]); }
      bandProfil.push([radiusBei(y1) - 0.001, y1]);
      t.add(material("paint", p.bandColour, 1, 400), turned(bandProfil, seg));
    }

    // The lid, where it sits closed: its underside on the lip at y = h, the cap 4 mm past the lip, a plug 10 mm into
    // the neck with 1 mm clearance to the inner wall, a low dome and the knob
    const rc = rr + 0.004, rp = rn - wand - 0.001, dicke = Math.max(0.008, 0.1 * rn), kuppel = 0.08 * rc, yT = h + dicke + kuppel;
    const deckelProfil: [number, number][] = [
      [0.001, h - 0.01], [rp - 0.002, h - 0.01], [rp, h - 0.008], [rp, h], [rc - 0.002, h], [rc, h + 0.002], [rc, h + dicke * 0.6], [rc - 0.003, h + dicke],
    ];
    const kr = p.knob === "button" ? Math.max(0.01, 0.3 * rn) : Math.max(0.007, 0.16 * rn);
    const fussK = p.knob === "none" ? 0.001 : kr * 0.6;
    for (let k = 1; k <= 4; k++) {
      const x = rc - 0.003 - ((rc - 0.003 - fussK) * k) / 4;
      deckelProfil.push([x, yT - kuppel * ((x - fussK) / (rc - 0.003 - fussK)) ** 2]);
    }
    if (p.knob === "button") {
      deckelProfil.push([kr * 0.5, yT + 0.004], [kr - 0.0015, yT + 0.007], [kr, yT + 0.0085], [kr - 0.002, yT + 0.012], [0.001, yT + 0.012]);
    } else if (p.knob === "ball") {
      // A short stem and a ball on it
      const yk = yT + kr * 1.3;
      deckelProfil.push([kr * 0.45, yT + kr * 0.35]);
      for (let k = 0; k <= 7; k++) {
        const a = -Math.PI / 3 + ((Math.PI / 2 + Math.PI / 3) * k) / 7;
        deckelProfil.push([Math.max(0.001, kr * Math.cos(a)), yk + kr * Math.sin(a)]);
      }
    }
    t.moving("lid", 0, h, 0, { max: Math.min(0.15, 0.5 * h) }).add(glasur, turned(deckelProfil, seg));
    return t.cylinder(Math.max(R, rc), Math.max(...deckelProfil.map(([, y]) => y))).group();
  },
});
