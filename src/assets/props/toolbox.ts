import { CylinderGeometry, ExtrudeGeometry, Shape } from "three";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded } from "../shapes";

export const toolbox = defineAsset({
  id: "toolbox", category: "props",
  title: { de: "Werkzeugkiste", en: "Toolbox" },
  description: {
    de: "Eine offene hölzerne Werkzeugtrage des Zimmermanns für Werkstätten, Baustellen und Schuppen: ein langer, flacher Kasten ohne Deckel, zwei Stirnbretter, die über die Seiten ragen, und ein runder Stab dazwischen zum Tragen.",
    en: "A carpenter's open wooden tool tote for workshops, building sites and sheds: a long, low box without a lid, two end boards that rise above the sides, and a round dowel between them to carry it by.",
  },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 0.4, max: 0.8, step: 0.01, default: 0.55, unit: "m",
      describe: { de: "Äußere Länge entlang x: 0,4 m eine kleine, 0,55 m üblich, 0,8 m eine lange für Sägen.", en: "Outer length along x: 0.4 m a small one, 0.55 m usual, 0.8 m a long one for saws." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.18, max: 0.32, step: 0.01, default: 0.24, unit: "m",
      describe: { de: "Äußere Breite entlang z: 0,18 m schmal, 0,24 m üblich, 0,32 m breit.", en: "Outer width along z: 0.18 m narrow, 0.24 m usual, 0.32 m wide." } },
    sides: { type: "number", label: { de: "Seitenhöhe", en: "Sides" }, min: 0.08, max: 0.2, step: 0.01, default: 0.12, unit: "m",
      describe: { de: "Höhe der Seitenbretter: 0,08 m ein flaches Tablett, 0,12 m üblich, 0,2 m ein tiefer Kasten.", en: "Height of the side boards: 0.08 m a shallow tray, 0.12 m usual, 0.2 m a deep box." } },
    handle: { type: "number", label: { de: "Griffhöhe", en: "Handle" }, min: 0.22, max: 0.4, step: 0.01, default: 0.3, unit: "m",
      describe: { de: "Höhe der Stabmitte über dem Boden: 0,22 m niedrig, 0,3 m üblich, 0,4 m hoch; mindestens Seitenhöhe + 0,08 m, damit die Hand zwischen Stab und Seiten passt.", en: "Height of the dowel's centre above the floor: 0.22 m low, 0.3 m usual, 0.4 m high; lifted to at least sides + 0.08 m, so the hand always fits between dowel and sides." } },
    ends: { type: "choice", label: { de: "Stirnbretter", en: "Ends" }, options: ["peaked", "square"], labels: { peaked: { de: "spitz", en: "peaked" }, square: { de: "eckig", en: "square" } }, default: "peaked",
      describe: { de: "Form der Stirnbretter: spitz verjüngt von voller Breite an der Oberkante der Seiten auf 0,07 m oben, eckig als schlichte Rechtecke.", en: "Shape of the end boards: peaked tapers from full width at the top of the sides to 0.07 m at the top, square is a plain rectangle." } },
    divider: { type: "boolean", label: { de: "Trennbrett", en: "Divider" }, default: true,
      describe: { de: "Ein Längsbrett in der Mitte, so hoch wie die Seiten, trennt zwei Fächer.", en: "A lengthwise board down the middle, as high as the sides, splitting the box in two compartments." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#a07a50",
      describe: { de: "Farbe des Holzes: Kiefer #a07a50, Buche #b08860, dunkle Eiche #5c4026.", en: "Colour of the wood: pine #a07a50, beech #b08860, dark oak #5c4026." } },
  },
  presets: {
    carpenter: { label: { de: "Zimmermann", en: "Carpenter" }, values: { ends: "peaked" } },
    small: { label: { de: "Klein", en: "Small" }, values: { length: 0.4, width: 0.18, sides: 0.08, handle: 0.22 } },
    deep: { label: { de: "Tief", en: "Deep" }, values: { sides: 0.18, ends: "square", divider: false } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 2500, drawCalls: 1 },
  build(p) {
    const t = new Parts(), b = 0.015, L = p.length, W = p.width, S = p.sides;
    const holz = material("wood", p.colour, 1, 600, { grain: "part" });
    // The dowel is lifted so a hand fits between it and the sides; the end boards reach 0.03 m above its centre
    const hy = Math.max(p.handle, S + 0.08), top = hy + 0.03, w = W - 2 * b;

    t.add(holz, grained(rounded(L, b, W, 0.003, 0, b / 2, 0), "x"));
    for (const s of [-1, 1]) t.add(holz, grained(rounded(L, S, b, 0.003, 0, S / 2, s * (W / 2 - b / 2)), "x"));

    // The end boards stand on the bottom between the sides
    for (const s of [-1, 1]) {
      const x = s * (L / 2 - b / 2);
      if (p.ends === "square") {
        t.add(holz, grained(rounded(b, top - b, w, 0.003, x, (top + b) / 2, 0), "y"));
      } else {
        const f = new Shape();
        f.moveTo(-w / 2, b);
        f.lineTo(w / 2, b);
        f.lineTo(w / 2, S);
        f.lineTo(0.035, top);
        f.lineTo(-0.035, top);
        f.closePath();
        const g = new ExtrudeGeometry(f, { depth: b, bevelEnabled: false }).translate(0, 0, -b / 2).rotateY(Math.PI / 2).translate(x, 0, 0);
        t.add(holz, grained(g, "y"));
      }
    }

    // The dowel, its ends sunk halfway into the end boards
    t.add(holz, grained(new CylinderGeometry(0.014, 0.014, L - b, 16).rotateZ(Math.PI / 2).translate(0, hy, 0), "x"));
    if (p.divider) t.add(holz, grained(rounded(L - 2 * b, S, b, 0.003, 0, S / 2, 0), "x"));
    return t.group();
  },
});
