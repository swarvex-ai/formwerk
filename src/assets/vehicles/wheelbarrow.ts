import { BoxGeometry, CylinderGeometry, TorusGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const wheelbarrow = defineAsset({
  id: "wheelbarrow", category: "vehicles",
  title: { de: "Schubkarre", en: "Wheelbarrow" },
  description: { de: "Eine Schubkarre mit Bottich aus Blech oder Holz, zwei Griffen, Stützbeinen und einem oder zwei Rädern.", en: "A wheelbarrow with a tray of sheet metal or wood, two handles, support legs and one or two wheels." },
  params: {
    trayLength: { type: "number", label: { de: "Bottichlänge", en: "Tray length" }, min: 0.6, max: 1, step: 0.05, default: 0.85, unit: "m",
      describe: { de: "Länge des Bottichs: 0,6 m klein, 0,85 m üblich, 1 m eine Bauernschubkarre.", en: "Length of the tray: 0.6 m small, 0.85 m usual, 1 m a farm barrow." } },
    trayWidth: { type: "number", label: { de: "Bottichbreite", en: "Tray width" }, min: 0.45, max: 0.75, step: 0.05, default: 0.6, unit: "m",
      describe: { de: "Breite des Bottichs: 0,45 m schmal, 0,6 m üblich, 0,75 m breit.", en: "Width of the tray: 0.45 m narrow, 0.6 m usual, 0.75 m wide." } },
    trayDepth: { type: "number", label: { de: "Bottichtiefe", en: "Tray depth" }, min: 0.18, max: 0.35, step: 0.01, default: 0.28, unit: "m",
      describe: { de: "Tiefe des Bottichs: 0,2 m flach, 0,28 m üblich, 0,35 m für Schüttgut.", en: "Depth of the tray: 0.2 m shallow, 0.28 m usual, 0.35 m for loose material." } },
    handleLength: { type: "number", label: { de: "Grifflänge", en: "Handle length" }, min: 0.4, max: 0.8, step: 0.05, default: 0.6, unit: "m",
      describe: { de: "Länge der Griffe hinter dem Bottich: 0,4 m kurz, 0,6 m üblich, 0,8 m für große Leute.", en: "Length of the handles behind the tray: 0.4 m short, 0.6 m usual, 0.8 m for tall people." } },
    wheels: { type: "choice", label: { de: "Räder", en: "Wheels" }, options: ["one", "two"], labels: { one: { de: "Ein Rad", en: "One wheel" }, two: { de: "Zwei Räder", en: "Two wheels" } }, default: "one",
      describe: { de: "Ein luftgefülltes Rad vorn oder zwei Räder für mehr Standsicherheit.", en: "One pneumatic wheel at the front, or two for steadier footing." } },
    wheelRadius: { type: "number", label: { de: "Radradius", en: "Wheel radius" }, min: 0.12, max: 0.28, step: 0.01, default: 0.18, unit: "m",
      describe: { de: "Radius des Rads: 0,15 m klein, 0,18 m üblich, 0,28 m ein Geländerad.", en: "Wheel radius: 0.15 m small, 0.18 m usual, 0.28 m an all-terrain wheel." } },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["metal", "wood"], labels: { metal: { de: "Blech", en: "Sheet metal" }, wood: { de: "Holz", en: "Wood" } }, default: "metal",
      describe: { de: "Verzinktes Blech oder hölzerne Kastenkarre, jeweils mit passendem Gestell.", en: "Galvanised sheet metal or a wooden barrow, each with a matching frame." } },
    color: { type: "color", label: { de: "Bottich", en: "Tray" }, default: "#9aa1a8",
      describe: { de: "Farbe des Bottichs: verzinktes Grau, grünes oder rotes Blech, Holzton.", en: "Colour of the tray: galvanised grey, green or red sheet, a wood tone." } },
  },
  presets: {
    garden: { label: { de: "Gartenschubkarre", en: "Garden barrow" }, values: { color: "#4c7a4e", trayLength: 0.8, wheelRadius: 0.17 } },
    builders: { label: { de: "Baustellen-Schubkarre", en: "Builders barrow" }, values: { trayLength: 0.95, trayWidth: 0.65, trayDepth: 0.32, handleLength: 0.65, wheelRadius: 0.2 } },
    "wooden-farm": { label: { de: "Holzkarre", en: "Wooden farm barrow" }, values: { material: "wood", color: "#8a6a42", trayLength: 1, trayWidth: 0.7, trayDepth: 0.32, wheelRadius: 0.22, wheels: "two" } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 2000, drawCalls: 3 },
  build(p) {
    // Drawn with thick walls but really sheet and angle iron: effective densities give a barrow's mass
    const bottich = p.material === "wood" ? material("wood", p.color, 1, 420) : material("metal", p.color, 1, 200);
    const geruest = p.material === "wood" ? material("wood", "#6b543a", 1, 500) : material("metal", "#43474c", 1, 550);
    const gummi = material("plastic", "#26262b", 1, 900);
    const t = new Parts();
    const r = p.wheelRadius, TL = p.trayLength, TW = p.trayWidth, TD = p.trayDepth;
    // The two rails run from above the wheel up to the handle ends; the tray lies tilted forward on them
    const s = TW / 2 + 0.02, zf = TL / 2 + r + 0.01, zB = -TL / 2 - p.handleLength, zL = -TL / 2 + 0.1, zw = TL / 2 + r + 0.01;
    const vorn = r, oben = r + 0.42, hang = (oben - vorn) / (zf - zB), neigung = Math.atan(hang);
    const hoehe = (z: number) => vorn + (zf - z) * hang;
    const lang = Math.hypot(zf - zB, oben - vorn);
    for (const sx of [-1, 1]) t.add(geruest, new BoxGeometry(0.045, 0.04, lang).rotateX(neigung).translate(sx * s, (vorn + oben) / 2, (zf + zB) / 2));
    const schale = (w: number, h: number, d: number, x: number, y: number, z: number) =>
      t.add(bottich, new BoxGeometry(w, h, d).rotateX(neigung).translate(x, hoehe(0) + 0.026 + y, z));
    schale(TW, 0.03, TL, 0, 0.015, 0);
    for (const sx of [-1, 1]) schale(0.03, TD, TL, sx * (TW / 2 - 0.015), TD / 2, 0);
    for (const sz of [-1, 1]) schale(TW - 0.06, TD, 0.03, 0, TD / 2, sz * (TL / 2 - 0.015));
    // Legs under the back, cross members between the rails, the axle and the wheel or wheels
    for (const sx of [-1, 1]) t.box(geruest, 0.04, hoehe(zL) - 0.02, 0.04, sx * s, (hoehe(zL) - 0.02) / 2, zL);
    for (const z of [-TL / 4, TL / 4]) t.box(geruest, 2 * s, 0.03, 0.03, 0, hoehe(z), z);
    const raeder = p.wheels === "two" ? [s + 0.09, -(s + 0.09)] : [0];
    for (const x of raeder) {
      t.add(gummi, new TorusGeometry(r - 0.028, 0.028, 8, 20).rotateY(Math.PI / 2).translate(x, r, zw));
      t.add(geruest, new CylinderGeometry(r - 0.055, r - 0.055, 0.05, 12).rotateZ(Math.PI / 2).translate(x, r, zw));
    }
    t.add(geruest, new CylinderGeometry(0.02, 0.02, raeder.length === 2 ? 2 * (s + 0.135) : 2 * s + 0.06, 8).rotateZ(Math.PI / 2).translate(0, r, zw));
    return t.group();
  },
});
