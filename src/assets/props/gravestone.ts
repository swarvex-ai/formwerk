import { Box3, BoxGeometry, BufferGeometry, ConeGeometry, CylinderGeometry } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const gravestone = defineAsset({
  id: "gravestone", category: "props",
  title: { de: "Grabstein", en: "Gravestone" },
  description: { de: "Ein Grabstein aus Stein: Platte mit rundem Kopf und Tafel, Kreuz oder Obelisk, auf Wunsch auf einem Sockel und leicht nach hinten geneigt.", en: "A stone grave marker: a slab with a rounded top and a plaque, a cross or an obelisk, optionally on a plinth and leaning back a little." },
  params: {
    shape: { type: "choice", label: { de: "Form", en: "Shape" }, options: ["slab", "cross", "obelisk"], labels: { slab: { de: "Platte", en: "Slab" }, cross: { de: "Kreuz", en: "Cross" }, obelisk: { de: "Obelisk", en: "Obelisk" } }, default: "slab",
      describe: { de: "Form des Steins: Platte mit rundem Kopf, lateinisches Kreuz oder Obelisk mit Spitze.", en: "Shape of the stone: slab with a rounded top, Latin cross or obelisk with a pointed top." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.5, max: 1.6, step: 0.05, default: 0.9, unit: "m",
      describe: { de: "Höhe über dem Boden oder Sockel: 0,6 m ein einfacher Stein, 0,9 m eine Platte, 1,5 m ein Obelisk.", en: "Height above the ground or plinth: 0.6 m a simple stone, 0.9 m a slab, 1.5 m an obelisk." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.3, max: 0.8, step: 0.01, default: 0.5, unit: "m",
      describe: { de: "Breite des Steins; beim Kreuz die Armspannweite, beim Obelisken die untere Seite: 0,4 m schlicht, 0,5 m Platte, 0,8 m breites Kreuz.", en: "Width of the stone; the arm span of a cross, the bottom side of an obelisk: 0.4 m simple, 0.5 m slab, 0.8 m wide cross." } },
    thickness: { type: "number", label: { de: "Dicke", en: "Thickness" }, min: 0.06, max: 0.2, step: 0.01, default: 0.12, unit: "m",
      describe: { de: "Dicke von vorn nach hinten: 0,08 m dünne Platte, 0,12 m üblich, 0,2 m massiv. Der Obelisk ist quadratisch und ignoriert das.", en: "Thickness front to back: 0.08 m a thin slab, 0.12 m usual, 0.2 m massive. The obelisk is square and ignores it." } },
    plinth: { type: "boolean", label: { de: "Sockel", en: "Plinth" }, default: true,
      describe: { de: "Ein Steinblock von 0,12 m Höhe unter dem Stein; aus steht der Stein direkt im Boden.", en: "A stone block 0.12 m high under the marker; off, the marker stands directly in the ground." } },
    tilt: { type: "number", label: { de: "Neigung", en: "Tilt" }, min: 0, max: 12, step: 0.5, default: 0, unit: "°",
      describe: { de: "Neigung nach hinten (Kopf Richtung −z): 0° gerade, 6° ein alter Stein, 12° fast gekippt.", en: "Lean backwards (top towards −z): 0° upright, 6° an old stone, 12° nearly toppled." } },
    colour: { type: "color", label: { de: "Steinfarbe", en: "Stone colour" }, default: "#8a8a84",
      describe: { de: "Farbe des Steins und des Sockels.", en: "Colour of the stone and the plinth." } },
    plaqueColour: { type: "color", label: { de: "Tafelfarbe", en: "Plaque colour" }, default: "#6e6e68",
      describe: { de: "Farbe der Tafel auf der Platte.", en: "Colour of the plaque on the slab." } },
  },
  presets: {
    "old-slab": { label: { de: "Alte Platte", en: "Old slab" }, values: { tilt: 6 } },
    cross: { label: { de: "Kreuz", en: "Cross" }, values: { shape: "cross", height: 1.1, width: 0.6 } },
    obelisk: { label: { de: "Obelisk", en: "Obelisk" }, values: { shape: "obelisk", height: 1.5, width: 0.35 } },
    simple: { label: { de: "Schlicht", en: "Simple" }, values: { plinth: false, height: 0.6, width: 0.4 } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 200, drawCalls: 2 },
  build(p, seed) {
    const stein = material("stone", p.colour), tafel = material("stone", p.plaqueColour), t = new Parts();
    const { height: h, width: w, thickness: d } = p, obelisk = p.shape === "obelisk";
    const y0 = p.plinth ? 0.12 : 0;
    if (p.plinth) t.box(stein, 1.3 * w, 0.12, obelisk ? 1.3 * w : 2.5 * d, 0, 0.06, 0);
    // The marker around its own base centre at y = 0
    const body: BufferGeometry[] = [], plaque: BufferGeometry[] = [];
    const box = (gw: number, gh: number, gd: number, y: number, z = 0) => new BoxGeometry(gw, gh, gd).translate(0, y, z);
    if (p.shape === "slab") {
      body.push(box(w, h - w / 2, d, (h - w / 2) / 2));
      body.push(new CylinderGeometry(w / 2, w / 2, d, 16, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2).translate(0, h - w / 2, 0));
      plaque.push(box(0.6 * w, 0.35 * h, 0.008, 0.55 * h, d / 2));
    } else if (p.shape === "cross") {
      body.push(box(0.3 * w, h, d, h / 2), box(w, 0.3 * w, d, 0.7 * h));
    } else {
      const top = h * 0.88, r = w / Math.SQRT2;
      body.push(new CylinderGeometry(0.6 * r, r, top, 4, 1).rotateY(Math.PI / 4).translate(0, top / 2, 0));
      body.push(new ConeGeometry(0.6 * r, h - top, 4, 1).rotateY(Math.PI / 4).translate(0, top + (h - top) / 2, 0));
    }
    const lean = ((rng(seed)() * 2 - 1) * 2 * Math.PI) / 180, tilt = (-p.tilt * Math.PI) / 180;
    const all = [...body, ...plaque];
    const bounds = new Box3();
    for (const g of all) { g.rotateX(tilt).rotateZ(lean); g.computeBoundingBox(); bounds.union(g.boundingBox!); }
    const dy = y0 - bounds.min.y;
    for (const g of all) g.translate(0, dy, 0);
    for (const g of body) t.add(stein, g);
    for (const g of plaque) t.add(tafel, g);
    return t.group();
  },
});
