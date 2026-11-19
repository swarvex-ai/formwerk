import { DoubleSide, Vector3 } from "three";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded, turned } from "../shapes";

export const banner = defineAsset({
  id: "banner", category: "props",
  title: { de: "Banner", en: "Banner" },
  description: { de: "Ein Banner an einer Stange mit Querholz: Stoffbahn mit gerader, spitzer oder geschwalbter Unterkante, wahlweise mit Raute als Wappen und Kreuzfuß.", en: "A banner on a pole with a crossbar: a cloth with a straight, pointed or swallowtail end, optionally with a lozenge as emblem and a cross foot." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1.6, max: 4, step: 0.1, default: 2.6, unit: "m",
      describe: { de: "Höhe der Stange bis zur Spitze: 1,6 m in einer Halle, 2,6 m vor einem Turnierzelt, 4 m auf einer Burg.", en: "Height of the pole to the tip: 1.6 m in a hall, 2.6 m before a tournament tent, 4 m in a castle yard." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.4, max: 1.2, step: 0.05, default: 0.7, unit: "m",
      describe: { de: "Breite der Stoffbahn: 0,4 m schmale Wimpel, 0,7 m üblich, 1,2 m großes Hausbanner.", en: "Width of the cloth: 0.4 m a narrow pennant, 0.7 m usual, 1.2 m a large house banner." } },
    clothLength: { type: "number", label: { de: "Stofflänge", en: "Cloth length" }, min: 0.6, max: 2.4, step: 0.05, default: 1.2, unit: "m",
      describe: { de: "Länge der Stoffbahn unter dem Querholz, endet mindestens 0,4 m über dem Boden.", en: "Length of the cloth below the crossbar, ending at least 0.4 m above the floor." } },
    tail: { type: "choice", label: { de: "Unterkante", en: "End" }, options: ["straight", "point", "swallowtail"],
      labels: { straight: { de: "Gerade", en: "Straight" }, point: { de: "Spitz", en: "Pointed" }, swallowtail: { de: "Geschwalbt", en: "Swallowtail" } }, default: "swallowtail",
      describe: { de: "Form der Unterkante: gerade, spitz zulaufend oder mit geschwalbtem Ausschnitt.", en: "Shape of the lower edge: straight, coming to a point, or with a swallowtail cut." } },
    emblem: { type: "boolean", label: { de: "Wappen", en: "Emblem" }, default: true,
      describe: { de: "Raute in der Wappenfarbe vorn auf dem Stoff; aus ist der Stoff einfarbig.", en: "A lozenge in the emblem colour on the front; off the cloth stays plain." } },
    stand: { type: "boolean", label: { de: "Kreuzfuß", en: "Cross foot" }, default: true,
      describe: { de: "Kreuzfuß, auf dem die Stange steht; aus wird die Stange in den Boden gesteckt.", en: "A cross foot the pole stands on; off the pole is set into the ground." } },
    color: { type: "color", label: { de: "Stoff", en: "Cloth" }, default: "#8e2a2a",
      describe: { de: "Farbe des Stoffs: Weinrot #8e2a2a, Königsblau #2a4a8e, Waldgrün #2f6b3a.", en: "Colour of the cloth: wine red #8e2a2a, royal blue #2a4a8e, forest green #2f6b3a." } },
    emblemColor: { type: "color", label: { de: "Wappenfarbe", en: "Emblem colour" }, default: "#d8b24a",
      describe: { de: "Farbe der Raute: Gold #d8b24a, Silber #e6e6e0, Schwarz #222222.", en: "Colour of the lozenge: gold #d8b24a, silver white #e6e6e0, black #222222." } },
  },
  presets: {
    "knight-banner": { label: { de: "Ritterbanner", en: "Knight banner" }, values: { tail: "swallowtail", height: 2.6 } },
    "hall-tapestry": { label: { de: "Hallenbanner", en: "Hall tapestry" }, values: { height: 2, width: 1, clothLength: 1.5, tail: "straight", color: "#2a4a8e", emblemColor: "#e6e6e0" } },
    pennant: { label: { de: "Wimpel", en: "Pennant" }, values: { height: 3.4, width: 0.45, clothLength: 1.6, tail: "point", emblem: false, stand: false, color: "#2f6b3a" } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 3202, drawCalls: 4 },
  build(p) {
    // One wood: the pole stands ("auto"), crossbar and foot boards are grained along their length
    const holz = material("wood", "#6b4a2e", 1, undefined, { grain: "part" }), eisen = material("metal", "#40454b"), stoff = material("paint", p.color, 1, 40);
    stoff.side = DoubleSide;
    const t = new Parts();
    const h = p.height, w = p.width, r = 0.03, yQuer = h - 0.12, zStoff = r + 0.02;
    const l = Math.min(p.clothLength, yQuer - 0.4);
    const kerbe = Math.min(w * 0.4, l * 0.4);
    // Turned pole: closed foot with a small chamfer, a collar just under the spike, closed top
    t.add(holz, turned([[0, 0], [r * 0.9, 0], [r, 0.008], [r, h - 0.05], [r * 1.25, h - 0.05], [r * 1.4, h - 0.045], [r * 1.4, h - 0.025],
      [r * 1.25, h - 0.02], [r, h - 0.02], [r, h], [0, h]], 16));
    // Iron spike: a ferrule ring round the pole top, a neck, then the point
    t.add(eisen, turned([[0, h - 0.017], [r * 1.1, h - 0.017], [r * 1.15, h - 0.012], [r * 1.15, h + 0.01], [r * 0.8, h + 0.018], [r * 0.8, h + 0.026],
      [r * 1.6, h + 0.034], [r * 0.9, h + 0.06], [r * 0.4, h + 0.08], [0, h + 0.1]], 16));
    t.add(holz, grained(rounded(w + 0.1, 0.04, 0.04, 0.006, 0, yQuer, zStoff), "x"));
    // The cloth hangs in front of the pole on +z; its outline starts under the crossbar (yTop). Just below the bar it
    // bends forward into the sleeve's front, and from there it hangs in soft vertical folds.
    const yTop = yQuer - 0.02, R = 0.02 + 0.006, zc = zStoff + 0.005, zVorn = zStoff + R;
    const glatt = (k: number) => { const c = Math.min(1, Math.max(0, k)); return c * c * (3 - 2 * c); };
    const zAt = (x: number, y: number) => zc + (zVorn - zc) * glatt((y - yTop + 0.04) / 0.06) + 0.012 * Math.sin((2 * Math.PI * x) / (w / 3)) * glatt((yTop - y) / 0.15);
    const unten = (x: number) => {
      const a = Math.abs(x) / (w / 2);
      return yTop - l + (p.tail === "point" ? kerbe * a : p.tail === "swallowtail" ? kerbe * (1 - a) : 0);
    };
    // Rows: 6 through the bend, 4 through the fading folds, 2 down to the end
    const zeile = (j: number, x: number) => (j <= 6 ? yQuer - (0.06 * j) / 6 : j <= 10 ? yTop - 0.04 - (0.12 * (j - 6)) / 4 : yTop - 0.16 + ((unten(x) - yTop + 0.16) * (j - 10)) / 2);
    t.add(stoff, grid(36, 12, (u, v) => {
      const x = -w / 2 + w * u, y = zeile(Math.round(v * 12), x);
      return new Vector3(x, y, zAt(x, y));
    }, () => new Vector3(0, 0, 1)));
    // Sleeve: a half tube over the bar's front, top and back, and the back flap hanging down behind the bar
    t.add(stoff, grid(1, 8, (u, v) => new Vector3(-w / 2 + w * u, yQuer + R * Math.sin(Math.PI * v), zStoff + R * Math.cos(Math.PI * v)),
      (q) => new Vector3(0, q.y - yQuer, q.z - zStoff)));
    t.add(stoff, grid(1, 1, (u, v) => new Vector3(-w / 2 + w * u, yQuer - 0.04 * v, zStoff - R), () => new Vector3(0, 0, -1)));
    if (p.emblem) {
      const d = Math.min(w * 0.3, (l - kerbe) * 0.35);
      const yR = yQuer - 0.02 - Math.min(l * 0.4, (l - kerbe) * 0.5);
      const wappen = material("paint", p.emblemColor);
      wappen.side = DoubleSide;
      // The lozenge as a patch 2 mm in front of the folds: from the left corner, u towards the bottom, v towards the top
      t.add(wappen, grid(16, 16, (u, v) => {
        const x = 0.75 * d * (u + v - 1), y = yR + d * (v - u);
        return new Vector3(x, y, zAt(x, y) + 0.002);
      }, () => new Vector3(0, 0, 1)));
    }
    if (p.stand) {
      // Cross foot: the board along x runs through, the board along z butts against it from both sides
      t.add(holz, grained(rounded(0.7, 0.06, 0.08, 0.006, 0, 0.03, 0), "x"));
      for (const s of [-1, 1]) t.add(holz, grained(rounded(0.08, 0.06, 0.31, 0.006, 0, 0.03, s * 0.195), "z"));
    }
    return t.group();
  },
});
