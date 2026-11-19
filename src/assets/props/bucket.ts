import { CircleGeometry, CylinderGeometry, LatheGeometry, RingGeometry, TorusGeometry, Vector2, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, roundBoards, stave, turned } from "../shapes";

export const bucket = defineAsset({
  id: "bucket", category: "props",
  title: { de: "Eimer", en: "Bucket" },
  description: {
    de: "Ein Eimer für Brunnen, Küchen, Ställe und Höfe, aus Holz mit Metallbändern oder als Metalleimer, mit umklappbarem Tragebügel (bewegliches Teil „handle“).",
    en: "A bucket for wells, kitchens, stables and farms, of banded wood or metal, with a swinging carry handle (movable part \"handle\").",
  },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.2, max: 0.4, step: 0.01, default: 0.3, unit: "m",
      describe: { de: "Höhe des Eimers ohne Bügel: 0,22 m ein kleiner Pail, 0,3 m ein Hofeimer, 0,38 m ein großer Brunneneimer.", en: "Height of the bucket without the handle: 0.22 m a small pail, 0.3 m a farm bucket, 0.38 m a large well bucket." } },
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.1, max: 0.2, step: 0.005, default: 0.15, unit: "m",
      describe: { de: "Äußerer Radius am oberen Rand: 0,11 m ein Melkeimer, 0,15 m ein Hofeimer, 0,18 m ein Brunnenkübel.", en: "Outer radius at the rim: 0.11 m a milk pail, 0.15 m a farm bucket, 0.18 m a well bucket." } },
    taper: { type: "number", label: { de: "Verjüngung", en: "Taper" }, min: 0, max: 0.25, step: 0.01, default: 0.15,
      describe: { de: "Um wie viel der Boden schmaler als der Rand ist, als Anteil des Radius: 0 zylindrisch, 0,15 ein klassischer Eimer.", en: "How much narrower the floor is than the rim, as a fraction of the radius: 0 straight, 0.15 a typical bucket." } },
    body: { type: "choice", label: { de: "Material", en: "Body" }, options: ["wood", "metal"],
      labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" } }, default: "wood",
      describe: { de: "Holz mit zwei geschmiedeten Bändern oder ein glatter Metalleimer.", en: "Wood with two forged bands or a smooth metal pail." } },
    fill: { type: "number", label: { de: "Füllung", en: "Fill" }, min: 0, max: 1, step: 0.01, default: 0.5,
      describe: { de: "Wasserstand innen: 0 leer, 0,5 halbvoll, 1 randvoll.", en: "Liquid level inside: 0 empty, 0.5 half full, 1 brimful." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a5a32",
      describe: { de: "Farbe des Eimers: Holz #8a5a32, Zink oder Blech #9a9ea4.", en: "Colour of the body: wood #8a5a32, galvanised metal #9a9ea4." } },
    liquidColour: { type: "color", label: { de: "Flüssigkeit", en: "Liquid colour" }, default: "#5a7a8c",
      describe: { de: "Farbe der Flüssigkeit: Wasser #5a7a8c, Milch #f2efe6.", en: "Colour of the liquid: water #5a7a8c, milk #f2efe6." } },
  },
  presets: {
    "well-bucket": { label: { de: "Brunneneimer", en: "Well bucket" }, values: { body: "wood", height: 0.32, taper: 0.15 } },
    "pail": { label: { de: "Wassereimer", en: "Pail" }, values: { body: "metal", height: 0.26, taper: 0.1, colour: "#9a9ea4" } },
    "milk-pail": { label: { de: "Milcheimer", en: "Milk pail" }, values: { body: "metal", fill: 0.8, colour: "#9a9ea4", liquidColour: "#f2efe6" } },
  },
  rig: { handle: { label: { de: "Bügel", en: "Handle" }, type: "rotate", axis: [1, 0, 0], min: 0, max: 90 } },
  physics: { body: "dynamic", collider: "cylinder" },
  budget: { triangles: 5000, drawCalls: 4 },
  build(p, seed) {
    const z = rng(seed), h = p.height, wall = 0.01, floorT = 0.012;
    const rBottom = p.radius * (1 - p.taper);
    const r = (y: number) => rBottom + (p.radius - rBottom) * (y / h);

    const koerper = material(p.body === "wood" ? "wood" : "metal", p.colour);
    const metall = material("metal", p.body === "metal" ? p.colour : "#4a4a4a");

    const t = new Parts();
    // Ears: iron on the wooden body (one draw call with the hoops), the body's own sheet on the metal one
    let ohr = koerper, innen = wall;
    if (p.body === "wood") {
      // One wood material for staves and floor: the wood shader already gives every board/stave its own tone
      const holz = material("wood", p.colour, 1, 130);
      const reif = material("iron", "#4a4a4a", 1, 180);
      ohr = reif;

      // Staves about a hand wide, ~2 mm joints; stave(r, h, a0+halb, a1-halb, dicke, 12, 3) like barrel
      const n = Math.max(10, Math.round((2 * Math.PI * r(h / 2)) / 0.095));
      const fuge = 0.002, halb = fuge / 2 / p.radius, dicke = Math.max(0.014, p.radius * 0.07);
      for (let i = 0; i < n; i++) {
        const a0 = (2 * Math.PI * i) / n, a1 = (2 * Math.PI * (i + 1)) / n;
        t.add(holz, stave(r, h, a0 + halb, a1 - halb, dicke, 12, 3));
      }
      // A lining in the middle of the wall closes the joints from inside (an open vessel): two faces, out and in, from
      // the floor boards to 3 mm below the rim, so it never shows above the stave tops
      const y0 = floorT, y1 = h - 0.003;
      const mitte = (u: number, v: number) => {
        const y = y0 + v * (y1 - y0), rm = r(y) - dicke / 2;
        return new Vector3(rm * Math.cos(2 * Math.PI * u), y, rm * Math.sin(2 * Math.PI * u));
      };
      const raus = (q: Vector3) => new Vector3(q.x, 0, q.z);
      t.add(holz, grid(64, 1, mitte, raus));
      t.add(holz, grid(64, 1, mitte, (q) => raus(q).negate()));
      // The lining leaves two ways through a joint to the ground: past its top down the outer half (the taper) and
      // past its foot down the inner half, beside the floor boards. A small closed patch in each joint, 2 mm below the
      // rim and at the foot, 0.4 mm into both staves and 0.15 mm inside both faces, shuts both
      const breit = halb + 0.0004 / p.radius;
      for (let i = 0; i < n; i++) for (const yd of [h - 0.002, y0]) {
        const a = (2 * Math.PI * i) / n;
        const fleck = (u: number, v: number) => {
          const rd = r(yd) - dicke + 0.00015 + v * (dicke - 0.0003), w = a + (2 * u - 1) * breit;
          return new Vector3(rd * Math.cos(w), yd, rd * Math.sin(w));
        };
        for (const s of [1, -1]) t.add(holz, grid(1, 1, fleck, () => new Vector3(0, s, 0)));
      }
      // Floor disc: top at floorT, underside at y = 0, edge touches the staves' inner face (no light gap)
      const fr = r(floorT) - dicke;
      const bretter = Math.max(3, Math.round((2 * fr) / 0.12));
      t.add(holz, roundBoards(fr, bretter, 0.002, floorT).translate(0, floorT, 0));
      // A disc in the middle of the boards closes their joints: they show wood below, not the ground
      t.add(holz, new CircleGeometry(fr, 48).rotateX(-Math.PI / 2).translate(0, floorT / 2, 0));

      // Two continuous iron hoops at about 0.2 h and 0.75 h, exactly like barrel: 64 segments + two RingGeometry caps
      const breite = Math.min(0.045, h * 0.05), staerke = 0.004;
      for (const f of [0.2, 0.75]) {
        const y = h * f, y0 = y - breite / 2, y1 = y + breite / 2;
        const ru = r(y0) + staerke, ro = r(y1) + staerke;
        t.add(reif, new CylinderGeometry(ro, ru, breite, 64, 1, true).translate(0, y, 0));
        t.add(reif, new RingGeometry(r(y1) - 0.0005, ro, 64, 1).rotateX(-Math.PI / 2).translate(0, y1, 0));
        t.add(reif, new RingGeometry(r(y0) - 0.0005, ru, 64, 1).rotateX(Math.PI / 2).translate(0, y0, 0));
      }
    } else {
      // Pressed sheet in one lathe profile: under the floor, round heel, up the outside, over a rolled bead, down the
      // inner wall and across the floor. Counter-clockwise around the section, so every face points out of the sheet
      const s = 0.0012, b = 0.0025, c = 0.005;
      innen = s;
      const profil: Vector2[] = [new Vector2(0, 0)];
      const bogen = (cx: number, cy: number, rad: number, von: number, bis: number, n: number) => {
        for (let i = 0; i <= n; i++) {
          const a = ((von + ((bis - von) * i) / n) * Math.PI) / 180;
          profil.push(new Vector2(cx + rad * Math.cos(a), cy + rad * Math.sin(a)));
        }
      };
      bogen(rBottom - c, c, c, -90, 0, 3);
      // A pressed stiffening rib low on the wall
      const rippe = (y: number) => 0.0018 * Math.exp(-(((y - h * 0.16) / 0.006) ** 2));
      const ys = [-0.9, -0.5, -0.25, 0, 0.25, 0.5, 0.9].map((k) => h * 0.16 + k * 0.012);
      for (const y of ys) profil.push(new Vector2(r(y) + rippe(y), y));
      // Up to the bead, round it outward and over, and in at the inner wall
      const cy = h - b, cx = r(cy) - s + b, unten = cy - 0.82 * b - 0.004;
      profil.push(new Vector2(r(unten), unten));
      bogen(cx, cy, b, -(Math.acos((s - b) / b) * 180) / Math.PI, 180, 9);
      for (const y of [...ys].reverse()) profil.push(new Vector2(r(y) + rippe(y) - s, y));
      bogen(rBottom - c, c, c - s, 0, -90, 3);
      profil.push(new Vector2(0, s));
      t.add(koerper, new LatheGeometry(profil, 48).rotateY(z() * Math.PI));
    }

    // Ears: a thin plate on the wall just below the rim, following its curve and taper, with a round boss for the bail
    const yo = h - 0.02, ro = r(yo), plattT = 0.0025, plattH = 0.026, halbW = 0.017 / ro, boss = 0.012;
    for (const seite of [-1, 1]) {
      const mitte = seite > 0 ? 0 : Math.PI;
      t.add(ohr, stave((y) => r(yo - plattH / 2 + y) + plattT, plattH, mitte - halbW, mitte + halbW, plattT, 2, 4).translate(0, yo - plattH / 2, 0));
      t.add(ohr, turned([[0.001, 0], [0.007, 0], [0.007, boss * 0.7], [0.0055, boss], [0.001, boss]], 16).rotateZ((-seite * Math.PI) / 2).translate(seite * (ro + plattT - 0.0005), yo, 0));
    }

    if (p.fill >= 0.02) {
      const y = floorT + p.fill * (h - floorT - 0.01);
      t.add(material("paint", p.liquidColour), new CircleGeometry(r(y) - innen - 0.0005, 48).rotateX(-Math.PI / 2).translate(0, y, 0));
    }

    // The bail: an upright wire half circle over the rim, its ends in the bosses on the hinge axis
    const R = ro + plattT + boss - 0.0035;
    const henkel = t.moving("handle", 0, yo, 0);
    henkel.add(metall, new TorusGeometry(R, 0.004, 8, 32, Math.PI).translate(0, yo, 0));

    return t.cylinder(p.radius, h).group();
  },
});
