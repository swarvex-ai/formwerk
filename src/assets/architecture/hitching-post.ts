import { CylinderGeometry, TorusGeometry } from "three";
import { material, grained } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded } from "../shapes";

export const hitchingPost = defineAsset({
  id: "hitching-post", category: "architecture",
  title: { de: "Anbindepfahl", en: "Hitching post" },
  description: { de: "Zwei Pfosten mit einem Querbalken und eiserne Anbinderinge zum Anbinden von Pferden, für Gasthöfe, Ställe und Ranches.", en: "Two posts with a rail across the top and iron tie rings for tying up horses, for inn yards, stables and ranches." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 1, max: 4, step: 0.1, default: 2, unit: "m",
      describe: { de: "Balkenlänge zwischen den äußeren Pfostenkanten; 2 m binden zwei Pferde.", en: "Rail length between the outer faces of the posts; 2 m ties two horses." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.8, max: 1.3, step: 0.05, default: 1.05, unit: "m",
      describe: { de: "Oberkante des Balkens über dem Boden: Brusthöhe eines Pferdes, 1,05 m.", en: "Top of the rail above the floor: chest height of a horse, 1.05 m." } },
    postSize: { type: "number", label: { de: "Pfostenstärke", en: "Post size" }, min: 0.08, max: 0.2, step: 0.01, default: 0.12, unit: "m",
      describe: { de: "Pfostenbreite oder -durchmesser; der Balken misst etwa 80 % davon.", en: "Post width or diameter; the rail is about 0.8 of it." } },
    style: { type: "choice", label: { de: "Bauart", en: "Style" }, options: ["sawn", "round"], labels: { sawn: { de: "Schnittig", en: "sawn" }, round: { de: "Rund", en: "round" } }, default: "sawn",
      describe: { de: "Schnittiges Kantholz mit leicht gerundeten Kanten oder geschälte Rundhölzer.", en: "Sawn square timber with slightly rounded edges, or round peeled logs." } },
    rings: { type: "integer", label: { de: "Ringe", en: "Rings" }, min: 0, max: 4, default: 2,
      describe: { de: "Eiserne Anbinderinge unter dem Balken, gleichmäßig entlang ihm verteilt.", en: "Iron tie rings under the rail on eye bolts, spaced evenly along it." } },
    wood: { type: "color", label: { de: "Holzfarbe", en: "Wood colour" }, default: "#8a6a48",
      describe: { de: "Grundfarbe des Holzes.", en: "Base colour of the wood." } },
  },
  presets: {
    "inn-yard": { label: { de: "Gasthofshof", en: "Inn yard" }, values: { length: 2 } },
    "ranch-rail": { label: { de: "Ranch", en: "Ranch rail" }, values: { style: "round", length: 3.6, rings: 0, wood: "#7a5a3a" } },
    "town-square": { label: { de: "Marktplatz", en: "Town square" }, values: { length: 1.2, rings: 1, postSize: 0.15 } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 4000, drawCalls: 6 },
  build(p) {
    const ps = p.postSize, L = p.length, h = p.height;
    const railH = 0.8 * ps;
    const postH = h - railH;
    const railBottom = postH;
    const holz = material("wood", p.wood, 1, undefined, { grain: "part" });
    const eisen = material("iron", "#707070");
    const t = new Parts();
    const postX = [-(L / 2 - ps / 2), L / 2 - ps / 2];
    for (const x of postX) {
      if (p.style === "sawn") t.add(holz, grained(rounded(ps, postH, ps, 0.015, x, postH / 2, 0), "y"));
      else t.add(holz, grained(new CylinderGeometry(ps / 2, ps / 2, postH, 16).translate(x, postH / 2, 0), "y"));
    }
    if (p.style === "sawn") t.add(holz, grained(rounded(L, railH, ps, 0.015, 0, h - railH / 2, 0), "x"));
    else t.add(holz, grained(new CylinderGeometry(railH / 2, railH / 2, L, 16).rotateZ(Math.PI / 2).translate(0, h - railH / 2, 0), "x"));
    if (p.rings > 0) {
      const ringR = 0.05, wire = 0.01, boltLen = 0.06, boltR = 0.004;
      const ringY = railBottom - boltLen - ringR;
      for (let i = 0; i < p.rings; i++) {
        const x = -L / 2 + ps + (i + 0.5) * (L - 2 * ps) / p.rings;
        t.add(eisen, new TorusGeometry(ringR, wire, 12, 10).translate(x, ringY, 0));
        t.add(eisen, new CylinderGeometry(boltR, boltR, boltLen, 8).translate(x, railBottom - boltLen / 2, 0));
      }
    }
    return t.group();
  },
});
