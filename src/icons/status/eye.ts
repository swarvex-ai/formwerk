import { circle, line, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, dot, gap, hole, stroke, type Part } from "../define";
import { CLEAR, EDGE } from "../shared";

export const eye = defineIcon({
  id: "eye", category: "status",
  title: { de: "Auge", en: "Eye" },
  description: {
    de: "Ein Auge für Anzeigen, Vorschau und Sichtbarkeit, durchgestrichen für Verbergen (etwa ein Passwort).",
    en: "An eye for show, preview and visibility, crossed out for hide (a password, for instance).",
  },
  params: {
    width: { type: "number", min: 16, max: 21.5, step: 0.5, default: 20, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite von Augenwinkel zu Augenwinkel in Rasterpunkten (von 24): 17 kompakt, 20 üblich, 21,5 randlos.", en: "Width from corner to corner in grid units (of 24): 17 compact, 20 usual, 21.5 edge to edge." } },
    open: { type: "number", min: 0.55, max: 0.8, step: 0.05, default: 0.65, label: { de: "Öffnung", en: "Opening" },
      describe: { de: "Höhe der Lidöffnung im Verhältnis zur Breite: 0,55 schmal und wach, 0,65 üblich, 0,8 weit offen und rund.", en: "Height of the opening relative to the width: 0.55 narrow and alert, 0.65 usual, 0.8 wide open and round." } },
    iris: { type: "number", min: 0.35, max: 1, step: 0.05, default: 0.45, label: { de: "Iris", en: "Iris" },
      describe: { de: "Durchmesser der Iris im Verhältnis zur Lidöffnung: 0,35 klein, 0,45 üblich, 0,6 groß mit Pupille, 1 so groß, wie es mit freiem Rand zu den Lidern passt.", en: "Diameter of the iris relative to the opening: 0.35 small, 0.45 usual, 0.6 big with a pupil, 1 as big as fits with clear room to the lids." } },
    hidden: { type: "boolean", default: false, label: { de: "Verborgen", en: "Hidden" },
      describe: { de: "Ein Schrägstrich mit freiem Rand: verbergen, unsichtbar, Passwort verdeckt.", en: "A slash with a clear margin: hide, invisible, password masked." } },
  },
  presets: {
    show: { label: { de: "Anzeigen", en: "Show" }, values: { open: 0.65, iris: 0.45 } },
    hide: { label: { de: "Verbergen", en: "Hide" }, values: { hidden: true } },
    watch: { label: { de: "Beobachten", en: "Watch" }, values: { open: 0.8, iris: 0.6 } },
  },
  build(p, pen) {
    const hw = pen.width / 2, w = Math.min(p.width, 24 - 2 * EDGE - pen.width), h = Math.min(w * p.open, 24 - 2 * EDGE - pen.width);
    // Two lids as arcs of a parabola, meeting in sharp corners
    const lid = (s: number) => Array.from({ length: 15 }, (_, i): Pt => { const x = -w / 2 + (w * i) / 14; return [12 + x, 12 + s * (h / 2) * (1 - (2 * x / w) ** 2)]; });
    const teile: Part[] = [area(polygon(...lid(-1), ...lid(1).reverse().slice(1, -1)))];
    // The iris stays clear of the lids
    const r = Math.min((p.iris * h) / 2, h / 2 - pen.width - CLEAR);
    // Crossed out, the slash's margin cuts the iris: only an iris big enough to leave clear pieces stays, without pupil
    if (p.hidden && r - 1.25 < 1.6) { /* no iris */ }
    else if (r - hw >= 0.6) {
      teile.push(hole(circle([12, 12], r)));
      const pupille = r * 0.42;
      if (!p.hidden && pupille >= 0.6 && r - hw - pupille >= CLEAR) teile.push(dot(circle([12, 12], pupille)));
    } else if (!p.hidden) teile.push(dot(circle([12, 12], Math.max(0.8, r))));
    if (p.hidden) {
      const e = EDGE + (pen.corners === "sharp" ? hw * Math.SQRT2 : hw) + 0.25, strich = line([e, e], [24 - e, 24 - e]);
      teile.push(gap(strich, 1.25), stroke(strich));
    }
    return teile;
  },
});
