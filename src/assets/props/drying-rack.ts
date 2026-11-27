import { BoxGeometry, Color, CylinderGeometry, Vector3, type Material } from "three";
import { rng } from "../../core/rng";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded } from "../shapes";

const KARTEN = 6;

// One herb bunch hanging head-down from the neck at x, y, z: crossed leaf cards that open downwards like a cone,
// each with both faces (formwerk materials render front faces only), the whole bunch turned and tilted a little.
function bunch(t: Parts, m: Material, x: number, y: number, z: number, len: number, turn: number, tilt: number, tiltDir: number) {
  const achse = new Vector3(Math.cos(tiltDir), 0, Math.sin(tiltDir));
  for (let k = 0; k < KARTEN; k++) {
    const a = turn + (k / KARTEN) * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
    // each card fans out a little from the axis, alternately to its two faces, so the cone has body
    const fan = (k % 2 ? 1 : -1) * 0.15;
    const at = (u: number, v: number) => {
      const s = u * 2 - 1, half = 0.005 + 0.03 * Math.sin((v * Math.PI) / 2);
      // the tips of the outer leaves end higher than the middle: a rounded, leafy bottom
      const down = len * v * (1 - 0.1 * s * s);
      const off = Math.sin(fan) * down;
      const q = new Vector3(ca * half * s - sa * off, -down, sa * half * s + ca * off).applyAxisAngle(achse, tilt);
      return q.add(new Vector3(x, y, z));
    };
    const n = new Vector3(-sa, 0, ca).applyAxisAngle(achse, tilt);
    t.add(m, grid(2, 3, at, () => n));
    t.add(m, grid(2, 3, at, () => n.clone().negate()));
  }
  // The tied stems above the leaves
  t.add(m, new CylinderGeometry(0.006, 0.009, 0.025, 8).translate(x, y + 0.008, z));
}

export const dryingRack = defineAsset({
  id: "drying-rack", category: "props",
  title: { de: "Kräutertrockengestell", en: "Herb drying rack" },
  description: {
    de: "Ein freistehendes Trockengestell aus Holz für Apotheken, Küchen, Bauernhäuser und Hexenhütten: zwei A-förmige Endrahmen mit Querstangen, an denen Kräuterbüschel kopfüber an kurzen Schnüren trocknen.",
    en: "A free-standing wooden drying rack for apothecaries, kitchens, farmhouses and witches' huts: two A-shaped end frames joined by rails, with bunches of herbs hanging head-down on short strings to dry.",
  },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.6, max: 1.6, step: 0.01, default: 1.0, unit: "m",
      describe: { de: "Länge der Stangen zwischen den Endrahmen: 0,7 m ein Küchengestell, 1 m üblich, 1,5 m ein langes in der Apotheke.", en: "Length of the rails between the end frames: 0.7 m a kitchen rack, 1 m usual, 1.5 m a long one in an apothecary." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.9, max: 1.8, step: 0.01, default: 1.4, unit: "m",
      describe: { de: "Höhe der obersten Stange: 1 m ein kleines Gestell auf der Anrichte, 1,4 m üblich, 1,8 m ein hohes.", en: "Height of the top rail: 1 m a small rack by the counter, 1.4 m usual, 1.8 m a tall one." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.4, max: 0.8, step: 0.01, default: 0.55, unit: "m",
      describe: { de: "Spreizung der Füße von vorn nach hinten: 0,4 m schmal, 0,55 m üblich, 0,8 m sehr standfest.", en: "Spread of the feet front to back: 0.4 m narrow, 0.55 m usual, 0.8 m very steady." } },
    rails: { type: "integer", label: { de: "Stangen", en: "Rails" }, min: 1, max: 4, step: 1, default: 3,
      describe: { de: "Zahl der Querstangen, gleichmäßig von 0,45 × Höhe bis oben: 1 nur die oberste, 3 üblich, 4 voll.", en: "Number of rails, spaced evenly from 0.45 × height to the top: 1 only the top one, 3 usual, 4 full." } },
    bunches: { type: "integer", label: { de: "Büschel", en: "Bunches" }, min: 0, max: 8, step: 1, default: 5,
      describe: { de: "Kräuterbüschel je Stange: 0 ein leeres Gestell, 3 ein paar, 5 üblich, 8 dicht behängt.", en: "Herb bunches per rail: 0 an empty rack, 3 a few, 5 usual, 8 densely hung." } },
    dried: { type: "number", label: { de: "Getrocknet", en: "Dried" }, min: 0, max: 1, step: 0.05, default: 0.4,
      describe: { de: "Wie weit die Kräuter getrocknet sind: 0 frisch und grün, 0,4 welk, 1 ganz braun.", en: "How far the herbs have dried: 0 fresh and green, 0.4 wilted, 1 fully brown." } },
    herbs: { type: "color", label: { de: "Kräuterfarbe", en: "Herb colour" }, default: "#5a8a40",
      describe: { de: "Farbe der frischen Kräuter: Grün #5a8a40, Salbei #7a9a7a, Lavendelblüten #8a70b0.", en: "Colour of the fresh herbs: green #5a8a40, sage #7a9a7a, lavender heads #8a70b0." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a6a48",
      describe: { de: "Farbe des Holzes: Kiefer #9a7650, übliches Holz #8a6a48, dunkle Eiche #5c4026.", en: "Colour of the wood: pine #9a7650, usual wood #8a6a48, dark oak #5c4026." } },
  },
  presets: {
    kitchen: { label: { de: "Küche", en: "Kitchen" }, values: { width: 0.7, height: 1.0, rails: 2, bunches: 3 } },
    apothecary: { label: { de: "Apotheke", en: "Apothecary" }, values: { width: 1.4, rails: 4, bunches: 7, dried: 0.7 } },
    lavender: { label: { de: "Lavendel", en: "Lavender" }, values: { herbs: "#8a70b0", dried: 0.2 } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 8000, drawCalls: 2 },
  build(p, seed) {
    const r = rng(seed), t = new Parts();
    const W = p.width, H = p.height, D = p.depth;
    const legW = 0.03, legD = 0.04, rail = 0.03, bevel = 0.004;
    // 800 kg/m³ instead of pine's 600: the pegs, wedges and lashings the model leaves out bring it to a real 8–10 kg
    const holz = material("wood", p.colour, 1, 800, { grain: "part" });
    const herb = `#${new Color(p.herbs).lerp(new Color("#8a6a3a"), p.dried).getHexString()}`;
    const kraut = material("leaf", herb, 1, 200, { plain: true });

    // The legs of each end frame meet under the top rail, which rests in the crotch they form above that point
    const yTop = H - rail / 2, meet = yTop - rail / 2;
    const zLeg = (y: number) => (D / 2) * (1 - y / meet);
    for (const s of [-1, 1]) {
      const x = s * W / 2;
      for (const k of [-1, 1]) {
        const lean = Math.atan2(D / 2, meet), len = Math.hypot(D / 2, meet) + 0.045;
        // build upright from the foot, lean it towards the middle, then lift it so its lowest corner touches the floor
        const g = rounded(legW, len, legD, bevel, 0, len / 2, 0, 1).rotateX(-k * lean);
        g.computeBoundingBox();
        g.translate(x, -g.boundingBox!.min.y, k * D / 2);
        t.add(holz, grained(g, "y"));
      }
      // The cross brace between the legs, on the inner face of the frame
      const yb = 0.3 * H, zb = zLeg(yb) + legD / 2 + 0.01;
      t.add(holz, grained(rounded(0.025, 0.04, 2 * zb, bevel, s * (W / 2 - (legW + 0.025) / 2), yb, 0, 1), "z"));
    }

    // Rails from 0.45 × height to the top; the lower ones are pegged to the outside of the legs, alternately front
    // and back, so their bunches hang clear of the others
    const len = W + legW + 0.05, y0 = 0.45 * H;
    const holes: [number, number][] = [];
    for (let i = 0; i < p.rails; i++) {
      const top = i === p.rails - 1, y = top ? yTop : y0 + ((yTop - y0) * i) / (p.rails - 1);
      const z = top ? 0 : (i % 2 ? -1 : 1) * (zLeg(y) + legD / 2 + rail / 2);
      t.add(holz, grained(rounded(len, rail, rail, bevel, 0, y, z, 1), "x"));
      holes.push([y, z]);
    }

    // On every rail the bunches, a 0.1 m margin from the frames: a string down to the tied neck, then the leaves
    const span = W / 2 - 0.1;
    for (const [y, z] of holes) for (let j = 0; j < p.bunches; j++) {
      const x = p.bunches === 1 ? 0 : -span + (2 * span * j) / (p.bunches - 1);
      const neck = y - rail / 2 - 0.06;
      t.add(holz, grained(new BoxGeometry(0.01, 0.065, 0.01).translate(x, neck + 0.0325, z), "y"));
      bunch(t, kraut, x, neck, z, 0.12 * (0.85 + 0.3 * r()), r() * Math.PI, 0.15 * r(), r() * Math.PI * 2);
    }
    return t.group();
  },
});
