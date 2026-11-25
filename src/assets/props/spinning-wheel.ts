import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

export const spinningWheel = defineAsset({
  id: "spinning-wheel", category: "props",
  title: { de: "Spinnrad", en: "Spinning wheel" },
  description: { de: "Ein hölzernes Spinnrad: ein großes Speichenrad auf einer Achse zwischen zwei Stützen über einer schrägen Bank mit drei gespreizten Beinen, unten die Fußstange mit Tritt und Trittstange, am hohen Ende der Bank Spindel, Flügel und Spule; Rad, Nabe, Achse und Kurbel drehen sich als bewegliches Teil „wheel“.",
    en: "A wooden spinning wheel: a big spoked wheel on an axle between two uprights above a sloped bench on three splayed legs, below a foot treadle (Fußstange) with a footman rod up to the crank, at the high end of the bench a spindle with a U-shaped flyer and bobbin; wheel, hub, axle and crank turn as the movable part \"wheel\"." },
  params: {
    diameter: { type: "number", label: { de: "Durchmesser", en: "Diameter" }, min: 0.45, max: 0.9, step: 0.01, default: 0.6, unit: "m",
      describe: { de: "Durchmesser des Spinnrads: 0,5 m ein kleines Handrad, 0,6 m das übliche Sachsrad, 0,85 m ein großes Bockspinnrad.", en: "Diameter of the wheel: 0.5 m a small hand wheel, 0.6 m the usual Saxony wheel, 0.85 m a big castle wheel." } },
    spokes: { type: "choice", label: { de: "Speichen", en: "Spokes" }, options: ["8", "10", "12"], labels: { "8": { de: "8", en: "8" }, "10": { de: "10", en: "10" }, "12": { de: "12", en: "12" } }, default: "10",
      describe: { de: "Anzahl der gedrechselten Speichen: 8 beim kleinen Handrad, 10 üblich, 12 beim großen Rad.", en: "Number of turned spokes: 8 on a small hand wheel, 10 usual, 12 on a big wheel." } },
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 0.6, max: 1.1, step: 0.01, default: 0.85, unit: "m",
      describe: { de: "Länge der Bank vom Rad bis zum Flügel: 0,6 m beim Bockrad, 0,85 m üblich, 1,1 m eine große Sachs-Bank.", en: "Length of the bench from wheel to flyer: 0.6 m a castle wheel, 0.85 m usual, 1.1 m a big Saxony bench." } },
    slope: { type: "number", label: { de: "Gefälle", en: "Slope" }, min: 0, max: 12, step: 1, default: 6, unit: "°",
      describe: { de: "Gefälle der Bank zum Rad hin: 0° beim Bockrad, 6° üblich, 12° stark geneigt.", en: "How far the bench falls towards the wheel end: 0° a castle wheel, 6° usual, 12° strongly sloped." } },
    treadle: { type: "boolean", label: { de: "Fußstange", en: "Treadle" }, default: true,
      describe: { de: "Fußstange mit Trittbrett zwischen den vorderen Beinen und Trittstange zur Kurbel; aus ergibt ein Handrad, dessen Achse in einem kleinen Kurbelgriff endet.", en: "A treadle board hinged between the front legs with a footman rod up to the crank; off gives a hand-turned wheel whose axle ends in a small crank handle." } },
    color: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#7d5a38",
      describe: { de: "Farbe des Holzes: Eiche #7d5a38, Nussbaum #5d4126, heller Ahorn #b08c5a.", en: "Colour of the wood: oak #7d5a38, walnut #5d4126, light maple #b08c5a." } },
  },
  presets: {
    saxony: { label: { de: "Sachsrad", en: "Saxony wheel" }, values: { diameter: 0.6 } },
    castle: { label: { de: "Bockspinnrad", en: "Castle wheel" }, values: { diameter: 0.85, length: 0.7, slope: 0 } },
    "hand-wheel": { label: { de: "Handrad", en: "Hand wheel" }, values: { treadle: false, diameter: 0.5, spokes: "8" } },
  },
  rig: { wheel: { label: { de: "Rad", en: "Wheel" }, type: "rotate", axis: [1, 0, 0], min: 0, max: 360 } },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 12000, drawCalls: 3 },
  build(p) {
    const holz = material("wood", p.color, 1, 500, { grain: "part" }), t = new Parts();
    const R = p.diameter / 2, L = p.length, n = Number(p.spokes);
    const neig = Math.tan((p.slope * Math.PI) / 180), s = (p.slope * Math.PI) / 180;
    // Bench top face y at z; the wheel sits with its centre 5 cm of rim clearance above the bench, on the axle
    const yEnd = 0.37, zA = -(L + 0.51) / 3, bt = (z: number) => yEnd + neig * (z - zA);
    const zW = zA + 0.02, zH = zW + 0.26, zLF = zA + L - 0.1, zSp = zA + L - 0.13;
    const achse = bt(zW) + 0.05 + R, xU = 0.125, xK = 0.21, schwung = 0.14;
    // Bench: a 30 cm plank along z, falling towards the wheel end
    t.add(holz, grained(rounded(0.3, 0.032, L, 0.005).rotateX(-s).translate(0, bt(zA + L / 2) - 0.016 * Math.cos(s), zA + L / 2), "z"));
    // Three turned legs with a fixed 8° splay (not the bench slope), so at slope 0 they still stand outside the treadle board
    const streck = (8 * Math.PI) / 180;
    const fuss = (H: number) => turned([[0.014, 0], [0.011, -0.06], [0.013, -0.16], [0.016, -(H - 0.07)], [0.026, -(H - 0.02)], [0.026, -(H - 0.006)], [0.001, -H]], 10);
    const hL = bt(zLF) - 0.028, hW = bt(zH) - 0.028;
    t.add(holz, grained(fuss(hL / Math.cos(streck)).rotateX(-streck).translate(0, hL, zLF), "y"));
    for (const seite of [-1, 1]) t.add(holz, grained(fuss(hW / Math.cos(streck)).rotateZ(seite * streck).translate(seite * 0.095, hW, zH), "y"));
    // Two turned uprights at ±x of the wheel, holding the axle near their domed tops
    const hU = achse + 0.034 - (bt(zW) - 0.006);
    for (const seite of [-1, 1]) t.add(holz, grained(turned([[0.026, 0], [0.026, 0.014], [0.018, 0.05], [0.016, hU - 0.05], [0.021, hU - 0.03], [0.021, hU - 0.006], [0.001, hU]], 16, seite * xU, bt(zW) - 0.006, zW), "y"));
    // Flyer end on x = 0: a short pair of maidens holds the spindle lying along the bench, the bobbin hangs in the U of the flyer
    const yS = bt(zSp) + 0.075, hM = 0.105;
    for (const seite of [-1, 1]) for (const zM of [zSp - 0.05, zSp - 0.13]) t.add(holz, grained(turned([[0.017, 0], [0.017, 0.012], [0.012, 0.03], [0.012, hM - 0.03], [0.016, hM - 0.015], [0.016, hM - 0.004], [0.001, hM]], 12, seite * 0.055, bt(zSp) - 0.006, zM), "y"));
    t.add(holz, grained(rounded(0.007, 0.007, 0.25, 0.002, 0, yS, zSp - 0.025), "z"));
    t.add(holz, grained(turned([[0.006, 0], [0.026, 0.006], [0.023, 0.02], [0.023, 0.07], [0.026, 0.084], [0.006, 0.09]], 12).rotateX(Math.PI / 2).translate(0, yS, zSp - 0.015), "z"));
    for (const seite of [-1, 1]) t.add(holz, grained(rounded(0.008, 0.008, 0.11, 0.002, seite * 0.06, yS, zSp + 0.035), "z"));
    t.add(holz, grained(rounded(0.128, 0.012, 0.013, 0.003, 0, yS, zSp + 0.082), "x"));
    // Treadle: hinge rail between the front legs, board under the wheel, footman from the board's +x edge to the crank pin at xK
    if (p.treadle) {
      t.add(holz, grained(rounded(0.26, 0.03, 0.03, 0.004, 0, 0.062, zH + 0.004), "x"));
      t.add(holz, grained(rounded(0.22, 0.016, 0.34, 0.004, 0, 0.042, zH - 0.155), "z"));
      const x0 = 0.115, x1 = 0.232, y0 = 0.052, y1 = achse - schwung, la = Math.hypot(x1 - x0, y1 - y0);
      t.add(holz, grained(rounded(0.014, la, 0.014, 0.003).rotateZ(-Math.asin((x1 - x0) / la)).translate((x0 + x1) / 2, (y0 + y1) / 2, zW + 0.01), "y"));
    }
    // Wheel, hub, spokes, axle and crank turn together about the axle at (0, achse, zW), built where they sit
    const rad = t.moving("wheel", 0, achse, zW);
    rad.add(holz, turned([[R - 0.032, -0.011], [R - 0.004, -0.011], [R, -0.007], [R, 0.007], [R - 0.004, 0.011], [R - 0.032, 0.011], [R - 0.032, -0.011]], 48).rotateZ(Math.PI / 2).translate(0, achse, zW));
    rad.add(holz, turned([[0.012, -0.04], [0.034, -0.04], [0.038, -0.024], [0.038, 0.024], [0.034, 0.04], [0.012, 0.04]], 16).rotateZ(Math.PI / 2).translate(0, achse, zW));
    const lang = R - 0.032 - 0.034;
    for (let k = 0; k < n; k++) rad.add(holz, turned([[0.001, 0], [0.011, 0], [0.0095, lang * 0.4], [0.0075, lang], [0.001, lang]], 6, 0, 0.034).rotateX((k * Math.PI * 2) / n).translate(0, achse, zW));
    rad.add(holz, turned([[0.001, 0], [0.013, 0], [0.013, xK + 0.17], [0.001, xK + 0.17]], 12).rotateZ(Math.PI / 2).translate(xK, achse, zW));
    if (p.treadle) {
      // Crank arm and pin on the axle end at xK, outside the upright; the pin sits at the bottom of its turn
      rad.add(holz, rounded(0.028, schwung + 0.025, 0.024, 0.004, xK, achse - schwung / 2 + 0.0125, zW));
      rad.add(holz, turned([[0.001, 0], [0.01, 0], [0.01, 0.045], [0.001, 0.045]], 12).rotateZ(Math.PI / 2).translate(xK + 0.04, achse - schwung, zW));
    } else {
      // Hand crank on the same axle end, the handle pointing outward along +x
      rad.add(holz, rounded(0.028, 0.16, 0.024, 0.004, xK, achse + 0.06, zW));
      rad.add(holz, turned([[0.001, 0], [0.011, 0], [0.011, 0.085], [0.001, 0.085]], 12).rotateZ(-Math.PI / 2).translate(xK, achse + 0.14, zW));
    }
    return t.group();
  },
});
