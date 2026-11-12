import { CatmullRomCurve3, CircleGeometry, LatheGeometry, TorusGeometry, Vector2, Vector3 } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const vase = defineAsset({
  id: "vase", category: "props",
  title: { de: "Vase", en: "Vase" },
  description: { de: "Ein gedrehtes Gefäß aus einer Profilkurve: Vase, Amphore, Krug oder Topf, mit hohler Öffnung und bis zu zwei Henkeln.", en: "A turned vessel from one profile curve: vase, amphora, jug or pot, with a hollow opening and up to two handles." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.1, max: 1.2, step: 0.01, default: 0.35, unit: "m",
      describe: { de: "Gesamthöhe: 0,2 m ein Topf, 0,35 m eine Blumenvase, 0,7 m eine Amphore.", en: "Overall height: 0.2 m a pot, 0.35 m a flower vase, 0.7 m an amphora." } },
    belly: { type: "number", label: { de: "Bauch", en: "Belly" }, min: 0.15, max: 0.5, step: 0.01, default: 0.3,
      describe: { de: "Radius an der weitesten Stelle als Anteil der Höhe: 0,22 schlanke Amphore, 0,3 Vase, 0,5 breiter Topf.", en: "Radius at the widest point as a share of the height: 0.22 a slim amphora, 0.3 a vase, 0.5 a wide pot." } },
    bellyHeight: { type: "number", label: { de: "Bauchhöhe", en: "Belly height" }, min: 0.2, max: 0.8, step: 0.01, default: 0.45,
      describe: { de: "Wo der Bauch sitzt, als Anteil der Höhe: 0,45 mittig, 0,6 eine Amphore mit hoher Schulter.", en: "Where the widest point sits, as a share of the height: 0.45 centred, 0.6 an amphora with a high shoulder." } },
    neck: { type: "number", label: { de: "Hals", en: "Neck" }, min: 0.2, max: 1, step: 0.01, default: 0.45,
      describe: { de: "Halsradius als Anteil des Bauchradius: 0,3 enger Hals, 0,55 ein Krug, 1 kein Hals (Topf).", en: "Neck radius as a share of the belly radius: 0.3 a narrow neck, 0.55 a jug, 1 no neck (a pot)." } },
    lip: { type: "number", label: { de: "Lippe", en: "Lip" }, min: 0, max: 0.03, step: 0.001, default: 0.008, unit: "m",
      describe: { de: "Wie weit der Rand nach außen schwingt: 0 gerade, 0,008 m eine Vase, 0,015 m ein Topf.", en: "How far the rim flares outward: 0 straight, 0.008 m a vase, 0.015 m a pot." } },
    handles: { type: "integer", label: { de: "Henkel", en: "Handles" }, min: 0, max: 2, default: 0,
      describe: { de: "Henkel von der Schulter zum Hals: 0 keine, 1 ein Krug (auf +x), 2 eine Amphore.", en: "Handles from shoulder to neck: 0 none, 1 a jug (on +x), 2 an amphora." } },
    colour: { type: "color", label: { de: "Glasur", en: "Glaze" }, default: "#b5653f",
      describe: { de: "Farbe der Glasur oder des Tons.", en: "Colour of the glaze or the clay." } },
  },
  presets: {
    "flower-vase": { label: { de: "Blumenvase", en: "Flower vase" }, values: { height: 0.35 } },
    amphora: { label: { de: "Amphore", en: "Amphora" }, values: { height: 0.7, belly: 0.22, bellyHeight: 0.6, neck: 0.3, handles: 2 } },
    jug: { label: { de: "Krug", en: "Jug" }, values: { height: 0.25, belly: 0.36, neck: 0.55, handles: 1 } },
    "clay-pot": { label: { de: "Tontopf", en: "Clay pot" }, values: { height: 0.2, belly: 0.5, bellyHeight: 0.5, neck: 1, lip: 0.015 } },
  },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 3000, drawCalls: 2 },
  build(p) {
    const h = p.height, rb = p.belly * h, rn = rb * p.neck, wall = 0.008;
    // Hollow vessel drawn as a solid-looking volume: effective density for its mass
    const glasur = material("paint", p.colour, 1, 400);
    const kurve = new CatmullRomCurve3([
      new Vector3(rb * 0.6, 0, 0), new Vector3(rb, h * p.bellyHeight, 0), new Vector3(rn, h * 0.85, 0), new Vector3(rn + p.lip, h, 0),
    ], false, "centripetal");
    const aussen = kurve.getPoints(23).map((v) => new Vector2(Math.max(0.002, v.x), v.y));
    // One closed profile: up the outside, over the rim, down the inside to just above the floor
    const innen = aussen.slice().reverse().filter((v) => v.y >= 0.01).map((v) => new Vector2(Math.max(0.002, v.x - wall), v.y));
    const profil = [...aussen, ...innen, new Vector2(0, Math.max(0.01, innen[innen.length - 1].y))];
    const t = new Parts().add(glasur, new LatheGeometry(profil, 24));
    t.add(glasur, new CircleGeometry(aussen[0].x, 24).rotateX(Math.PI / 2));
    // Handles: half-ring arcs from the shoulder to the neck, bulging outward
    const radiusBei = (y: number) => kurve.getPoint(Math.min(1, Math.max(0, aussen.findIndex((v) => v.y >= y) / 23))).x;
    const ys = h * (0.5 + 0.5 * p.bellyHeight) * 0.97, yn = h * 0.85;
    const a = new Vector2(radiusBei(ys), ys), b = new Vector2(radiusBei(yn), yn), d = b.clone().sub(a);
    const dreh = Math.atan2(d.y, d.x) - Math.PI / 2 + Math.PI; // arc opens towards the vessel wall
    for (let k = 0; k < p.handles; k++) {
      const g = new TorusGeometry(d.length() / 2, 0.012 * (h / 0.35), 8, 12, Math.PI).rotateZ(dreh + Math.PI).translate((a.x + b.x) / 2, (a.y + b.y) / 2, 0);
      t.add(glasur, k === 1 ? g.rotateY(Math.PI) : g);
    }
    return t.group();
  },
});
