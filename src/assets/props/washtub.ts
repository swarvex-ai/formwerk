import { CircleGeometry, CylinderGeometry, RingGeometry, Vector3 } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, roundBoards, stave } from "../shapes";

export const washtub = defineAsset({
  id: "washtub", category: "props",
  title: { de: "Waschzuber", en: "Washtub" },
  description: {
    de: "Ein niedriger, weiter Waschzuber aus Dauben mit Eisenreifen, zwei gegenüberliegenden Ohren mit Handloch für die Tragestange und Wasser innen.",
    en: "A low, wide laundry tub of staves and iron hoops, two opposite ears with a hand hole for a carrying pole and optional water inside.",
  },
  params: {
    diameter: { type: "number", label: { de: "Durchmesser", en: "Diameter" }, min: 0.45, max: 1.0, step: 0.01, default: 0.7, unit: "m",
      describe: { de: "Äußerer Durchmesser am Rand: 0,5 m ein kleiner Zuber, 0,7 m ein Waschzuber, 0,95 m ein Badezuber.", en: "Outer diameter at the rim: 0.5 m a small tub, 0.7 m a wash tub, 0.95 m a bathing tub." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.22, max: 0.45, step: 0.01, default: 0.3, unit: "m",
      describe: { de: "Höhe der Dauben ohne die Ohren: 0,24 m ein kleiner Zuber, 0,3 m ein Waschzuber, 0,42 m ein Badezuber.", en: "Height of the staves without the ears: 0.24 m a small tub, 0.3 m a wash tub, 0.42 m a bathing tub." } },
    taper: { type: "number", label: { de: "Verjüngung", en: "Taper" }, min: 0, max: 0.15, step: 0.01, default: 0.08,
      describe: { de: "Um wie viel der Boden schmaler als der Rand ist, als Anteil des Radius: 0 gerade, 0,08 ein klassischer Zuber.", en: "How much narrower the floor is than the rim, as a fraction of the radius: 0 straight, 0.08 a typical tub." } },
    hoops: { type: "integer", label: { de: "Reifen", en: "Hoops" }, min: 1, max: 3, default: 2,
      describe: { de: "Zahl der Eisenreifen: 1 ein Reifen in halber Höhe, 2 zwei Reifen, 3 bei einem großen Badezuber.", en: "Number of iron hoops: 1 one hoop at mid-height, 2 two hoops, 3 on a large bathing tub." } },
    ears: { type: "boolean", label: { de: "Ohren", en: "Ears" }, default: true,
      describe: { de: "Zwei gegenüberliegende Dauben steigen über den Rand auf und bilden Ohren mit Handloch für eine Tragestange.", en: "Two opposite staves rise above the rim as ears with a hand hole for a carrying pole." } },
    fill: { type: "number", label: { de: "Füllung", en: "Fill" }, min: 0, max: 1, step: 0.01, default: 0.4,
      describe: { de: "Wasserstand innen: 0 leer, 0,5 halbvoll, 1 randvoll.", en: "Water level inside: 0 empty, 0.5 half full, 1 brimful." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a6a48",
      describe: { de: "Farbe des Holzes: #8a6a48 ein gebrauchter Waschzuber, #a8845c fröhliche Tanne.", en: "Colour of the wood: #8a6a48 a used wash tub, #a8845c fresh spruce." } },
    waterColour: { type: "color", label: { de: "Wasser", en: "Water colour" }, default: "#6a8a96",
      describe: { de: "Farbe des Wassers: #6a8a96 klares Wasser, #7a8a72 Seifenlauge.", en: "Colour of the water: #6a8a96 clear water, #7a8a72 soapy water." } },
  },
  presets: {
    "wash-tub": { label: { de: "Waschzuber", en: "Wash tub" }, values: { ears: true } },
    "bath-tub": { label: { de: "Badezuber", en: "Bath tub" }, values: { diameter: 0.95, height: 0.42, fill: 0.6 } },
    "small": { label: { de: "Kleiner Zuber", en: "Small tub" }, values: { diameter: 0.5, height: 0.24, hoops: 1, ears: false, fill: 0 } },
  },
  physics: { body: "dynamic", collider: "cylinder" },
  budget: { triangles: 12000, drawCalls: 3 },
  build(p) {
    const R = p.diameter / 2, h = p.height, floorT = 0.015;
    const rBottom = R * (1 - p.taper);
    const r = (y: number) => rBottom + (R - rBottom) * (y / h);

    const holz = material("wood", p.colour, 1, 130);
    const reif = material("iron", "#4a4a4a", 1, 180);
    const t = new Parts();

    // Staves about a hand wide at mid height, ~2 mm joints, like barrel; a low tub needs fewer rows along y
    // n even so the two ear staves sit exactly opposite each other, centred at angle 0 (+x) and π (−x)
    let n = Math.max(16, Math.round((2 * Math.PI * r(h / 2)) / 0.095));
    if (n % 2) n += 1;
    const fuge = 0.002, halb = fuge / 2 / R, dicke = Math.max(0.016, R * 0.05);
    for (let i = 0; i < n; i++) {
      const s0 = (2 * Math.PI * (i + 0.5)) / n + halb, s1 = (2 * Math.PI * (i + 1.5)) / n - halb;
      t.add(holz, stave(r, h, s0, s1, dicke, 6, 3));
      if (p.ears && (i === n - 1 || i === n / 2 - 1)) {
        // The ear: this stave continued 0.09 m above the rim on the same taper line, as two posts (a third of the
        // stave's angle each) with the open middle third as hand hole and a top bar over them; the posts start
        // exactly at y = h so they join the stave below with no gap
        const drittel = (s1 - s0) / 3, pfosten = 0.09 - 0.025;
        t.add(holz, stave((y) => r(h + y), pfosten, s0, s0 + drittel, dicke, 2, 3).translate(0, h, 0));
        t.add(holz, stave((y) => r(h + y), pfosten, s1 - drittel, s1, dicke, 2, 3).translate(0, h, 0));
        t.add(holz, stave((y) => r(h + pfosten + y), 0.025, s0, s1, dicke, 1, 3).translate(0, h + pfosten, 0));
      }
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
    const breit = halb + 0.0004 / R;
    for (let i = 0; i < n; i++) for (const yd of [h - 0.002, y0]) {
      const a = (2 * Math.PI * (i + 1.5)) / n;
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

    // Iron hoops evenly spaced between 0.15 h and 0.8 h (one hoop at mid height): 35 mm wide, 4 mm proud, like bucket
    const breite = 0.035, staerke = 0.004;
    for (let k = 0; k < p.hoops; k++) {
      const y = h * (p.hoops === 1 ? 0.5 : 0.15 + (0.65 * k) / (p.hoops - 1)), hy0 = y - breite / 2, hy1 = y + breite / 2;
      const ru = r(hy0) + staerke, ro = r(hy1) + staerke;
      t.add(reif, new CylinderGeometry(ro, ru, breite, 64, 1, true).translate(0, y, 0));
      t.add(reif, new RingGeometry(r(hy1) - 0.0005, ro, 64, 1).rotateX(-Math.PI / 2).translate(0, hy1, 0));
      t.add(reif, new RingGeometry(r(hy0) - 0.0005, ru, 64, 1).rotateX(Math.PI / 2).translate(0, hy0, 0));
    }

    if (p.fill >= 0.02) {
      const y = floorT + p.fill * (h - floorT - 0.01);
      t.add(material("paint", p.waterColour), new CircleGeometry(r(y) - dicke / 2 - 0.0005, 48).rotateX(-Math.PI / 2).translate(0, y, 0));
    }

    return t.cylinder(R, h + (p.ears ? 0.09 : 0)).group();
  },
});
