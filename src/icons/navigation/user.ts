import { circle, polygon, reach, type Pt, type Shape } from "../../core/vector";
import { area, defineIcon, gap, type Part } from "../define";
import { CLEAR } from "../shared";

export const user = defineIcon({
  id: "user", category: "navigation",
  title: { de: "Person", en: "User" },
  description: {
    de: "Kopf und Schultern für Konto, Profil und Mitglieder; bis zu drei Personen für Gruppen und Teams.",
    en: "Head and shoulders for account, profile and members; up to three people for groups and teams.",
  },
  params: {
    people: { type: "integer", min: 1, max: 3, default: 1, label: { de: "Personen", en: "People" },
      describe: { de: "1 für Konto und Profil, 2 für Kontakte oder Paare, 3 für Gruppen und Teams.", en: "1 for account and profile, 2 for contacts or pairs, 3 for groups and teams." } },
    head: { type: "number", min: 2.5, max: 5, step: 0.25, default: 4, label: { de: "Kopf", en: "Head" },
      describe: { de: "Radius des Kopfs in Rasterpunkten: 3 wirkt zierlich, 4 üblich, 5 rund wie ein Avatar.", en: "Radius of the head in grid units: 3 looks delicate, 4 usual, 5 round like an avatar." } },
    shoulders: { type: "number", min: 12, max: 20, step: 0.5, default: 16, label: { de: "Schultern", en: "Shoulders" },
      describe: { de: "Breite der Schultern in Rasterpunkten (von 24): 13 schmal, 16 üblich, 19 breit; bei Gruppen rücken sie enger.", en: "Width of the shoulders in grid units (of 24): 13 narrow, 16 usual, 19 broad; groups stand closer." } },
  },
  presets: {
    account: { label: { de: "Konto", en: "Account" }, values: { people: 1, head: 4.5, shoulders: 17 } },
    team: { label: { de: "Team", en: "Team" }, values: { people: 3, head: 3.5 } },
  },
  build(p, pen) {
    const m = Math.max(2, 1 + reach(pen, 90)), unten = 24 - m, luft = Math.max(1.5, pen.width * 0.75) + pen.width;
    // Groups: the person in front in the middle (three) or on the left (two); the others stand behind, smaller, and
    // reach out to the side as far as the room allows
    const versatz = p.people === 3 ? 6.5 : p.people === 2 ? 7 : 0, vornX = p.people === 2 ? 12 - versatz / 2 : 12;
    const vornBreite = Math.min(p.shoulders, p.people === 3 ? 13.5 : p.people === 2 ? 2 * (vornX - m) : 24 - 2 * m);
    const person = (cx: number, breite: number, k: number) => {
      const rx = breite / 2, frei = unten - m;
      let kopf = Math.min(p.head, p.people === 3 ? 3.75 : 4.5) * k, ry = Math.min(rx * 0.75, frei - 2 * kopf - luft);
      if (ry < 3) { ry = 3; kopf = Math.max(2, Math.min(kopf, (frei - ry - luft) / 2)); }
      const koerper = polygon(...Array.from({ length: 17 }, (_, i): Pt => { const t = ((i / 16) * 180 - 90) * Math.PI / 180; return [cx + rx * Math.sin(t), unten - ry * Math.cos(t)]; }));
      return { kopf: circle([cx, unten - ry - luft - kopf], kopf), koerper } as { kopf: Shape; koerper: Shape };
    };
    const vorn = person(vornX, vornBreite, 1), hw = pen.width / 2, saum = hw + 1.25;
    // Whether a point is outside the gaps around the person in front (head and body, each 1.25 beyond its stroke)
    const draussen = ([x, y]: Pt): boolean => {
      if (vorn.kopf.kind === "circle" && Math.hypot(x - vorn.kopf.c[0], y - vorn.kopf.c[1]) < vorn.kopf.r + saum) return false;
      if (vorn.koerper.kind !== "line") return true;
      const ps = vorn.koerper.points;
      let innen = false;
      for (let i = 0, j = ps.length - 1; i < ps.length; j = i++) {
        const [ax, ay] = ps[j], [bx, by] = ps[i], dx = bx - ax, dy = by - ay;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
        if (Math.hypot(x - ax - t * dx, y - ay - t * dy) < saum) return false;
        if (ay > y !== by > y && x < ax + ((y - ay) * dx) / (dy || 1e-9)) innen = !innen;
      }
      return !innen;
    };
    // Whether the gaps cut the ring of a head behind cleanly, so it reads at 24 px as it does large. Along the ring,
    // the ink left over is solid (up to 1 grid unit thick), thin or none. Where it thins to a sliver, the ring must
    // open there by CLEAR or more (or a sliver would draw it shut); every piece in between keeps one solid stretch of
    // CLEAR or more (none would vanish, two would come apart)
    const sauber = (c: Pt, r: number): boolean => {
      const N = 144, K = 9, schritt = (2 * Math.PI) / N, voll = Math.min(2 * hw, 1) - 1e-6;
      const auf = (w: number, d: number): Pt => [c[0] + d * Math.sin(w), c[1] - d * Math.cos(w)];
      const n = Array.from({ length: N }, (_, i) => Array.from({ length: K }, (_, k) => draussen(auf(i * schritt, r - hw + (k / (K - 1)) * 2 * hw))).filter(Boolean).length);
      const dicke = n.map((v) => (v ? ((v - 1) / (K - 1)) * 2 * hw : -1)), duenn = (i: number) => dicke[i % N] < 0.3;
      // Runs of angles alike, starting at one that differs from the angle before
      const laeufe = (gleich: (i: number) => boolean): number[][] => {
        const s = Array.from({ length: N }, (_, i) => i).find((i) => gleich(i) !== gleich(i + N - 1));
        if (s === undefined) return [Array.from({ length: N }, (_, i) => i)];
        const l: number[][] = [];
        for (let i = s; i < s + N; i++) (i > s && gleich(i) === gleich(i - 1) ? l[l.length - 1] : l[l.push([]) - 1]).push(i % N);
        return l;
      };
      for (const lauf of laeufe(duenn)) {
        if (duenn(lauf[0])) {
          const offen = laeufe((i) => dicke[i % N] < 0).filter((o) => dicke[o[0]] < 0 && o.every((i) => lauf.includes(i)));
          if (!offen.some((o) => 2 * (r - hw) * Math.sin(((o.length + 1) * schritt) / 2) >= CLEAR)) return false;
        } else {
          const fest = lauf.map((i) => dicke[i] >= voll), strecken: number[] = [];
          fest.forEach((f, k) => { if (f) { if (k && fest[k - 1]) strecken[strecken.length - 1]++; else strecken.push(1); } });
          if (lauf.length === N && fest[0] && fest[N - 1] && strecken.length > 1) strecken[0] += strecken.pop()!;
          if (lauf.length === N ? strecken.length > 1 || (strecken[0] ?? 0) === 0 : strecken.length !== 1 || strecken[0] * schritt * r < CLEAR) return false;
        }
      }
      return true;
    };
    // The people behind: as wide as the room to the edge allows, their heads inside it and a little lower
    const seite = (cx: number) => {
      const rand = 12 - m - Math.abs(cx - 12), q = person(cx, Math.min(vornBreite * 0.8, 2 * rand), 0.8);
      if (q.kopf.kind === "circle" && vorn.kopf.kind === "circle") {
        const grenze = rand - 0.25, r = Math.min(q.kopf.r, grenze), c: Pt = [cx, Math.max(q.kopf.c[1], vorn.kopf.c[1] + 1)];
        // The nearest radius at which the gaps of the person in front cut the ring cleanly or not at all
        const versuche = Array.from({ length: 41 }, (_, i) => r + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.05).filter((v) => v >= 1.5 && v <= grenze);
        q.kopf = circle(c, versuche.find((v) => sauber(c, v)) ?? r);
      }
      return q;
    };
    const hinten = p.people === 3 ? [seite(12 - versatz), seite(12 + versatz)] : p.people === 2 ? [seite(12 + versatz / 2)] : [];
    // Centre top to bottom: from the top of the highest head to the bottom line
    const kopfOben = Math.min(...[vorn, ...hinten].map((q) => (q.kopf.kind === "circle" ? q.kopf.c[1] - q.kopf.r : 12)));
    const dy = Math.min(0, 12 - (kopfOben + unten) / 2);
    const schieben = (s: Shape): Shape => (s.kind === "circle" ? { ...s, c: [s.c[0], s.c[1] + dy] } : s.kind === "line" ? { ...s, points: s.points.map(([x, y]): Pt => [x, y + dy]) } : s);
    for (const q of [vorn, ...hinten]) { q.kopf = schieben(q.kopf); q.koerper = schieben(q.koerper); }
    const teile: Part[] = hinten.flatMap((h) => [area(h.koerper), area(h.kopf)]);
    if (hinten.length) teile.push(gap(vorn.koerper, 1.25, true), gap(vorn.kopf, 1.25, true));
    teile.push(area(vorn.koerper), area(vorn.kopf));
    return teile;
  },
});
