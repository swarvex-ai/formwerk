import { CatmullRomCurve3, SphereGeometry, TorusGeometry, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid } from "../shapes";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const TAU = Math.PI * 2;

export const sack = defineAsset({
  id: "sack", category: "props",
  title: { de: "Sack", en: "Sack" },
  description: { de: "Ein Stoffsack aus Jute oder Leinen für Korn oder Mehl: rund und schwer auf dem Boden, oben zum Hals gerafft, zugebunden, mit umgeschlagener Manschette oder offen. Für Mühlen, Bäckereien, Scheunen, Marktstände und Lager.", en: "A cloth sack of jute or linen for grain or flour: round and heavy on the floor, gathered to a neck at the top, tied shut, with a folded cuff or open. For mills, bakeries, barns, market stalls and store rooms." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.4, max: 1, step: 0.05, default: 0.7, unit: "m",
      describe: { de: "Gesamthöhe mit Hals: 0,5 m ein 25-kg-Mehlsack, 0,7 m ein 50-kg-Kornsack, 1 m ein großer Futtersack.", en: "Total height with the neck: 0.5 m a 25 kg flour sack, 0.7 m a 50 kg grain sack, 1 m a large feed sack." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.3, max: 0.6, step: 0.02, default: 0.44, unit: "m",
      describe: { de: "Durchmesser an der weitesten Stelle: 0,4 m ein Mehlsack, 0,44 m ein Kornsack, 0,56 m ein Futtersack.", en: "Diameter at the widest point: 0.4 m a flour sack, 0.44 m a grain sack, 0.56 m a feed sack." } },
    fill: { type: "number", label: { de: "Füllung", en: "Fill" }, min: 0.3, max: 1, step: 0.05, default: 0.85,
      describe: { de: "Wie voll der Sack ist: 1 prall und rund, 0,85 ein voller Sack, 0,45 halb leer, breit und niedrig mit weichen Falten im leeren Stoff.", en: "How full the sack is: 1 round and taut, 0.85 a full sack, 0.45 half empty, wide and low with soft folds in the empty cloth." } },
    neck: { type: "choice", label: { de: "Hals", en: "Neck" }, options: ["tied", "folded", "open"],
      labels: { tied: { de: "Zugebunden", en: "Tied" }, folded: { de: "Umgeschlagen", en: "Folded" }, open: { de: "Offen", en: "Open" } }, default: "tied",
      describe: { de: "Zugebunden: Schnur um den Hals und gekrauste Spitze; umgeschlagen: oben zur Manschette gerollt, Öffnung offen; offen: Öffnung ohne Manschette.", en: "Tied: a cord round the neck and a frilled top; folded: the top rolled down into a cuff, mouth open; open: the mouth without a cuff." } },
    lumps: { type: "number", label: { de: "Beulen", en: "Lumps" }, min: 0, max: 1, step: 0.05, default: 0.4,
      describe: { de: "Unebene Beulen des Inhalts: 0 glatt, 0,4 ein normaler Sack, 1 klumpig (Radius bis 4 % der Breite).", en: "Uneven bulges of the contents: 0 smooth, 0.4 an ordinary sack, 1 lumpy (radius up to 4 % of the width)." } },
    cloth: { type: "color", label: { de: "Stoff", en: "Cloth" }, default: "#c2ab80",
      describe: { de: "Farbe des Sacks: Jute #c2ab80, Leinen #e6e0d2, dunkle Jute #9a8258.", en: "Colour of the sack: jute #c2ab80, linen #e6e0d2, dark jute #9a8258." } },
    cord: { type: "color", label: { de: "Schnur", en: "Cord" }, default: "#6a4c30",
      describe: { de: "Farbe der Bindeschnur (nur zugebunden): Hanf #6a4c30, helles Garn #b8a47c.", en: "Colour of the tie cord (tied only): hemp #6a4c30, pale twine #b8a47c." } },
    contents: { type: "color", label: { de: "Inhalt", en: "Contents" }, default: "#ece6d6",
      describe: { de: "Farbe des Inhalts, sichtbar bei offener Öffnung: Mehl #ece6d6, Korn #d4b066, Hafer #c9b88a.", en: "Colour of the contents, shown when the mouth is open: flour #ece6d6, grain #d4b066, oats #c9b88a." } },
  },
  presets: {
    "grain-sack": { label: { de: "Kornsack", en: "Grain sack" }, values: { height: 0.7 } },
    "flour-sack": { label: { de: "Mehlsack", en: "Flour sack" }, values: { height: 0.55, width: 0.4, cloth: "#e6e0d2" } },
    "half-empty": { label: { de: "Halb leer", en: "Half empty" }, values: { fill: 0.45, neck: "folded" } },
    "open-sack": { label: { de: "Offener Sack", en: "Open sack" }, values: { neck: "open", contents: "#d4b066" } },
  },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 7000, drawCalls: 3 },
  build(p, seed) {
    const H = p.height, tied = p.neck === "tied";
    const slack = (1 - p.fill) / 0.7;
    // A slumped sack grows up to 15 % wider and its widest point sinks towards the floor
    const R = (p.width / 2) * (1 + 0.15 * slack), yw = H * (0.35 - 0.15 * slack);
    const rn = R * (tied ? 0.25 : 0.4), sc = H / 0.7;
    const stoff = material("paint", p.cloth, 1, 700), t = new Parts();

    // Profile (radius, height) from the floor: flat over 60 % of R, then up round the belly, a short shoulder, the neck
    const c: [number, number][] = [
      [0, 0], [0.3 * R, 0], [0.6 * R, 0], [0.88 * R, 0.07 * H], [R, yw], [0.9 * R, 0.5 * H], [0.62 * R, 0.62 * H],
      [rn * 1.8, 0.7 * H], [rn * 1.1, 0.76 * H], [rn, 0.8 * H],
    ];
    if (tied) c.push([rn * 1.35, 0.86 * H], [rn * 1.8, 0.93 * H], [rn * 1.6, 0.97 * H], [rn * 0.8, H], [0, H]);
    else if (p.neck === "folded") c.push([rn + 0.012 * sc, 0.84 * H], [rn + 0.022 * sc, 0.91 * H], [rn + 0.018 * sc, 0.97 * H], [rn + 0.006 * sc, H]);
    else c.push([rn * 1.06, 0.9 * H], [rn * 1.14, H]);
    const n = 52;
    const pts = new CatmullRomCurve3(c.map(([x, y]) => new Vector3(x, y, 0)), false, "centripetal").getPoints(n)
      .map((v) => new Vector3(Math.max(0, v.x), Math.min(H, Math.max(0, v.y)), 0));
    pts[0].x = 0;
    if (tied) pts[n].x = 0;

    // Lumps (periodic around the sack: whole frequencies) and folds under the neck, from their own random streams
    const r = rng(seed), r2 = rng(seed + 1);
    const lump = [0, 1, 2].map((k) => ({ f: 2 + k + (k === 2 ? 1 : 0), a: 0.5 + 0.5 * r(), ph: TAU * r(), c: 8 * r() - 4 }));
    const fold = [0, 1].map((k) => ({ f: k ? 11 : 7, a: k ? 0.5 : 1, ph: TAU * r2() }));
    const pleat = TAU * r2();
    const af = 0.07 + 0.3 * slack, L = p.lumps * 0.04 * p.width, norm = lump.reduce((s, l) => s + l.a, 0);
    const surf = (u: number, s: number) => {
      const j = Math.min(n - 1, Math.floor(s)), f = s - j, a = pts[j], b = pts[j + 1];
      let rad = a.x + (b.x - a.x) * f;
      const y = a.y + (b.y - a.y) * f, a2 = TAU * u;
      const lw = smooth(0.03 * H, 0.2 * H, y) * (1 - smooth(0.5 * H, 0.7 * H, y));
      const nz = lump.reduce((q, l) => q + l.a * Math.cos(l.f * a2 + l.ph + l.c * y / H), 0) / norm;
      const fw = smooth(0.45 * H, 0.62 * H, y) * (1 - smooth(0.68 * H, 0.79 * H, y));
      const fz = fold.reduce((q, l) => q + l.a * Math.cos(l.f * a2 + l.ph), 0) / 1.5;
      rad = rad * (1 + af * fw * fz) + L * lw * nz;
      if (tied) rad *= 1 + 0.3 * smooth(0.8 * H, 0.9 * H, y) * Math.cos(13 * a2 + pleat);
      return new Vector3(rad * Math.cos(a2), y, rad * Math.sin(a2));
    };
    t.add(stoff, grid(40, n, (u, v) => surf(u, v * n), (q) => new Vector3(q.x, 0, q.z)));

    if (tied) {
      // The cord sits in the cloth at the narrowest point of the neck, with a knot at the front
      const yc = 0.8 * H, q0 = surf(0, pts.findIndex((q, i) => i > n / 2 && q.y >= yc)), rc = Math.hypot(q0.x, q0.z) + 0.004 * sc;
      const cord = material("paint", p.cord), tube = 0.009 * sc;
      t.add(cord, new TorusGeometry(rc, tube, 8, 32).rotateX(Math.PI / 2).translate(0, yc, 0));
      t.add(cord, new SphereGeometry(tube * 1.5, 8, 6).translate(0, yc, rc));
    } else {
      // Open mouth: the inner wall (a cloth of 1.2 cm), a rim over the top and a domed disc of contents below the rim
      let low = n;
      while (low > 0 && pts[low].y > H - 0.07 * sc) low--;
      const inner = (u: number, s: number) => {
        const q = surf(u, s), rr = Math.hypot(q.x, q.z), k = Math.max(0.4, 1 - 0.012 / rr);
        return new Vector3(q.x * k, q.y, q.z * k);
      };
      t.add(stoff, grid(40, n - low, (u, v) => inner(u, n - v * (n - low)), (q) => new Vector3(-q.x, 0, -q.z)));
      t.add(stoff, grid(40, 1, (u, v) => surf(u, n).lerp(inner(u, n), v), () => new Vector3(0, 1, 0)));
      const korn = material("paint", p.contents);
      t.add(korn, grid(40, 4, (u, v) => {
        const e = inner(u, low), d = new Vector3(e.x * v, e.y + 0.015 * sc * (1 - v * v), e.z * v);
        return d;
      }, () => new Vector3(0, 1, 0)));
    }
    return t.group();
  },
});
