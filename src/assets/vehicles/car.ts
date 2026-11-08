import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Shape } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

type P = [number, number];
/** Side profiles from the rear (x 0) to the front (x 1), heights as fractions from the sill (0) to the roof (1).
 *  `scheibe` and `heck`: the two profile points of the windscreen and of the rear window (indices). */
const FORM: Record<string, { profil: P[]; kabine: [P, P, P, P]; scheibe: [number, number]; heck: [number, number] | null }> = {
  sedan: { profil: [[0, 0], [0, 0.5], [0.2, 0.53], [0.3, 1], [0.62, 1], [0.76, 0.52], [0.96, 0.46], [1, 0.36], [1, 0]], kabine: [[0.22, 0.53], [0.31, 0.97], [0.61, 0.97], [0.73, 0.53]], scheibe: [5, 4], heck: [2, 3] },
  hatchback: { profil: [[0, 0], [0, 0.62], [0.06, 0.96], [0.56, 1], [0.72, 0.52], [0.95, 0.46], [1, 0.36], [1, 0]], kabine: [[0.06, 0.55], [0.09, 0.94], [0.55, 0.97], [0.69, 0.53]], scheibe: [4, 3], heck: [1, 2] },
  van: { profil: [[0, 0], [0, 1], [0.8, 1], [0.94, 0.58], [1, 0.45], [1, 0]], kabine: [[0.05, 0.56], [0.05, 0.93], [0.78, 0.93], [0.9, 0.58]], scheibe: [3, 2], heck: null },
  pickup: { profil: [[0, 0], [0, 0.5], [0.42, 0.5], [0.44, 1], [0.66, 1], [0.78, 0.52], [0.97, 0.46], [1, 0.36], [1, 0]], kabine: [[0.46, 0.53], [0.47, 0.96], [0.65, 0.96], [0.75, 0.53]], scheibe: [5, 4], heck: null },
};

export const car = defineAsset({
  id: "car", category: "vehicles",
  title: { de: "Auto", en: "Car" },
  description: { de: "Ein vereinfachtes Auto: Limousine, Kleinwagen, Transporter oder Pick-up, mit Scheiben, Scheinwerfern und Rädern.", en: "A simplified car: a sedan, a hatchback, a van or a pickup, with windows, headlights and wheels." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 3, max: 5.6, step: 0.05, default: 4.4, unit: "m",
      describe: { de: "Länge: 3,6 m ein Kleinwagen, 4,5 m eine Limousine, 5,3 m ein Pick-up.", en: "Length: 3.6 m a small car, 4.5 m a sedan, 5.3 m a pickup." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 1.55, max: 2.1, step: 0.01, default: 1.8, unit: "m",
      describe: { de: "Breite ohne Spiegel: 1,65 m klein, 1,8 m üblich, 2 m ein Transporter.", en: "Width without mirrors: 1.65 m small, 1.8 m usual, 2 m a van." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1.3, max: 2.3, step: 0.01, default: 1.45, unit: "m",
      describe: { de: "Höhe bis zum Dach: 1,45 m eine Limousine, 1,8 m ein Pick-up, 2,2 m ein Transporter.", en: "Height to the roof: 1.45 m a sedan, 1.8 m a pickup, 2.2 m a van." } },
    style: { type: "choice", label: { de: "Bauform", en: "Body" }, options: ["sedan", "hatchback", "van", "pickup"], labels: { sedan: { de: "Limousine", en: "Sedan" }, hatchback: { de: "Kleinwagen", en: "Hatchback" }, van: { de: "Transporter", en: "Van" }, pickup: { de: "Pick-up", en: "Pickup" } }, default: "sedan",
      describe: { de: "Limousine mit Stufenheck, Kleinwagen mit Schrägheck, kastenförmiger Transporter oder Pick-up mit Ladefläche.", en: "A sedan with a boot, a hatchback, a boxy van or a pickup with a load bed." } },
    wheelRadius: { type: "number", label: { de: "Radradius", en: "Wheel radius" }, min: 0.28, max: 0.45, step: 0.01, default: 0.33, unit: "m",
      describe: { de: "Radius der Räder: 0,3 m klein, 0,33 m üblich, 0,42 m ein Geländewagen.", en: "Radius of the wheels: 0.3 m small, 0.33 m usual, 0.42 m an off-roader." } },
    color: { type: "color", label: { de: "Lack", en: "Paint" }, default: "#2d6cdf",
      describe: { de: "Farbe des Lacks.", en: "Colour of the paint." } },
  },
  presets: {
    "city-car": { label: { de: "Kleinwagen", en: "City car" }, values: { style: "hatchback", length: 3.7, width: 1.68, height: 1.5, wheelRadius: 0.3, color: "#d94a3a" } },
    sedan: { label: { de: "Limousine", en: "Sedan" }, values: { style: "sedan", length: 4.6, color: "#2d6cdf" } },
    van: { label: { de: "Transporter", en: "Van" }, values: { style: "van", length: 5, width: 1.98, height: 2.15, wheelRadius: 0.34, color: "#f0efe9" } },
    pickup: { label: { de: "Pick-up", en: "Pickup" }, values: { style: "pickup", length: 5.3, width: 1.95, height: 1.82, wheelRadius: 0.41, color: "#3f5d3a" } },
  },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 4000, drawCalls: 5 },
  build(p) {
    // Drawn solid, a car is mostly air inside: an effective density gives it a car's mass
    const lack = material("paint", p.color, 1, 230), glas = material("plastic", "#1d2630", 1, 300), metall = material("metal", "#8c9298"), licht = material("glow", "#fff4d6"), rueck = material("paint", "#b3201c");
    const f = FORM[p.style], L = p.length, W = p.width, schwelle = 0.2, oben = p.height, t = new Parts();
    const at = ([u, v]: P): P => [-L / 2 + u * L, schwelle + v * (oben - schwelle)];
    // The body: the side profile extruded across the width, the edges rounded off a little
    const s = new Shape(), pts = f.profil.map(at), rund = 0.05;
    s.moveTo(...pts[0]);
    for (const q of pts.slice(1)) s.lineTo(...q);
    s.closePath();
    const seite = (form: Shape, breite: number, bevel: number) => new ExtrudeGeometry(form, { depth: breite - 2 * bevel, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2 }).translate(0, 0, -(breite - 2 * bevel) / 2).rotateY(-Math.PI / 2);
    // (rotated so the profile's front, x = +L/2, faces +z)
    t.add(lack, seite(s, W, rund));
    // Side windows: the cabin shape a little proud of the body; windscreen and rear window as panes on the slopes
    const kab = f.kabine.map(at), fenster = new Shape();
    fenster.moveTo(...kab[0]);
    for (const q of kab.slice(1)) fenster.lineTo(...q);
    fenster.closePath();
    t.add(glas, seite(fenster, W + 0.012, 0));
    const lege = (i: number, j: number) => {
      const a = pts[i], b = pts[j], lang = Math.hypot(b[0] - a[0], b[1] - a[1]);
      // Direction of the slope in the side view (x = along the car, y = up), and its outward normal
      const dx = (b[0] - a[0]) / lang, dy = (b[1] - a[1]) / lang, nx = dy, ny = -dx;
      // Outward is up; the rounded edges of the body stand out by `rund`, the pane just beyond them
      const aus = ny < 0 ? -1 : 1, mx = (a[0] + b[0]) / 2 + nx * aus * (rund + 0.012), my = (a[1] + b[1]) / 2 + ny * aus * (rund + 0.012);
      // A thin pane: its length along the slope; in the car's frame profile x is z
      const g = new BoxGeometry(W * 0.84, lang * 0.84, 0.012);
      g.rotateX(Math.atan2(dx, dy));
      g.translate(0, my, mx);
      t.add(glas, g);
    };
    lege(...f.scheibe);
    if (f.heck) lege(...f.heck);
    // Wheels: tyres with a hub, a quarter of the length in from either end
    const r = p.wheelRadius, achse = Math.min(L * 0.32, L / 2 - r - 0.25), spur = W / 2 - 0.1;
    for (const z of [-achse, achse]) for (const sx of [-1, 1]) {
      t.add(glas, new CylinderGeometry(r, r, 0.22, 18).rotateZ(Math.PI / 2).translate(sx * spur, r, z));
      t.add(metall, new CylinderGeometry(r * 0.55, r * 0.55, 0.232, 12).rotateZ(Math.PI / 2).translate(sx * spur, r, z));
    }
    // Lights and bumpers
    const vorn = L / 2 + rund, guertel = at([1, f.profil[f.profil.length - 2][1]])[1];
    for (const sx of [-1, 1]) {
      t.box(licht, 0.26, 0.09, 0.03, sx * (W / 2 - 0.26), guertel - 0.1, vorn + 0.005);
      t.box(rueck, 0.22, 0.09, 0.03, sx * (W / 2 - 0.22), at([0, f.profil[1][1]])[1] - 0.12, -vorn - 0.005);
    }
    t.box(metall, W * 0.96, 0.1, 0.08, 0, schwelle + 0.1, vorn + 0.02).box(metall, W * 0.96, 0.1, 0.08, 0, schwelle + 0.1, -vorn - 0.02);
    return t.group();
  },
});
