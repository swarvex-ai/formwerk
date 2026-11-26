import { circle, line, polygon, reach, rect, type Pt } from "../../core/vector";
import { area, defineIcon, detail, dot, type Part } from "../define";
import { centre, fits, inkRadius } from "../shared";

type Strecke = readonly [Pt, Pt];
const abstand = (p: Pt, [a, b]: Strecke) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dy * t);
};
const strecken = (pts: readonly Pt[], zu: boolean): Strecke[] =>
  pts.slice(0, zu ? pts.length : pts.length - 1).map((q, i): Strecke => [q, pts[(i + 1) % pts.length]]);
// Points every quarter grid unit along a polyline
const proben = (pts: readonly Pt[], zu: boolean): Pt[] => strecken(pts, zu).flatMap(([a, b]) => {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.25));
  return Array.from({ length: n + 1 }, (_, i): Pt => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);
});
/** Ink that something drawn has to keep clear of: its centre lines and how far its ink reaches beyond them. */
type Hindernis = { segs: Strecke[]; ink: number };
const frei = (pts: readonly Pt[], ink: number, luft: number, hin: readonly Hindernis[]) =>
  hin.every((h) => pts.every((q) => h.segs.every((s) => abstand(q, s) >= ink + h.ink + luft - 1e-6)));

export const shirt = defineIcon({
  id: "shirt", category: "objects",
  title: { de: "Hemd", en: "Shirt" },
  description: {
    de: "Ein T-Shirt oder Hemd von vorn für Kleidung, Shop, Kleiderschrank, Wäsche, Avatare und Ankleide-Menüs: Rumpf mit zwei Ärmeln und Halsausschnitt, auf Wunsch mit Knopfleiste oder Brusttasche.",
    en: "A T-shirt or button shirt seen from the front for clothing, shops, wardrobes, laundry, avatars and dress-up menus: a body with two sleeves and a neck opening, optionally with a button placket or a breast pocket.",
  },
  params: {
    sleeves: { type: "choice", options: ["short", "long"], default: "short", label: { de: "Ärmel", en: "Sleeves" },
      labels: { short: { de: "Kurz", en: "Short" }, long: { de: "Lang", en: "Long" } },
      describe: { de: "Kurze Ärmel enden schräg nach außen über der Taille wie beim T-Shirt; lange laufen am Rumpf entlang bis fast zum Saum.", en: "Short sleeves end above the waist, angled outwards like a T-shirt; long ones run down along the body to near its hem." } },
    width: { type: "number", min: 14, max: 19, step: 0.5, default: 17, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite des Rumpfs am Saum ohne Ärmel in Rasterpunkten (von 24): 14 schmal geschnitten, 17 üblich, 19 weit; das Ganze wird so groß gezeichnet, wie es mit den Ärmeln passt.", en: "Width of the body at the hem without the sleeves in grid units (of 24): 14 slim, 17 usual, 19 loose; the whole is drawn as large as it fits with the sleeves." } },
    neck: { type: "choice", options: ["round", "v", "collar"], default: "round", label: { de: "Ausschnitt", en: "Neck" },
      labels: { round: { de: "Rund", en: "Round" }, v: { de: "V-Ausschnitt", en: "V-neck" }, collar: { de: "Kragen", en: "Collar" } },
      describe: { de: "Rund ein gebogener Ausschnitt in der Oberkante, V ein spitzer Ausschnitt, Kragen zwei kleine umgelegte Kragenspitzen über einem flachen Ausschnitt.", en: "Round a curved notch in the top edge, V a pointed notch, collar two small collar points folded down over a shallow notch." } },
    placket: { type: "boolean", default: false, label: { de: "Knopfleiste", en: "Placket" },
      describe: { de: "Eine senkrechte Linie vom Ausschnitt zum Saum mit zwei oder drei Knöpfen daneben, wie beim Hemd.", en: "A vertical line from the neck to the hem with two or three buttons beside it, as on a button shirt." } },
    pocket: { type: "boolean", default: false, label: { de: "Brusttasche", en: "Pocket" },
      describe: { de: "Eine kleine quadratische Tasche auf der linken Brust (vom Betrachter rechts); entfällt, wo sie neben der Knopfleiste keinen Platz hat.", en: "A small square pocket on the left breast (the viewer's right); left out where it does not fit beside the placket." } },
  },
  presets: {
    tshirt: { label: { de: "T-Shirt", en: "T-shirt" }, values: { sleeves: "short" } },
    shirt: { label: { de: "Hemd", en: "Shirt" }, values: { sleeves: "long", neck: "collar", placket: true } },
    vneck: { label: { de: "V-Ausschnitt", en: "V-neck" }, values: { neck: "v", pocket: true } },
    solid: { label: { de: "Gefüllt", en: "Solid" }, values: { style: "filled" } },
  },
  build(p, pen) {
    const hw = pen.width / 2, e = inkRadius(pen), luft = 1;
    // Buttons as large as the body leaves room for beside the placket (a is its half width at the hem)
    const knopf = (a: number) => Math.max(0.6, Math.min(0.8, (a - pen.width - 2 * luft) / 2 - 0.05));
    // The outline at scale k: the right half from the neck corner to the hem, mirrored; the neck notch across the top
    const umriss = (k: number): Pt[] => {
      const a = (p.width / 2) * k, h = 22 * k, nw = 3.8 * k;
      // A short sleeve points out and down at 28° below level, so the armpit opens at 62°; it stays thick enough
      // at every stroke for its inside to pass the armpit's corner
      const d: Pt = [0.883, 0.469], t = Math.max(4 * k, 1.5 * pen.width + 1.6), s: Pt = [a, 1.2 * k];
      const o: Pt = [s[0] + 4.5 * k * d[0], s[1] + 4.5 * k * d[1]], i: Pt = [o[0] - t * d[1], o[1] + t * d[0]];
      const achsel: Pt = [a, i[1] - ((i[0] - a) / d[0]) * d[1]];
      const rechts: Pt[] = p.sleeves === "short"
        ? [s, o, i, achsel, [a, h]]
        : [[a + 0.9 * k, 1.3 * k], [a + Math.max(4 * k, pen.width + 1.4), h - 3.2 * k], [a, h - 3.2 * k], [a, h]];
      // The notch keeps room below for the placket and its buttons, and for the hem
      const tiefMax = h - 2 * (e + luft) - 3 * (2 * knopf(a) + luft);
      const tiefe = Math.min(tiefMax, p.neck === "v" ? 1.5 * nw : p.neck === "round" ? 0.85 * nw : 0.45 * nw);
      const hals: Pt[] = p.neck === "round"
        ? Array.from({ length: 9 }, (_, i): Pt => [-nw * Math.cos((i * Math.PI) / 8), tiefe * Math.sin((i * Math.PI) / 8)])
        : [[-nw, 0], [0, tiefe], [nw, 0]];
      return [...hals, ...rechts, ...rechts.slice().reverse().map(([x, y]): Pt => [-x, y])];
    };
    let k = 1;
    if (!fits([area(polygon(...umriss(1)))], pen)) {
      let lo = 0.3, hi = 1;
      for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (fits([area(polygon(...umriss(m)))], pen)) lo = m; else hi = m; }
      k = lo;
    }
    const form = umriss(k), a = (p.width / 2) * k, h = 22 * k, rb = knopf(a), dotLuft = 2 * rb + luft;
    const teile: Part[] = [area(polygon(...form))];
    // The outline's ink: half the stroke beside its edges, up to the miter tip at its corners
    const hin: Hindernis[] = [{ segs: strecken(form, true), ink: hw }, ...form.map((v, j): Hindernis => {
      const q = form[(j + form.length - 1) % form.length], r = form[(j + 1) % form.length];
      const w = Math.abs(Math.atan2(q[1] - v[1], q[0] - v[0]) - Math.atan2(r[1] - v[1], r[0] - v[0])) * 180 / Math.PI;
      return { segs: [[v, v]], ink: reach(pen, Math.min(w, 360 - w)) };
    })];
    // The lowest point of the neck notch, where its ink ends below
    const tiefe = Math.max(...form.filter(([x]) => Math.abs(x) <= 3.8 * k + 1e-9).map(([, y]) => y));
    let oben = tiefe;
    if (p.neck === "collar") {
      // Two collar points folded down below the shallow notch: solid triangles, cut out of a filled shirt
      // With a placket they part wide enough for it to run between them from the neck
      const g = p.placket ? hw + luft + 0.05 : 0.65, yt = tiefe + hw + e + luft, breit = Math.max(3.8 * k + 0.6, g + 2.8), lang = 3;
      for (const s of [-1, 1]) {
        // As wide as the shoulders leave room for, else lower
        let tri: Pt[] = [];
        suche: for (let y = yt; y < yt + 3; y += 0.1) for (let b = breit; b >= g + 1.8; b -= 0.1) {
          tri = [[s * b, y], [s * g, y], [s * g, y + lang]];
          if (frei(proben(tri, true), 0, luft, hin)) break suche;
        }
        teile.push(detail(polygon(...tri), true));
        hin.push({ segs: strecken(tri, true), ink: 0 });
        if (!p.placket) oben = Math.max(oben, tri[2][1] - e);
      }
    }
    // Room for the placket: below the notch (or the collar) and above the hem
    const y0 = oben + 2 * e + luft + (pen.corners === "sharp" && p.neck === "v" ? hw : 0), y1 = h - 2 * e - luft;
    if (p.placket) {
      const leiste: Pt[] = [[0, y0], [0, Math.max(y0 + 0.5, y1)]];
      teile.push(detail(line(...leiste)));
      // Its square caps stay within half the stroke across, so beside it half the stroke counts
      hin.push({ segs: strecken(leiste, false), ink: hw });
      // Buttons beside the placket on the viewer's left, from as high as the neck and the collar leave room down to
      // the hem: three where they fit, else two
      const x = -(hw + luft + rb), unten = h - e - luft - rb;
      const offen = (y: number) => frei([[x, y]], rb, luft, hin);
      let top = tiefe;
      while (top < unten && !offen(top)) top += 0.1;
      const schritt = Math.max(dotLuft, Math.min(1.6 * dotLuft, (unten - top) / 2));
      for (let y = top, n = 0; y <= unten + 1e-9 && n < 3; n++) {
        teile.push(dot(circle([x, y], rb)));
        y += schritt;
        while (y <= unten && !offen(y)) y += 0.1;
      }
    }
    if (p.pocket) {
      // A square on the viewer's right breast, as near to its usual place as the outline and the placket leave room:
      // drawn as a frame, or solid where the frame does not fit off the middle
      const wunsch: Pt = [a * 0.5, 0.42 * h];
      const suche = (s: number, ink: number): Pt | null => {
        let best: Pt | null = null, bestD = Infinity;
        for (let x0 = 0.35 * a - s / 2; x0 + s <= a; x0 += 0.25) for (let yp = 0.15 * h; yp + s <= 0.75 * h; yp += 0.25) {
          const d = Math.hypot(x0 + s / 2 - wunsch[0], yp + s / 2 - wunsch[1]);
          if (d >= bestD) continue;
          const ecken: Pt[] = [[x0, yp], [x0 + s, yp], [x0 + s, yp + s], [x0, yp + s]];
          if (frei(proben(ecken, true), ink, luft, hin)) { best = [x0, yp]; bestD = d; }
        }
        return best;
      };
      const rahmen = pen.width + 1.3, voll = 2.4, r = suche(rahmen, e), v = r ? null : suche(voll, 0);
      if (r) teile.push(detail(rect(r[0], r[1], rahmen, rahmen)));
      else if (v) teile.push(detail(polygon([v[0], v[1]], [v[0] + voll, v[1]], [v[0] + voll, v[1] + voll], [v[0], v[1] + voll]), true));
    }
    return centre(teile, pen);
  },
});
