import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const fence = defineAsset({
  id: "fence", category: "architecture",
  title: { de: "Zaun", en: "Fence" },
  description: { de: "Zaun mit Pfosten, Riegeln und Latten, Riegeln allein oder Paneelen, auf Wunsch mit Tor.", en: "A fence with posts, rails and pickets, rails only, or panels, optionally with a gate." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 1, max: 12, step: 0.1, default: 4, unit: "m",
      describe: { de: "Gesamtlänge des Zauns entlang x.", en: "Total length of the fence along x." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.4, max: 2.2, step: 0.05, default: 1, unit: "m",
      describe: { de: "Höhe von Pfosten und Latten: 1 m für Gärten, 1,8 m als Sichtschutz.", en: "Height of the posts and pickets: 1 m for gardens, 1.8 m for privacy." } },
    postSpacing: { type: "number", label: { de: "Pfostenabstand", en: "Post spacing" }, min: 0.8, max: 3, step: 0.1, default: 1.8, unit: "m",
      describe: { de: "Abstand zwischen den Pfosten; die Länge wird in gleich große Felder geteilt.", en: "Distance between posts; the length is split into equal bays." } },
    style: { type: "choice", label: { de: "Bauart", en: "Style" }, options: ["pickets", "rails", "panels"], labels: { pickets: { de: "Latten", en: "pickets" }, rails: { de: "Riegel", en: "rails" }, panels: { de: "Paneele", en: "panels" } }, default: "pickets",
      describe: { de: "Latten, nur Riegel (Weidezaun) oder geschlossene Paneele (Sichtschutz).", en: "Pickets, rails only (paddock), or closed panels (privacy)." } },
    pickets: { type: "number", label: { de: "Lattenabstand", en: "Picket spacing" }, min: 0.06, max: 0.3, step: 0.01, default: 0.12, unit: "m",
      describe: { de: "Abstand der Latten von Mitte zu Mitte, nur bei der Bauart „Latten“.", en: "Picket spacing centre to centre, only for the \"pickets\" style." } },
    rails: { type: "integer", label: { de: "Riegel", en: "Rails" }, min: 1, max: 5, default: 2,
      describe: { de: "Anzahl der waagerechten Riegel.", en: "Number of horizontal rails." } },
    gate: { type: "boolean", label: { de: "Tor", en: "Gate" }, default: false,
      describe: { de: "Das mittlere Feld wird ein Tor, das sich nach vorn öffnet (bewegliches Teil „gate“).", en: "The middle bay becomes a gate that opens to the front (movable part \"gate\")." } },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["wood", "metal", "paint"], labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" }, paint: { de: "lackiert", en: "Painted" } }, default: "wood",
      describe: { de: "Material von Pfosten, Riegeln und Latten.", en: "Material of the posts, rails and pickets." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#9b7653",
      describe: { de: "Grundfarbe des Materials.", en: "Base colour of the material." } },
  },
  presets: {
    paddock: { label: { de: "Weidezaun", en: "Paddock fence" }, values: { length: 8, postSpacing: 2.5, style: "rails", rails: 3, color: "#7a5c3e" } },
    "privacy-screen": { label: { de: "Sichtschutz", en: "Privacy screen" }, values: { height: 1.8, style: "panels", color: "#6b5a48" } },
    "garden-gate": { label: { de: "Gartentor", en: "Garden gate" }, values: { length: 3, gate: true, material: "paint", color: "#e9e6df" } },
  },
  rig: { gate: { label: { de: "Tor", en: "Gate" }, type: "rotate", axis: [0, -1, 0], min: 0, max: 100 } },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 12000, drawCalls: 2 },
  build(p) {
    const m = material(p.material, p.color);
    const t = new Parts();
    const L = p.length, h = p.height, felder = Math.max(1, Math.round(L / p.postSpacing)), feld = L / felder;
    // Das Tor ist das mittlere Feld; sein Scharnier sitzt am linken Pfosten
    const tor = p.gate ? Math.floor(felder / 2) : -1, x0 = -L / 2 + tor * feld, x1 = x0 + feld;
    const torTeile = p.gate ? t.moving("gate", x0 + 0.04, 0, 0) : null;
    const teil = (x: number) => (torTeile && x > x0 + 0.04 && x < x1 - 0.04 ? torTeile : t);
    for (let i = 0; i <= felder; i++) t.box(m, 0.08, h + 0.05, 0.08, -L / 2 + i * feld, (h + 0.05) / 2, 0);
    for (let r = 0; r < p.rails; r++) {
      const y = h * (0.2 + (0.6 * r) / Math.max(1, p.rails - 1));
      if (!torTeile) t.box(m, L, 0.06, 0.03, 0, y, 0.05);
      else for (let i = 0; i < felder; i++) {
        const a = -L / 2 + i * feld;
        if (i === tor) torTeile.box(m, feld - 0.1, 0.06, 0.03, a + feld / 2, y, 0.05);
        else t.box(m, feld, 0.06, 0.03, a + feld / 2, y, 0.05);
      }
    }
    if (p.style === "pickets") {
      const n = Math.floor(L / p.pickets);
      for (let i = 0; i < n; i++) {
        const x = -L / 2 + (i + 0.5) * (L / n);
        teil(x).box(m, Math.min(0.07, p.pickets * 0.7), h * 0.95, 0.02, x, (h * 0.95) / 2, 0.075);
      }
    } else if (p.style === "panels") {
      for (let i = 0; i < felder; i++) {
        const x = -L / 2 + (i + 0.5) * feld;
        teil(x).box(m, feld - 0.1, h * 0.85, 0.025, x, h * 0.47, 0.03);
      }
    }
    return t.group();
  },
});
