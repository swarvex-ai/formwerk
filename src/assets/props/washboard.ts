import { Vector3 } from "three";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded } from "../shapes";

export const washboard = defineAsset({
  id: "washboard", category: "props",
  title: { de: "Waschbrett", en: "Washboard" },
  description: {
    de: "Ein altes Waschbrett für Waschküchen, Bauernküchen, Waschtage am Fluss, Lager und Zeitkulissen: Holzrahmen mit Füßen und Kopfbrett um ein geriffeltes Zink- oder Holzbrett.",
    en: "An old laundry washboard for laundries, farmhouse kitchens, wash days at the river, camps and period scenes: a wooden frame with feet and a header around a rippled zinc or wooden board.",
  },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.45, max: 0.7, step: 0.01, default: 0.6, unit: "m",
      describe: { de: "Gesamthöhe von den Füßen bis zur Oberkante des Kopfbretts: 0,46 m ein kleines Reisebrett, 0,6 m ein Waschbrett, 0,68 m ein großes.", en: "Total height from the feet to the top of the header: 0.46 m a small travel board, 0.6 m a washboard, 0.68 m a large one." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.25, max: 0.4, step: 0.01, default: 0.31, unit: "m",
      describe: { de: "Gesamtbreite über beide Holme: 0,26 m ein kleines Brett, 0,31 m ein übliches, 0,38 m ein breites.", en: "Total width over both stiles: 0.26 m a small board, 0.31 m a usual one, 0.38 m a wide one." } },
    ribs: { type: "integer", label: { de: "Riffeln", en: "Ribs" }, min: 10, max: 30, step: 1, default: 18,
      describe: { de: "Wie viele Riffeln quer über das Brett laufen, von oben nach unten: 12 grob, 18 üblich, 28 fein.", en: "How many ripples run across the board, top to bottom: 12 coarse, 18 usual, 28 fine." } },
    ripple: { type: "number", label: { de: "Riffeltiefe", en: "Ripple depth" }, min: 0.002, max: 0.008, step: 0.0005, default: 0.005, unit: "m",
      describe: { de: "Tiefe jeder Riffel von Kamm zu Tal: 0,003 m flach, 0,005 m üblich, 0,008 m tief (Holz).", en: "Depth of each ripple from crest to trough: 0.003 m shallow, 0.005 m usual, 0.008 m deep (wood)." } },
    board: { type: "choice", label: { de: "Brett", en: "Board" }, options: ["zinc", "wood"],
      labels: { zinc: { de: "Zink", en: "Zinc" }, wood: { de: "Holz", en: "Wood" } }, default: "zinc",
      describe: { de: "Zink: ein dünnes gewelltes Blech; Holz: ein massives geriffeltes Brett aus dem Holz des Rahmens.", en: "Zinc: a thin corrugated metal sheet; wood: a solid ribbed board of the frame's wood." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#9a7650",
      describe: { de: "Farbe des Holzes: helle Buche #b89a70, Kiefer #9a7650, dunkle Eiche #5c4026.", en: "Colour of the wood: pale beech #b89a70, pine #9a7650, dark oak #5c4026." } },
  },
  presets: {
    zinc: { label: { de: "Zink", en: "Zinc" }, values: { board: "zinc" } },
    wooden: { label: { de: "Holz", en: "Wooden" }, values: { board: "wood", ribs: 14, ripple: 0.007 } },
    small: { label: { de: "Klein", en: "Small" }, values: { height: 0.46, width: 0.26, ribs: 12 } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 4000, drawCalls: 2 },
  build(p) {
    const h = p.height, w = p.width;
    const stileW = 0.035, stileD = 0.03, foot = 0.08, headH = 0.12, railH = 0.03;
    const holz = material("wood", p.colour, 1, 600, { grain: "part" });
    const t = new Parts();

    // Stiles from the floor to the top; the bottom 0.08 m below the rail is the foot
    for (const s of [-1, 1]) t.add(holz, grained(rounded(stileW, h, stileD, 0.004, s * (w / 2 - stileW / 2), h / 2, 0), "y"));
    // Header over the full width, bottom rail just above the feet
    t.add(holz, grained(rounded(w, headH, 0.02, 0.004, 0, h - headH / 2, 0), "x"));
    const inner = w - 2 * stileW;
    t.add(holz, grained(rounded(inner + 0.004, railH, 0.03, 0.004, 0, foot + railH / 2, 0), "x"));

    // The rippled board fills the opening, 1 mm into rail, header and stiles
    const y0 = foot + railH - 0.001, y1 = h - headH + 0.001, x = inner / 2 + 0.001;
    const wave = (v: number) => (p.ripple / 2) * Math.sin(2 * Math.PI * p.ribs * v);
    const rows = p.ribs * 8;
    const at = (z0: number, wv: boolean) => (u: number, v: number) => new Vector3(-x + 2 * x * u, y0 + (y1 - y0) * v, z0 + (wv ? wave(v) : 0));
    const front = new Vector3(0, 0, 1), back = new Vector3(0, 0, -1);
    if (p.board === "zinc") {
      const zn = material("metal", "#a8adb0");
      t.add(zn, grid(1, rows, at(0.0005, true), () => front));
      t.add(zn, grid(1, rows, at(-0.0005, true), () => back));
    } else {
      const d = 0.006;
      t.add(holz, grained(grid(1, rows, at(d - p.ripple / 2, true), () => front), "x"));
      t.add(holz, grained(grid(1, 1, at(-d, false), () => back), "x"));
    }
    return t.group();
  },
});
