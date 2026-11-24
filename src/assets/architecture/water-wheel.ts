import { Matrix4, TorusGeometry, type BufferGeometry } from "three";
import { material, grained } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

export const waterWheel = defineAsset({
  id: "water-wheel", category: "architecture",
  title: { de: "Wasserrad", en: "Water wheel" },
  description: { de: "Ein hölzernes Mühlrad: zwei Kränze, verbunden durch Schaufelbretter, auf Speichen und einer Welle, die auf zwei Böcken oder Steinpfeilern ruht; das Rad dreht sich als bewegliches Teil „wheel“.", en: "A timber mill wheel: two rims joined by paddle boards, on spokes and an axle that rests on two trestles or stone piers; the wheel turns as the movable part \"wheel\"." },
  params: {
    diameter: { type: "number", label: { de: "Durchmesser", en: "Diameter" }, min: 1.6, max: 4, step: 0.1, default: 2.6, unit: "m",
      describe: { de: "Äußerer Durchmesser des Rads: 1,6 m ein kleines Hofrad, 2,6 m eine Dorfmühle, 4 m eine große Mühle.", en: "Outer diameter of the wheel: 1.6 m a small farm wheel, 2.6 m a village mill, 4 m a large mill." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.3, max: 1.2, step: 0.05, default: 0.6, unit: "m",
      describe: { de: "Länge der Schaufeln entlang x, der Abstand der beiden Kränze: 0,4 m am Hofrad, 0,6 m üblich, 1,1 m an einer großen Mühle.", en: "Length of the paddles along x, the distance between the two rims: 0.4 m on a farm wheel, 0.6 m usual, 1.1 m on a large mill." } },
    paddles: { type: "number", label: { de: "Schaufeln", en: "Paddles" }, min: 8, max: 24, step: 1, default: 16,
      describe: { de: "Anzahl der Schaufelbretter rund um das Rad: 10 an einem kleinen Rad, 16 üblich, 24 an einem großen.", en: "Number of paddle boards around the wheel: 10 on a small wheel, 16 usual, 24 on a large one." } },
    spokes: { type: "choice", label: { de: "Speichen", en: "Spokes" }, options: ["4", "6", "8"], labels: { "4": { de: "4", en: "4" }, "6": { de: "6", en: "6" }, "8": { de: "8", en: "8" } }, default: "6",
      describe: { de: "Speichen je Kranz von der Nabe zum Kranz: 4 an einem kleinen Rad, 6 üblich, 8 an einem großen.", en: "Spokes per rim from the hub to the rim: 4 on a small wheel, 6 usual, 8 on a large one." } },
    clearance: { type: "number", label: { de: "Bodenabstand", en: "Clearance" }, min: 0.05, max: 0.6, step: 0.05, default: 0.2, unit: "m",
      describe: { de: "Abstand zwischen der untersten Schaufel und dem Boden, das Gerinne: 0,05 m knapp über dem Grund, 0,2 m üblich, 0,6 m hoch gesetzt.", en: "Gap between the lowest paddle and the floor, the water race: 0.05 m just above the bed, 0.2 m usual, 0.6 m set high." } },
    support: { type: "choice", label: { de: "Lager", en: "Support" }, options: ["posts", "piers"], labels: { posts: { de: "Holzböcke", en: "Timber trestles" }, piers: { de: "Steinpfeiler", en: "Stone piers" } }, default: "posts",
      describe: { de: "Zwei Holzböcke (zwei gespreizte Beine und ein Sattelholz) oder zwei Steinpfeiler tragen die Wellenenden.", en: "Two timber trestles (two splayed legs and a cap each) or two stone piers carry the axle ends." } },
  },
  presets: {
    "village-mill": { label: { de: "Dorfmühle", en: "Village mill" }, values: { diameter: 2.6, paddles: 16 } },
    farm: { label: { de: "Hofrad", en: "Farm wheel" }, values: { diameter: 1.6, width: 0.4, paddles: 10, spokes: "4" } },
    "great-mill": { label: { de: "Große Mühle", en: "Great mill" }, values: { diameter: 4, width: 1.1, paddles: 24, spokes: "8", support: "piers" } },
  },
  rig: { wheel: { label: { de: "Rad", en: "Wheel" }, type: "rotate", axis: [1, 0, 0], min: 0, max: 360 } },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 20000, drawCalls: 5 },
  build(p) {
    const holz = material("wood", "#6e5034", 1, undefined, { grain: "part" }), eisen = material("iron", "#3a3633", 2, undefined, { rust: 0.4 }),
      stein = material("stone", "#8a8278", 1, undefined, { moss: 0.3 });
    const t = new Parts();
    const D = p.diameter, R = D / 2, w = p.width, ya = p.clearance + R, ra = 0.06;
    // Rim section from 0.08 m on the small wheel to 0.12 m on the 4 m wheel; rim from rIn to rOut
    const s = 0.08 + (0.04 * (D - 1.6)) / 2.4, rOut = R - 0.02, rIn = rOut - s, b = 0.012;
    const sx = w / 2 + 0.25, breit = 0.24, rh = 0.1 + 0.03 * D, hubL = 0.16;
    // Turned about x: a [radius, x] profile laid along the axle at height ya
    const drehen = (profil: [number, number][], seg: number, x0: number) => turned(profil, seg).rotateZ(-Math.PI / 2).translate(x0, ya, 0);
    // About the axle line: turned by a from the top
    const umAchse = (g: BufferGeometry, a: number) => g.translate(0, -ya, 0).rotateX(a).translate(0, ya, 0);
    const rad = t.moving("wheel", 0, ya, 0);
    for (const k of [-1, 1]) {
      // Rim: a closed ring of square section with eased edges
      const x0 = k * w / 2 - s / 2;
      rad.add(holz, drehen([[rIn + b, 0], [rOut - b, 0], [rOut, b], [rOut, s - b], [rOut - b, s], [rIn + b, s], [rIn, s - b], [rIn, b], [rIn + b, 0]], 48, x0));
      // Hub: a turned drum with collars on the axle
      const h0 = k * w / 2 - hubL / 2;
      rad.add(holz, grained(drehen([[ra, 0], [rh - 0.02, 0], [rh, 0.02], [rh, 0.035], [rh - 0.015, 0.045], [rh - 0.015, hubL - 0.045], [rh, hubL - 0.035], [rh, hubL - 0.02], [rh - 0.02, hubL], [ra, hubL]], 24, h0), "x"));
      // Spokes in the rim's plane, from the hub into the rim's inner face
      const n = Number(p.spokes), lang = rIn + 0.01 - (rh - 0.02), dick = Math.min(0.05, s * 0.7), tief = 0.07 + 0.01 * D;
      for (let i = 0; i < n; i++) {
        const a = (2 * Math.PI * (i + 0.5)) / n;
        const g = umAchse(rounded(dick, lang, tief, 0.006, k * w / 2, ya + rh - 0.02 + lang / 2, 0, 1), a);
        rad.add(holz, grained(g, Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? "y" : "z"));
      }
    }
    // Paddles: boards along x from rim to rim, standing radially from the rim's inner face to the outer radius
    for (let k = 0; k < p.paddles; k++) {
      const a = (2 * Math.PI * k) / p.paddles;
      rad.add(holz, grained(umAchse(rounded(w + 0.04, R - rIn, 0.03, 0.005, 0, ya + (R + rIn) / 2, 0, 1), a), "x"));
    }
    // Axle: an iron shaft from support to support, with turned ends
    const xa = sx + breit / 2 + 0.04;
    rad.add(eisen, drehen([[0.001, 0], [ra - 0.01, 0], [ra, 0.01], [ra, 2 * xa - 0.01], [ra - 0.01, 2 * xa], [0.001, 2 * xa]], 16, -xa));
    for (const k of [-1, 1]) {
      const x = k * sx, top = ya - ra;
      // Bearing: an iron strap over the axle, its legs down into the support's top
      t.add(eisen, new TorusGeometry(ra + 0.012, 0.012, 8, 16, Math.PI).rotateY(Math.PI / 2).translate(x, ya, 0));
      for (const z of [-1, 1]) t.add(eisen, rounded(0.06, ra + 0.01, 0.024, 0.003, x, top + (ra + 0.01) / 2 - 0.01, z * (ra + 0.012), 1));
      if (p.support === "posts") {
        // Trestle: a sill on the floor, two legs splayed in z, a cap under the axle
        const fuss = 0.35 * D, kapH = 0.12, kapL = 0.5, sill = 0.12, beinH = top - kapH - sill + 0.02, kopf = 0.15;
        t.add(holz, grained(rounded(breit - 0.04, sill, 2 * fuss + 0.3, 0.012, x, sill / 2, 0), "z"));
        t.add(holz, grained(rounded(breit, kapH, kapL, 0.012, x, top - kapH / 2, 0), "z"));
        for (const z of [-1, 1]) {
          // Sheared upright, so foot and head stay level on the sill and under the cap
          const scher = new Matrix4().set(1, 0, 0, 0, 0, 1, 0, 0, 0, (z * (kopf - fuss)) / beinH, 1, 0, 0, 0, 0, 1);
          const bein = rounded(0.14, beinH, 0.14, 0.012, 0, beinH / 2, 0).applyMatrix4(scher).translate(x, sill - 0.01, z * fuss);
          t.add(holz, grained(bein, "y"));
        }
      } else {
        // Pier: a stone footing and a block, its top at the axle's underside
        t.add(stein, rounded(breit + 0.12, 0.15, 0.5, 0.02, x, 0.075, 0));
        t.add(stein, rounded(breit + 0.02, top - 0.14, 0.38, 0.02, x, 0.14 + (top - 0.14) / 2, 0));
      }
    }
    return t.group();
  },
});
