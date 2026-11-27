import { hex, mixRGBA, Pixels, ramp, type RGBA, type Ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const TROCKEN = hex("#8a6a3a"), SCHNUR = hex("#d8c8a0"), DUNKEL: RGBA = [16, 12, 28, 255];

// One piece in its own coordinates: x from the stem's foot, y rows up from it. `spitze` droops when dried, `stiel`
// stays still in the sway; everything else in the top rows (from `wipfel` up) sways.
type Punkt = { x: number; y: number; c: RGBA; spitze?: boolean; stiel?: boolean };
type Stueck = { punkte: Punkt[]; wipfel: number };
type Farben = { blatt: Ramp; stiel: Ramp; wurzel: Ramp; blass: Ramp; gruen: Ramp; gelb: Ramp; fleck: RGBA };

// a sprig: a stem with pairs of leaves, each rising outwards to its tip, and a bud on top; `schmal` leaves for the bundle
function zweig(f: Farben, h: number, gross: boolean, schmal: boolean): Stueck {
  const { blatt: b, stiel: s } = f, punkte: Punkt[] = [];
  for (let y = 0; y < h - 1; y++) punkte.push({ x: 0, y, c: y === 0 ? s.dark : s.base, stiel: true });
  punkte.push({ x: 0, y: h, c: b.light }, { x: 0, y: h - 1, c: b.base });
  if (!gross) punkte.push({ x: -1, y: h - 1, c: b.light, spitze: true }, { x: 1, y: h - 1, c: b.base, spitze: true });
  const schritt = schmal ? 2 : 3;
  for (let k = h - (schmal ? 2 : 3), n = 0; k >= 3 && n < (schmal ? 2 : 3); k -= schritt, n++) {
    if (schmal) punkte.push({ x: -1, y: k, c: b.base }, { x: -2, y: k + 1, c: b.light, spitze: true }, { x: 1, y: k, c: b.dark }, { x: 2, y: k + 1, c: b.base, spitze: true });
    else punkte.push(
      { x: -1, y: k, c: b.base }, { x: -2, y: k, c: b.base }, { x: -2, y: k + 1, c: b.light }, { x: -3, y: k + 1, c: b.light, spitze: true },
      { x: 1, y: k, c: b.dark }, { x: 2, y: k, c: b.dark }, { x: 2, y: k + 1, c: b.base }, { x: 3, y: k + 1, c: b.base, spitze: true });
  }
  return { punkte, wipfel: h - (gross ? 2 : 1) };
}

// a root: a fat body narrowing to a neck under a tuft of three leaves, forking into two legs with a hair root each;
// in the bundle (`seite` -1, 0, 1) tied at the neck, the outer ones slimmer behind the middle one, tapering to a tip
function wurzel(f: Farben, h: number, gross: boolean, seite?: number): Stueck {
  const { blatt: b, wurzel: r } = f, punkte: Punkt[] = [], aussen = seite ?? 0;
  punkte.push({ x: -1, y: h - 1, c: b.base }, { x: -2, y: h, c: b.light, spitze: true }, { x: 0, y: h - 1, c: b.base }, { x: 0, y: h, c: b.light, spitze: true },
    { x: 1, y: h - 1, c: b.dark }, { x: 2, y: h, c: b.base, spitze: true });
  punkte.push({ x: 0, y: h - 2, c: r.base, stiel: true });
  const [links, rechts] = aussen < 0 ? [-2, -1] : aussen > 0 ? [1, 2] : [-1, gross ? 2 : 1];
  if (gross) punkte.push({ x: 0, y: h - 3, c: r.light, stiel: true }, { x: 1, y: h - 3, c: r.dark, stiel: true });
  for (let y = aussen ? 1 : seite === undefined ? 4 : 3; y <= h - (gross ? 4 : 3); y++) for (let x = links; x <= rechts; x++) {
    if (aussen && y < 3 && x !== aussen) continue;
    punkte.push({ x, y, c: x === links ? r.light : x === rechts ? r.dark : (y + x) % 3 === 0 ? r.deep : r.base, stiel: true });
  }
  if (!aussen) for (const [s, x0] of [[-1, -1], [1, rechts]]) {
    punkte.push({ x: x0, y: 3, c: s < 0 ? r.base : r.dark, stiel: true }, { x: x0 + s, y: 2, c: s < 0 ? r.base : r.dark, stiel: true });
    if (seite === undefined) punkte.push({ x: x0 + 2 * s, y: 1, c: r.dark, stiel: true }, { x: x0 + 3 * s, y: 0, c: r.dark, stiel: true });
  }
  return { punkte, wipfel: h - 1 };
}

// a mushroom: a short thick pale stem under a domed cap with light spots; `klein` is the narrow cap of the bundle
function pilz(f: Farben, gross: boolean, klein: number): Stueck {
  const { blatt: c, blass: p, fleck } = f, punkte: Punkt[] = [];
  if (klein) {
    for (let y = 0; y < klein; y++) punkte.push({ x: 0, y, c: p.base, stiel: true });
    for (let x = -2; x <= 2; x++) punkte.push({ x, y: klein, c: c.dark }, { x, y: klein + 1, c: x === -2 ? c.light : x === -1 ? fleck : x === 2 ? c.dark : c.base });
    for (let x = -1; x <= 1; x++) punkte.push({ x, y: klein + 2, c: x === -1 ? c.light : x === 1 ? fleck : c.base });
    return { punkte, wipfel: klein + 1 };
  }
  // rows of the cap from the bottom: [left, right] relative to the stem
  const [stiel, links, rechts, kappe, flecken]: [number, number, number, [number, number][], [number, number][]] = gross
    ? [4, -1, 1, [[-3, 3], [-5, 5], [-6, 6], [-6, 6], [-5, 5], [-4, 4], [-2, 2]], [[-3, 3], [3, 2], [0, 5]]]
    : [3, -1, 0, [[-3, 2], [-5, 4], [-5, 4], [-4, 3], [-2, 1]], [[-3, 2], [2, 1], [0, 3]]];
  for (let y = 0; y < stiel; y++) for (let x = links; x <= rechts; x++) punkte.push({ x, y, c: x === links ? p.light : x === rechts ? p.dark : p.base, stiel: true });
  const mitte = (links + rechts) / 2, breit = kappe[2][1] - kappe[2][0] + 1, hoch = kappe.length;
  kappe.forEach(([l, r], j) => {
    for (let x = l; x <= r; x++) {
      if (j === 0) { punkte.push({ x, y: stiel, c: c.deep }); continue; }
      const dx = (x - mitte) / (breit / 2), dy = (j - hoch / 2) / (hoch / 2), seite = dx * 0.6 - dy * 0.8;
      const rand = x === l || x === r || j === hoch - 1;
      punkte.push({ x, y: stiel + j, c: rand && seite > 0.1 ? c.dark : seite < -0.5 ? c.light : c.base });
    }
  });
  for (const [x, j] of flecken) punkte.push({ x, y: stiel + j, c: fleck });
  return { punkte, wipfel: stiel + hoch - 2 };
}

// a flower: five petals around a yellow centre on a stem with two leaves
function bluete(f: Farben, h: number, gross: boolean): Stueck {
  const { blatt: b, stiel: s, gruen: g, gelb } = f, punkte: Punkt[] = [];
  const m = gross ? h - 3 : h - 1; // the (lower left) centre pixel
  for (let y = 0; y < m; y++) punkte.push({ x: 0, y, c: y === 0 ? s.dark : s.base, stiel: true });
  if (gross) {
    punkte.push({ x: 0, y: m, c: gelb.light }, { x: 1, y: m, c: gelb.base }, { x: 0, y: m + 1, c: gelb.light }, { x: 1, y: m + 1, c: gelb.dark });
    for (const [x, y, c] of [[0, 2, b.light], [1, 2, b.base], [0, 3, b.light], [1, 3, b.light], [-1, 0, b.base], [-2, 0, b.base], [-1, 1, b.light], [-2, 1, b.light],
      [2, 0, b.dark], [3, 0, b.dark], [2, 1, b.base], [3, 1, b.base], [-1, -1, b.base], [-2, -2, b.base], [2, -1, b.dark], [3, -2, b.dark]] as [number, number, RGBA][]) punkte.push({ x, y: m + y, c });
    punkte.push({ x: -1, y: 3, c: g.base }, { x: -2, y: 3, c: g.base }, { x: -2, y: 4, c: g.light }, { x: -3, y: 4, c: g.light, spitze: true },
      { x: 1, y: 4, c: g.dark }, { x: 2, y: 4, c: g.dark }, { x: 2, y: 5, c: g.base }, { x: 3, y: 5, c: g.base, spitze: true });
  } else {
    punkte.push({ x: 0, y: m, c: gelb.base });
    for (const [x, y, c] of [[0, 1, b.light], [-1, 0, b.light], [1, 0, b.base], [-1, -1, b.base], [1, -1, b.dark]] as [number, number, RGBA][]) punkte.push({ x, y: m + y, c });
    punkte.push({ x: -1, y: 3, c: g.base }, { x: -2, y: 4, c: g.light, spitze: true }, { x: 1, y: 4, c: g.dark }, { x: 2, y: 5, c: g.base, spitze: true });
  }
  return { punkte, wipfel: gross ? m + 2 : m };
}

export const herbs = defineSprite({
  id: "herbs", category: "items",
  title: { de: "Kräuter", en: "Herbs" },
  description: {
    de: "Eine Zutat als Pixel-Symbol für Inventar, Handwerk und Alchemie: ein Zweig, eine Wurzel, ein Pilz oder eine Blume, einzeln oder zu dritt gebündelt, frisch oder getrocknet, mit Spitzen, die sich im Wind wiegen. 16 × 16 Pixel.",
    en: "An ingredient as a pixel icon for inventories, crafting and alchemy: a sprig, a root, a mushroom or a flower, alone or tied in a bundle of three, fresh or dried, with tips that sway in the wind. 16 × 16 pixels.",
  },
  params: {
    kind: { type: "choice", options: ["sprig", "root", "mushroom", "flower"], default: "sprig", label: { de: "Sorte", en: "Kind" },
      labels: { sprig: { de: "Zweig", en: "sprig" }, root: { de: "Wurzel", en: "root" }, mushroom: { de: "Pilz", en: "mushroom" }, flower: { de: "Blume", en: "flower" } },
      describe: { de: "Welche Zutat: ein Stängel mit Blattpaaren (Salbei, Minze), eine gegabelte braune Wurzel mit Blattbüschel (Alraune, Ginseng), ein Pilz mit gewölbtem, gepunktetem Hut auf hellem Stiel, eine Blume mit fünf Blütenblättern um eine gelbe Mitte.", en: "Which ingredient: a stem with pairs of leaves (sage, mint), a forked brown root with a tuft of leaves (mandrake, ginseng), a mushroom with a domed, spotted cap on a pale stem, a flower with five petals around a yellow centre." } },
    bundle: { type: "boolean", default: false, label: { de: "Bündel", en: "Bundle" },
      describe: { de: "Drei Stück nebeneinander, gefächert und mit einer Schnur um die Stiele gebunden, wie ein Kräuterbund vom Markt; aus: ein einzelnes Stück in der Mitte.", en: "Three pieces side by side, fanned and tied with a string around the stems like a bunch of herbs from the market; off: one piece in the middle." } },
    size: { type: "choice", options: ["small", "large"], default: "small", label: { de: "Größe", en: "Size" },
      labels: { small: { de: "klein", en: "small" }, large: { de: "groß", en: "large" } },
      describe: { de: "Wie viel vom Rahmen gefüllt ist: klein etwa 10 Pixel hoch für Inventarfelder, groß etwa 13 Pixel für Handwerksmenüs.", en: "How much of the frame it fills: small about 10 pixels high for inventory slots, large about 13 pixels for crafting menus." } },
    dried: { type: "boolean", default: false, label: { de: "Getrocknet", en: "Dried" },
      describe: { de: "Getrocknet: die Farben werden braun und matt, die Blattspitzen hängen einen Pixel herab; aus: frisch gepflückt.", en: "Dried: the colours turn brown and dull and the leaf tips droop one pixel; off: freshly picked." } },
    colour: { type: "color", default: "#4f9a3c", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe der Blätter (Zweig, Wurzelkraut; grün #4f9a3c, Salbei #7a9a7a), beim Pilz des Huts (rot #b0402c, braun #9a7a52), bei der Blume der Blütenblätter (Lavendel #a070c8, Kamille #e8d84a, dann weißgelb).", en: "Colour of the leaves (sprig, root tuft; green #4f9a3c, sage #7a9a7a), of the cap for the mushroom (red #b0402c, brown #9a7a52), of the petals for the flower (lavender #a070c8, chamomile #e8d84a, then white-yellow)." } },
  },
  presets: {
    sage: { label: { de: "Salbei", en: "Sage" }, values: { kind: "sprig", colour: "#7a9a7a" } },
    mandrake: { label: { de: "Alraune", en: "Mandrake" }, values: { kind: "root" } },
    toadstool: { label: { de: "Fliegenpilz", en: "Toadstool" }, values: { kind: "mushroom", colour: "#b0402c" } },
    lavender: { label: { de: "Lavendel", en: "Lavender" }, values: { kind: "flower", colour: "#a070c8", bundle: true } },
    "dried-bundle": { label: { de: "Getrocknetes Bündel", en: "Dried bundle" }, values: { kind: "sprig", bundle: true, dried: true } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "sway", frames: 4, fps: 6, loop: true }],
  grounded: false,
  build(p) {
    const r = (c: string | RGBA) => ramp(p.dried ? mixRGBA(typeof c === "string" ? hex(c) : c, TROCKEN, 0.5) : c);
    const f: Farben = { blatt: r(p.colour), stiel: r("#6f7a3a"), wurzel: r("#a06c3c"), blass: r("#e0d4b4"), gruen: r("#4f9a3c"), gelb: r("#f0c030"), fleck: r("#f4ecd8").base };
    const gross = p.size === "large";
    // the pieces: one in the middle, or a bundle with a taller middle one in front of two shorter ones fanned outwards
    const stueck = (seite: number): Stueck => {
      const mitte = seite === 0;
      const g = gross && !p.bundle, h = p.bundle ? (mitte ? (gross ? 12 : 9) : gross ? 9 : 7) : gross ? 12 : 9;
      if (p.kind === "root") return wurzel(f, p.bundle ? (gross ? 12 : 9) : h, g, p.bundle ? seite : undefined);
      if (p.kind === "mushroom") return pilz(f, g, p.bundle ? (mitte ? (gross ? 8 : 6) : gross ? 5 : 3) : 0);
      if (p.kind === "flower") return bluete(f, p.bundle && !mitte ? h + 1 : h, g);
      return zweig(f, h, g, p.bundle);
    };
    const teile = (p.bundle ? [-1, 1, 0] : [0]).map((s) => [s, stueck(s)] as const);
    // stems stand at x 6, 8, 10 up to the row above the string and lean outwards by a pixel every three rows above;
    // roots are tied at the neck, under their tufts
    const knoten = p.kind === "root" ? (gross ? 10 : 7) : 2;
    const neigung = (s: number, y: number) => s * (y > knoten ? 2 + Number(p.kind === "root") + Math.floor((y - knoten - 1) / 3) : 2 + (p.kind === "root" ? Math.floor((knoten - y) / 3) : 0));
    const lage = (q: Punkt) => q.y - (p.dried && q.spitze ? 1 : 0);
    const oben = Math.max(...teile.flatMap(([, t]) => t.punkte.map(lage)));
    const unten = Math.floor((H + oben + 1) / 2) - 1;
    return (animation, _d, n) => {
      const b = new Pixels(W, H), wind = animation === "sway" ? [0, 1, 0, -1][n] : 0;
      for (const [s, t] of teile) {
        const ebene = new Pixels(W, H);
        for (const q of t.punkte) {
          const x = 8 + q.x + neigung(s, q.y) + (q.y >= t.wipfel && !q.stiel ? wind : 0), y = unten - lage(q);
          if (x > 0 && y > 0 && x < W - 1 && y < H - 1) ebene.set(x, y, s ? mixRGBA(q.c, DUNKEL, 0.22) : q.c);
        }
        // the piece in front gets a dark edge where it covers the ones behind, so each reads on its own
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          if (ebene.alpha(x, y) || !b.alpha(x, y)) continue;
          if ([[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => ebene.alpha(x + dx, y + dy))) b.set(x, y, mixRGBA(b.get(x, y), DUNKEL, 0.78));
        }
        b.blit(ebene, 0, 0);
      }
      // the string across the stems, two rows above their ends (roots: across the necks)
      if (p.bundle) for (let x = 6; x <= 10; x++) b.set(x, unten - knoten, SCHNUR);
      return b;
    };
  },
});
