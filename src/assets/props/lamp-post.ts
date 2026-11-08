import { ConeGeometry, CylinderGeometry, SphereGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const lampPost = defineAsset({
  id: "lamp-post", category: "props",
  title: { de: "Straßenlaterne", en: "Lamp post" },
  description: { de: "Eine Straßenlaterne: Laterne auf dem Mast wie in der Altstadt, Kugelleuchten im Park oder flache Leuchte am Ausleger; ein oder zwei Köpfe, das Licht leuchtet.", en: "A lamp post: a lantern on top like in an old town, globe lights in a park or a flat light on an arm; one or two heads, the light glows." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 2, max: 7, step: 0.05, default: 3.5, unit: "m",
      describe: { de: "Höhe des Masts: 3 m im Park und in der Altstadt, 6 m an einer Straße.", en: "Height of the post: 3 m in a park or an old town, 6 m along a road." } },
    arm: { type: "number", label: { de: "Ausleger", en: "Arm" }, min: 0, max: 1.6, step: 0.05, default: 0.6, unit: "m",
      describe: { de: "Länge des Auslegers: 0 die Leuchte sitzt oben auf, 0,6 m im Park, 1,5 m über einer Fahrbahn.", en: "Length of the arm: 0 the light sits on top, 0.6 m in a park, 1.5 m over a road." } },
    heads: { type: "integer", label: { de: "Köpfe", en: "Heads" }, min: 1, max: 2, default: 1,
      describe: { de: "Ein Kopf oder zwei gegenüber an beiden Seiten.", en: "One head or two facing each other on both sides." } },
    style: { type: "choice", label: { de: "Leuchte", en: "Light" }, options: ["lantern", "globe", "modern"], labels: { lantern: { de: "Laterne", en: "Lantern" }, globe: { de: "Kugel", en: "Globe" }, modern: { de: "Modern", en: "Modern" } }, default: "lantern",
      describe: { de: "Laterne mit Dach wie früher, Kugel wie im Park, flache moderne Leuchte wie an Straßen.", en: "A lantern with a roof like in the old days, a globe like in a park, a flat modern light like on roads." } },
    color: { type: "color", label: { de: "Mast", en: "Post" }, default: "#2b2f33",
      describe: { de: "Farbe von Mast und Gehäuse.", en: "Colour of the post and housing." } },
    light: { type: "color", label: { de: "Licht", en: "Light" }, default: "#ffd27a",
      describe: { de: "Farbe des Lichts: warm #ffd27a wie alte Gaslampen, kalt #e6f0ff wie LED.", en: "Colour of the light: warm #ffd27a like old gas lamps, cold #e6f0ff like LEDs." } },
  },
  presets: {
    "old-town": { label: { de: "Altstadt", en: "Old town" }, values: { height: 3.2, arm: 0, style: "lantern" } },
    park: { label: { de: "Park", en: "Park" }, values: { height: 3, arm: 0.5, heads: 2, style: "globe" } },
    street: { label: { de: "Straße", en: "Street" }, values: { height: 6, arm: 1.5, style: "modern", light: "#e6f0ff" } },
  },
  physics: { body: "static", collider: "cylinder" },
  budget: { triangles: 3000, drawCalls: 2 },
  build(p) {
    const mast = material("metal", p.color), licht = material("glow", p.light), t = new Parts(), h = p.height;
    t.add(mast, new CylinderGeometry(0.1, 0.13, 0.35, 12).translate(0, 0.175, 0));
    t.add(mast, new CylinderGeometry(0.045, 0.06, h - 0.35, 10).translate(0, 0.35 + (h - 0.35) / 2, 0));
    // Two heads need an arm to sit on
    const arm = p.heads === 2 ? Math.max(0.35, p.arm) : p.arm;
    const kopf = (x: number, oben: boolean) => {
      // `oben`: standing on top of the post; otherwise hanging below the end of the arm
      if (p.style === "lantern") {
        const y = oben ? h + 0.03 : h - 0.1 - 0.42;
        t.box(mast, 0.08, 0.04, 0.08, x, y, 0);
        t.box(licht, 0.17, 0.26, 0.17, x, y + 0.15, 0);
        for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) t.box(mast, 0.02, 0.28, 0.02, x + sx * 0.095, y + 0.15, sz * 0.095);
        t.add(mast, new ConeGeometry(0.17, 0.14, 4).rotateY(Math.PI / 4).translate(x, y + 0.35, 0));
        if (!oben) t.box(mast, 0.02, 0.1, 0.02, x, h - 0.1 - 0.05, 0);
      } else if (p.style === "globe") {
        const y = oben ? h + 0.2 : h - 0.1 - 0.2;
        t.add(licht, new SphereGeometry(0.17, 14, 10).translate(x, y, 0));
        t.add(mast, new CylinderGeometry(0.05, 0.07, 0.06, 10).translate(x, oben ? h + 0.02 : y + 0.18, 0));
      } else {
        const y = oben ? h + 0.04 : h - 0.1;
        t.box(mast, 0.55, 0.07, 0.24, x + (oben ? 0 : Math.sign(x) * 0.15), y, 0);
        t.box(licht, 0.45, 0.02, 0.18, x + (oben ? 0 : Math.sign(x) * 0.15), y - 0.045, 0);
      }
    };
    if (arm < 0.05) kopf(0, true);
    else for (const s of p.heads === 2 ? [-1, 1] : [1]) {
      t.box(mast, arm, 0.05, 0.05, (s * arm) / 2, h - 0.1, 0);
      t.add(mast, new CylinderGeometry(0.03, 0.03, 0.4, 6).rotateZ(s * 0.9).translate(s * Math.min(arm * 0.5, 0.2), h - 0.25, 0));
      kopf(s * arm, false);
    }
    return t.cylinder(0.13, h).group();
  },
});
