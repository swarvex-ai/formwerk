import { ExtrudeGeometry, Path, Shape, Vector2, Vector3 } from "three";
import { grid, rounded, turned } from "../shapes";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const anvil = defineAsset({
  id: "anvil", category: "props",
  title: { de: "Amboss", en: "Anvil" },
  description: { de: "Ein Schmiedeamboss: Bahn auf schmaler Taille mit Fuß und konischem Horn, auf einem Holzklumpen oder auf dem Boden.", en: "A blacksmith's anvil: the face on a pinched waist with a foot and a conical horn, standing on a wooden stump or on the floor." },
  params: {
    length: { type: "number", label: { de: "Bahnlänge", en: "Face length" }, min: 0.3, max: 0.9, step: 0.01, default: 0.5, unit: "m",
      describe: { de: "Länge der Bahn ohne Horn: 0,3 m Bankamboss, 0,5 m Schmiedeamboss, 0,9 m schwerer Amboss.", en: "Face length without the horn: 0.3 m a bench anvil, 0.5 m a forge anvil, 0.9 m a heavy anvil." } },
    faceWidth: { type: "number", label: { de: "Bahnbreite", en: "Face width" }, min: 0.08, max: 0.2, step: 0.01, default: 0.12, unit: "m",
      describe: { de: "Breite der Bahn von vorn nach hinten: 0,08 m klein, 0,12 m üblich, 0,2 m schwerer Amboss.", en: "Width of the face from front to back: 0.08 m small, 0.12 m usual, 0.2 m a heavy anvil." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.15, max: 0.4, step: 0.01, default: 0.25, unit: "m",
      describe: { de: "Höhe des Ambosskörpers vom Fuß bis zur Bahn: 0,15 m Bankamboss, 0,25 m üblich, 0,4 m schwerer Amboss.", en: "Height of the anvil body from foot to face: 0.15 m a bench anvil, 0.25 m usual, 0.4 m a heavy anvil." } },
    horn: { type: "number", label: { de: "Horn", en: "Horn" }, min: 0, max: 1, step: 0.05, default: 0.6,
      describe: { de: "Länge des konischen Horns als Anteil der Bahnlänge: 0 ohne Horn, 0,6 üblich, 1 so lang wie die Bahn.", en: "Length of the conical horn as a share of the face length: 0 no horn, 0.6 usual, 1 as long as the face." } },
    waist: { type: "number", label: { de: "Taille", en: "Waist" }, min: 0.3, max: 0.8, step: 0.05, default: 0.5,
      describe: { de: "Breite der schmalen Mitte als Anteil der Bahnbreite: 0,3 schlank, 0,5 üblich, 0,8 massig.", en: "Width of the narrow middle as a share of the face width: 0.3 slim, 0.5 usual, 0.8 stocky." } },
    stump: { type: "boolean", label: { de: "Holzklumpen", en: "Wooden stump" }, default: true,
      describe: { de: "Der Amboss steht auf einem 0,5 m hohen Holzklumpen, sonst steht der Fuß direkt auf dem Boden.", en: "The anvil stands on a wooden stump 0.5 m high, otherwise the foot rests directly on the floor." } },
    colour: { type: "color", label: { de: "Eisen", en: "Iron" }, default: "#3c3f44",
      describe: { de: "Farbe des Schmiedeeisens: #3c3f44 dunkles Eisen, #56595e polierte Bahn.", en: "Colour of the wrought iron: #3c3f44 dark iron, #56595e a polished face." } },
  },
  presets: {
    forge: { label: { de: "Schmiedeamboss", en: "Forge anvil" }, values: { horn: 0.6, stump: true } },
    "small-bench": { label: { de: "Bankamboss", en: "Bench anvil" }, values: { length: 0.3, faceWidth: 0.08, height: 0.15, horn: 0.4, stump: false } },
    heavy: { label: { de: "Schwerer Amboss", en: "Heavy anvil" }, values: { length: 0.8, faceWidth: 0.18, height: 0.35, horn: 0.7 } },
  },
  // A stump under the anvil fixes it in the level; the bare body is a prop that can be pushed.
  // The contract knows only one body per asset, so it follows the default (stump on).
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 6000, drawCalls: 3 },
  build(p) {
    // Forged iron at the scale of an anvil: little rust, in speckles a few millimetres across, the face nearly bare
    const eisen = material("iron", p.colour, 5, undefined, { rust: 0.15 }), t = new Parts();
    const L = p.length, fw = p.faceWidth, h = p.height, y0 = p.stump ? 0.5 : 0, ease = 0.003;
    if (p.stump) {
      // A log section centred on the y axis: bark on the side with a slight root flare, growth rings on the cut top
      const R = 0.6 * Math.max(L, fw);
      t.add(material("bark", "#5b4532"), turned([[0.001, 0], [R * 1.03, 0], [R * 1.02, 0.05], [R, 0.14], [R, 0.49], [R * 0.985, 0.496]], 32));
      t.add(material("wood", "#c9a477", 1, undefined, { grain: "rings" }), turned([[0.001, 0.47], [R * 0.985, 0.47], [R * 0.985, 0.497], [R * 0.975, 0.5], [0.001, 0.5]], 32));
    }
    // Heights of the body: foot plate up to yF, waist up to yB, the top block up to the face at yT, the table a step lower
    const yF = y0 + 0.2 * h, yB = y0 + 0.62 * h, yT = y0 + h, yS = yT - 0.07 * h, tab = 0.15 * L;
    // The foot plate on four short feet at the corners
    const fx = 0.38 * L, fz = 0.7 * fw, fe = 0.04 * h;
    t.add(eisen, rounded(2 * fx, yF - y0 - fe, 2 * fz, 0.005, 0, (y0 + fe + yF) / 2, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(eisen, rounded(0.44 * fx, fe + 0.004, 0.7 * fz, 0.003, sx * 0.78 * fx, y0 + (fe + 0.004) / 2, sz * 0.65 * fz));
    // The waist: a rounded section that pinches in smooth curves from the foot to the top block (flat in the middle)
    const kurve = (unten: number, mitte: number, oben: number, k: number) =>
      mitte + (unten - mitte) * Math.max(0, 1 - k / 0.45) ** 2 + (oben - mitte) * Math.max(0, (k - 0.55) / 0.45) ** 2;
    t.add(eisen, grid(32, 16, (u, v) => {
      const a = kurve(0.33 * L, (0.12 + 0.12 * p.waist) * L, 0.26 * L, v), b = kurve(0.6 * fw, (p.waist * fw) / 2, 0.47 * fw, v);
      const c = Math.cos(2 * Math.PI * u), s = Math.sin(2 * Math.PI * u);
      return new Vector3(a * Math.sign(c) * Math.abs(c) ** 0.5, yF - 0.004 + (yB - yF + 0.004) * v, b * Math.sign(s) * Math.abs(s) ** 0.5);
    }, (q) => new Vector3(q.x, 0, q.z)));
    // The top block with the face, eased edges, the square hardy hole and the round pritchel hole at the heel (-x)
    const x0 = -L / 2, x1 = L / 2 - tab, hw = fw / 2, hs = 0.09 * fw, pr = 0.05 * fw;
    const xh = x0 + Math.max(0.1 * L, hs + 0.012), xp = xh + hs + pr + Math.max(0.012, 0.05 * L);
    const form = new Shape([new Vector2(x0, -hw), new Vector2(x1, -hw), new Vector2(x1, hw), new Vector2(x0, hw)]);
    form.holes.push(new Path([new Vector2(xh - hs, -hs), new Vector2(xh + hs, -hs), new Vector2(xh + hs, hs), new Vector2(xh - hs, hs)]));
    form.holes.push(new Path().absarc(xp, 0, pr, 0, Math.PI * 2, true));
    t.add(eisen, new ExtrudeGeometry(form, { depth: yT - yB - 2 * ease, bevelEnabled: true, bevelThickness: ease, bevelSize: ease, bevelOffset: -ease, bevelSegments: 2, curveSegments: 12 })
      .rotateX(-Math.PI / 2).translate(0, yB + ease, 0));
    // The table: a step below the face between the face and the horn
    t.add(eisen, rounded(tab + 0.004, yS - yB, 0.9 * fw, ease, L / 2 - tab / 2 - 0.002, (yB + yS) / 2, 0));
    // The horn: an oval cone from the table end that tapers linearly and arcs down to a rounded nose
    if (p.horn > 0.005) {
      const len = p.horn * L, a0 = (yS - yB) / 2, b0 = Math.min(0.45 * fw, 1.4 * a0), rT = Math.min(0.25 * a0, 0.4 * len), lc = len - rT, sinkt = 0.14 * h;
      t.add(eisen, grid(24, 24, (u, v) => {
        const gerade = u < 0.75, w = ((u - 0.75) / 0.25) * (Math.PI / 2);
        const s = gerade ? (u / 0.75) * lc : lc + rT * Math.sin(w), k = gerade ? 1 - s / lc : 0, f = gerade ? 1 : Math.cos(w);
        const a = (rT + (a0 - rT) * k) * f, b = (rT + (b0 - rT) * k) * f, yc = yB + a0 - sinkt * (s / len) ** 2;
        return new Vector3(L / 2 - 0.004 + s, yc + a * Math.cos(2 * Math.PI * v), b * Math.sin(2 * Math.PI * v));
      }, () => new Vector3(0, -1, 0)));
    }
    return t.group();
  },
});
