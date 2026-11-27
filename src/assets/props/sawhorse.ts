import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded } from "../shapes";

export const sawhorse = defineAsset({
  id: "sawhorse", category: "props",
  title: { de: "Sägebock", en: "Sawhorse" },
  description: {
    de: "Ein Sägebock aus Holz für Werkstätten, Baustellen und Höfe: ein Balken oben, an jedem Ende zwei Beine, die nach vorn und hinten wie ein A ausgestellt sind, mit einem Querbrett je Beinpaar; zwei davon tragen auch eine Tischplatte.",
    en: "A wooden sawhorse for workshops, building sites and yards: a beam on top, two legs at each end splayed front and back like an A, with a cross board on each pair; two of them also carry a table top.",
  },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 0.6, max: 1.5, step: 0.01, default: 1.0, unit: "m",
      describe: { de: "Länge des Balkens: 0,7 m ein kleiner Bock, 1 m üblich, 1,5 m ein langer Tischbock.", en: "Length of the beam: 0.7 m a small one, 1 m usual, 1.5 m a long trestle." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.4, max: 0.9, step: 0.01, default: 0.7, unit: "m",
      describe: { de: "Höhe der Oberkante des Balkens: 0,45 m zum Sägen von Stämmen, 0,7 m üblich, 0,85 m ein Bock unter einer Werkbankplatte.", en: "Height of the top of the beam: 0.45 m for sawing logs, 0.7 m usual, 0.85 m a trestle under a workbench top." } },
    splay: { type: "number", label: { de: "Spreizung", en: "Splay" }, min: 8, max: 25, step: 1, default: 15, unit: "°",
      describe: { de: "Wie weit sich jedes Bein aus der Senkrechten nach vorn und hinten neigt: 10° steil, 15° üblich, 25° breit und standfest.", en: "How far each leg leans out from vertical, front and back: 10° steep, 15° usual, 25° wide and steady." } },
    beam: { type: "choice", label: { de: "Balken", en: "Beam" }, options: ["square", "plank"], labels: { square: { de: "Kantholz", en: "square" }, plank: { de: "Bohle", en: "plank" } }, default: "square",
      describe: { de: "Form des Balkens: Kantholz 0,09 × 0,09 m für Sägearbeiten, Bohle 0,04 m hoch und 0,14 m breit, flach liegend als Auflage für eine Platte.", en: "Shape of the beam: square a 0.09 × 0.09 m beam for sawing, plank a board 0.04 m high and 0.14 m wide, lying flat to carry a top." } },
    braces: { type: "boolean", label: { de: "Querbretter", en: "Braces" }, default: true,
      describe: { de: "Ein Querbrett außen an jedem Beinpaar auf 0,35 × Höhe, das die Beine versteift: an bei fast jedem Bock, aus bei einem schnell gebauten.", en: "A cross board on the outside of each leg pair at 0.35 × height that stiffens the legs: on for almost every sawhorse, off for a quickly built one." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#a07a50",
      describe: { de: "Farbe des Holzes: Kiefer #a07a50, Fichte #c09a68, verwittert #7a6a58.", en: "Colour of the wood: pine #a07a50, spruce #c09a68, weathered #7a6a58." } },
  },
  presets: {
    workshop: { label: { de: "Werkstatt", en: "Workshop" }, values: { beam: "square" } },
    trestle: { label: { de: "Tischbock", en: "Trestle" }, values: { length: 1.5, height: 0.75, beam: "plank", splay: 10 } },
    low: { label: { de: "Niedrig", en: "Low" }, values: { length: 0.7, height: 0.45, splay: 20 } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 3000, drawCalls: 1 },
  build(p) {
    const t = new Parts();
    const L = p.length, H = p.height, lean = (p.splay * Math.PI) / 180;
    const sin = Math.sin(lean), cos = Math.cos(lean);
    const [bw, bh] = p.beam === "plank" ? [0.14, 0.04] : [0.09, 0.09];
    const leg = 0.045, half = leg / 2, bevel = 0.004;
    const holz = material("wood", p.colour, 1, 600, { grain: "part" });

    // The beam, its top at the height
    t.add(holz, grained(rounded(L, bh, bw, 0.005, 0, H - bh / 2, 0, 1), "x"));

    // The legs: built upright from the foot, leaned out by the splay, then lifted so the lowest foot corner touches
    // the floor. Lifted like that, the lowest (inner) top corner sits at len·cos above the floor: it meets the beam's
    // underside, the outer corner sinks 2·half·sin into the beam (1.9 cm at 25°); 1 mm more covers the bevel
    const len = (H - bh) / cos + 0.001, zTop = bw / 2 - half, zFoot = zTop + len * sin;
    const xLeg = L / 2 - 0.12;
    for (const s of [-1, 1]) for (const k of [-1, 1]) {
      const g = rounded(leg, len, leg, bevel, 0, len / 2, 0, 1).rotateX(-k * lean);
      g.computeBoundingBox();
      g.translate(s * xLeg, -g.boundingBox!.min.y, k * zFoot);
      t.add(holz, grained(g, "y"));
    }

    // The cross boards against the outer face of each leg pair, as wide as the legs are apart there plus 4 cm
    if (p.braces) {
      const yb = 0.35 * H, lift = half * sin;
      const zc = zFoot - (yb - lift) * Math.tan(lean), w = 2 * (zc + half / cos) + 0.04;
      for (const s of [-1, 1]) t.add(holz, grained(rounded(0.02, 0.12, w, 0.003, s * (xLeg + half + 0.01), yb, 0, 1), "z"));
    }
    return t.group();
  },
});
