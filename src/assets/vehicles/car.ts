import { ExtrudeGeometry, Shape, Vector2, Vector3 } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded, turned } from "../shapes";

type P = [number, number];
/** Side profiles from the rear (u 0) to the front (u 1), heights v as fractions from the sill (0) to the roof (1).
 *  `oben`: the top of the lower body from the rear bumper to the front bumper. `kabine`: u of the greenhouse at the
 *  rear belt, rear roof, front roof and front belt, then the belt height v. `seite` and `heck`: the side and rear
 *  windows as ranges on the greenhouse outline (0–1 the right side from rear to front, 1–2 the front corner, 5–8 the
 *  rear); `tueren`: the door seams on the side (0–1); `schulter`: how far the greenhouse stands in from the sides at
 *  the belt. `bett`: a pickup's load bed behind the cab, its floor above the wheel arches (second and third point). */
const FORM: Record<string, { oben: P[]; kabine: [number, number, number, number, number]; seite: P[]; heck: P[]; tueren: number[]; schulter: number; bett?: boolean }> = {
  sedan: { oben: [[0, 0.1], [0, 0.34], [0.02, 0.43], [0.1, 0.47], [0.24, 0.48], [0.74, 0.48], [0.92, 0.43], [0.985, 0.37], [1, 0.3], [1, 0.1]], kabine: [0.23, 0.35, 0.6, 0.75, 0.48], seite: [[0.04, 0.5], [0.54, 1.38]], heck: [[5.6, 7.4]], tueren: [0.06, 0.52, 1], schulter: 0.08 },
  hatchback: { oben: [[0, 0.1], [0, 0.45], [0.02, 0.53], [0.7, 0.54], [0.92, 0.46], [0.985, 0.39], [1, 0.3], [1, 0.1]], kabine: [0.025, 0.07, 0.56, 0.72, 0.53], seite: [[0.03, 0.4], [0.44, 1.38]], heck: [[5.6, 7.4]], tueren: [0.1, 0.42, 1], schulter: 0.07 },
  van: { oben: [[0, 0.08], [0, 0.5], [0.01, 0.52], [0.88, 0.52], [0.96, 0.47], [0.995, 0.4], [1, 0.3], [1, 0.08]], kabine: [0.012, 0.02, 0.8, 0.9, 0.52], seite: [[0.78, 1.38]], heck: [[6.06, 6.47], [6.53, 6.94]], tueren: [0.76, 1], schulter: 0.025 },
  pickup: { oben: [[0, 0.1], [0, 0.2], [0.43, 0.2], [0.43, 0.64], [0.76, 0.64], [0.94, 0.57], [0.99, 0.48], [1, 0.38], [1, 0.1]], kabine: [0.46, 0.48, 0.66, 0.77, 0.64], seite: [[0.1, 1.38]], heck: [[6.15, 6.85]], tueren: [0.08, 1], schulter: 0.07, bett: true },
};

// A wheel part turned about its axle (x), the profile's y running outwards from the inner face at x0 towards side s
const rad = (profil: P[], seg: number, s: number, x0: number, y: number, z: number) =>
  turned(profil, seg).rotateZ((-s * Math.PI) / 2).translate(x0, y, z);

export const car = defineAsset({
  id: "car", category: "vehicles",
  title: { de: "Auto", en: "Car" },
  description: { de: "Ein vereinfachtes Auto: Limousine, Kleinwagen, Transporter oder Pick-up, mit Scheiben, Scheinwerfern und Rädern.", en: "A simplified car: a sedan, a hatchback, a van or a pickup, with windows, headlights and wheels." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 3, max: 5.6, step: 0.05, default: 4.4, unit: "m",
      describe: { de: "Länge: 3,6 m ein Kleinwagen, 4,5 m eine Limousine, 5,3 m ein Pick-up.", en: "Length: 3.6 m a small car, 4.5 m a sedan, 5.3 m a pickup." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 1.55, max: 2.1, step: 0.01, default: 1.8, unit: "m",
      describe: { de: "Breite ohne Spiegel: 1,65 m klein, 1,8 m üblich, 2 m ein Transporter.", en: "Width without mirrors: 1.65 m small, 1.8 m usual, 2 m a van." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1.3, max: 2.3, step: 0.01, default: 1.45, unit: "m",
      describe: { de: "Höhe bis zum Dach: 1,45 m eine Limousine, 1,8 m ein Pick-up, 2,2 m ein Transporter.", en: "Height to the roof: 1.45 m a sedan, 1.8 m a pickup, 2.2 m a van." } },
    style: { type: "choice", label: { de: "Bauform", en: "Body" }, options: ["sedan", "hatchback", "van", "pickup"], labels: { sedan: { de: "Limousine", en: "Sedan" }, hatchback: { de: "Kleinwagen", en: "Hatchback" }, van: { de: "Transporter", en: "Van" }, pickup: { de: "Pick-up", en: "Pickup" } }, default: "sedan",
      describe: { de: "Limousine mit Stufenheck, Kleinwagen mit Schrägheck, kastenförmiger Transporter oder Pick-up mit Ladefläche.", en: "A sedan with a boot, a hatchback, a boxy van or a pickup with a load bed." } },
    wheelRadius: { type: "number", label: { de: "Radradius", en: "Wheel radius" }, min: 0.28, max: 0.45, step: 0.01, default: 0.33, unit: "m",
      describe: { de: "Radius der Räder: 0,3 m klein, 0,33 m üblich, 0,42 m ein Geländewagen.", en: "Radius of the wheels: 0.3 m small, 0.33 m usual, 0.42 m an off-roader." } },
    color: { type: "color", label: { de: "Lack", en: "Paint" }, default: "#2d6cdf",
      describe: { de: "Farbe des Lacks.", en: "Colour of the paint." } },
  },
  presets: {
    "city-car": { label: { de: "Kleinwagen", en: "City car" }, values: { style: "hatchback", length: 3.7, width: 1.68, height: 1.5, wheelRadius: 0.3, color: "#d94a3a" } },
    sedan: { label: { de: "Limousine", en: "Sedan" }, values: { style: "sedan", length: 4.6, color: "#2d6cdf" } },
    van: { label: { de: "Transporter", en: "Van" }, values: { style: "van", length: 5, width: 1.98, height: 2.15, wheelRadius: 0.34, color: "#f0efe9" } },
    pickup: { label: { de: "Pick-up", en: "Pickup" }, values: { style: "pickup", length: 5.3, width: 1.95, height: 1.82, wheelRadius: 0.41, color: "#3f5d3a" } },
  },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 24000, drawCalls: 6 },
  build(p) {
    // Drawn solid, a car is mostly air inside: an effective density gives it a car's mass
    const lack = material("paint", p.color, 1, 230), glas = material("plastic", "#18212a", 1, 300), gummi = material("plastic", "#1c1d1e", 1, 300);
    const metall = material("metal", "#c3c8cc", 1, 900), licht = material("glow", "#fff4d6"), rueck = material("paint", "#b3201c");
    const f = FORM[p.style], L = p.length, W = p.width, r = p.wheelRadius, t = new Parts();
    // Heights: the belt (bottom of the windows) rises with big wheels so the arches stay below it, the roof above it
    const sill = 0.2, kb = f.kabine[4], gurt = Math.max(sill + kb * (p.height - sill), 2 * r + 0.18), dach = Math.max(p.height, gurt + 0.34);
    const hoch = (v: number) => (v <= kb ? sill + (v / kb) * (gurt - sill) : gurt + ((v - kb) / (1 - kb)) * (dach - gurt));
    const at = ([u, v]: P) => new Vector2(-L / 2 + u * L, hoch(v));
    const achse = Math.min(L * 0.32, L / 2 - r - 0.25), ra = r + 0.05;
    // A pickup's load bed floor lies above the wheel arches
    const boden = Math.max(hoch(f.oben[1][1]), r + ra + 0.03);

    // The lower body: the side profile with its corners rounded off and both wheel arches cut into the bottom,
    // extruded across the width with round edges
    const ecken = [new Vector2(-L / 2 + 0.1, sill), new Vector2(-L / 2, sill), ...f.oben.map(at), new Vector2(L / 2, sill), new Vector2(L / 2 - 0.1, sill)];
    if (f.bett) ecken[3].y = ecken[4].y = boden;
    const k = new Shape().moveTo(ecken[0].x, ecken[0].y);
    for (let i = 1; i < ecken.length - 1; i++) {
      const q = ecken[i], vor = ecken[i - 1].clone().sub(q), nach = ecken[i + 1].clone().sub(q), d = Math.min(0.2, vor.length() * 0.45, nach.length() * 0.45);
      if (d < 1e-3) continue;
      const p1 = q.clone().add(vor.setLength(d)), p2 = q.clone().add(nach.setLength(d));
      k.lineTo(p1.x, p1.y).quadraticCurveTo(q.x, q.y, p2.x, p2.y);
    }
    k.lineTo(L / 2 - 0.1, sill);
    const dz = Math.sqrt(ra * ra - (sill - r) ** 2), a0 = Math.atan2(sill - r, dz);
    for (const z of [achse, -achse]) { k.lineTo(z + dz, sill); k.absarc(z, r, ra, a0, Math.PI - a0, false); }
    k.closePath();
    const b = 0.07;
    t.add(lack, new ExtrudeGeometry(k, { depth: W - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 4, curveSegments: 10 }).translate(0, 0, -(W - 2 * b) / 2).rotateY(-Math.PI / 2));
    // (rotated so the profile's front, x = +L/2, faces +z)
    // Dark wheel wells: a liner round each arch and a wall behind the wheel, so you cannot see through the body
    for (const z of [achse, -achse]) {
      const wand = new Shape();
      wand.moveTo(dz, sill - r);
      wand.absarc(0, 0, ra, a0, Math.PI - a0, false);
      wand.closePath();
      for (const s of [-1, 1]) {
        t.add(gummi, grid(16, 1, (u, v) => { const w = a0 + (Math.PI - 2 * a0) * u; return new Vector3(s * (W / 2 - 0.015 - 0.35 * v), r + Math.sin(w) * (ra - 0.004), z + Math.cos(w) * (ra - 0.004)); }, (q) => new Vector3(0, r - q.y, z - q.z)));
        t.add(gummi, new ExtrudeGeometry(wand, { depth: 0.01, bevelEnabled: false, curveSegments: 12 }).rotateY(Math.PI / 2).translate(s * (W / 2 - 0.36), r, z));
      }
    }
    if (f.bett) {
      // The pickup's load bed: side walls and a tailgate up to the belt
      const lb = f.oben[2][0] * L, h = gurt - boden + 0.02;
      for (const s of [-1, 1]) t.add(lack, rounded(0.06, h, lb, 0.02, s * (W / 2 - 0.03), boden - 0.02 + h / 2, -L / 2 + lb / 2));
      t.add(lack, rounded(W - 0.1, h, 0.06, 0.02, 0, boden - 0.02 + h / 2, -L / 2 + 0.03));
    }

    // The greenhouse: a loft of rounded rectangles from the belt to the roof, narrower at the top (tumblehome), the
    // roof edge rounded off; the windows are panes on the same surface, so the paint between them forms the pillars
    const [ub, ur, uf, uv] = f.kabine, hw0 = W / 2 - f.schulter, schraeg = Math.min(0.13, W * 0.07) * (f.schulter / 0.08), s1 = 0.72;
    const ebene = (s: number) => {
      const q = Math.max(0, (s - s1) / (1 - s1)), zug = Math.min(0.07, (dach - gurt) * 0.3) * (1 - Math.sqrt(Math.max(0, 1 - q * q))), sc = Math.max(0, s);
      const zr = at([ub + (ur - ub) * sc, 0]).x + zug, zf = at([uv + (uf - uv) * sc, 0]).x - zug, hw = hw0 - schraeg * sc - zug;
      return { y: gurt + s * (dach - gurt), zc: (zr + zf) / 2, hl: (zf - zr) / 2, hw, rc: Math.min(0.2, hw * 0.45, ((zf - zr) / 2) * 0.45) };
    };
    // A point on the outline at level s, `aus` further out; c runs 0–1 along the right side (rear to front), 1–2
    // round the front right corner, 2–3 across the front, 3–4 round the front left corner, and so on back to the start
    const rand = (s: number, c: number, aus = 0) => {
      const e = ebene(s), cc = Math.min(7.9999, ((c % 8) + 8) % 8), seg = Math.floor(cc), l = cc - seg;
      const bogen = (j: number, a: number) => {
        const m = [[1, 1], [-1, 1], [-1, -1], [1, -1]][(j + 4) % 4], w = ((j + a) * Math.PI) / 2;
        return [m[0] * (e.hw - e.rc) + Math.cos(w) * (e.rc + aus), e.zc + m[1] * (e.hl - e.rc) + Math.sin(w) * (e.rc + aus)];
      };
      let q: number[];
      if (seg % 2) q = bogen((seg - 1) / 2, l);
      else { const a = bogen(seg / 2 - 1, 1), z = bogen(seg / 2, 0); q = [a[0] + (z[0] - a[0]) * l, a[1] + (z[1] - a[1]) * l]; }
      return new Vector3(q[0], e.y, q[1]);
    };
    const mitte = ebene(0.5).zc, aussen = (q: Vector3) => new Vector3(q.x, 0.2, q.z - mitte);
    const stufe = (v: number) => (v < 0.5 ? -0.06 + (s1 + 0.06) * (v / 0.5) : s1 + (1 - s1) * Math.sin(((v - 0.5) / 0.5) * (Math.PI / 2)));
    t.add(lack, grid(48, 10, (u, v) => rand(stufe(v), u * 8), aussen));
    // The roof: a slightly domed cap on the top outline
    const oben = ebene(1);
    t.add(lack, grid(48, 4, (u, v) => { const q = rand(1, u * 8), m = 1 - v; return new Vector3(q.x * m, dach + 0.015 * (1 - m * m), oben.zc + (q.z - oben.zc) * m); }, () => new Vector3(0, 1, 0)));
    // Windows: the windscreen, the side windows (mirrored to the left) and the rear windows
    const scheiben: P[] = [[1.55, 3.45], ...f.heck];
    for (const [c0, c1] of f.seite) scheiben.push([c0, c1], [5 - c1, 5 - c0]);
    for (const [c0, c1] of scheiben) t.add(glas, grid(Math.max(2, Math.ceil((c1 - c0) * 8)), 6, (u, v) => rand(0.06 + 0.6 * v, c0 + (c1 - c0) * u, 0.006), aussen));

    // Door seams down the sides (lifted above the wheel arches), a handle near the rear edge of each door
    const zt = f.tueren.map((c) => rand(0, c).z);
    for (const s of [-1, 1]) {
      zt.forEach((z, i) => {
        let y0 = sill + 0.06;
        for (const a of [achse, -achse]) if (Math.abs(z - a) < ra + 0.04) y0 = Math.max(y0, r + Math.sqrt((ra + 0.04) ** 2 - (z - a) ** 2) + 0.02);
        if (y0 < gurt - 0.15) t.add(gummi, rounded(0.006, gurt - 0.03 - y0, 0.008, 0.002, s * (W / 2 + 0.001), (y0 + gurt - 0.03) / 2, z));
        if (i > 0) t.add(metall, rounded(0.016, 0.03, 0.14, 0.008, s * (W / 2 + 0.006), gurt - 0.1, zt[i - 1] + 0.16));
      });
    }
    // Mirrors on short arms at the front of the side windows
    for (const s of [-1, 1]) {
      const z = rand(0, 1).z - 0.12;
      t.add(gummi, rounded(0.08, 0.03, 0.05, 0.01, s * (hw0 + 0.04), gurt + 0.05, z));
      t.add(lack, rounded(0.07, 0.11, 0.15, 0.03, s * (hw0 + 0.1), gurt + 0.1, z));
    }

    // Wheels: a tyre with rounded shoulders on a rim, five spokes in front of a dark centre, a hub cap
    const tw = Math.min(0.24, W * 0.12), rr = r * 0.66;
    for (const z of [-achse, achse]) for (const s of [-1, 1]) {
      const x0 = s * (W / 2 - 0.035 - tw);
      t.add(gummi, rad([[rr, 0], [r - 0.035, 0], [r - 0.008, 0.012], [r, 0.04], [r, tw - 0.04], [r - 0.008, tw - 0.012], [r - 0.035, tw], [rr, tw], [rr, 0]], 32, s, x0, r, z));
      t.add(metall, rad([[rr - 0.03, 0.02], [rr + 0.003, 0.02], [rr + 0.003, tw - 0.008], [rr - 0.016, tw - 0.004], [rr - 0.03, tw - 0.03], [rr - 0.03, 0.02]], 32, s, x0, r, z));
      t.add(gummi, rad([[0, 0.03], [rr - 0.029, 0.03], [rr - 0.029, tw - 0.07], [0, tw - 0.07]], 24, s, x0, r, z));
      for (let j = 0; j < 5; j++) {
        const lang = rr - 0.05;
        t.add(metall, rounded(0.03, lang, 0.05, 0.01, 0, 0.035 + lang / 2, 0, 1).rotateX((j / 5) * Math.PI * 2).translate(x0 + s * (tw - 0.045), r, z));
      }
      t.add(metall, rad([[0, 0], [0.065, 0], [0.06, 0.02], [0.03, 0.035], [0, 0.04]], 16, s, x0 + s * (tw - 0.06), r, z));
    }

    // Front: bumper, a dark grille with bright bars and the headlights; rear: bumper and the rear lights; number plates
    const vorn = f.oben[f.oben.length - 2], ytop = at(vorn).y, yg = (sill + 0.2 + ytop) / 2, hg = Math.min(0.14, ytop - sill - 0.24);
    for (const zs of [-1, 1]) {
      t.add(gummi, rounded(W - 0.04, 0.16, 0.12, 0.04, 0, sill + 0.1, zs * (L / 2 - 0.02)));
      t.add(metall, rounded(0.52, 0.11, 0.012, 0.004, 0, sill + 0.1, zs * (L / 2 + 0.046)));
    }
    t.add(gummi, rounded(W * 0.42, hg, 0.03, 0.012, 0, yg, L / 2 - 0.005));
    for (let j = 0; j < 3; j++) t.add(metall, rounded(W * 0.42 - 0.02, 0.012, 0.02, 0.005, 0, yg - hg / 2 + (hg * (j + 1)) / 4, L / 2 + 0.008));
    const yr = f.bett ? gurt - 0.15 : hoch(f.oben[1][1]) - 0.09;
    for (const s of [-1, 1]) {
      t.add(licht, rounded(0.28, 0.09, 0.04, 0.02, s * (W / 2 - 0.24), ytop - 0.07, L / 2 - 0.012));
      t.add(rueck, rounded(f.bett ? 0.07 : 0.26, 0.1, 0.04, 0.015, s * (f.bett ? W / 2 - 0.03 : W / 2 - 0.22), yr, -L / 2 + 0.012));
    }
    return t.group();
  },
});
