import { CylinderGeometry } from "three";
import { material, grained } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

export const swing = defineAsset({
  id: "swing", category: "props",
  title: { de: "Schaukel", en: "Swing" },
  description: { de: "Ein hölzerner Gartenschaukel: zwei A-Rahmen aus runden Stützen mit einem Querbalken, daran ein oder zwei Sitzbretter an Seilen hängen; der Sitz schwingt nach vorne um den Balken.", en: "A wooden garden swing: two A-frames of round posts with a top beam, one or two board seats hanging on ropes; the seat swings forward about the beam." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 1.2, max: 2.4, step: 0.05, default: 1.8, unit: "m",
      describe: { de: "Abstand der beiden A-Rahmen entlang x: 1,2 m für einen Sitz, 1,8 m üblich, 2,4 m breit für zwei Sitze.", en: "Distance between the two A-frames along x: 1.2 m for one seat, 1.8 m usual, 2.4 m wide for two." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1.8, max: 2.8, step: 0.05, default: 2.2, unit: "m",
      describe: { de: "Höhe der Oberkante des Querbalkens: 1,8 m niedrig, 2,2 m üblich, 2,8 m hoch.", en: "Height of the top edge of the beam: 1.8 m low, 2.2 m usual, 2.8 m high." } },
    seatHeight: { type: "number", label: { de: "Sitzhöhe", en: "Seat height" }, min: 0.3, max: 0.6, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Höhe der Sitzplatte im Ruhezustand: 0,3 m für kleine Kinder, 0,45 m üblich, 0,6 m für Erwachsene.", en: "Height of the seat's top face at rest: 0.3 m for small children, 0.45 m usual, 0.6 m for adults." } },
    splay: { type: "number", label: { de: "Spreiz", en: "Splay" }, min: 10, max: 25, step: 1, default: 18, unit: "°",
      describe: { de: "Wie weit jedes Bein von der Vertikalen nach außen geneigt ist, von der Seite gesehen: 10° schmal, 18° üblich, 25° weit.", en: "How far each leg leans out from the vertical, seen from the side: 10° narrow, 18° usual, 25° wide." } },
    seats: { type: "choice", label: { de: "Sitze", en: "Seats" }, options: ["1", "2"], labels: { "1": { de: "Ein Sitz", en: "One seat" }, "2": { de: "Zwei Sitze", en: "Two seats" } }, default: "1",
      describe: { de: "Ein Sitz in der Mitte oder zwei nebeneinander.", en: "One seat in the middle, or two side by side." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a6440",
      describe: { de: "Farbe von Rahmen und Sitz.", en: "Colour of the frame and the seat." } },
  },
  presets: {
    garden: { label: { de: "Gartenschaukel", en: "Garden swing" }, values: { seats: "1" } },
    double: { label: { de: "Doppelschaukel", en: "Double swing" }, values: { seats: "2", width: 2.2 } },
    playground: { label: { de: "Spielplatzschaukel", en: "Playground swing" }, values: { height: 2.6, seatHeight: 0.4, splay: 22, seats: "2", width: 2.4 } },
  },
  rig: { seat: { label: { de: "Sitz", en: "Seat" }, type: "rotate", axis: [-1, 0, 0], min: 0, max: 45 } },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 6000, drawCalls: 3 },
  build(p) {
    const holz = material("wood", p.color, 1, undefined, { grain: "part" });
    const sitzholz = material("wood", p.color, 1, undefined, { grain: "part" });
    const seil = material("wood", "#c8b28a", 1, undefined, { plain: true });
    const t = new Parts();
    const w = p.width, h = p.height, a = (p.splay * Math.PI) / 180, H = h - 0.1;
    const lift = 0.05 * Math.sin(a), fuss = H * Math.tan(a), beinL = H / Math.cos(a);
    for (const e of [-1, 1]) for (const s of [-1, 1]) t.add(holz, grained(turned([[0.05, 0], [0.05, beinL]], 12).rotateX(-s * a).translate(e * w / 2, lift, s * fuss), "y"));
    const zc = fuss * (lift + H - 0.6) / H;
    for (const e of [-1, 1]) t.add(holz, grained(rounded(0.06, 0.08, 2 * zc - 0.1, 0.003, e * w / 2, 0.6, 0, 1), "z"));
    t.add(holz, grained(rounded(w + 0.24, 0.1, 0.1, 0.003, 0, h - 0.05, 0, 1), "x"));
    const breit = p.seats === "2" ? Math.min(0.45, w / 2 - 0.2) : 0.5;
    const sitzL = H - p.seatHeight;
    const sitz = t.moving("seat", 0, H, 0);
    for (const sx of p.seats === "2" ? [-w / 4, w / 4] : [0]) {
      sitz.add(sitzholz, grained(rounded(breit, 0.03, 0.22, 0.003, sx, p.seatHeight - 0.015, 0, 1), "x"));
      for (const sz of [-1, 1]) sitz.add(seil, new CylinderGeometry(0.012, 0.012, sitzL, 8).translate(sx + sz * (breit / 2 - 0.04), (H + p.seatHeight) / 2, 0));
    }
    return t.group();
  },
});
