import { CylinderGeometry, LatheGeometry, Vector2 } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const column = defineAsset({
  id: "column", category: "architecture",
  title: { de: "Säule", en: "Column" },
  description: { de: "Säule mit Kanneluren, Verjüngung, Basis und Kapitell.", en: "A column with flutes, taper, base and capital." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1, max: 8, step: 0.1, default: 3, unit: "m" },
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.1, max: 0.6, step: 0.01, default: 0.25, unit: "m" },
    flutes: { type: "integer", label: { de: "Kanneluren", en: "Flutes" }, min: 0, max: 32, default: 16 },
    taper: { type: "number", label: { de: "Verjüngung", en: "Taper" }, min: 0, max: 0.3, step: 0.01, default: 0.12 },
    base: { type: "boolean", label: { de: "Basis", en: "Base" }, default: true },
    capital: { type: "choice", label: { de: "Kapitell", en: "Capital" }, options: ["none", "plain", "round"], labels: { none: { de: "keins", en: "none" }, plain: { de: "Platte", en: "slab" }, round: { de: "Wulst", en: "torus" } }, default: "round" },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["stone", "paint", "metal"], labels: { stone: { de: "Stein", en: "Stone" }, paint: { de: "lackiert", en: "Painted" }, metal: { de: "Metall", en: "Metal" } }, default: "stone" },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#d8d2c4" },
  },
  budget: { triangles: 8000, drawCalls: 1 },
  build(p) {
    const m = material(p.material, p.color, 0.6);
    const t = new Parts();
    const r = p.radius, unten = p.base ? r * 0.35 : 0, oben = p.capital === "none" ? 0 : r * 0.4;
    const schaft = p.height - unten - oben, segmente = p.flutes ? p.flutes * 6 : 32;
    const g = new CylinderGeometry(r * (1 - p.taper), r, schaft, segmente, 6, true);
    if (p.flutes) {
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i), w = Math.atan2(z, x), f = 1 - 0.035 * (1 + Math.cos(p.flutes * w));
        pos.setX(i, x * f); pos.setZ(i, z * f);
      }
      g.computeVertexNormals();
    }
    g.translate(0, unten + schaft / 2, 0);
    t.add(m, g);
    if (p.base) {
      const profil = [new Vector2(0, 0), new Vector2(r * 1.35, 0), new Vector2(r * 1.35, unten * 0.4), new Vector2(r * 1.15, unten * 0.7), new Vector2(r * 1.05, unten), new Vector2(0, unten)];
      t.add(m, new LatheGeometry(profil, 32));
    }
    if (p.capital === "plain") t.box(m, r * 2.6, oben, r * 2.6, 0, p.height - oben / 2, 0);
    if (p.capital === "round") {
      const y = p.height - oben;
      const profil = [new Vector2(0, y), new Vector2(r * (1 - p.taper), y), new Vector2(r * 1.25, y + oben * 0.45), new Vector2(r * 1.4, y + oben * 0.6), new Vector2(r * 1.4, p.height), new Vector2(0, p.height)];
      t.add(m, new LatheGeometry(profil, 32));
    }
    return t.group();
  },
});
