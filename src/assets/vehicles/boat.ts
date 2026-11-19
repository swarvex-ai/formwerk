import { BufferGeometry, ExtrudeGeometry, Float32BufferAttribute, Shape, SphereGeometry, TorusGeometry, Vector3 } from "three";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded, turned } from "../shapes";

export const boat = defineAsset({
  id: "boat", category: "vehicles",
  title: { de: "Ruderboot", en: "Rowboat" },
  description: { de: "Ein offenes Ruderboot mit spitzem Bug, Spiegelheck, Ruderbänken und Riemen; Länge, Breite und Tiefe frei.", en: "An open rowboat with a pointed bow, a transom stern, thwarts and oars; length, beam and depth as you like." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 2, max: 6, step: 0.05, default: 3.6, unit: "m",
      describe: { de: "Länge über alles: 2,5 m ein Beiboot, 3,6 m ein Ruderboot, 5,5 m ein Fischerboot.", en: "Length overall: 2.5 m a dinghy, 3.6 m a rowboat, 5.5 m a fishing boat." } },
    beam: { type: "number", label: { de: "Breite", en: "Beam" }, min: 0.8, max: 2, step: 0.01, default: 1.3, unit: "m",
      describe: { de: "Größte Breite: 1 m schlank, 1,3 m üblich, 1,8 m breit und stabil.", en: "Greatest width: 1 m slim, 1.3 m usual, 1.8 m wide and stable." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.3, max: 0.8, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Höhe vom Kiel bis zur Bordkante mittschiffs: 0,35 m flach, 0,45 m üblich, 0,7 m hochbordig.", en: "Height from the keel to the gunwale amidships: 0.35 m low, 0.45 m usual, 0.7 m high-sided." } },
    seats: { type: "integer", label: { de: "Bänke", en: "Seats" }, min: 1, max: 3, default: 2,
      describe: { de: "Zahl der Ruderbänke quer im Boot.", en: "Number of thwarts across the boat." } },
    oars: { type: "boolean", label: { de: "Riemen", en: "Oars" }, default: true,
      describe: { de: "Zwei Riemen liegen im Boot.", en: "Two oars lie in the boat." } },
    color: { type: "color", label: { de: "Rumpf", en: "Hull" }, default: "#e9e4d8",
      describe: { de: "Farbe des Rumpfs.", en: "Colour of the hull." } },
    trim: { type: "color", label: { de: "Bordkante", en: "Gunwale" }, default: "#2f5d8a",
      describe: { de: "Farbe der Bordkante.", en: "Colour of the gunwale." } },
    wood: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#a67a4c",
      describe: { de: "Farbe von Bänken und Riemen.", en: "Colour of the seats and oars." } },
  },
  presets: {
    rowboat: { label: { de: "Ruderboot", en: "Rowboat" }, values: { length: 3.6, beam: 1.3 } },
    dinghy: { label: { de: "Beiboot", en: "Dinghy" }, values: { length: 2.4, beam: 1.2, depth: 0.38, seats: 1, color: "#d9663b", trim: "#e9e4d8" } },
    "fishing-boat": { label: { de: "Fischerboot", en: "Fishing boat" }, values: { length: 5.4, beam: 1.8, depth: 0.7, seats: 3, color: "#3f6f7a", trim: "#c9a548" } },
  },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 16000, drawCalls: 4 },
  build(p) {
    const rumpf = material("paint", p.color, 1, 160), kante = material("paint", p.trim, 1, 160);
    const holz = material("wood", p.wood, 1, 450, { grain: "part" }), beschlag = material("metal", "#8a7448", 1, 900), t = new Parts();
    const L = p.length, B = p.beam, D = p.depth, dick = 0.018, hb = 0.037, N = 28;
    // Half the beam along the boat (u 0 at the transom, 1 at the bow), the sheer rising to the bow, the keel rising at it
    const halb = (u: number) => (B / 2) * (u < 0.4 ? 0.62 + 0.38 * Math.sin((Math.PI / 2) * (u / 0.4)) : Math.cos((Math.PI / 2) * ((u - 0.4) / 0.6)) ** 0.75);
    const bord = (u: number) => hb + D + 0.14 * u * u, kiel = (u: number) => hb + 0.18 * D * Math.max(0, (u - 0.7) / 0.3) ** 2;
    // v from −1 (port gunwale) over 0 (keel) to 1 (starboard): a rounded U; innen is the inside of the planking
    const punkt = (u: number, v: number, innen = false) => {
      const b = Math.max(0, halb(u) - (innen ? dick : 0)), k = kiel(u) + (innen ? dick : 0), phi = (v * Math.PI) / 2;
      return new Vector3(b * Math.sin(phi), k + (bord(u) - k) * (1 - Math.cos(phi)) ** 0.8, -L / 2 + u * L);
    };
    // Outward normal of the section at (u, v), and the inside half-width at height y
    const normale = (u: number, v: number) => {
      const d = punkt(u, Math.min(1, v + 1e-3)).sub(punkt(u, Math.max(-1, v - 1e-3)));
      const n = new Vector3(d.y, -d.x, 0);
      return n.lengthSq() < 1e-12 ? new Vector3(0, -1, 0) : n.normalize();
    };
    const breite = (u: number, y: number) => {
      let lo = 0, hi = 1;
      for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (punkt(u, m, true).y < y) lo = m; else hi = m; }
      return punkt(u, lo, true).x;
    };
    const uAus = (q: Vector3) => Math.min(1, Math.max(0, (q.z + L / 2) / L));
    // Clinker planking: each strake laps over the outside of the one below; the lap fades out towards the stem
    const planken = Math.max(3, Math.round(D / 0.09)), lap = (u: number) => 0.018 * Math.min(1, halb(u) / (0.25 * B));
    const innenMitte = hb + D * 0.9;
    for (const sg of [-1, 1]) for (let k = 0; k < planken; k++) {
      const s0 = k / planken, s1 = (k + 1) / planken;
      t.add(rumpf, grid(N, 3, (u, f) => {
        const v = sg * (s0 + (s1 - s0) * f);
        return punkt(u, v).addScaledVector(normale(u, v), lap(u) * (1 - f));
      }, (q) => new Vector3(q.x, q.y - innenMitte, 0)));
      // The lower edge of the next strake, standing out by the lap
      if (k < planken - 1) t.add(rumpf, grid(N, 1, (u, f) => punkt(u, sg * s1).addScaledVector(normale(u, sg * s1), lap(u) * f),
        (q) => punkt(uAus(q), sg * (s1 - 0.02)).sub(punkt(uAus(q), sg * s1))));
    }
    t.add(rumpf, grid(N, 16, (u, v) => punkt(u, -1 + 2 * v, true), (q) => new Vector3(-q.x, innenMitte - q.y, 0)));
    // The transom: a board over the ends of the planking, its outline the stern section with the laps
    const heck = new Shape();
    for (let j = 0; j <= 20; j++) { const v = -1 + j / 10, q = punkt(0, v).addScaledVector(normale(0, v), lap(0) + 0.003); if (j === 0) heck.moveTo(q.x, q.y); else heck.lineTo(q.x, q.y); }
    t.add(rumpf, new ExtrudeGeometry(heck, { depth: 0.022, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelOffset: -0.004, bevelSegments: 1, curveSegments: 1 }).translate(0, 0, -L / 2 - 0.022));
    // Gunwale rails over the sheer from the transom to the stem, a capping rail across the transom
    const seite = new Vector3(0, 1, 0);
    for (const sg of [-1, 1]) {
      const pfad = [new Vector3(sg * (halb(0) - dick / 2 + 0.006), bord(0) + 0.004, -L / 2 - 0.026)];
      for (let i = 0; i <= N; i++) { const u = i / N; pfad.push(new Vector3(sg * Math.max(0, halb(u) - dick / 2 + 0.006), bord(u) + 0.004, -L / 2 + u * L)); }
      t.add(kante, schlauch(pfad, seite, 0.02, 0.019));
    }
    t.add(kante, rounded(2 * halb(0) + 0.03, 0.03, 0.04, 0.008, 0, bord(0) + 0.002, -L / 2 - 0.012));
    // Keel under the planking, rising into the stem at the bow
    const kielPfad: Vector3[] = [new Vector3(0, hb - 0.012, -L / 2 - 0.026)];
    for (let i = 0; i <= 12; i++) { const u = (i / 12) * 0.96; kielPfad.push(new Vector3(0, kiel(u) - 0.012, -L / 2 + u * L)); }
    for (let i = 0; i <= 6; i++) kielPfad.push(new Vector3(0, kiel(1) + 0.02 + ((bord(1) + 0.06 - kiel(1) - 0.02) * i) / 6, L / 2 - 0.004));
    t.add(holz, schlauch(kielPfad, new Vector3(1, 0, 0), 0.022, 0.025));
    // Ribs inside the planking, about every 35 cm
    const rippen = Math.max(3, Math.round(L / 0.35));
    for (let k = 0; k < rippen; k++) {
      const u = 0.08 + (0.76 * k) / (rippen - 1), pfad: Vector3[] = [];
      for (let j = 0; j <= 14; j++) { const v = -1 + (2 * j) / 14; pfad.push(punkt(u, v, true).addScaledVector(normale(u, v), -0.008)); }
      t.add(holz, schlauch(pfad, new Vector3(0, 0, 1), 0.016, 0.008, 6));
    }
    // Floorboards on the ribs where the bottom is wide enough
    const brett = 0.1, fuge = 0.012, spann = 1.5 * brett + fuge + 0.004;
    let boden = hb + dick + 0.016;
    for (let i = 0; i <= 10; i++) { const u = 0.15 + (0.53 * i) / 10; let lo = hb, hi = bord(u); for (let j = 0; j < 24; j++) { const m = (lo + hi) / 2; if (breite(u, m) < spann) lo = m; else hi = m; } boden = Math.max(boden, hi); }
    for (const x of [-(brett + fuge), 0, brett + fuge]) t.add(holz, grained(rounded(brett, 0.018, 0.53 * L, 0.004, x, boden + 0.009, -L / 2 + 0.415 * L), "z"));
    // Thwarts on a riser along each side, just below the gunwale
    const baenke = Array.from({ length: p.seats }, (_, k) => 0.25 + (0.45 * (k + 0.5)) / p.seats);
    const hoehe = (u: number) => bord(u) - 0.12;
    for (const sg of [-1, 1]) {
      const pfad: Vector3[] = [];
      for (let i = 0; i <= 16; i++) { const u = 0.12 + (0.72 * i) / 16, y = hoehe(u) - 0.042; pfad.push(new Vector3(sg * (breite(u, y) - 0.01), y, -L / 2 + u * L)); }
      t.add(holz, schlauch(pfad, seite, 0.012, 0.01, 6));
    }
    // Each thwart as wide as the hull is at its narrower edge and its underside
    for (const u of baenke) t.add(holz, grained(rounded(2 * Math.min(breite(u - 0.11 / L, hoehe(u) - 0.03), breite(u + 0.11 / L, hoehe(u) - 0.03)) - 0.004, 0.03, 0.22, 0.006, 0, hoehe(u) - 0.015, -L / 2 + u * L), "x"));
    // Bronze rowlocks on the rails, 28 cm aft of the middle thwart
    const uR = Math.max(0.1, baenke[Math.floor(p.seats / 2)] - 0.28 / L), yR = bord(uR) + 0.024;
    for (const sg of [-1, 1]) {
      const x = sg * (halb(uR) - dick / 2 + 0.006), z = -L / 2 + uR * L;
      t.add(beschlag, turned([[0, 0], [0.016, 0], [0.016, 0.012], [0.008, 0.016], [0.008, 0.03], [0, 0.03]], 10).translate(x, yR - 0.004, z));
      t.add(beschlag, new TorusGeometry(0.032, 0.006, 6, 12, Math.PI).rotateZ(Math.PI).rotateY(Math.PI / 2).translate(x, yR + 0.058, z));
      for (const o of [-0.032, 0.032]) t.add(beschlag, new SphereGeometry(0.008, 8, 6).translate(x, yR + 0.058, z + o));
    }
    // Oars lying on the thwarts: a turned shaft with its grip, and a flat blade towards the bow
    if (p.oars) {
      const lang = Math.min(L * 0.7, 2.6), y = Math.max(...baenke.map(hoehe)) + 0.024, z0 = -0.1 * L;
      for (const sx of [-1, 1]) {
        const x = sx * 0.085, schaft = lang - 0.45;
        const profil: [number, number][] = [[0, 0], [0.015, 0], [0.017, 0.02], [0.017, 0.12], [0.024, 0.15], [0.024, schaft * 0.55], [0.019, schaft], [0, schaft + 0.02]];
        t.add(holz, grained(turned(profil, 10).rotateX(Math.PI / 2).translate(x, y, z0 - lang / 2), "z"));
        t.add(holz, grained(rounded(0.12, 0.012, 0.47, 0.005, x, y, z0 - lang / 2 + schaft + 0.215), "z"));
      }
    }
    return t.group();
  },
});

/** A tube along a path: one ring per point in the plane of `seite` and the path normal (rx along seite), ends closed. */
function schlauch(pfad: Vector3[], seite: Vector3, rx: number, ry: number, um = 8): BufferGeometry {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], n = pfad.length;
  const ring = (j: number) => {
    const tg = pfad[Math.min(n - 1, j + 1)].clone().sub(pfad[Math.max(0, j - 1)]).normalize();
    const nn = new Vector3().crossVectors(tg, seite).normalize(), sx = new Vector3().crossVectors(nn, tg).normalize();
    return { tg, pts: Array.from({ length: um }, (_, i) => { const w = (i / um) * Math.PI * 2; return pfad[j].clone().addScaledVector(sx, rx * Math.cos(w)).addScaledVector(nn, ry * Math.sin(w)); }) };
  };
  const ringe = pfad.map((_, j) => ring(j));
  ringe.forEach(({ pts }, j) => pts.concat(pts[0]).forEach((q, i) => { pos.push(q.x, q.y, q.z); uv.push(i / um, j / (n - 1)); }));
  for (let j = 0; j < n - 1; j++) for (let i = 0; i < um; i++) { const a = j * (um + 1) + i, b = a + 1, c = a + um + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
  // Flat caps with their own vertices, so the ends stay crisp
  for (const [j, vorn] of [[0, false], [n - 1, true]] as const) {
    const m = pos.length / 3;
    pos.push(pfad[j].x, pfad[j].y, pfad[j].z); uv.push(0.5, 0.5);
    ringe[j].pts.forEach((q, i) => { pos.push(q.x, q.y, q.z); uv.push(0.5 + 0.5 * Math.cos((i / um) * Math.PI * 2), 0.5 + 0.5 * Math.sin((i / um) * Math.PI * 2)); });
    for (let i = 0; i < um; i++) { const a = m + 1 + i, b = m + 1 + ((i + 1) % um); if (vorn) idx.push(m, a, b); else idx.push(m, b, a); }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
