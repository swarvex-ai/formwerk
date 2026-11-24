import { ExtrudeGeometry, Path, Shape } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

export const breadOven = defineAsset({
  id: "bread-oven", category: "architecture",
  title: { de: "Backofen", en: "Bread oven" },
  description: {
    de: "Ein gemauerter Holzbackofen: Sockel auf Arbeitshöhe, flache Kuppel darüber und ein gewölbter Mund vorn, durch den die Laibe hineingehen, für Bäckereien, Höfe und Dörfer.",
    en: "A wood-fired bread oven: a block plinth at working height, a low dome on top and an arched mouth at the front through which the loaves go in, for bakeries, farms and villages.",
  },
  params: {
    diameter: { type: "number", label: { de: "Durchmesser", en: "Diameter" }, min: 1, max: 2.4, step: 0.05, default: 1.6, unit: "m",
      describe: { de: "Äußerer Durchmesser der Kuppel: 1,1 m bei einem kleinen Hofbackofen, 1,6 m im Dorf, 2,2 m in einer Bäckerei.", en: "Outer diameter of the dome: 1.1 m a small farm oven, 1.6 m a village oven, 2.2 m a bakery oven." } },
    height: { type: "number", label: { de: "Kuppelhöhe", en: "Dome height" }, min: 0.6, max: 1.4, step: 0.05, default: 0.9, unit: "m",
      describe: { de: "Höhe der Kuppel über der Plattenoberkante: 0,7 m bei einem flachen Lehmofen, 0,9 m üblich, 1,2 m im Backhaus.", en: "Height of the dome above the plinth top: 0.7 m a flat clay oven, 0.9 m usual, 1.2 m in a bakehouse." } },
    plinth: { type: "number", label: { de: "Sockelhöhe", en: "Plinth height" }, min: 0.3, max: 1, step: 0.05, default: 0.8, unit: "m",
      describe: { de: "Höhe der Plattenoberkante über dem Boden, die Arbeitshöhe des Ofenbodens: 0,5 m am Hofbackofen, 0,8 m üblich, 1,0 m für die Steharbeit.", en: "Height of the plinth top above the floor, the working height of the oven floor: 0.5 m at a farm oven, 0.8 m usual, 1.0 m for standing work." } },
    mouth: { type: "number", label: { de: "Mundbreite", en: "Mouth width" }, min: 0.3, max: 0.6, step: 0.05, default: 0.45, unit: "m",
      describe: { de: "Breite des gewölbten Mundes, durch den die Laibe geschoben werden, auf höchstens 0,4 × Durchmesser begrenzt: 0,3 m schmal, 0,45 m üblich, 0,6 m weit.", en: "Width of the arched mouth the loaves go in, clamped to at most 0.4 × diameter: 0.3 m narrow, 0.45 m usual, 0.6 m wide." } },
    chimney: { type: "boolean", label: { de: "Schornstein", en: "Chimney" }, default: true,
      describe: { de: "Kurzer eckiger Fuchs (0,25 × 0,25 m, 0,5 m hoch) auf der Kuppel über dem Mund; ohne ihn raucht der Ofen durch den Mund ab.", en: "A short square flue (0.25 × 0.25 m, 0.5 m tall) on the dome above the mouth; without it the oven smokes out through the mouth." } },
    fire: { type: "boolean", label: { de: "Feuer", en: "Fire" }, default: true,
      describe: { de: "Glühende Asche und Glut im Mund oder ein kalter, dunkler Mund.", en: "Glowing ash and embers in the mouth, or a cold dark mouth." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#a87a58",
      describe: { de: "Farbe des Tons und Mauerwerks: gebrannter Ton #a87a58, gekalkt #e6dcc8, grauer Stein #8a8278.", en: "Colour of the clay and masonry: fired clay #a87a58, whitewashed #e6dcc8, grey stone #8a8278." } },
  },
  presets: {
    village: { label: { de: "Dorfbackofen", en: "Village oven" }, values: { diameter: 1.6, height: 0.9, plinth: 0.8 } },
    "farm-oven": { label: { de: "Hofbackofen", en: "Farm oven" }, values: { diameter: 1.1, height: 0.7, plinth: 0.5, chimney: false } },
    bakery: { label: { de: "Bäckerei", en: "Bakery" }, values: { diameter: 2.2, height: 1.2, plinth: 0.9, colour: "#e6dcc8" } },
    cold: { label: { de: "Kalt", en: "Cold" }, values: { fire: false } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 8000, drawCalls: 2 },
  build(p) {
    const stein = material("stone", p.colour, 1, undefined, { moss: 0 });
    const mund = p.fire ? material("glow", "#ff7a2a") : material("stone", "#2a2826", 4, undefined, { moss: 0 });
    const t = new Parts();

    const dia = p.diameter, rad = dia / 2, h = p.height, plinth = p.plinth;
    const m = Math.min(p.mouth, 0.4 * dia); // the mouth never outwids the dome front
    const mouthH = 1.2 * m;
    const rw = 0.08; // stone around the opening
    // Ring and plate sit on the plinth top; when the mouth is taller than the dome front, sink them into the plinth.
    const y0 = Math.min(plinth, plinth + h - (mouthH + rw));
    const archY = y0 + mouthH - m / 2; // straight sides up to here, round head above

    // 1. Plinth: a square block at working height
    t.add(stein, rounded(dia + 0.2, plinth, dia + 0.2, 0.02, 0, plinth / 2, 0));

    // 2. Dome: a half-ellipse turned profile from radius dia/2 at the plinth top to a point at the top (closed)
    const profil: [number, number][] = [];
    const seg = 12;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * (Math.PI / 2);
      profil.push([rad * Math.cos(a), h * Math.sin(a)]);
    }
    t.add(stein, turned(profil, 48, 0, plinth, 0));

    // 3. Mouth surround: a stone ring proud of the dome front, round-headed hole, bottom on the plinth top
    const ringFront = rad + 0.08, ringBack = rad - 0.24;
    const ow = m / 2 + rw, ringTop = y0 + mouthH + rw;
    const ring = new Shape();
    ring.moveTo(-ow, y0); ring.lineTo(ow, y0); ring.lineTo(ow, ringTop); ring.lineTo(-ow, ringTop); ring.closePath();
    const loch = new Path();
    loch.moveTo(-m / 2, y0); loch.lineTo(-m / 2, archY);
    loch.absarc(0, archY, m / 2, Math.PI, 0, true);
    loch.lineTo(m / 2, y0); loch.closePath();
    ring.holes.push(loch);
    const fase = 0.01;
    const ringGeo = new ExtrudeGeometry(ring, { depth: ringFront - ringBack - 2 * fase, bevelEnabled: true, bevelSize: fase, bevelThickness: fase, bevelOffset: -fase, bevelSegments: 1, curveSegments: 16 });
    ringGeo.translate(0, 0, ringBack);
    t.add(stein, ringGeo);

    // 4. Mouth: a round-headed plate just behind the ring (its faces both ways), glowing embers or a cold dark hearth
    const mundForm = new Shape();
    mundForm.moveTo(-m / 2, y0); mundForm.lineTo(-m / 2, archY);
    mundForm.absarc(0, archY, m / 2, Math.PI, 0, true);
    mundForm.lineTo(m / 2, y0); mundForm.closePath();
    const plateT = 0.02, plateZ = rad + 0.03;
    const mundGeo = new ExtrudeGeometry(mundForm, { depth: plateT, bevelEnabled: false, curveSegments: 16 });
    mundGeo.translate(0, 0, plateZ - plateT / 2);
    t.add(mund, mundGeo);

    // 5. Chimney: a short square flue standing on the dome front just above the mouth
    if (p.chimney) {
      const cw = 0.25, ch = 0.5;
      const crown = Math.min(mouthH, h - rw);
      const zc = rad * Math.sqrt(Math.max(0, 1 - (crown / h) ** 2));
      const foot = Math.min(zc + cw / 2, rad - 0.02);
      const base = plinth + h * Math.sqrt(Math.max(0, 1 - (foot / rad) ** 2));
      t.add(stein, rounded(cw, ch, cw, 0.02, 0, base + ch / 2, zc));
    }

    return t.group();
  },
});
