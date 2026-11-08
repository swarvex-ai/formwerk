import { circle, polygon, reach, type Pt, type Shape } from "../../core/vector";
import { area, defineIcon, gap, type Part } from "../define";

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
    const vorn = person(vornX, vornBreite, 1);
    // The people behind: as wide as the room to the edge allows, their heads inside it and a little lower
    const seite = (cx: number) => {
      const rand = 12 - m - Math.abs(cx - 12), q = person(cx, Math.min(vornBreite * 0.8, 2 * rand), 0.8);
      if (q.kopf.kind === "circle" && vorn.kopf.kind === "circle") {
        const r = Math.min(q.kopf.r, rand - pen.width / 2 + pen.width / 2 - 0.25);
        q.kopf = circle([cx, Math.max(q.kopf.c[1], vorn.kopf.c[1] + 1)], r);
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
