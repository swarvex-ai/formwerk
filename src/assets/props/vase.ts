import { CatmullRomCurve3, TubeGeometry, Vector2, Vector3 } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { turned } from "../shapes";

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
  budget: { triangles: 9000, drawCalls: 1 },
  build(p) {
    const h = p.height, rb = p.belly * h, rn = rb * p.neck;
    // Hollow vessel drawn as a solid-looking volume: effective density for its mass; a glaze is smooth
    const glasur = material("paint", p.colour, 1, 400);
    // Thrown on the wheel: foot ring 6 mm high and set in 3 mm, wall 7 mm, floor 1 cm above the ground
    const fuss = 0.006, rf = rb * 0.6 - 0.003, ring = Math.min(0.008, rf * 0.4), mulde = 0.003, boden = 0.01;
    const wand = Math.min(0.007, rn * 0.5), rTop = rn + p.lip, rl = Math.min(Math.max(0.003, p.lip / 2 + 0.002), rTop * 0.45);
    const kurve = new CatmullRomCurve3([
      new Vector3(rb * 0.6, 0, 0), new Vector3(rb, h * p.bellyHeight, 0), new Vector3(rn, h * 0.85, 0), new Vector3(rTop, h, 0),
    ], false, "centripetal");
    // The same curve, set on the foot ring and ending under the rolled lip
    const aussen = kurve.getPoints(47).map((v): [number, number] => [Math.max(0.002, v.x), fuss + (v.y / h) * (h - rl - fuss)]);
    const profil: [number, number][] = [
      [0.001, mulde], [rf - ring, mulde], [rf - ring + 0.0015, 0], [rf - 0.0015, 0], [rf, 0.0015], [rf, fuss - 0.001], [rf + 0.001, fuss],
      ...aussen,
    ];
    // Rolled lip: a half-round over the rim from the outside to the inside
    for (let i = 1; i <= 5; i++) {
      const a = (Math.PI * i) / 5;
      profil.push([rTop - rl + rl * Math.cos(a), h - rl + rl * Math.sin(a)]);
    }
    // Down the inner wall to the floor: the vessel stays open, inner faces point inward
    const innen = aussen.slice().reverse().filter(([, y]) => y < h - rl - 0.002 && y > boden + 0.002);
    for (const [x, y] of innen) profil.push([Math.max(0.001, x - wand), y]);
    profil.push([Math.max(0.001, radiusBei(boden) - wand), boden], [0.001, boden]);
    const t = new Parts().add(glasur, turned(profil, 32));

    // Outside radius and outward normal of the profile at height y
    function radiusBei(y: number) { return wandBei(y).x; }
    function wandBei(y: number) {
      let i = aussen.findIndex(([, v]) => v >= y);
      i = Math.min(aussen.length - 1, Math.max(1, i));
      const [x0, y0] = aussen[i - 1], [x1, y1] = aussen[i], f = Math.min(1, Math.max(0, (y - y0) / (y1 - y0 || 1)));
      const n = new Vector2(y1 - y0, -(x1 - x0)).normalize();
      return { x: x0 + (x1 - x0) * f, n };
    }
    // Strap handles from the shoulder to the neck: a half-oval loop, both ends sunk 4 mm (plus the curve of the wall)
    // into the wall along its normal
    const yn = h * 0.85, ys = Math.min(h * (0.5 + 0.5 * p.bellyHeight) * 0.97, yn - h * 0.07);
    const breite = 0.03 * (h / 0.35), dicke = breite / 2.5;
    const punkt = (y: number, k: number) => {
      const w = wandBei(y);
      return new Vector3(w.x + w.n.x * k, y + w.n.y * k, 0);
    };
    const tief = (y: number) => -Math.min(wand * 0.85, 0.004 + (breite / 2) ** 2 / (2 * radiusBei(y)));
    const a = punkt(ys, 0), b = punkt(yn, 0), mitte = a.clone().add(b).multiplyScalar(0.5), u = b.clone().sub(a).multiplyScalar(0.5);
    const v = new Vector3(u.y, -u.x, 0).normalize();
    if (v.x < 0) v.negate();
    v.multiplyScalar(Math.max(0.03 * (h / 0.35), u.length() * 0.7));
    const bogen = [1, 2, 3, 4, 5, 6, 7].map((i) => {
      const w = (Math.PI * i) / 8;
      return mitte.clone().addScaledVector(u, -Math.cos(w)).addScaledVector(v, Math.sin(w));
    });
    const henkel = new CatmullRomCurve3([punkt(ys, tief(ys)), punkt(ys, dicke * 0.6), ...bogen, punkt(yn, dicke * 0.6), punkt(yn, tief(yn))], false, "centripetal");
    for (let k = 0; k < p.handles; k++) {
      const g = new TubeGeometry(henkel, 32, dicke / 2, 10, false).scale(1, 1, 2.5);
      t.add(glasur, k === 1 ? g.rotateY(Math.PI) : g);
    }
    return t.group();
  },
});
