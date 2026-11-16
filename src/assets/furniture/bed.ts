import { SphereGeometry, Vector3 } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded } from "../shapes";

export const bed = defineAsset({
  id: "bed", category: "furniture",
  title: { de: "Bett", en: "Bed" },
  description: { de: "Ein Bett mit Holzrahmen, Matratze, Decke und Kissen: Einzel- oder Doppelbett, mit Kopf- und auf Wunsch Fußteil.", en: "A bed with a wooden frame, mattress, blanket and pillows: single or double, with a headboard and, if you like, a footboard." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.9, max: 2, step: 0.05, default: 1.4, unit: "m",
      describe: { de: "Breite der Matratze: 0,9 m ein Einzelbett, 1,4 m breit, 1,8 m ein Doppelbett.", en: "Width of the mattress: 0.9 m a single bed, 1.4 m wide, 1.8 m a double bed." } },
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 1.9, max: 2.2, step: 0.05, default: 2, unit: "m",
      describe: { de: "Länge der Matratze: 2 m üblich, 2,2 m für große Menschen.", en: "Length of the mattress: 2 m usual, 2.2 m for tall people." } },
    height: { type: "number", label: { de: "Liegehöhe", en: "Height" }, min: 0.35, max: 0.7, step: 0.01, default: 0.5, unit: "m",
      describe: { de: "Höhe der Liegefläche: 0,4 m niedrig, 0,5 m üblich, 0,65 m bequem zum Aufstehen.", en: "Height of the sleeping surface: 0.4 m low, 0.5 m usual, 0.65 m easy to get up from." } },
    headboard: { type: "number", label: { de: "Kopfteil", en: "Headboard" }, min: 0, max: 0.9, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Höhe des Kopfteils über der Matratze: 0 keins, 0,45 m üblich, 0,8 m hoch.", en: "Height of the headboard above the mattress: 0 none, 0.45 m usual, 0.8 m tall." } },
    footboard: { type: "boolean", label: { de: "Fußteil", en: "Footboard" }, default: false,
      describe: { de: "Ein niedriges Brett am Fußende.", en: "A low board at the foot end." } },
    pillows: { type: "integer", label: { de: "Kissen", en: "Pillows" }, min: 0, max: 2, default: 2,
      describe: { de: "Zahl der Kissen am Kopfende.", en: "Number of pillows at the head end." } },
    color: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#9b7653",
      describe: { de: "Farbe des Rahmens.", en: "Colour of the frame." } },
    sheet: { type: "color", label: { de: "Laken", en: "Sheet" }, default: "#f0ede6",
      describe: { de: "Farbe von Laken und Kissen.", en: "Colour of the sheet and pillows." } },
    blanket: { type: "color", label: { de: "Decke", en: "Blanket" }, default: "#5a7fa8",
      describe: { de: "Farbe der Decke.", en: "Colour of the blanket." } },
  },
  presets: {
    single: { label: { de: "Einzelbett", en: "Single bed" }, values: { width: 0.9, pillows: 1 } },
    double: { label: { de: "Doppelbett", en: "Double bed" }, values: { width: 1.8, pillows: 2, headboard: 0.6 } },
    guest: { label: { de: "Gästebett", en: "Guest bed" }, values: { width: 1.4, footboard: true, blanket: "#9b4a3c", color: "#6e4a2c" } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 15000, drawCalls: 4 },
  build(p) {
    // Legs and posts upright, rails, slats and boards with the grain along their length
    const holz = material("wood", p.color, 1, 450), brett = material("wood", p.color, 1, 450, { grain: "level" });
    const laken = material("paint", p.sheet, 1, 200), decke = material("paint", p.blanket, 1, 200), t = new Parts();
    const W = p.width, L = p.length, h = p.height, mat = 0.18, yr = h - mat;
    // Frame: square legs at the corners 2 cm beside the mattress (3.5 cm at the ends, clear of the blanket), rails set into them, slats under the mattress
    const q = 0.065, gx = W / 2 + 0.02, gz = L / 2 + 0.035, mitte = 0.023, dick = 0.03, oben = yr + 0.025, unten = yr - 0.115;
    const fbTop = h + 0.12, kopf = p.headboard > 0.02 ? h + p.headboard : 0;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      // Every leg rises 3.5 cm above the rails; under a headboard or footboard the leg is its post with a cap
      const top = sz < 0 && kopf ? kopf : sz > 0 && p.footboard ? fbTop : yr + 0.06, kappe = top > yr + 0.06;
      const lh = kappe ? top - 0.02 : top, x = sx * (gx + q / 2), z = sz * (gz + q / 2);
      t.add(holz, rounded(q, lh, q, 0.003, x, lh / 2, z));
      if (kappe) t.add(holz, rounded(q + 0.016, 0.022, q + 0.016, 0.004, x, top - 0.011, z));
    }
    for (const s of [-1, 1]) {
      t.add(brett, rounded(dick, oben - unten, 2 * gz + 0.006, 0.003, s * (gx + mitte), (oben + unten) / 2, 0));
      t.add(brett, rounded(2 * gx + 0.006, oben - unten, dick, 0.003, 0, (oben + unten) / 2, s * (gz + mitte)));
    }
    for (let i = 0; i < 7; i++) t.add(brett, rounded(2 * (gx + 0.008) + 0.004, 0.02, 0.07, 0.003, 0, yr - 0.011, -L / 2 + 0.1 + (i * (L - 0.2)) / 6));
    // Headboard and footboard: one panel or 3 to 5 boards between the posts, standing on the end rail
    const wand = (sz: number, bis: number) => {
      const spanne = bis - oben, n = spanne < 0.25 ? 1 : Math.min(5, Math.max(3, Math.round(spanne / 0.14))), fuge = 0.005, b = (spanne - fuge * (n - 1)) / n;
      for (let i = 0; i < n; i++) t.add(brett, rounded(2 * gx + 0.006, b, 0.022, 0.003, 0, oben - 0.002 + b / 2 + i * (b + fuge), sz * (gz + mitte)));
    };
    if (kopf) wand(-1, kopf - 0.03);
    if (p.footboard) wand(1, fbTop - 0.03);
    // Mattress with soft edges
    const R = 0.035;
    t.add(laken, rounded(W, mat, L, R, 0, yr + mat / 2, 0, 4));
    // The blanket: one cloth from the turned-back edge to the foot. A point (s, z) of the flat cloth lies on the top up
    // to the edge of the mattress, folds round it with radius rho and then hangs; at the foot corners the distance past
    // the edge is the larger of both, so the corner is one soft round fold. k is the offset along the cloth normal
    // (its thickness), welle soft waves in the hanging part.
    const th = 0.018, rho = R + th / 2 + 0.002, bog = (Math.PI * rho) / 2, a = W / 2 - R, c = L / 2 - R, mittelY = h - R;
    const fall = 0.075, zh = L / 2 - L * 0.68;
    const tuch = (s: number, z: number, k: number) => {
      const ex = Math.sign(s) * Math.max(0, Math.abs(s) - a), ez = Math.max(0, z - c), e = Math.max(Math.abs(ex), ez), n = Math.hypot(ex, ez) || 1;
      const cx = Math.max(-a, Math.min(a, s)), cz = Math.min(z, c);
      if (e < bog) { const phi = e / rho, r = (rho + k) * Math.sin(phi); return new Vector3(cx + (ex / n) * r, mittelY + (rho + k) * Math.cos(phi), cz + (ez / n) * r); }
      const r = rho + k + 0.004 * Math.sin((2 * Math.PI * (cx + cz)) / 0.3) * Math.min(1, (e - bog) / fall);
      return new Vector3(cx + (ex / n) * r, mittelY - (e - bog), cz + (ez / n) * r);
    };
    // Grid lines dense on the fold, sparse on the flat
    const achse = (start: number, teile: [number, number][]) => {
      const w = [start];
      for (const [len, n] of teile) for (let i = 1; i <= n; i++) w.push(w[w.length - 1] + len / n);
      return (u: number) => { const f = u * (w.length - 1), i = Math.min(w.length - 2, Math.floor(f)); return w[i] + (w[i + 1] - w[i]) * (f - i); };
    };
    const quer = (haengt: number) => achse(-a - bog - haengt, [[haengt, 3], [bog, 8], [2 * a, 14], [bog, 8], [haengt, 3]]);
    const sAt = quer(fall), zAt = achse(zh, [[c - zh, 16], [bog, 8], [fall, 3]]), S = a + bog + fall, Z = c + bog + fall;
    const up = () => new Vector3(0, 1, 0), down = () => new Vector3(0, -1, 0), k = (v: number) => -th / 2 + th * v;
    t.add(decke, grid(36, 27, (u, v) => tuch(sAt(u), zAt(v), th / 2), up));
    t.add(decke, grid(36, 27, (u, v) => tuch(sAt(u), zAt(v), -th / 2), down));
    // Hem all round: the sides, the foot and the turned-back edge
    for (const s of [-1, 1]) t.add(decke, grid(27, 1, (u, v) => tuch(s * S, zAt(u), k(v)), down));
    t.add(decke, grid(36, 1, (u, v) => tuch(sAt(u), Z, k(v)), down));
    t.add(decke, grid(36, 1, (u, v) => tuch(sAt(u), zh, k(v)), () => new Vector3(0, 0, -1)));
    // The top sheet turned back over the blanket: a thin cloth on the blanket that folds round its edge
    const rr = th / 2 + 0.004, auf = 0.24, unter = 0.1, bogen = Math.PI * rr;
    const falte = (w: number): [number, number] => {
      const l = w * (auf + bogen + unter);
      if (l < auf) return [zh + auf - l, rr];
      if (l < auf + bogen) { const phi = (l - auf) / rr; return [zh - rr * Math.sin(phi), rr * Math.cos(phi)]; }
      return [zh + l - auf - bogen, -rr];
    };
    const sS = quer(0.04);
    t.add(laken, grid(36, 16, (u, v) => { const [z, kk] = falte(v); return tuch(sS(u), z, kk); }, up));
    // Pillows: full, slightly flattened ellipsoids
    const breite = p.pillows === 2 ? Math.min(0.32, W / 4 - 0.02) : Math.min(0.36, W / 2 - 0.06);
    for (let i = 0; i < p.pillows; i++) {
      const x = p.pillows === 2 ? (i ? 1 : -1) * W / 4 : 0;
      t.add(laken, new SphereGeometry(1, 24, 12).scale(breite, 0.085, 0.2).translate(x, h + 0.07, -L / 2 + 0.25));
    }
    return t.group();
  },
});
