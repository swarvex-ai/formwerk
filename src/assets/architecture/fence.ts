import { BoxGeometry, ConeGeometry, CylinderGeometry, ExtrudeGeometry, Shape } from "three";
import { material, grained } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

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
  budget: { triangles: 40000, drawCalls: 3 },
  build(p) {
    // Wood: one material with grain "part" serves posts, pickets and rails; each part keeps its own fibre axis.
    // Rails lie along x ("grained"), posts and pickets stand (auto/upright). On metal and paint the option changes
    // nothing, so they share one material and one draw call
    const holz = p.material === "wood";
    const m = holz ? material(p.material, p.color, 1, undefined, { grain: "part" }) : material(p.material, p.color), mr = m;
    const eisen = material("metal", "#3a3d42");
    const t = new Parts();
    const L = p.length, h = p.height, felder = Math.max(1, Math.round(L / p.postSpacing)), feld = L / felder, kopf = h + 0.05;
    // Das Tor ist das mittlere Feld; sein Scharnier sitzt am linken Pfosten. Torteile bleiben 5 cm von den Pfosten weg,
    // so schwenkt es frei an ihnen vorbei
    const tor = p.gate ? Math.floor(felder / 2) : -1, x0 = -L / 2 + tor * feld, x1 = x0 + feld, hx = x0 + 0.04, gl = x0 + 0.09, gr = x1 - 0.09;
    const g = p.gate ? t.moving("gate", hx, 0, 0) : null;
    // Architecture allows 4 draw calls: in wood the gate with pickets or boards keeps one wood (see summary)
    const riegel = Array.from({ length: p.rails }, (_, r) => h * (0.2 + (0.6 * r) / Math.max(1, p.rails - 1)));
    for (let i = 0; i <= felder; i++) {
      const x = -L / 2 + i * feld;
      t.add(m, rounded(0.08, kopf, 0.08, 0.004, x, kopf / 2, 0));
      // Kappe: Pyramide aus vier Schrägen, bei Metall eine gedrechselte Kugel auf kurzem Hals
      if (p.material === "metal") {
        const kugel: [number, number][] = [];
        for (let a = -60; a <= 90; a += 10) kugel.push([0.03 * Math.cos((a * Math.PI) / 180), 0.048 + 0.03 * Math.sin((a * Math.PI) / 180)]);
        t.add(m, turned([[0.001, -0.002], [0.025, -0.002], [0.025, 0.006], [0.014, 0.012], [0.014, 0.02], ...kugel], 16, x, kopf, 0));
      } else t.add(m, new ConeGeometry(0.036 * Math.SQRT2, 0.031, 4, 1, true).rotateY(Math.PI / 4).toNonIndexed().translate(x, kopf - 0.001 + 0.0155, 0));
    }
    for (const y of riegel) for (let i = 0; i < felder; i++) {
      // Ein Riegel je Feld, 1 cm in jeden Pfosten
      const a = -L / 2 + i * feld;
      if (i === tor) g!.add(mr, grained(rounded(gr - gl, 0.06, 0.03, 0.003, (gl + gr) / 2, y, 0.05, 1), "x"));
      else t.add(mr, grained(rounded(feld - 0.06, 0.06, 0.03, 0.003, a + feld / 2, y, 0.05, 1), "x"));
    }
    if (p.style === "pickets") {
      const n = Math.floor(L / p.pickets), b = Math.min(0.07, p.pickets * 0.7), H = h * 0.95 - 0.02;
      for (let i = 0; i < n; i++) {
        const x = -L / 2 + (i + 0.5) * (L / n);
        // Spitze: die obersten 5 % ein Giebel; Rückseite 1 mm vor den Riegeln
        const s = new Shape().moveTo(-b / 2, 0).lineTo(b / 2, 0).lineTo(b / 2, H * 0.95).lineTo(0, H).lineTo(-b / 2, H * 0.95);
        const latte = () => new ExtrudeGeometry(s, { depth: 0.014, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelOffset: -0.003, bevelSegments: 2, curveSegments: 1 }).translate(x, 0.02, 0.069);
        // Im Torfeld nur Latten ganz auf dem Tor; neben den Torpfosten keine, die das offene Tor streifen
        if (!g) t.add(m, latte());
        else if (x - b / 2 >= hx + 0.07 && x + b / 2 <= gr) g.add(m, latte());
        else if (x + b / 2 <= x0 - 0.06 || x - b / 2 >= x1 + 0.02) t.add(m, latte());
      }
    } else if (p.style === "panels") {
      for (let i = 0; i < felder; i++) {
        const a = -L / 2 + i * feld, auf = i === tor ? g! : t, mf = mr;
        const xa = i === tor ? gl : a + 0.05, xb = i === tor ? gr : a + feld - 0.05, ya = h * 0.045, yb = h * 0.895, W = xb - xa;
        // Rahmen: zwei Höhen, zwei Querstücke (0,5 cm in den Höhen), Bretter 12 cm breit, 4 mm Fuge, 1 cm im Rahmen
        for (const x of [xa + 0.03, xb - 0.03]) auf.add(mf, rounded(0.06, yb - ya, 0.025, 0.003, x, (ya + yb) / 2, 0.03, 1));
        for (const y of [ya + 0.03, yb - 0.03]) auf.add(mf, grained(rounded(W - 0.11, 0.058, 0.023, 0.003, (xa + xb) / 2, y, 0.03, 1), "x"));
        const Wi = W - 0.1, k = Math.max(1, Math.round((Wi + 0.004) / 0.124)), bw = (Wi - (k - 1) * 0.004) / k;
        for (let j = 0; j < k; j++) auf.add(m, rounded(bw, yb - ya - 0.1, 0.015, 0.003, xa + 0.05 + bw / 2 + j * (bw + 0.004), (ya + yb) / 2, 0.03, 1));
      }
    }
    if (g) {
      // Strebe vom untersten Riegel am Scharnier zum obersten am Riegel-Ende, in der Ebene der Riegel
      const ya = riegel[0], yb = riegel[riegel.length - 1], xa = gl + 0.04, xb = gr - 0.04;
      if (p.rails > 1) g.add(mr, grained(rounded(Math.hypot(xb - xa, yb - ya), 0.06, 0.028, 0.003), "x").rotateZ(Math.atan2(yb - ya, xb - xa)).translate((xa + xb) / 2, (ya + yb) / 2, 0.05));
      // Langbänder hinten auf dem untersten und obersten Riegel, gekröpft zum Kloben am Pfosten
      for (const y of p.rails > 1 ? [ya, yb] : [ya]) {
        g.add(eisen, new BoxGeometry(0.25, 0.03, 0.0045).translate(hx + 0.17, y, 0.03325));
        g.add(eisen, new BoxGeometry(0.003, 0.03, 0.037).translate(hx + 0.048, y, 0.0145));
        g.add(eisen, new BoxGeometry(0.048, 0.03, 0.004).translate(hx + 0.024, y, -0.0025));
        g.add(eisen, new CylinderGeometry(0.006, 0.006, 0.06, 8).translate(hx, y, 0));
      }
      // Riegel: flaches Eisen im obersten Riegel, das vor den anderen Pfosten greift, mit Knopf
      g.add(eisen, new BoxGeometry(x1 + 0.01 - (gr - 0.12), 0.025, 0.004).translate((x1 + 0.01 + gr - 0.12) / 2, yb, 0.0425));
      g.add(eisen, new CylinderGeometry(0.006, 0.006, 0.026, 8).rotateX(Math.PI / 2).translate(x1 - 0.065, yb, 0.0575));
    }
    return t.group();
  },
});
