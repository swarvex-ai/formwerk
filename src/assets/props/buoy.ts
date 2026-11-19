import { CylinderGeometry, SphereGeometry, TorusGeometry } from "three";
import { turned } from "../shapes";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const buoy = defineAsset({
  id: "buoy", category: "props",
  title: { de: "Boje", en: "Buoy" },
  description: { de: "Eine Schwimmboje für Hafen und Fahrwasser: als Tonne, Kegel oder Kugel, mit Farbbändern und optionalem Toppzeichen auf dünnem Mast.", en: "A floating navigation buoy for harbour and fairway: a can, a cone or a sphere, with colour bands and an optional top mark on a thin mast." },
  params: {
    shape: { type: "choice", label: { de: "Form", en: "Shape" }, options: ["can", "cone", "sphere"], labels: { can: { de: "Tonne", en: "Can" }, cone: { de: "Kegel", en: "Cone" }, sphere: { de: "Kugel", en: "Sphere" } }, default: "can",
      describe: { de: "Tonne mit flachem Deckel, Kegel auf kurzem Zylinder oder Kugel.", en: "A can with a flat top, a cone on a short cylinder, or a sphere." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.6, max: 2.5, step: 0.01, default: 1.2, unit: "m",
      describe: { de: "Höhe des Körpers ohne Toppzeichen: 0,6 m eine kleine Hafenboje, 1,2 m eine übliche Fahrwasserboje, 2,5 m eine große Seezeichenboje.", en: "Height of the body without the top mark: 0.6 m a small harbour buoy, 1.2 m a usual fairway buoy, 2.5 m a large seamark buoy." } },
    diameter: { type: "number", label: { de: "Durchmesser", en: "Diameter" }, min: 0.4, max: 1.5, step: 0.01, default: 0.8, unit: "m",
      describe: { de: "Größter Durchmesser des Körpers: 0,4 m eine schlanke Tonne, 0,8 m üblich, 1,5 m eine breite Großtonne.", en: "Largest diameter of the body: 0.4 m a slim can, 0.8 m usual, 1.5 m a wide large buoy." } },
    stripes: { type: "integer", label: { de: "Streifen", en: "Stripes" }, min: 0, max: 4, default: 0,
      describe: { de: "Zahl der waagerechten Farbbänder, gleichmäßig über den Körper verteilt; 0 ohne Bänder.", en: "Number of horizontal colour bands, evenly spaced over the body; 0 for no bands." } },
    topMark: { type: "boolean", label: { de: "Toppzeichen", en: "Top mark" }, default: false,
      describe: { de: "Dünner Mast mit kleiner Tonne, Kegel oder Kugel als Toppzeichen; aus bleibt der Körper oben frei.", en: "A thin mast with a small can, cone or ball as top mark; off leaves the body top clear." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#c8372d",
      describe: { de: "Farbe des Körpers, z. B. Rot #c8372d für Backbord oder Grün #2f7a3a für Steuerbord.", en: "Colour of the body, e.g. red #c8372d for port or green #2f7a3a for starboard." } },
    stripeColour: { type: "color", label: { de: "Streifenfarbe", en: "Stripe colour" }, default: "#f2efe6",
      describe: { de: "Farbe der Farbbänder, z. B. Weiß #f2efe6 oder Schwarz #1c1c1c für Kardinalzeichen.", en: "Colour of the bands, e.g. white #f2efe6 or black #1c1c1c for cardinal marks." } },
  },
  presets: {
    port: { label: { de: "Backbord", en: "Port" }, values: { shape: "can", colour: "#c8372d" } },
    starboard: { label: { de: "Steuerbord", en: "Starboard" }, values: { shape: "cone", colour: "#2f7a3a", topMark: true } },
    cardinal: { label: { de: "Kardinal", en: "Cardinal" }, values: { shape: "sphere", colour: "#e8c21a", stripeColour: "#1c1c1c", stripes: 2, topMark: true } },
  },
  physics: { body: "dynamic", collider: "cylinder" },
  budget: { triangles: 3000, drawCalls: 4 },
  build(p) {
    const h = p.height, r = p.diameter / 2, ch = 0.15 * h, bh = h - ch, seg = 32;
    const body = material("paint", p.colour, 1, 150), band = material("paint", p.stripeColour, 1, 150), metal = material("metal", "#3a3a3a");
    const iron = material("iron", "#3a3a3a", 3, undefined, { rust: 0.35 });
    const t = new Parts();
    const isSphere = p.shape === "sphere", cylH = p.shape === "cone" ? bh * 0.55 : 0, coneH = bh - cylH, joint = ch + cylH;
    const ballR = Math.min(r, bh / 2), cy = ch + ballR, bodyTop = isSphere ? cy + ballR : h;
    // A rounded corner of radius e at b between the edges to a and to c: tangent point, middle of the arc, tangent point
    const fillet = (a: [number, number], b: [number, number], c: [number, number], e: number): [number, number][] => {
      const la = Math.hypot(a[0] - b[0], a[1] - b[1]), lc = Math.hypot(c[0] - b[0], c[1] - b[1]);
      const u = [(a[0] - b[0]) / la, (a[1] - b[1]) / la], v = [(c[0] - b[0]) / lc, (c[1] - b[1]) / lc];
      const half = Math.acos(Math.min(1, Math.max(-1, u[0] * v[0] + u[1] * v[1]))) / 2, d = e / Math.tan(half);
      const bl = Math.hypot(u[0] + v[0], u[1] + v[1]), k = e / Math.sin(half) - e;
      return [[b[0] + u[0] * d, b[1] + u[1] * d], [b[0] + ((u[0] + v[0]) / bl) * k, b[1] + ((u[1] + v[1]) / bl) * k], [b[0] + v[0] * d, b[1] + v[1] * d]];
    };
    // A closed can profile from y0 to y1 with both edges rounded by e
    const can = (rad: number, y0: number, y1: number, e: number): [number, number][] =>
      [[0, y0], ...fillet([0, y0], [rad, y0], [rad, y1], e), ...fillet([rad, y0], [rad, y1], [0, y1], e), [0, y1]];
    // A closed circle profile of radius rad around yc, bottom to top
    const ball = (rad: number, yc: number, steps: number): [number, number][] =>
      Array.from({ length: steps + 1 }, (_, i): [number, number] => [rad * Math.sin((Math.PI * i) / steps), yc - rad * Math.cos((Math.PI * i) / steps)]);
    // Hollow: an effective density for the mass estimate. The ballast tail reaches 1 cm up into the body.
    const cwR = isSphere ? Math.min(0.35 * p.diameter, 0.8 * ballR) : 0.35 * p.diameter;
    t.add(iron, turned([[0, 0], ...fillet([0, 0], [cwR, 0], [cwR, ch + 0.01], 0.01), [cwR, ch + 0.01], [0, ch + 0.01]], seg));
    let prof: [number, number][] = [];
    if (p.shape === "can") {
      t.add(body, turned(prof = can(r, ch, h, 0.02), seg));
    } else if (p.shape === "cone") {
      // Blunted tip: the cone ends at radius 0.02 m, then a round cap to the axis
      const tip = fillet([r, joint], [0, h], [-r, joint], (0.02 * Math.hypot(r, coneH)) / coneH).slice(0, 2);
      t.add(body, turned(prof = [[0, ch], ...fillet([0, ch], [r, ch], [r, joint], 0.02), ...fillet([r, ch], [r, joint], [0, h], 0.015), ...tip], seg));
    } else t.add(body, turned(prof = ball(ballR, cy, 16), seg));
    const top = prof[prof.length - 1][1];
    // Radius of the body at y, from its profile (the widest edge at that height)
    const radAt = (y: number) => {
      let best = 0;
      for (let i = 1; i < prof.length; i++) {
        const [ra, ya] = prof[i - 1], [rb, yb] = prof[i];
        if (y < Math.min(ya, yb) - 1e-9 || y > Math.max(ya, yb) + 1e-9) continue;
        best = Math.max(best, Math.abs(yb - ya) < 1e-9 ? Math.max(ra, rb) : ra + ((rb - ra) * (y - ya)) / (yb - ya));
      }
      return best;
    };
    // Bands: equal periods, the lower half of each in the stripe colour, just outside the body
    const y0base = ch, span = isSphere ? 2 * ballR : bh;
    for (let i = 0; i < p.stripes; i++) {
      const y0 = y0base + (span * i) / p.stripes, y1 = y0base + (span * (i + 0.5)) / p.stripes;
      if (p.shape === "sphere") {
        const theta = (y: number) => Math.acos(Math.min(1, Math.max(-1, (y - cy) / ballR)));
        const ts = theta(y1), tl = theta(y0) - ts;
        if (tl > 1e-4) t.add(band, new SphereGeometry(ballR + 0.003, seg, Math.max(2, Math.ceil(tl / (Math.PI / 32))), 0, Math.PI * 2, ts, tl).translate(0, cy, 0));
      } else {
        // The band follows the body profile: its ends plus every profile height in between.
        const ys = [...new Set([y0, ...prof.map(([, y]) => y).filter((y) => y > y0 && y < y1), y1])].sort((u, v) => u - v);
        t.add(band, turned(ys.map((y) => [radAt(y) + 0.003, y]), seg));
      }
    }
    if (p.topMark) {
      // The mast sinks 1 cm into the body and 1 cm into the mark
      const mastH = 0.3 * h, mastR = Math.max(0.008, 0.022 * p.diameter), markY = bodyTop + mastH, foot = Math.min(bodyTop, top) - 0.01;
      t.add(metal, new CylinderGeometry(mastR, mastR, markY + 0.01 - foot, 8).translate(0, (foot + markY + 0.01) / 2, 0));
      if (p.shape === "can") t.add(body, turned(can(0.12 * p.diameter, markY, markY + 0.15 * p.diameter, 0.005), 16));
      else if (p.shape === "cone") {
        const mr = 0.14 * p.diameter, mt = markY + 0.18 * p.diameter;
        t.add(body, turned([[0, markY], ...fillet([0, markY], [mr, markY], [0, mt], 0.005), ...fillet([mr, markY], [0, mt], [-mr, markY], 0.005).slice(0, 2)], 16));
      } else t.add(body, turned(ball(0.1 * p.diameter, markY + 0.1 * p.diameter, 8), 16));
    } else {
      // Lifting eye: an upright ring in the x–y plane, sunk 1 cm into the body top
      const er = 0.06 * p.diameter, et = 0.012 * p.diameter;
      t.add(metal, new TorusGeometry(er, et, 8, 24).translate(0, top - 0.01 + er + et, 0));
    }
    return t.cylinder(r, h).group();
  },
});
