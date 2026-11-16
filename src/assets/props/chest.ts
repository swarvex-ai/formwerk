import { BufferGeometry, Color, CylinderGeometry, ExtrudeGeometry, Path, Quaternion, Shape, SphereGeometry, Vector3, type Material } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded } from "../shapes";

export const chest = defineAsset({
  id: "chest", category: "props",
  title: { de: "Truhe", en: "Chest" },
  description: { de: "Eine Truhe mit gewölbtem oder flachem Deckel, Metallbändern und Schloss; der Deckel klappt auf (bewegliches Teil „lid“).", en: "A chest with an arched or flat lid, metal bands and a lock; the lid opens (movable part \"lid\")." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.4, max: 1.2, step: 0.01, default: 0.7, unit: "m",
      describe: { de: "Breite von links nach rechts: 0,5 m ein Kästchen, 0,7 m eine Schatztruhe, 1,1 m eine Aussteuertruhe.", en: "Width from left to right: 0.5 m a casket, 0.7 m a treasure chest, 1.1 m a blanket chest." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.3, max: 0.8, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Tiefe von vorn nach hinten; beim gewölbten Deckel auch die Spannweite der Wölbung.", en: "Depth from front to back; with an arched lid also the span of the arch." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.2, max: 0.6, step: 0.01, default: 0.35, unit: "m",
      describe: { de: "Höhe des Kastens ohne Deckel.", en: "Height of the box without the lid." } },
    lid: { type: "choice", label: { de: "Deckel", en: "Lid" }, options: ["arched", "flat"], labels: { arched: { de: "Gewölbt", en: "Arched" }, flat: { de: "Flach", en: "Flat" } }, default: "arched",
      describe: { de: "Gewölbt wie eine Schatztruhe oder flach wie eine Werkzeugkiste.", en: "Arched like a treasure chest or flat like a tool chest." } },
    bands: { type: "integer", label: { de: "Bänder", en: "Bands" }, min: 0, max: 4, default: 2,
      describe: { de: "Metallbänder über Kasten und Deckel: 0 schlicht, 2 üblich, 4 schwer beschlagen.", en: "Metal bands over box and lid: 0 plain, 2 usual, 4 heavily bound." } },
    lock: { type: "boolean", label: { de: "Schloss", en: "Lock" }, default: true,
      describe: { de: "Ein Schloss vorn mit Überfall am Deckel.", en: "A lock at the front with a hasp on the lid." } },
    color: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#8a5a33",
      describe: { de: "Farbe des Holzes.", en: "Colour of the wood." } },
    metalColor: { type: "color", label: { de: "Beschläge", en: "Fittings" }, default: "#c9a548",
      describe: { de: "Farbe der Bänder und des Schlosses: Messing #c9a548, Eisen #4a4a4a.", en: "Colour of the bands and the lock: brass #c9a548, iron #4a4a4a." } },
  },
  presets: {
    treasure: { label: { de: "Schatztruhe", en: "Treasure chest" }, values: { lid: "arched", bands: 2, lock: true } },
    "tool-chest": { label: { de: "Werkzeugkiste", en: "Tool chest" }, values: { lid: "flat", bands: 0, width: 0.8, depth: 0.4, height: 0.4, color: "#5d6b4a", metalColor: "#4a4a4a" } },
    "blanket-chest": { label: { de: "Aussteuertruhe", en: "Blanket chest" }, values: { lid: "flat", width: 1.1, depth: 0.5, height: 0.45, bands: 4, color: "#6e4a2c", metalColor: "#4a4a4a" } },
  },
  rig: { lid: { label: { de: "Deckel", en: "Lid" }, type: "rotate", axis: [-1, 0, 0], min: 0, max: 110 } },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 16000, drawCalls: 4 },
  build(p) {
    // Two tones of the same wood: the box in one, the lid in a darker one (four draw calls: two per part)
    const ton = (k: number) => { const c = new Color(p.color); c.multiplyScalar(k); return `#${c.getHexString()}`; };
    const holz = material("wood", p.color, 1, undefined, { grain: "level" }), holz2 = material("wood", ton(0.86), 1, undefined, { grain: "level" });
    const metall = material("metal", p.metalColor);
    const w = p.width, d = p.depth, h = p.height, t = new Parts(), dicke = 0.0045, breit = 0.04, tk = 0.018, fuge = 0.003;
    // Rivet heads: low domes on the iron, facing along n
    const niet = (teile: Parts, x: number, y: number, z: number, n: Vector3) =>
      teile.add(metall, new SphereGeometry(0.0055, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.6, 1).applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), n.normalize())).translate(x, y, z));
    // Boards from a to b with 3 mm joints: [start, end] of board k of n
    const brett = (a: number, b: number, n: number, k: number) => [a + ((b - a) * k) / n + (k ? fuge / 2 : 0), a + ((b - a) * (k + 1)) / n - (k < n - 1 ? fuge / 2 : 0)];

    // The box: corner posts, planked walls between them, a lining behind the joints and a bottom board
    const nb = Math.max(2, Math.round(h / 0.11));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(holz, rounded(tk, h, tk, 0.003, sx * (w / 2 - tk / 2), h / 2, sz * (d / 2 - tk / 2)));
    for (let k = 0; k < nb; k++) {
      const [y0, y1] = brett(0, h, nb, k);
      for (const s of [-1, 1]) {
        t.add(holz, rounded(w - 2 * tk, y1 - y0, tk, 0.003, 0, (y0 + y1) / 2, s * (d / 2 - tk / 2)));
        t.add(holz, rounded(tk, y1 - y0, d - 2 * tk, 0.003, s * (w / 2 - tk / 2), (y0 + y1) / 2, 0));
      }
    }
    for (const s of [-1, 1]) {
      t.box(holz, w - 2 * tk, h - 0.008, tk - 0.007, 0, h / 2, s * (d / 2 - tk / 2 - 0.0015));
      t.box(holz, tk - 0.007, h - 0.008, d - 2 * tk, s * (w / 2 - tk / 2 - 0.0015), h / 2, 0);
    }
    t.box(holz, w - 2 * tk, tk, d - 2 * tk, 0, 0.002 + tk / 2, 0);

    // Corner irons: an angle at the foot and at the top of every corner, one rivet on each leg
    const cw = 0.055, ch = Math.min(0.07, h * 0.3);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [ch / 2 + 0.002, h - ch / 2 - 0.003]) {
      const zf = sz * (d / 2 + dicke / 2 + 0.0005), xs = sx * (w / 2 + dicke / 2 + 0.0005);
      t.add(metall, rounded(cw + dicke, ch, dicke, 0.0015, sx * (w / 2 - cw / 2 + dicke / 2 + 0.0005), y, zf, 1));
      t.add(metall, rounded(dicke, ch, cw + dicke, 0.0015, xs, y, sz * (d / 2 - cw / 2 + dicke / 2 + 0.0005), 1));
      niet(t, sx * (w / 2 - cw / 2), y, zf + (sz * dicke) / 2, new Vector3(0, 0, sz));
      niet(t, xs + (sx * dicke) / 2, y, sz * (d / 2 - cw / 2), new Vector3(sx, 0, 0));
    }

    // The lid turns about its back edge on a hinge barrel along the axis, which closes the slot there when it is open
    t.add(metall, new CylinderGeometry(0.004, 0.004, w - 0.006, 16).rotateZ(Math.PI / 2).translate(0, h, -d / 2));
    // The lid's parts are built where they sit when closed
    const deckel = t.moving("lid", 0, h, -d / 2);
    const y0 = h + 0.001, A = d / 2, B = Math.min(d / 2, 0.25) * 0.75, lt = 0.03, W = w + 0.024, D = d + 0.02;
    // A curved board on the arch: outer semi-axes a (along z) and b (up), `dick` inwards, between two angles and two x
    const bogen = (m: Material, a: number, b: number, dick: number, a0: number, a1: number, x0: number, x1: number, seg: number) => {
      const at = (o: number, v: number, x: number) => new Vector3(x, y0 + (b - o) * Math.sin(v), (a - o) * Math.cos(v));
      const ang = (u: number) => a0 + (a1 - a0) * u, xu = (u: number) => x0 + (x1 - x0) * u;
      const raus = (q: Vector3) => new Vector3(0, q.y - y0, q.z);
      const teile: BufferGeometry[] = [
        grid(1, seg, (u, v) => at(0, ang(v), xu(u)), raus),
        grid(1, seg, (u, v) => at(dick, ang(v), xu(u)), (q) => raus(q).negate()),
        grid(1, 1, (u, v) => at(dick * v, a0, xu(u)), () => new Vector3(0, -b * Math.cos(a0), a * Math.sin(a0))),
        grid(1, 1, (u, v) => at(dick * v, a1, xu(u)), () => new Vector3(0, b * Math.cos(a1), -a * Math.sin(a1))),
        grid(seg, 1, (u, v) => at(dick * v, ang(u), x0), () => new Vector3(-1, 0, 0)),
        grid(seg, 1, (u, v) => at(dick * v, ang(u), x1), () => new Vector3(1, 0, 0)),
      ];
      deckel.add(m, mergeGeometries(teile)!);
    };
    if (p.lid === "arched") {
      // Boards along the arch between two gables that follow the full outer arch, a lining behind the joints
      const n = Math.max(4, Math.round((Math.PI * (A + B)) / 2 / 0.1)), spalt = fuge / (A + B);
      for (let k = 0; k < n; k++) {
        const a0 = (Math.PI * k) / n + (k ? spalt : 0), a1 = (Math.PI * (k + 1)) / n - (k < n - 1 ? spalt : 0);
        bogen(holz2, A, B, tk, a0, a1, -w / 2 + tk, w / 2 - tk, 3);
      }
      bogen(holz2, A - tk / 2, B - tk / 2, tk / 2 - 0.002, spalt, Math.PI - spalt, -w / 2 + tk, w / 2 - tk, 18);
      const giebel = new Shape();
      giebel.moveTo(A, 0);
      for (let i = 1; i <= 24; i++) giebel.lineTo(A * Math.cos((Math.PI * i) / 24), B * Math.sin((Math.PI * i) / 24));
      for (const s of [-1, 1]) {
        const g = new ExtrudeGeometry(giebel, { depth: tk - 0.004, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelOffset: -0.002, bevelSegments: 1 });
        deckel.add(holz2, g.rotateY(Math.PI / 2).translate(s < 0 ? -w / 2 + 0.002 : w / 2 - tk + 0.002, y0, 0));
      }
    } else {
      // Boards across the lid with an underlayer set in from every edge
      const n = Math.max(3, Math.round(D / 0.12));
      for (let k = 0; k < n; k++) {
        const [z0, z1] = brett(-D / 2, D / 2, n, k);
        deckel.add(holz2, rounded(W, lt, z1 - z0, 0.003, 0, h + lt / 2, (z0 + z1) / 2));
      }
      deckel.add(holz2, rounded(W - 0.004, lt / 2, D - 0.004, 0.001, 0, h + lt / 4 + 0.001, 0));
    }

    // Iron bands over box and lid, evenly across, riveted
    for (let k = 0; k < p.bands; k++) {
      const x = -w / 2 + (w * (k + 1)) / (p.bands + 1);
      for (const sz of [-1, 1]) {
        const z = sz * (d / 2 + dicke / 2 + 0.0005);
        t.add(metall, rounded(breit, h - 0.006, dicke, 0.0015, x, h / 2, z, 1));
        for (const f of [0.15, 0.5, 0.85]) niet(t, x, h * f, z + (sz * dicke) / 2, new Vector3(0, 0, sz));
      }
      if (p.lid === "arched") {
        const a = A + dicke + 0.0005, b = B + dicke + 0.0005;
        bogen(metall, a, b, dicke, 0, Math.PI, x - breit / 2, x + breit / 2, 24);
        for (let j = 0; j < 5; j++) {
          const v = (Math.PI * (j + 0.5)) / 5;
          niet(deckel, x, y0 + b * Math.sin(v), a * Math.cos(v), new Vector3(0, Math.sin(v) / b, Math.cos(v) / a));
        }
      } else {
        const yt = h + lt + dicke / 2 + 0.0005;
        deckel.add(metall, rounded(breit, dicke, D + 2 * dicke + 0.001, 0.0015, x, yt, 0, 1));
        for (const sz of [-1, 1]) deckel.add(metall, rounded(breit, lt + dicke, dicke, 0.0015, x, h + (lt + dicke) / 2 + 0.0005, sz * (D / 2 + dicke / 2 + 0.0005), 1));
        for (const f of [-0.6, 0, 0.6]) niet(deckel, x, yt + dicke / 2, (f * D) / 2, new Vector3(0, 1, 0));
      }
    }

    if (p.lock) {
      // Lock plate with a keyhole over the bands; the hasp hangs from a knuckle on the lid over its upper half
      const platte = new Shape();
      platte.moveTo(-0.04, -0.05).lineTo(0.04, -0.05).lineTo(0.04, 0.05).lineTo(-0.04, 0.05).lineTo(-0.04, -0.05);
      const r = 0.0065, sl = 0.0025, cy = -0.022, unten = cy - 0.016, phi = Math.asin(sl / r);
      const loch = new Path();
      loch.moveTo(sl, unten).lineTo(sl, cy - r * Math.cos(phi)).absarc(0, cy, r, -Math.PI / 2 + phi, (3 * Math.PI) / 2 - phi, false);
      loch.lineTo(-sl, unten).lineTo(sl, unten);
      platte.holes.push(loch);
      const zp = d / 2 + dicke + 0.0015, yp = h - 0.075;
      t.add(metall, new ExtrudeGeometry(platte, { depth: 0.003, bevelEnabled: true, bevelSize: 0.001, bevelThickness: 0.001, bevelOffset: -0.001, bevelSegments: 1, curveSegments: 10 }).translate(0, yp, zp));
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) niet(t, sx * 0.03, yp + sy * 0.04, zp + 0.004, new Vector3(0, 0, 1));
      const zh = d / 2 + 0.0125, zl = p.lid === "arched" ? A * Math.cos(Math.asin(Math.min(1, 0.03 / B))) : D / 2;
      deckel.add(metall, rounded(0.03, 0.085, 0.005, 0.0015, 0, h - 0.0175, zh + 0.0025, 1));
      deckel.add(metall, rounded(0.012, 0.012, 0.012, 0.002, 0, h - 0.045, zh + 0.008, 1));
      deckel.add(metall, new CylinderGeometry(0.006, 0.006, 0.036, 12).rotateZ(Math.PI / 2).translate(0, h + 0.025, zh + 0.003));
      deckel.add(metall, rounded(0.03, 0.016, zh + 0.003 - zl + 0.004, 0.0015, 0, h + 0.022, (zh + 0.003 + zl - 0.004) / 2, 1));
    }
    return t.group();
  },
});
