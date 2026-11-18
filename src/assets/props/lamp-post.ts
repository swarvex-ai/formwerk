import { CylinderGeometry, SphereGeometry, TorusGeometry } from "three";
import { rounded, turned } from "../shapes";
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
      describe: { de: "Länge des Auslegers: 0 die Leuchte sitzt oben auf, 0,6 m im Park, 1,5 m über einer Fahrbahn; eine hängende Leuchte rückt so weit aus, dass sie den Mast nicht berührt.", en: "Length of the arm: 0 the light sits on top, 0.6 m in a park, 1.5 m over a road; a hanging light moves out far enough to clear the post." } },
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
  budget: { triangles: 8000, drawCalls: 2 },
  build(p) {
    // Painted cast iron: clean metal without rust
    const mast = material("metal", p.color), licht = material("glow", p.light), t = new Parts(), h = p.height;
    // An arc about the point r, y from the angle a0 to a1 (degrees, 0 = outwards): torus and cove mouldings
    const bogen = (r: number, y: number, rad: number, a0: number, a1: number, n: number): [number, number][] =>
      Array.from({ length: n + 1 }, (_, i) => { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; return [r + rad * Math.cos(a), y + rad * Math.sin(a)]; });
    // Foot: a plinth with a chamfer, a torus, a cove into the waist, a fillet ring under the shaft
    const fuss = Math.min(0.9, 0.1 + 0.2 * h), R = 0.2, r0 = 0.07, r1 = 0.048;
    t.add(mast, turned([[0.001, 0], [R, 0], [R, 0.05], [R - 0.012, 0.062], ...bogen(0.17, 0.09, 0.028, -60, 90, 7),
      ...bogen(0.16, 0.168, 0.05, -90, -180, 6), [0.094, 0.168 + 0.45 * (fuss - 0.288)], [0.086, fuss - 0.12], ...bogen(0.09, fuss - 0.08, 0.02, -90, 90, 6),
      [0.106, fuss - 0.05], [0.106, fuss - 0.03], [0.09, fuss - 0.016], [r0 + 0.004, fuss - 0.008], [r0, fuss]], 24));
    // Shaft: a tapered column with a collar ring above the foot, the collar of the arm and a cap on top
    const ya = h - 0.15, rS = (y: number) => r0 + ((r1 - r0) * (y - fuss)) / (h - 0.06 - fuss);
    const ring = (y: number, d: number): [number, number][] => [[rS(y - 0.04), y - 0.04], [rS(y) + d * 0.7, y - 0.03], [rS(y) + d, y - 0.012], [rS(y) + d, y + 0.012], [rS(y) + d * 0.7, y + 0.03], [rS(y + 0.04), y + 0.04]];
    t.add(mast, turned([[r0, fuss - 0.02], ...ring(fuss + 0.3, 0.022), ...ring(ya, 0.028), [r1, h - 0.06], [r1 + 0.018, h - 0.05],
      [r1 + 0.026, h - 0.03], [r1 + 0.026, h - 0.012], [r1 + 0.012, h], [0.001, h]], 16));
    // Two heads need an arm to sit on; a hanging head moves out until it clears the shaft and its collar by 2 cm
    const w = 0.2, Rr = (w / 2 + 0.035) * Math.SQRT2, kr = rS(ya) + 0.028;
    const frei = p.style === "lantern" ? Rr + kr + 0.02 : p.style === "globe" ? Math.max(0.09, 0.17) + kr + 0.02 : 0;
    const arm0 = p.heads === 2 ? Math.max(0.35, p.arm) : p.arm, arm = arm0 >= 0.05 ? Math.max(frei, arm0) : arm0;
    const ar = 0.022, haengt = arm >= 0.05, yh = ya - ar - 0.05;
    // A turned socket from the cap of the post up to a head standing on top (0.06 m)
    const sockel = (oben: number) => t.add(mast, turned([[r1 + 0.01, h - 0.004], [0.04, h + 0.012], [0.034, h + 0.028], [0.05, h + 0.045], [oben, h + 0.052], [oben, h + 0.06], [0.001, h + 0.06]], 16));
    // A head: hanging, it meets the drop under the arm end at yh; standing, it sits on the socket on the post
    const kopf = (x: number) => {
      if (p.style === "lantern") {
        const bh = 0.28, rh = 0.12, rr = 0.03, rt = 0.006;
        // From the base plate to the finial tip: 0.514 m; hanging, the tip sits in the tube of the hook ring
        const y0 = haengt ? yh - 2 * rr + 2 * rt - 0.514 : h + 0.06;
        if (haengt) {
          t.add(mast, new TorusGeometry(rr - rt, rt, 8, 20).translate(x, yh - rr + rt, 0));
          // A drip knob under the base plate
          t.add(mast, turned([[0.001, 0], [0.01, 0.008], [0.016, 0.022], [0.034, 0.04], [0.001, 0.042]], 12, x, y0 - 0.04, 0));
        } else sockel(0.08);
        t.add(mast, rounded(w + 0.03, 0.025, w + 0.03, 0.006, x, y0 + 0.0125, 0));
        const y1 = y0 + 0.025 + bh, k = w / 2 - 0.007;
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(mast, rounded(0.014, bh + 0.004, 0.014, 0.003, x + sx * k, y0 + 0.025 + bh / 2, sz * k));
        // Four panes between the corner bars, their edges in the bars
        for (const s of [-1, 1]) {
          t.box(licht, w - 0.012, bh, 0.004, x, y0 + 0.025 + bh / 2, s * k);
          t.box(licht, 0.004, bh, w - 0.012, x + s * k, y0 + 0.025 + bh / 2, 0);
        }
        t.add(mast, rounded(w + 0.012, 0.02, w + 0.012, 0.004, x, y1 + 0.01, 0));
        // A pyramid roof with its rim bent down, flat faces, 2 mm into the top frame
        const dach = turned([[0.001, 0], [Rr - 0.006, 0], [Rr, 0.002], [Rr, 0.01], [Rr - 0.012, 0.026], [0.04, 0.016 + rh], [0.001, 0.016 + rh]], 4).rotateY(Math.PI / 4).toNonIndexed();
        dach.computeVertexNormals();
        t.add(mast, dach.translate(x, y1 + 0.018, 0));
        t.add(mast, turned([[0.012, 0], [0.016, 0.01], [0.008, 0.02], [0.013, 0.035], [0.006, 0.05], [0.001, 0.058]], 8, x, y1 + 0.02 + 0.016 + rh - 0.005, 0));
      } else if (p.style === "globe") {
        // The globe sits in a turned collar: on the post, or hanging under the drop (the collar upside down)
        const kragen = turned([[0.001, 0.004], [0.03, 0], [0.042, 0.02], [0.05, 0.042], [0.072, 0.062], [0.09, 0.072], [0.09, 0.08], [0.082, 0.08], [0.001, 0.05]], 24);
        const rand = haengt ? yh + 0.002 - 0.08 : h - 0.004 + 0.08;
        t.add(mast, haengt ? kragen.rotateX(Math.PI).translate(x, yh + 0.002, 0) : kragen.translate(x, h - 0.004, 0));
        // At 0.148 m from its centre the globe is as wide as the inner rim of the collar
        t.add(licht, new SphereGeometry(0.17, 24, 12).translate(x, rand + (haengt ? -0.148 : 0.148), 0));
      } else {
        // A flat housing with rounded edges: the arm runs into its inner end; on the post it sits on a socket
        const yc = haengt ? ya : h + 0.06 + 0.035, xc = haengt ? x + Math.sign(x) * 0.175 : x;
        if (!haengt) sockel(0.06);
        t.add(mast, rounded(0.55, 0.07, 0.24, 0.015, xc, yc, 0, 3));
        // The lens set into the underside, 2 mm proud
        t.add(licht, rounded(0.45, 0.012, 0.17, 0.004, xc, yc - 0.035 + 0.004, 0));
      }
    };
    if (!haengt) kopf(0);
    else for (const s of p.heads === 2 ? [-1, 1] : [1]) {
      // The arm runs from the axis of the post through its collar
      t.add(mast, new CylinderGeometry(ar, ar, arm, 16).rotateZ(Math.PI / 2).translate((s * arm) / 2, ya, 0));
      // Brace at 45° from the axis of the post to the axis of the arm, so both ends are buried; none on a short arm
      const r = Math.min(arm * 0.6, 0.45);
      if (r >= 0.15) t.add(mast, new CylinderGeometry(0.015, 0.015, r * Math.SQRT2, 8).rotateZ((-s * Math.PI) / 4).translate((s * r) / 2, ya - r / 2, 0));
      if (p.style !== "modern") {
        // A ball on the arm end and the drop down to the head
        t.add(mast, new SphereGeometry(0.03, 16, 8).translate(s * arm, ya, 0));
        t.add(mast, new CylinderGeometry(0.01, 0.012, ya - yh + 0.004, 8).translate(s * arm, (ya + yh - 0.004) / 2, 0));
      }
      kopf(s * arm);
    }
    return t.cylinder(R, h).group();
  },
});
