import { CircleGeometry, ConeGeometry, CylinderGeometry, Quaternion, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const stump = defineAsset({
  id: "stump", category: "nature",
  title: { de: "Baumstumpf", en: "Tree stump" },
  description: { de: "Ein Baumstumpf mit hellem Schnitt oben und Wurzeln, die sich in den Boden krallen: gesägt, schräg mit der Axt gefällt oder abgebrochen.", en: "A tree stump with a pale cut on top and roots that grip the ground: sawn, felled at a slant with an axe, or snapped off." },
  params: {
    diameter: { type: "number", label: { de: "Durchmesser", en: "Diameter" }, min: 0.2, max: 1.2, step: 0.01, default: 0.5, unit: "m",
      describe: { de: "Durchmesser des Baumstumpfs: 0,25 m eine junge Birke, 0,5 m eine Fichte, 1,1 m eine alte Eiche.", en: "Diameter of the tree stump: 0.25 m a young birch, 0.5 m a spruce, 1.1 m an old oak." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.1, max: 1, step: 0.01, default: 0.4, unit: "m",
      describe: { de: "Höhe des Baumstumpfs über dem Boden: 0,15 m bodennah gesägt, 0,4 m üblich, 0,9 m ein hoher Hackklotz.", en: "Height of the tree stump above ground: 0.15 m sawn close to the ground, 0.4 m usual, 0.9 m a tall chopping stump." } },
    cut: { type: "choice", label: { de: "Schnitt", en: "Cut" }, options: ["saw", "axe", "broken"], labels: { saw: { de: "Gesägt", en: "Sawn" }, axe: { de: "Axt", en: "Axe" }, broken: { de: "Abgebrochen", en: "Snapped" } }, default: "saw",
      describe: { de: "Art des Schnitts: flach gesägt, im 25°-Winkel mit der Axt geschlagen oder mit Splittern abgebrochen.", en: "Type of cut: sawn flat, slanted 25° by an axe, or snapped off with splinters." } },
    roots: { type: "integer", label: { de: "Wurzeln", en: "Roots" }, min: 0, max: 7, default: 4,
      describe: { de: "Zahl der sichtbaren Wurzelanläufe: 0 gerade in den Boden, 4 üblich, 7 ein alter Stumpf.", en: "Number of visible root flares: 0 straight into the ground, 4 usual, 7 an old stump." } },
    rootLength: { type: "number", label: { de: "Wurzellänge", en: "Root length" }, min: 0.3, max: 1.5, step: 0.05, default: 0.6,
      describe: { de: "Länge der Wurzeln relativ zum Durchmesser: 0,3 kurz, 0,6 üblich, 1,5 weit ausladend.", en: "Length of the roots relative to the diameter: 0.3 short, 0.6 usual, 1.5 spreading wide." } },
    barkColor: { type: "color", label: { de: "Rinde", en: "Bark" }, default: "#5a4433",
      describe: { de: "Farbe der Rinde: #5a4433 Fichte, #d8d4c8 Birke, #4a3f35 Eiche.", en: "Colour of the bark: #5a4433 spruce, #d8d4c8 birch, #4a3f35 oak." } },
    cutColor: { type: "color", label: { de: "Schnittfläche", en: "Cut surface" }, default: "#c9a477",
      describe: { de: "Farbe der Schnittfläche: #c9a477 frisch, #8c7a64 verwittertes Grau.", en: "Colour of the cut surface: #c9a477 fresh, #8c7a64 weathered grey." } },
  },
  presets: {
    sawn: { label: { de: "Gesägt", en: "Sawn" }, values: { cut: "saw" } },
    "chopping-block": { label: { de: "Hackklotz", en: "Chopping block" }, values: { diameter: 0.55, height: 0.7, roots: 0 } },
    "old-oak": { label: { de: "Alte Eiche", en: "Old oak" }, values: { diameter: 1.1, height: 0.6, cut: "broken", roots: 7, rootLength: 1.2, barkColor: "#4a3f35", cutColor: "#8c7a64" } },
    birch: { label: { de: "Birke", en: "Birch" }, values: { diameter: 0.25, height: 0.3, cut: "axe", roots: 3, barkColor: "#d8d4c8" } },
  },
  physics: { body: "static", collider: "cylinder" },
  budget: { triangles: 800, drawCalls: 2 },
  build(p, seed) {
    const r = rng(seed);
    const rinde = material("bark", p.barkColor, 1 / Math.max(0.5, p.diameter * 2.5));
    const holz = material("wood", p.cutColor, 1);
    const t = new Parts();
    const rad = p.diameter / 2;
    const oben = rad * 0.9;
    const h = p.height;

    const neig = p.cut === "axe" ? Math.min(Math.tan((25 * Math.PI) / 180), (h * 0.75) / oben) : 0;
    const schief = <G extends CylinderGeometry | CircleGeometry>(g: G): G => {
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > h - 1e-6) {
          const x = pos.getX(i);
          pos.setY(i, h + x * neig);
        }
      }
      g.computeVertexNormals();
      return g;
    };

    t.add(rinde, schief(new CylinderGeometry(oben, rad, h, 12, 1, true).translate(0, h / 2, 0)));
    t.add(holz, schief(new CircleGeometry(oben, 12).rotateX(-Math.PI / 2).translate(0, h, 0)));
    t.cylinder(rad, h);

    if (p.cut === "broken") {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * 2 * Math.PI + r() * 0.6;
        const lang = h * (0.25 + 0.35 * r());
        const dick = oben * (0.2 + 0.1 * r());
        t.add(holz, new ConeGeometry(dick, lang, 5).translate(Math.cos(a) * oben * 0.6, h + lang / 2, Math.sin(a) * oben * 0.6));
      }
    }

    for (let i = 0; i < p.roots; i++) {
      const a = (i / p.roots) * 2 * Math.PI + r() * 0.5;
      const lang = p.diameter * p.rootLength * (0.8 + 0.4 * r());
      const dick = rad * (0.4 + 0.15 * r());
      const direction = new Vector3(Math.cos(a), -0.5, Math.sin(a)).normalize();
      const g = new ConeGeometry(dick, lang, 6, 1, true).translate(0, lang / 2, 0);
      g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction));
      g.translate(Math.cos(a) * rad * 0.5, Math.min(h * 0.6, dick * 1.4), Math.sin(a) * rad * 0.5);
      g.computeBoundingBox();
      t.add(rinde, g.translate(0, -g.boundingBox!.min.y, 0));
    }

    return t.group();
  },
});
