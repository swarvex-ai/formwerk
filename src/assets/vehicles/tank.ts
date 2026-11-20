import { BoxGeometry, ExtrudeGeometry, Matrix4, Shape, Vector2, Vector3 } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

type P = [number, number];

// The convex hull of points in the side view (z, y), counter-clockwise: the path a track runs around its wheels.
function huelle(pts: P[]): P[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const x = (o: P, a: P, b: P) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const unten: P[] = [], oben: P[] = [];
  for (const q of p) { while (unten.length > 1 && x(unten[unten.length - 2], unten[unten.length - 1], q) <= 0) unten.pop(); unten.push(q); }
  for (const q of p.reverse()) { while (oben.length > 1 && x(oben[oben.length - 2], oben[oben.length - 1], q) <= 0) oben.pop(); oben.push(q); }
  return [...unten.slice(0, -1), ...oben.slice(0, -1)];
}

// A wheel turned about its axle (x), the profile's y running outwards from the inner face at x0 towards side s
const rad = (profil: P[], seg: number, s: number, x0: number, y: number, z: number) =>
  turned(profil, seg).rotateZ((-s * Math.PI) / 2).translate(x0, y, z);

export const tank = defineAsset({
  id: "tank", category: "vehicles",
  title: { de: "Panzer", en: "Tank" },
  description: { de: "Ein vereinfachter Kampfpanzer mit Ketten, Laufrollen und drehbarem Turm (bewegliches Teil „turret“), Rohr und Wanne frei einstellbar.", en: "A simplified battle tank with tracks, road wheels and a turning turret (movable part \"turret\"); gun and hull as you like." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 4, max: 9, step: 0.05, default: 6.8, unit: "m",
      describe: { de: "Länge der Wanne ohne Rohr: 5 m ein leichter Panzer, 7 m ein Kampfpanzer.", en: "Length of the hull without the gun: 5 m a light tank, 7 m a battle tank." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 2.4, max: 3.8, step: 0.05, default: 3.4, unit: "m",
      describe: { de: "Breite über die Ketten: 2,6 m leicht, 3,4 m üblich, 3,7 m schwer.", en: "Width across the tracks: 2.6 m light, 3.4 m usual, 3.7 m heavy." } },
    turret: { type: "number", label: { de: "Turm", en: "Turret" }, min: 0.4, max: 0.8, step: 0.01, default: 0.6,
      describe: { de: "Größe des Turms im Verhältnis zur Breite: 0,45 klein, 0,6 üblich, 0,75 groß.", en: "Size of the turret relative to the width: 0.45 small, 0.6 usual, 0.75 big." } },
    gun: { type: "number", label: { de: "Rohr", en: "Gun" }, min: 1.5, max: 6, step: 0.05, default: 4.5, unit: "m",
      describe: { de: "Länge des Rohrs vor dem Turm: 2,5 m kurz, 4,5 m üblich, 5,5 m lang.", en: "Length of the gun in front of the turret: 2.5 m short, 4.5 m usual, 5.5 m long." } },
    wheels: { type: "integer", label: { de: "Laufrollen", en: "Road wheels" }, min: 4, max: 8, default: 6,
      describe: { de: "Laufrollen je Seite: 5 leicht, 6 bis 7 üblich.", en: "Road wheels per side: 5 light, 6 to 7 usual." } },
    color: { type: "color", label: { de: "Tarnfarbe", en: "Paint" }, default: "#5b6b3a",
      describe: { de: "Farbe: Oliv #5b6b3a, Sand #b59a6a, Grau #6d7378.", en: "Colour: olive #5b6b3a, sand #b59a6a, grey #6d7378." } },
  },
  presets: {
    "battle-tank": { label: { de: "Kampfpanzer", en: "Battle tank" }, values: { length: 7, width: 3.5, turret: 0.62, gun: 5 } },
    "light-tank": { label: { de: "Leichter Panzer", en: "Light tank" }, values: { length: 5, width: 2.6, turret: 0.5, gun: 2.6, wheels: 5, color: "#7a6a45" } },
    desert: { label: { de: "Wüste", en: "Desert" }, values: { color: "#b59a6a", gun: 4.8 } },
  },
  rig: { turret: { label: { de: "Turm", en: "Turret" }, type: "rotate", axis: [0, 1, 0], min: -180, max: 180 } },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 30000, drawCalls: 5 },
  build(p) {
    // Drawn solid, a tank weighs about what a real one does at these effective densities
    const lack = material("paint", p.color, 1, 900), stahl = material("iron", "#3a3934", 2, 2500, { rust: 1 }), gummi = material("plastic", "#1e1f1d", 1, 1100);
    const t = new Parts(), L = p.length, W = p.width, kb = Math.min(0.65, W * 0.2), dick = 0.07, steg = 0.025;
    // Wheels along each track: the drive sprocket at the rear, the idler at the front, the road wheels between
    const zs = -L / 2 + 0.38, ys = 0.72, rs = 0.29, zi = L / 2 - 0.36, yi = 0.64, ri = 0.27;
    const z0 = -L / 2 + 0.95, z1 = L / 2 - 0.9, n = p.wheels, abstand = (z1 - z0) / (n - 1), rw = Math.min(0.31, abstand * 0.47);
    const ww = kb * 0.82;
    // Track path: the hull around the wheels, the link centres half a link outside them
    const kreise: [number, number, number][] = [[zs, ys, rs], [zi, yi, ri]];
    for (let i = 0; i < n; i++) kreise.push([z0 + abstand * i, steg + dick + rw, rw]);
    const pfad = huelle(kreise.flatMap(([z, y, r]) => Array.from({ length: 96 }, (_, k): P => [z + Math.cos((k / 96) * Math.PI * 2) * (r + dick / 2), y + Math.sin((k / 96) * Math.PI * 2) * (r + dick / 2)])));
    const kanten = pfad.map((q, i) => { const w = pfad[(i + 1) % pfad.length]; return Math.hypot(w[0] - q[0], w[1] - q[1]); });
    const umfang = kanten.reduce((a, b) => a + b, 0), glieder = Math.round(umfang / 0.16), teil = umfang / glieder;
    const mz = kreise.reduce((a, k) => a + k[0], 0) / kreise.length, my = kreise.reduce((a, k) => a + k[1], 0) / kreise.length;
    for (const sx of [-1, 1]) {
      const xm = sx * (W / 2 - kb / 2);
      // The track: one cast link every 16 cm, each with a grouser bar across its outer face
      let k = 0, rest = 0;
      for (let g = 0; g < glieder; g++) {
        const d = g * teil + teil / 2;
        while (rest + kanten[k] < d) { rest += kanten[k]; k++; }
        const a = pfad[k], b = pfad[(k + 1) % pfad.length], f = (d - rest) / kanten[k];
        const pz = a[0] + (b[0] - a[0]) * f, py = a[1] + (b[1] - a[1]) * f;
        const tz = (b[0] - a[0]) / kanten[k], ty = (b[1] - a[1]) / kanten[k];
        // outward: away from the middle of the wheels
        let nz = ty, ny = -tz;
        if (nz * (pz - mz) + ny * (py - my) < 0) { nz = -nz; ny = -ny; }
        const lage = (g2: BoxGeometry, aus: number) => g2.applyMatrix4(new Matrix4().makeBasis(new Vector3(1, 0, 0), new Vector3(0, ny, nz), new Vector3(0, ty, tz)).setPosition(xm, py + ny * aus, pz + nz * aus));
        t.add(stahl, lage(new BoxGeometry(kb, dick, teil * 0.86), 0));
        t.add(stahl, lage(new BoxGeometry(kb * 0.96, steg, teil * 0.22), (dick + steg) / 2));
      }
      // Road wheels: a rubber tyre on a dished steel wheel with a hub cap
      const innen = xm - (sx * ww) / 2;
      for (let i = 0; i < n; i++) {
        const z = z0 + abstand * i, y = steg + dick + rw;
        t.add(gummi, rad([[rw * 0.8, 0], [rw - 0.012, 0], [rw, 0.012], [rw, ww - 0.012], [rw - 0.012, ww], [rw * 0.8, ww], [rw * 0.8, 0]], 24, sx, innen, y, z));
        t.add(lack, rad([[0, 0.02], [rw * 0.81, 0.02], [rw * 0.81, ww - 0.015], [rw * 0.62, ww - 0.04], [rw * 0.3, ww - 0.04], [rw * 0.28, ww + 0.02], [rw * 0.18, ww + 0.04], [0, ww + 0.04]], 24, sx, innen, y, z));
      }
      // The idler: a plain steel wheel; the sprocket: two toothed rings on a hub that drive the links
      t.add(lack, rad([[0, 0], [ri, 0], [ri, ww], [ri * 0.7, ww - 0.03], [ri * 0.3, ww - 0.03], [ri * 0.26, ww + 0.04], [0, ww + 0.04]], 24, sx, innen, yi, zi));
      const zahn = new Shape(), zaehne = 11;
      for (let j = 0; j <= zaehne * 4; j++) {
        const w = (j / (zaehne * 4)) * Math.PI * 2, r = j % 4 < 2 ? rs + dick * 0.9 : rs - 0.01;
        if (j === 0) zahn.moveTo(Math.cos(w) * r, Math.sin(w) * r); else zahn.lineTo(Math.cos(w) * r, Math.sin(w) * r);
      }
      for (const o of [0.12, 0.88]) t.add(stahl, new ExtrudeGeometry(zahn, { depth: 0.04, bevelEnabled: false, curveSegments: 1 }).rotateY(Math.PI / 2).translate(innen + sx * (ww * o - 0.02), ys, zs));
      t.add(lack, rad([[0, 0], [rs - 0.02, 0], [rs - 0.02, ww], [rs * 0.4, ww], [rs * 0.35, ww + 0.06], [0, ww + 0.06]], 24, sx, innen, ys, zs));
    }
    // The hull: a narrow lower hull between the tracks with sloped plates front and rear, and the upper hull over the
    // full width, its sponsons covering the tracks like fenders; eased edges
    const seite = (pts: P[], breite: number, b: number) => {
      const form = new Shape(pts.map(([x, y]) => new Vector2(x, y)));
      return new ExtrudeGeometry(form, { depth: breite - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 2, curveSegments: 1 }).translate(0, 0, -(breite - 2 * b) / 2).rotateY(-Math.PI / 2);
    };
    const gl = Math.min(1.3, L * 0.2), dach = 1.6, boden = 1.13;
    t.add(lack, seite([[-L / 2 + 0.4, 0.42], [L / 2 - 0.55, 0.42], [L / 2 - 0.05, boden + 0.02], [-L / 2 + 0.15, boden + 0.02]], W - 2 * kb - 0.06, 0.03));
    t.add(lack, seite([[-L / 2, boden], [L / 2, boden], [L / 2 - 0.04, boden + 0.06], [L / 2 - gl, dach], [-L / 2 + 0.1, dach], [-L / 2, dach - 0.08]], W - 0.02, 0.025));
    // Engine deck: two grilles of slats over a dark opening; front: headlights and tow hooks
    for (const sx of [-1, 1]) {
      const gz = -L / 2 + 0.25 + L * 0.08, gt = L * 0.16;
      t.add(gummi, rounded(W * 0.3, 0.02, gt, 0.006, sx * W * 0.2, dach + 0.004, gz));
      for (let j = 0; j < 7; j++) t.add(lack, rounded(W * 0.3 + 0.03, 0.035, gt / 14, 0.006, sx * W * 0.2, dach + 0.02, gz - gt / 2 + (gt * (j + 0.5)) / 7));
      t.add(gummi, turned([[0, 0], [0.09, 0], [0.09, 0.07], [0.075, 0.08], [0, 0.08]], 12).rotateX(Math.PI / 2).translate(sx * (W / 2 - 0.25), boden + 0.12, L / 2 - 0.12 + 0.08));
      t.add(stahl, rounded(0.08, 0.12, 0.16, 0.015, sx * (W / 2 - kb - 0.25), 0.62, L / 2 - 0.5));
    }
    // The turret turns about the centre of the hull's roof; its sides and roof are faceted armour plates
    const zt = -L * 0.05, tr = (W * p.turret) / 2, th = 0.72, turm = t.moving("turret", 0, dach, zt);
    const plan = new Shape(([[-tr, -1.1 * tr], [tr, -1.1 * tr], [tr, 0.55 * tr], [0.5 * tr, 1.2 * tr], [-0.5 * tr, 1.2 * tr], [-tr, 0.55 * tr]] as P[]).map(([x, z]) => new Vector2(x, -z)));
    const fase = Math.min(0.22, tr * 0.25);
    turm.add(lack, new ExtrudeGeometry(plan, { depth: th - 0.24, bevelEnabled: true, bevelSize: fase, bevelThickness: 0.12, bevelOffset: -fase, bevelSegments: 1, curveSegments: 1 }).rotateX(-Math.PI / 2).translate(0, dach - 0.03 + 0.12, zt));
    const oben = dach - 0.03 + th;
    // Gun mantlet and barrel: a turned tube with a fume extractor and a muzzle brake, open at the bore
    const vorne = zt + 1.2 * tr - 0.05, hg = dach + th * 0.45, mw = Math.min(0.85, tr * 0.8);
    turm.add(lack, rounded(mw, 0.42, 0.32, 0.06, 0, hg, vorne + 0.1));
    const g = p.gun, rb = 0.075;
    turm.add(lack, turned([[0, 0], [0.13, 0], [0.12, 0.2], [rb * 1.05, 0.32], [rb, g * 0.4], [0.12, g * 0.43], [0.125, g * 0.55], [rb * 0.95, g * 0.58], [rb * 0.88, g - 0.36], [0.105, g - 0.34], [0.11, g - 0.02], [0.1, g], [0.045, g], [0.045, g - 0.3], [0, g - 0.3]], 16).rotateX(Math.PI / 2).translate(0, hg, vorne + 0.2));
    // Commander's cupola with its vision blocks, the loader's hatch
    const cx = -tr * 0.4, cz = zt - tr * 0.35, rk = Math.min(0.34, tr * 0.36);
    turm.add(lack, turned([[0, 0], [rk, 0], [rk, 0.2], [rk - 0.04, 0.24], [rk * 0.76, 0.24], [rk * 0.74, 0.3], [rk * 0.6, 0.32], [0, 0.32]], 20, cx, oben - 0.02, cz));
    for (let j = 0; j < 6; j++) {
      const w = (j / 6) * Math.PI * 2;
      turm.add(gummi, new BoxGeometry(rk * 0.3, 0.06, 0.03).rotateY(-w + Math.PI / 2).translate(cx + Math.cos(w) * (rk - 0.005), oben + 0.1, cz + Math.sin(w) * (rk - 0.005)));
    }
    turm.add(lack, rounded(Math.min(0.55, tr * 0.5), 0.05, Math.min(0.6, tr * 0.55), 0.02, tr * 0.42, oben + 0.02, zt - tr * 0.3));
    turm.add(gummi, rounded(0.24, 0.12, 0.08, 0.01, tr * 0.42, oben + 0.08, zt + tr * 0.35));
    return t.group();
  },
});
