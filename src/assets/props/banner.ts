import { ConeGeometry, DoubleSide, ExtrudeGeometry, Shape } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

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
  budget: { triangles: 600, drawCalls: 4 },
  build(p) {
    const holz = material("wood", "#6b4a2e"), eisen = material("metal", "#40454b"), stoff = material("paint", p.color, 1, 40);
    stoff.side = DoubleSide;
    const t = new Parts();
    const h = p.height, w = p.width, r = 0.03, yQuer = h - 0.12, zStoff = r + 0.02;
    const l = Math.min(p.clothLength, yQuer - 0.4);
    const kerbe = Math.min(w * 0.4, l * 0.4);
    t.post(holz, r, h, 0, 0, 0, 8);
    t.add(eisen, new ConeGeometry(r * 1.6, 0.1, 6).translate(0, h + 0.05, 0));
    t.box(holz, w + 0.1, 0.04, 0.04, 0, yQuer, zStoff);
    // The cloth hangs in front of the pole on +z; its top edge sits just under the crossbar
    const s = new Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    if (p.tail === "point") { s.lineTo(w / 2, -l + kerbe); s.lineTo(0, -l); s.lineTo(-w / 2, -l + kerbe); }
    else if (p.tail === "swallowtail") { s.lineTo(w / 2, -l); s.lineTo(0, -l + kerbe); s.lineTo(-w / 2, -l); }
    else { s.lineTo(w / 2, -l); s.lineTo(-w / 2, -l); }
    s.closePath();
    t.add(stoff, new ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: false }).translate(0, yQuer - 0.02, zStoff));
    if (p.emblem) {
      const d = Math.min(w * 0.3, (l - kerbe) * 0.35);
      const yR = yQuer - 0.02 - Math.min(l * 0.4, (l - kerbe) * 0.5);
      const raute = new Shape();
      raute.moveTo(0, d);
      raute.lineTo(0.75 * d, 0);
      raute.lineTo(0, -d);
      raute.lineTo(-0.75 * d, 0);
      raute.closePath();
      t.add(material("paint", p.emblemColor), new ExtrudeGeometry(raute, { depth: 0.004, bevelEnabled: false }).translate(0, yR, zStoff + 0.01));
    }
    if (p.stand) {
      t.box(holz, 0.7, 0.06, 0.08, 0, 0.03, 0);
      t.box(holz, 0.08, 0.06, 0.7, 0, 0.03, 0);
    }
    return t.group();
  },
});
