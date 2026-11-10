import { circle, line, type Pt } from "../../core/vector";
import { area, defineIcon, dot, gap, stroke, type Part } from "../define";
import { centre, EDGE } from "../shared";

export const sliders = defineIcon({
  id: "sliders", category: "objects",
  title: { de: "Schieberegler", en: "Sliders" },
  description: {
    de: "Schieberegler für Einstellungen: zwei bis fünf Spuren, waagrecht oder senkrecht, mit versetzten oder mittigen Knöpfen.",
    en: "Sliders for settings: two to five tracks, horizontal or vertical, with staggered or centred knobs.",
  },
  params: {
    tracks: { type: "integer", min: 2, max: 5, default: 3, label: { de: "Spuren", en: "Tracks" },
      describe: { de: "Zahl der Regler: 2 für ein Paar, 3 üblich für Einstellungen, 5 für ein Mischpult; die Knöpfe werden dabei kleiner.", en: "Number of sliders: 2 for a pair, 3 usual for settings, 5 for a mixer; the knobs get smaller." } },
    orientation: { type: "choice", options: ["horizontal", "vertical"], default: "horizontal", label: { de: "Ausrichtung", en: "Orientation" },
      labels: { horizontal: { de: "Waagrecht", en: "Horizontal" }, vertical: { de: "Senkrecht", en: "Vertical" } },
      describe: { de: "Waagrecht wie ein üblicher Einstellungsdialog, senkrecht wie ein Mischpult oder Equalizer.", en: "Horizontal like a usual settings dialog, vertical like a mixer or equaliser." } },
    staggered: { type: "boolean", default: true, label: { de: "Versetzt", en: "Staggered" },
      describe: { de: "Die Knöpfe stehen auf verschiedenen Höhen; aus stehen alle in der Mitte wie neutrale Regler.", en: "The knobs sit at different positions; off, all rest in the middle like neutral controls." } },
    knob: { type: "number", min: 3, max: 6, step: 0.25, default: 4.5, label: { de: "Knopfgröße", en: "Knob size" },
      describe: { de: "Durchmesser der Knöpfe in Rasterpunkten (von 24): 3 klein und fein, 4,5 üblich, 6 groß und gut greifbar.", en: "Diameter of the knobs in grid units (of 24): 3 small and fine, 4.5 usual, 6 large and easy to grab." } },
  },
  presets: {
    settings: { label: { de: "Einstellungen", en: "Settings" }, values: { tracks: 3, staggered: true } },
    mixer: { label: { de: "Mischpult", en: "Mixer" }, values: { tracks: 5, orientation: "vertical", staggered: true, knob: 3.5 } },
    "equaliser": { label: { de: "Equalizer", en: "Equaliser" }, values: { tracks: 4, orientation: "vertical", staggered: false } },
  },
  build(p, pen) {
    const hw = pen.width / 2, n = p.tracks, waagrecht = p.orientation === "horizontal";
    const mitte = 24 - 2 * EDGE, rand = EDGE + hw;
    // Keep the knobs of neighbouring tracks apart, and the whole drawing inside the live area
    const grenze = (mitte - 2 * hw - (n - 1) * (2 * hw + 1.1)) / (2 * n);
    const r = Math.max(0.5, Math.min(p.knob / 2, grenze));
    const p0 = EDGE + r + hw, p1 = 24 - EDGE - r - hw, abstand = n > 1 ? (p1 - p0) / (n - 1) : 0;
    const lagen = p.staggered ? [0.3, 0.68, 0.42, 0.75, 0.35] : [0.5, 0.5, 0.5, 0.5, 0.5];
    const teile: Part[] = [], ring = r - hw >= 0.5;
    for (let i = 0; i < n; i++) {
      const quer = p0 + i * abstand, laengs = p0 + (p1 - p0) * lagen[i];
      if (waagrecht) {
        const k: Pt = [laengs, quer];
        teile.push(stroke(line([rand, quer], [24 - rand, quer])), ring ? gap(circle(k, r), 0, true) : dot(circle(k, r)), ...(ring ? [area(circle(k, r))] : []));
      } else {
        const k: Pt = [quer, laengs];
        teile.push(stroke(line([quer, rand], [quer, 24 - rand])), ring ? gap(circle(k, r), 0, true) : dot(circle(k, r)), ...(ring ? [area(circle(k, r))] : []));
      }
    }
    return centre(teile, pen);
  },
});
