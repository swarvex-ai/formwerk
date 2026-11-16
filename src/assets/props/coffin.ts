import { BufferGeometry, Color, ExtrudeGeometry, Shape } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded } from "../shapes";

type Pt = [number, number];
// The outline in plan (x, z), the head at -z
function kontur(outline: string, L: number, W: number): Pt[] {
  return outline === "box"
    ? [[-W / 2, -L / 2], [W / 2, -L / 2], [W / 2, L / 2], [-W / 2, L / 2]]
    : [[-0.3 * W, -L / 2], [0.3 * W, -L / 2], [0.5 * W, -0.2 * L], [0.225 * W, L / 2], [-0.225 * W, L / 2], [-0.5 * W, -0.2 * L]];
}
// Outward unit normal of the edge i of a convex outline
function aussen(k: Pt[], i: number): Pt {
  const [ax, az] = k[i], [bx, bz] = k[(i + 1) % k.length], len = Math.hypot(bx - ax, bz - az);
  const cx = k.reduce((u, q) => u + q[0], 0) / k.length, cz = k.reduce((u, q) => u + q[1], 0) / k.length;
  let nx = (bz - az) / len, nz = -(bx - ax) / len;
  if (nx * ((ax + bx) / 2 - cx) + nz * ((az + bz) / 2 - cz) < 0) { nx = -nx; nz = -nz; }
  return [nx, nz];
}
// The outline pushed out by o on every side: the corners are where the shifted edges meet
function versetzt(k: Pt[], o: number): Pt[] {
  const n = k.length;
  return k.map((_, i) => {
    const j = (i + n - 1) % n, [n0x, n0z] = aussen(k, j), [n1x, n1z] = aussen(k, i);
    const q = k[j], r = k[i], s = k[(i + 1) % n], p = k[i];
    const d0: Pt = [p[0] - q[0], p[1] - q[1]], d1: Pt = [s[0] - r[0], s[1] - r[1]];
    const p0: Pt = [q[0] + n0x * o, q[1] + n0z * o], p1: Pt = [r[0] + n1x * o, r[1] + n1z * o];
    const det = d0[0] * d1[1] - d0[1] * d1[0], t = ((p1[0] - p0[0]) * d1[1] - (p1[1] - p0[1]) * d1[0]) / det;
    return [p0[0] + t * d0[0], p0[1] + t * d0[1]] as Pt;
  });
}
// The part of a convex outline between the vertical lines x0 and x1
function schnitt(k: Pt[], x0: number, x1: number): Pt[] {
  const halb = (q: Pt[], f: (p: Pt) => number) => {
    const out: Pt[] = [];
    q.forEach((p, i) => {
      const r = q[(i + 1) % q.length], a = f(p), b = f(r);
      if (a >= 0) out.push(p);
      if (a >= 0 !== b >= 0) out.push([p[0] + (r[0] - p[0]) * (a / (a - b)), p[1] + (r[1] - p[1]) * (a / (a - b))]);
    });
    return out;
  };
  return halb(halb(k, (p) => p[0] - x0), (p) => x1 - p[0]);
}
// A flat plate of the outline from y0, th thick, with eased edges
function platte(k: Pt[], y0: number, th: number): BufferGeometry {
  const e = Math.min(0.003, th / 3), s = new Shape();
  k.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)));
  return new ExtrudeGeometry(s, { depth: th - 2 * e, bevelEnabled: true, bevelThickness: e, bevelSize: e, bevelOffset: -e, bevelSegments: 1 })
    .rotateX(-Math.PI / 2).translate(0, y0 + e, 0);
}
// The outline cut into boards along z, a hand wide, with 2 mm joints; the outer boards run to the outline
function bretter(k: Pt[], y0: number, th: number, wahl: () => number): [number, BufferGeometry][] {
  const x0 = Math.min(...k.map((q) => q[0])), x1 = Math.max(...k.map((q) => q[0]));
  const n = Math.max(1, Math.round((x1 - x0) / 0.11)), out: [number, BufferGeometry][] = [];
  for (let i = 0; i < n; i++) {
    const q = schnitt(k, x0 + ((x1 - x0) * i) / n + (i ? 0.001 : -1), x0 + ((x1 - x0) * (i + 1)) / n - (i < n - 1 ? 0.001 : -1));
    if (q.length >= 3) out.push([wahl(), platte(q, y0, th)]);
  }
  return out;
}

export const coffin = defineAsset({
  id: "coffin", category: "props",
  title: { de: "Sarg", en: "Coffin" },
  description: { de: "Ein hölzerner Sarg für Friedhof, Gruft, Vampirlager und Bestattungshaus: rechteckige oder sechseckige Form mit drei Metallgriffen an jeder Längsseite, der Deckel klappt auf (bewegliches Teil „lid“), auf Wunsch mit erhabenem Kreuz.", en: "A wooden coffin for graveyards, crypts, vampire lairs and undertakers' shops: box or six-sided outline with three metal handles on each long side, the lid opens (movable part \"lid\"), optionally with a raised cross." },
  params: {
    outline: { type: "choice", label: { de: "Umriss", en: "Outline" }, options: ["box", "tapered"],
      labels: { box: { de: "Rechteckig", en: "Box" }, tapered: { de: "Sechseckig", en: "Tapered" } }, default: "tapered",
      describe: { de: "Form von oben: Rechteck oder die klassische sechseckige Form, am breitesten an den Schultern, zum Kopf- und Fußende schmaler.", en: "Shape in plan: a rectangle or the classic six-sided outline, widest at the shoulders, narrower at the head and foot ends." } },
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 1.6, max: 2.2, step: 0.01, default: 1.9, unit: "m",
      describe: { de: "Länge von Kopf- bis Fußende: 1,7 m ein Kindersarg, 1,9 m üblich, 2,1 m für eine große Person.", en: "Length from the head to the foot end: 1.7 m a child's coffin, 1.9 m usual, 2.1 m for a tall person." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.45, max: 0.75, step: 0.01, default: 0.6, unit: "m",
      describe: { de: "Breite an den Schultern: 0,5 m schmal, 0,6 m üblich, 0,7 m breit.", en: "Width at the shoulders: 0.5 m narrow, 0.6 m usual, 0.7 m broad." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.3, max: 0.5, step: 0.01, default: 0.38, unit: "m",
      describe: { de: "Höhe des Kastens ohne Deckel: 0,3 m flach, 0,38 m üblich, 0,5 m hoch.", en: "Height of the body without the lid: 0.3 m low, 0.38 m usual, 0.5 m tall." } },
    handles: { type: "boolean", label: { de: "Griffe", en: "Handles" }, default: true,
      describe: { de: "Drei Metallgriffe an jeder Längsseite: 12 cm lange Stäbe, 3 cm von der Wand abgesetzt, auf halber Höhe.", en: "Three metal handles on each long side: 12 cm bars standing 3 cm out from the side, at mid height." } },
    cross: { type: "boolean", label: { de: "Kreuz", en: "Cross" }, default: false,
      describe: { de: "Ein erhaben aufgesetztes Kreuz auf dem Deckel: 1 cm hoch, eine halbe Länge lang, aus dem Holz des Deckels.", en: "A raised cross on the lid: 1 cm proud, half the length long, of the lid's wood." } },
    colour: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#5a3a24",
      describe: { de: "Farbe des Holzes: #5a3a24 dunkle Eiche, #8a5a33 Kiefer, #2a1a18 fast schwarz.", en: "Colour of the wood: #5a3a24 dark oak, #8a5a33 pine, #2a1a18 nearly black." } },
    metalColour: { type: "color", label: { de: "Griffe", en: "Handles" }, default: "#8a7a5a",
      describe: { de: "Farbe der Griffe: Messing #8a7a5a, altes Silber #b0a080, Eisen #4a4a4a.", en: "Colour of the handles: brass #8a7a5a, old silver #b0a080, iron #4a4a4a." } },
  },
  presets: {
    tapered: { label: { de: "Klassisch sechseckig", en: "Classic tapered" }, values: { outline: "tapered" } },
    "plain-box": { label: { de: "Schlichtes Rechteck", en: "Plain box" }, values: { outline: "box", handles: false } },
    vampire: { label: { de: "Vampirsarg", en: "Vampire coffin" }, values: { cross: true, colour: "#2a1a18", metalColour: "#b0a080" } },
  },
  rig: { lid: { label: { de: "Deckel", en: "Lid" }, type: "rotate", axis: [0, 0, 1], min: 0, max: 100 } },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 16000, drawCalls: 4 },
  build(p, seed) {
    const L = p.length, W = p.width, H = p.height, d = 0.025;
    // Drawn solid but hollow inside, so an effective density of 300; the fibres run along the length of the boards.
    // Two tones of the wood, as the barrel's staves; the lid is one tone (a movable part costs a draw call per material)
    const ton = `#${new Color(p.colour).multiplyScalar(0.88).getHexString()}`;
    const holz = [material("wood", p.colour, 1, 300, { grain: "z" }), material("wood", ton, 1, 300, { grain: "z" })];
    const metall = material("metal", p.metalColour);
    const zufall = rng(seed), wahl = () => (zufall() < 0.45 ? 1 : 0);
    const k = kontur(p.outline, L, W), t = new Parts();
    // Bottom boards along the length; the walls stand on them
    for (const [m, g] of bretter(k, 0, d, wahl)) t.add(holz[m], g);
    // Walls: one run of boards per edge with its outer face on the outline, as many courses as the height needs
    const lauf = Math.max(1, Math.ceil((H - d) / 0.15)), hb = (H - d) / lauf;
    k.forEach(([ax, az], i) => {
      const [bx, bz] = k[(i + 1) % k.length], [nx, nz] = aussen(k, i), len = Math.hypot(bx - ax, bz - az), a = Math.atan2(bx - ax, bz - az);
      for (let c = 0; c < lauf; c++) {
        const g = rounded(d, hb - 0.002, len, 0.004).rotateY(a);
        t.add(holz[wahl()], g.translate((ax + bx) / 2 - (nx * d) / 2, d + hb * (c + 0.5), (az + bz) / 2 - (nz * d) / 2));
      }
    });
    // The hinge runs along z through the shoulders' left corner; inside the moving part (define.ts shifts by the
    // pivot) the lid then spans x = 0 to W from the hinge: positive rotation about z lifts its +x edge, the lid swings
    // up over the left side and never into the body. It overhangs on three sides, not over the hinge, and at 0 it
    // sits on the body's top: a moulded plate below, the boards on top
    const deckel = t.moving("lid", -W / 2, H, 0);
    deckel.add(holz[0], platte(schnitt(versetzt(k, 0.022), -W / 2, 1e3), H, 0.012));
    for (const [, g] of bretter(schnitt(versetzt(k, 0.008), -W / 2, 1e3), H + 0.012, 0.018, () => 0)) deckel.add(holz[0], g);
    if (p.cross) {
      // Resting on the lid's top surface, 1 cm proud, centred along z at 0.4 × length from the head end
      const zK = -L / 2 + 0.4 * L;
      deckel.add(holz[0], rounded(0.09, 0.01, 0.5 * L, 0.003, 0, H + 0.035, zK));
      deckel.add(holz[0], rounded(0.26, 0.01, 0.09, 0.003, 0, H + 0.035, zK - 0.16 * L));
    }
    if (p.handles) {
      // Three handles per long side, from the shoulder to the foot (box: the whole side), turned to follow the slanting face
      for (const s of [-1, 1]) {
        const ax = (s * W) / 2, az = p.outline === "tapered" ? -0.2 * L : -L / 2;
        const dx = (p.outline === "tapered" ? s * 0.225 * W : (s * W) / 2) - ax, dz = L / 2 - az;
        const len = Math.hypot(dx, dz), nx = (s * dz) / len, nz = (-s * dx) / len, a = Math.atan2(dx, dz);
        for (const f of [0.25, 0.5, 0.75]) {
          const px = ax + f * dx, pz = az + f * dz;
          // The bar 3 cm out, on two brackets that run from the side to the bar's ends
          t.add(metall, rounded(0.014, 0.02, 0.12, 0.004).rotateY(a).translate(px + 0.03 * nx, H / 2, pz + 0.03 * nz));
          for (const e of [-1, 1]) t.add(metall, rounded(0.03, 0.016, 0.012, 0.003, s * 0.0145, 0, e * 0.054).rotateY(a).translate(px, H / 2, pz));
        }
      }
    }
    return t.group();
  },
});
