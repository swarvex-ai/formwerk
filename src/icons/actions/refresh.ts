import { arc, onCircle, polygon, reach, translate, type Pt } from "../../core/vector";
import { area, defineIcon, dot, stroke, type Part } from "../define";
import { CLEAR, partsBox } from "../shared";

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
    // Each arrow leaves room for its own head and the start of the next arc: the ink of the tip (a miter with sharp
    // corners) keeps CLEAR from the cap of the next arc (a square with sharp corners, a disc with round ones)
    const vor = len + reach(pen, (Math.atan2(k, len) * 360) / Math.PI);
    const frei = (g: number) => {
      const w = (g * Math.PI) / 180, dx = r - r * Math.cos(w), dy = vor - r * Math.sin(w);
      const u = -dx * Math.sin(w) + dy * Math.cos(w), v = dx * Math.cos(w) + dy * Math.sin(w);
      return pen.corners === "round" ? Math.hypot(u, v) - hw : Math.hypot(Math.max(0, -u - hw), Math.max(0, Math.abs(v) - hw));
    };
    let gapMin = ((len + hw + CLEAR + 0.5) / r) * 180 / Math.PI;
    while (frei(gapMin) < CLEAR) gapMin += 0.5;
    const each = Math.max(30, Math.min(p.sweep / n, 360 / n - gapMin)), gap = 360 / n - each;
    const c: Pt = [12, 12], teile: Part[] = [];
    for (let i = 0; i < n; i++) {
      const from = 40 + p.turn + gap / 2 + (i * 360) / n, to = from + each, e = onCircle(c, r, to);
      const a = (to * Math.PI) / 180, t: Pt = [Math.cos(a), Math.sin(a)], q: Pt = [-t[1], t[0]];
      teile.push(stroke(arc(c, r, from, to)));
      // Solid in every style (its inside is too small to stay open at 24 px), the area keeps the style visible
      const kopf = polygon([e[0] + q[0] * k, e[1] + q[1] * k], [e[0] + t[0] * len, e[1] + t[1] * len], [e[0] - q[0] * k, e[1] - q[1] * k]);
      teile.push(area(kopf), dot(kopf));
      if (pen.corners === "sharp") {
        // The miter of the inner barb points back at the arc: the narrow pocket between them would close at 24 px,
        // so it is solid from the barb's tip to the arc
        const L = Math.hypot(len, k), ot = -len / L, oq = 1 + k / L, on = Math.hypot(ot, oq);
        const m = reach(pen, (Math.acos(k / L) * 180) / Math.PI) / on, bi: Pt = [e[0] + q[0] * k, e[1] + q[1] * k];
        const spitze: Pt = [bi[0] + (t[0] * ot + q[0] * oq) * m, bi[1] + (t[1] * ot + q[1] * oq) * m];
        teile.push(dot(polygon(e, bi, spitze, onCircle(c, r, to - ((-ot * m + hw) / r) * 180 / Math.PI))));
      }
    }
    // An open arc leans away from its gap: moved back where its ink would sit more than 1.5 off the middle
    const [x0, y0, x1, y1] = partsBox(teile, pen), mitte = (v: number) => Math.sign(v) * Math.max(0, Math.abs(v) - 1.5);
    const dx = mitte(12 - (x0 + x1) / 2), dy = mitte(12 - (y0 + y1) / 2);
    return teile.map((t) => ({ ...t, shape: translate(t.shape, dx, dy) }));
  },
});
