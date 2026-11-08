import { CylinderGeometry, ExtrudeGeometry, Shape } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const tank = defineAsset({
  id: "tank", category: "vehicles",
  title: { de: "Panzer", en: "Tank" },
  description: { de: "Ein vereinfachter Kampfpanzer mit Ketten, Laufrollen und drehbarem Turm (bewegliches Teil „turret“), Rohr und Wanne frei einstellbar.", en: "A simplified battle tank with tracks, road wheels and a turning turret (movable part \"turret\"); gun and hull as you like." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 4, max: 9, step: 0.05, default: 6.8, unit: "m",
      describe: { de: "Länge der Wanne ohne Rohr: 5 m ein leichter Panzer, 7 m ein Kampfpanzer.", en: "Length of the hull without the gun: 5 m a light tank, 7 m a battle tank." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 2.4, max: 3.8, step: 0.05, default: 3.4, unit: "m",
      describe: { de: "Breite über die Ketten: 2,6 m leicht, 3,4 m üblich, 3,7 m schwer.", en: "Width across the tracks: 2.6 m light, 3.4 m usual, 3.7 m heavy." } },
    turret: { type: "number", label: { de: "Turm", en: "Turret" }, min: 0.4, max: 0.8, step: 0.01, default: 0.6,
      describe: { de: "Größe des Turms im Verhältnis zur Breite: 0,45 klein, 0,6 üblich, 0,75 groß.", en: "Size of the turret relative to the width: 0.45 small, 0.6 usual, 0.75 big." } },
    gun: { type: "number", label: { de: "Rohr", en: "Gun" }, min: 1.5, max: 6, step: 0.05, default: 4.5, unit: "m",
      describe: { de: "Länge des Rohrs vor dem Turm: 2,5 m kurz, 4,5 m üblich, 5,5 m lang.", en: "Length of the gun in front of the turret: 2.5 m short, 4.5 m usual, 5.5 m long." } },
    wheels: { type: "integer", label: { de: "Laufrollen", en: "Road wheels" }, min: 4, max: 8, default: 6,
      describe: { de: "Laufrollen je Seite: 5 leicht, 6 bis 7 üblich.", en: "Road wheels per side: 5 light, 6 to 7 usual." } },
    color: { type: "color", label: { de: "Tarnfarbe", en: "Paint" }, default: "#5b6b3a",
      describe: { de: "Farbe: Oliv #5b6b3a, Sand #b59a6a, Grau #6d7378.", en: "Colour: olive #5b6b3a, sand #b59a6a, grey #6d7378." } },
  },
  presets: {
    "battle-tank": { label: { de: "Kampfpanzer", en: "Battle tank" }, values: { length: 7, width: 3.5, turret: 0.62, gun: 5 } },
    "light-tank": { label: { de: "Leichter Panzer", en: "Light tank" }, values: { length: 5, width: 2.6, turret: 0.5, gun: 2.6, wheels: 5, color: "#7a6a45" } },
    desert: { label: { de: "Wüste", en: "Desert" }, values: { color: "#b59a6a", gun: 4.8 } },
  },
  rig: { turret: { label: { de: "Turm", en: "Turret" }, type: "rotate", axis: [0, 1, 0], min: -180, max: 180 } },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 8000, drawCalls: 4 },
  build(p) {
    // Drawn solid, a tank weighs about what a real one does at this effective density
    const lack = material("paint", p.color, 1, 900), kette = material("metal", "#3a3b37", 1, 2500), t = new Parts();
    const L = p.length, W = p.width, kb = Math.min(0.65, W * 0.2), kh = 0.95, wanne = W - 2 * kb;
    const seite = (form: Shape, breite: number) => new ExtrudeGeometry(form, { depth: breite, bevelEnabled: false }).translate(0, 0, -breite / 2).rotateY(-Math.PI / 2);
    // The hull between the tracks: a side profile with a sloped front plate
    const w = new Shape();
    w.moveTo(-L / 2, 0.45); w.lineTo(-L / 2, 1.6); w.lineTo(L / 2 - 1.2, 1.6); w.lineTo(L / 2, 1.05); w.lineTo(L / 2 - 0.45, 0.45); w.closePath();
    t.add(lack, seite(w, wanne));
    // Tracks: a long loop with round ends on each side, road wheels on the outside, fenders above
    const k = new Shape(), r = kh / 2;
    k.moveTo(-L / 2 + r, 0); k.lineTo(L / 2 - r, 0); k.absarc(L / 2 - r, r, r, -Math.PI / 2, Math.PI / 2, false); k.lineTo(-L / 2 + r, kh); k.absarc(-L / 2 + r, r, r, Math.PI / 2, (3 * Math.PI) / 2, false);
    for (const sx of [-1, 1]) {
      const x = sx * (W / 2 - kb / 2);
      t.add(kette, seite(k, kb - 0.04).translate(x, 0, 0));
      const n = p.wheels, rr = kh * 0.32;
      for (let i = 0; i < n; i++) t.add(kette, new CylinderGeometry(rr, rr, 0.08, 14).rotateZ(Math.PI / 2).translate(sx * (W / 2 - 0.02), rr + 0.05, -L / 2 + r + ((L - 2 * r) * i) / (n - 1)));
      t.box(lack, kb + 0.04, 0.05, L * 0.98, x, kh + 0.06, 0);
    }
    // The turret turns about the centre of the hull's roof; the gun points forward
    const turm = t.moving("turret", 0, 1.6, -L * 0.05), tr = (W * p.turret) / 2;
    turm.add(lack, new CylinderGeometry(tr * 0.85, tr, 0.75, 8).rotateY(Math.PI / 8).scale(1, 1, 1.35).translate(0, 1.6 + 0.375, -L * 0.05));
    turm.add(lack, new CylinderGeometry(0.32, 0.32, 0.18, 10).translate(-tr * 0.35, 2.35 + 0.09, -L * 0.05 - tr * 0.3));
    turm.box(lack, 0.6, 0.45, 0.35, 0, 1.6 + 0.4, -L * 0.05 + tr * 1.3);
    turm.add(kette, new CylinderGeometry(0.08, 0.1, p.gun, 10).rotateX(Math.PI / 2).translate(0, 1.6 + 0.42, -L * 0.05 + tr * 1.3 + p.gun / 2));
    return t.group();
  },
});
