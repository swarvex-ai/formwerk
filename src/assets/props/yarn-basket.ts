import { Curve, CylinderGeometry, Euler, SphereGeometry, TorusGeometry, TubeGeometry, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const yarnBasket = defineAsset({
  id: "yarn-basket", category: "props",
  title: { de: "Wollkorb", en: "Yarn basket" },
  description: {
    de: "Ein runder Weidenkorb: Staken stehen im Boden und reichen bis zum Rand, eine Flechtrute windet sich spiralförmig nach oben und läuft in jeder Runde auf der anderen Seite der Staken als in der Runde darunter, und zwei gegeneinander verdrehte Ruten bilden den Rand. Mit Wollknäueln darin und zwei Stricknadeln im obersten Knäuel – für eine Näh- oder Strickecke.",
    en: "A round wicker basket: stakes stand in the floor and reach to the rim, one weaving rod winds spirally upwards and passes on the opposite side of the stakes from the round below, and two rods twisted against each other form the rim. With balls of yarn inside and two knitting needles in the top ball – for a sewing or knitting corner.",
  },
  params: {
    diameter: { type: "number", label: { de: "Durchmesser", en: "Diameter" }, min: 0.24, max: 0.5, step: 0.01, default: 0.34, unit: "m",
      describe: { de: "Äußerer Durchmesser am Rand: 0,26 m ein kleiner Nähkorb, 0,34 m ein Wollkorb, 0,46 m eine Wollkammer.", en: "Outer diameter at the rim: 0.26 m a small sewing basket, 0.34 m a knitting basket, 0.46 m a wool store." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.1, max: 0.3, step: 0.01, default: 0.16, unit: "m",
      describe: { de: "Höhe des Wollkorbs ohne den Rand: 0,11 m ein kleiner Nähkorb, 0,16 m ein Wollkorb, 0,26 m eine Wollkammer.", en: "Height of the basket without the rim: 0.11 m a small sewing basket, 0.16 m a knitting basket, 0.26 m a wool store." } },
    flare: { type: "number", label: { de: "Trichterung", en: "Flare" }, min: 0, max: 0.2, step: 0.01, default: 0.1,
      describe: { de: "Um wie viel der Boden schmaler als der Rand ist, als Anteil des Radius: 0 gerade, 0,1 ein schmalerer Boden, 0,2 deutlich trichterförmig.", en: "How much narrower the floor is than the rim, as a fraction of the radius: 0 straight, 0.1 a narrower floor, 0.2 clearly funnel-shaped." } },
    stakes: { type: "integer", label: { de: "Staken", en: "Stakes" }, min: 11, max: 31, default: 21,
      describe: { de: "Anzahl der aufrechten Staken rund um den Korb: 11 ein schmaler Korb, 21 üblich, 31 ein voller Korb.", en: "Number of upright stakes around the basket: 11 a narrow basket, 21 usual, 31 a full basket." } },
    balls: { type: "integer", label: { de: "Knäuel", en: "Balls" }, min: 0, max: 6, default: 4,
      describe: { de: "Wollknäuel im Korb: 0 ein leerer Korb, 4 ein Wollkorb, 6 eine Wollkammer.", en: "Balls of yarn in the basket: 0 an empty basket, 4 a knitting basket, 6 a wool store." } },
    ball: { type: "number", label: { de: "Knäuelgrösse", en: "Ball size" }, min: 0.035, max: 0.07, step: 0.005, default: 0.05, unit: "m",
      describe: { de: "Radius der Wollknäuel: 0,035 m ein kleines Knäuel, 0,05 m ein übliches, 0,07 m ein großes.", en: "Radius of the yarn balls: 0.035 m a small ball, 0.05 m a usual one, 0.07 m a large ball." } },
    needles: { type: "boolean", label: { de: "Stricknadeln", en: "Needles" }, default: true,
      describe: { de: "Zwei Stricknadeln stecken im obersten Wollknäuel: an für eine Strickecke, aus für einen leeren Korb.", en: "Two knitting needles stuck in the top yarn ball: on for a knitting corner, off for an empty basket." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#b08a58",
      describe: { de: "Farbe der Weidenruten: #b08a58 Weide, #a8845c ein geflochtener Korb.", en: "Colour of the willow rods: #b08a58 willow, #a8845c a woven basket." } },
    yarn: { type: "color", label: { de: "Wolle", en: "Yarn" }, default: "#b8484a",
      describe: { de: "Farbe der Wollknäuel: #b8484a Wollrot, #d8c8a0 Naturwolle.", en: "Colour of the yarn balls: #b8484a wool red, #d8c8a0 natural wool." } },
    yarn2: { type: "color", label: { de: "Wolle 2", en: "Yarn 2" }, default: "#d8c8a0",
      describe: { de: "Farbe jedes zweiten Wollknäuels: #d8c8a0 Naturwolle, #b8484a Wollrot.", en: "Colour of every second yarn ball: #d8c8a0 natural wool, #b8484a wool red." } },
  },
  presets: {
    knitting: { label: { de: "Stricken", en: "Knitting" }, values: { balls: 4, needles: true } },
    "wool-store": { label: { de: "Wollkammer", en: "Wool store" }, values: { diameter: 0.46, height: 0.24, balls: 6, ball: 0.065, needles: false } },
    empty: { label: { de: "Leer", en: "Empty" }, values: { balls: 0, needles: false } },
  },
  physics: { body: "dynamic", collider: "cylinder" },
  budget: { triangles: 30000, drawCalls: 4 },
  build(p, seed) {
    const R = p.diameter / 2, h = p.height, rb = R * (1 - p.flare);
    const r = (y: number) => rb + (R - rb) * (y / h);
    const floorT = 0.012, sr = 0.004;
    const rows = Math.min(18, Math.max(6, Math.round((h - floorT) / 0.011)));
    const pitch = (h - floorT - 0.006) / rows, rr = pitch * 0.5;
    const n = p.stakes | 1;
    const korb = material("wood", p.colour, 4, 300, { plain: true });
    const t = new Parts();

    class Path extends Curve<Vector3> {
      constructor(private f: (t: number) => Vector3) { super(); }
      getPoint(t: number, out?: Vector3): Vector3 {
        return (out ?? new Vector3()).copy(this.f(t));
      }
    }

    // Stakes: upright rods from the floor to the rim, one per stake angle
    for (let k = 0; k < n; k++) {
      const a = (2 * Math.PI * k) / n;
      t.add(korb, new TubeGeometry(new Path((u) => {
        const y = floorT / 2 + u * (h - floorT / 2);
        const ry = r(y);
        return new Vector3(ry * Math.cos(a), y, ry * Math.sin(a));
      }), 4, sr, 5, false));
    }
    // Weaver: one rod spiralling up; because n is odd each round passes the stakes
    // on the opposite side from the round below (real randing)
    const amp = sr + rr * 0.9;
    t.add(korb, new TubeGeometry(new Path((u) => {
      const th = u * rows * 2 * Math.PI;
      const y = floorT + rr + u * rows * pitch;
      const radius = r(y) + amp * Math.cos(n * th / 2);
      return new Vector3(radius * Math.cos(th), y, radius * Math.sin(th));
    }), rows * n * 2, rr, 6, false));
    // Floor disc with its underside at y = 0
    t.add(korb, new CylinderGeometry(rb - 0.002, rb - 0.002, floorT, 40).translate(0, floorT / 2, 0));
    // Rim: two rods twisted into a rope
    const rimR = rr * 1.3, rimY = h - rimR * 0.3;
    for (const ph of [0, Math.PI]) {
      t.add(korb, new TubeGeometry(new Path((u) => {
        const th = u * 2 * Math.PI;
        const w = th * n + ph;
        const radius = r(rimY) + rimR * Math.cos(w);
        return new Vector3(radius * Math.cos(th), rimY + rimR * Math.sin(w), radius * Math.sin(th));
      }), n * 5, rimR, 6, true));
    }

    // Balls of yarn: two plain colours, every second ball takes yarn2
    const garn = material("paint", p.yarn, 1, 200, { plain: true });
    const garn2 = material("paint", p.yarn2, 1, 200, { plain: true });
    const b = Math.min(p.ball, (rb - 0.012) / 2.05);
    const ringR = rb - 0.01 - b * 1.05;
    const maxRing = ringR > b ? Math.max(1, Math.floor(Math.PI / Math.asin(Math.min(1, b * 1.05 / ringR)))) : 1;
    const inRing = Math.min(p.balls, p.balls >= 2 ? Math.min(maxRing, p.balls - (p.balls > 3 ? 1 : 0)) : 1);
    const rnd1 = rng(seed + 1), rnd2 = rng(seed + 2);
    let i = 0, topX = 0, topY = floorT + b, topZ = 0;
    const placeBall = (x: number, y: number, z: number) => {
      const mat = (i % 2 === 0) ? garn : garn2;
      i++;
      t.add(mat, new SphereGeometry(b * 0.96, 14, 10).translate(x, y, z));
      for (let w = 0; w < 8; w++) {
        const e = new Euler(rnd2() * 6.3, rnd2() * 6.3, rnd2() * 6.3);
        t.add(mat, new TorusGeometry(b * 0.96, 0.0035, 3, 20).rotateX(e.x).rotateY(e.y).rotateZ(e.z).translate(x, y, z));
      }
    };
    for (let j = 0; j < inRing; j++) {
      const angle = inRing === 1 ? 0 : (2 * Math.PI * j) / inRing + rnd1() * 0.3;
      placeBall(ringR * Math.cos(angle), floorT + b, ringR * Math.sin(angle));
    }
    if (p.balls > inRing) {
      topY = floorT + b + (inRing > 1 ? Math.sqrt(Math.max(0, 4 * b * b - ringR * ringR)) : 2 * b);
      topX = (rnd1() - 0.5) * 0.4 * b;
      topZ = (rnd1() - 0.5) * 0.4 * b;
      placeBall(topX, topY, topZ);
    }

    // Knitting needles through the top ball
    if (p.needles && p.balls > 0) {
      const nadeln = material("wood", "#c8a070", 4, 700, { plain: true });
      for (const s of [-1, 1]) {
        t.add(nadeln, new CylinderGeometry(0.0025, 0.0025, 0.3, 6).rotateZ(Math.PI / 2 - 0.5).rotateY(s * 0.35).translate(topX, topY + 0.3 * b, topZ));
      }
    }

    return t.cylinder(R + rimR, h + rimR).group();
  },
});
