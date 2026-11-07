import { CylinderGeometry, LatheGeometry, Vector2 } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const column = defineAsset({
  id: "column", category: "architecture",
  title: { de: "Säule", en: "Column" },
  description: { de: "Säule mit Kanneluren, Verjüngung, Basis und Kapitell.", en: "A column with flutes, taper, base and capital." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1, max: 8, step: 0.1, default: 3, unit: "m",
      describe: { de: "Gesamthöhe mit Basis und Kapitell.", en: "Total height including base and capital." } },
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.1, max: 0.6, step: 0.01, default: 0.25, unit: "m",
      describe: { de: "Radius des Schafts unten.", en: "Radius of the shaft at the bottom." } },
    flutes: { type: "integer", label: { de: "Kanneluren", en: "Flutes" }, min: 0, max: 32, default: 16,
      describe: { de: "Senkrechte Rillen im Schaft; 0 macht ihn glatt, klassisch sind 20 bis 24.", en: "Vertical grooves in the shaft; 0 makes it smooth, 20 to 24 is classical." } },
    taper: { type: "number", label: { de: "Verjüngung", en: "Taper" }, min: 0, max: 0.3, step: 0.01, default: 0.12,
      describe: { de: "Wie stark der Schaft nach oben schmaler wird, als Anteil des Radius.", en: "How much the shaft narrows towards the top, as a fraction of the radius." } },
    base: { type: "boolean", label: { de: "Basis", en: "Base" }, default: true,
      describe: { de: "Profilierter Sockel unten.", en: "A moulded base at the bottom." } },
    capital: { type: "choice", label: { de: "Kapitell", en: "Capital" }, options: ["none", "plain", "round"], labels: { none: { de: "keins", en: "none" }, plain: { de: "Platte", en: "slab" }, round: { de: "Wulst", en: "torus" } }, default: "round",
      describe: { de: "Abschluss oben: keiner, eine Platte oder ein Wulst mit Platte.", en: "The top: none, a slab, or a torus with a slab." } },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["stone", "paint", "metal"], labels: { stone: { de: "Stein", en: "Stone" }, paint: { de: "lackiert", en: "Painted" }, metal: { de: "Metall", en: "Metal" } }, default: "stone",
      describe: { de: "Stein mit Struktur, lackiert oder Metall.", en: "Textured stone, painted or metal." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#d8d2c4",
      describe: { de: "Grundfarbe des Materials.", en: "Base colour of the material." } },
  },
  presets: {
    doric: { label: { de: "Dorisch", en: "Doric" }, values: { height: 4, flutes: 20, base: false, capital: "plain" } },
    temple: { label: { de: "Tempelsäule", en: "Temple column" }, values: { height: 6, radius: 0.45, flutes: 24 } },
    "modern-pillar": { label: { de: "Moderner Pfeiler", en: "Modern pillar" }, values: { flutes: 0, taper: 0, base: false, capital: "none", material: "paint", color: "#e9e6df" } },
  },
  physics: { body: "static", collider: "hull" },
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
