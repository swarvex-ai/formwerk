import { arc, onCircle, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, dot, stroke, type Part } from "../define";
import { CLEAR } from "../shared";

export const refresh = defineIcon({
  id: "refresh", category: "actions",
  title: { de: "Aktualisieren", en: "Refresh" },
  description: {
    de: "Ein Kreispfeil für Aktualisieren, Neuladen und Wiederholen, mit einer oder zwei Pfeilspitzen.",
    en: "A circular arrow for refresh, reload and repeat, with one or two arrowheads.",
  },
  params: {
    sweep: { type: "number", min: 200, max: 330, step: 10, default: 290, label: { de: "Bogen", en: "Sweep" },
      describe: { de: "Wie viel vom Kreis die Pfeile zusammen überdecken, in Grad: 200 offen, 290 üblich, 330 fast geschlossen; die Lücke für die Spitze bleibt immer.", en: "How much of the circle the arrows cover together, in degrees: 200 open, 290 usual, 330 almost closed; the gap for the head always stays." } },
    arrows: { type: "integer", min: 1, max: 2, default: 1, label: { de: "Pfeile", en: "Arrows" },
      describe: { de: "Zahl der Pfeilspitzen: 1 für Aktualisieren, 2 für Synchronisieren (zwei Pfeile gegenüber).", en: "Number of arrowheads: 1 for refresh, 2 for sync (two arrows facing each other)." } },
    arrowSize: { type: "number", min: 2.5, max: 4, step: 0.5, default: 3, label: { de: "Pfeilspitze", en: "Arrowhead" },
      describe: { de: "Halbe Breite der Pfeilspitze in Rasterpunkten: 2,5 klein, 3 üblich, 4 groß; große Spitzen verkleinern den Kreis.", en: "Half width of the arrowhead in grid units: 2.5 small, 3 usual, 4 large; big heads make the circle smaller." } },
    turn: { type: "number", min: 0, max: 90, step: 15, default: 0, label: { de: "Drehung", en: "Turn" },
      describe: { de: "Dreht die Lücke im Uhrzeigersinn, in Grad: 0 Lücke oben rechts, 90 Lücke rechts unten.", en: "Turns the gap clockwise in degrees: 0 gap at the top right, 90 gap at the bottom right." } },
  },
  presets: {
    reload: { label: { de: "Neu laden", en: "Reload" }, values: { sweep: 290, arrows: 1 } },
    sync: { label: { de: "Synchronisieren", en: "Sync" }, values: { arrows: 2, sweep: 300, arrowSize: 2.5 } },
    open: { label: { de: "Offener Pfeil", en: "Open arrow" }, values: { sweep: 220, arrowSize: 3.5 } },
  },
  build(p, pen) {
    const hw = pen.width / 2, b = p.arrowSize, len = b * 1.1, n = p.arrows;
    // The head is an area: its stroke adds the pen, so its centre line is a little smaller
    const k = Math.max(0.5, b - hw);
    const r = 10.65 - Math.max(hw, b) - (pen.corners === "sharp" ? hw * 1.2 : 0);
    // Each arrow leaves room for its own head and the start of the next arc
    const gapMin = ((len + hw + CLEAR + 0.5) / r) * 180 / Math.PI;
    const each = Math.max(30, Math.min(p.sweep / n, 360 / n - gapMin)), gap = 360 / n - each;
    const c: Pt = [12, 12], teile: Part[] = [];
    for (let i = 0; i < n; i++) {
      const from = 40 + p.turn + gap / 2 + (i * 360) / n, to = from + each, e = onCircle(c, r, to);
      const a = (to * Math.PI) / 180, t: Pt = [Math.cos(a), Math.sin(a)], q: Pt = [-t[1], t[0]];
      teile.push(stroke(arc(c, r, from, to)));
      // Solid in every style (its inside is too small to stay open at 24 px), the area keeps the style visible
      const kopf = polygon([e[0] + q[0] * k, e[1] + q[1] * k], [e[0] + t[0] * len, e[1] + t[1] * len], [e[0] - q[0] * k, e[1] - q[1] * k]);
      teile.push(area(kopf), dot(kopf));
    }
    return teile;
  },
});
