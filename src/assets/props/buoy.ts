import { ConeGeometry, CylinderGeometry, SphereGeometry } from "three";
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
  budget: { triangles: 4000, drawCalls: 3 },
  build(p) {
    const h = p.height, r = p.diameter / 2, ch = 0.15 * h, bh = h - ch, seg = 20;
    const body = material("paint", p.colour, 1, 150), band = material("paint", p.stripeColour, 1, 150), metal = material("metal", "#3a3a3a");
    const t = new Parts();
    const isSphere = p.shape === "sphere", cylH = p.shape === "cone" ? bh * 0.55 : 0, coneH = bh - cylH, joint = ch + cylH;
    const ballR = Math.min(r, bh / 2), cy = ch + ballR, bodyTop = isSphere ? cy + ballR : h;
    // Hollow: an effective density for the mass estimate
    const cwR = isSphere ? Math.min(0.35 * p.diameter, 0.8 * ballR) : 0.35 * p.diameter;
    t.add(metal, new CylinderGeometry(cwR, cwR, ch, seg).translate(0, ch / 2, 0));
    const radAt = (y: number) => p.shape === "can" ? r : p.shape === "cone" ? (y <= joint ? r : r * Math.max(0, 1 - (y - joint) / coneH)) : Math.sqrt(Math.max(0, ballR * ballR - (y - cy) ** 2));
    if (p.shape === "can") t.add(body, new CylinderGeometry(r, r, bh, seg).translate(0, ch + bh / 2, 0));
    else if (p.shape === "cone") {
      t.add(body, new CylinderGeometry(r, r, cylH, seg).translate(0, ch + cylH / 2, 0));
      t.add(body, new ConeGeometry(r, coneH, seg).translate(0, joint + coneH / 2, 0));
    } else t.add(body, new SphereGeometry(ballR, seg, Math.max(8, Math.round(seg * 0.6))).translate(0, cy, 0));
    // Bands: equal periods, the lower half of each in the stripe colour, just outside the body
    const y0base = ch, span = isSphere ? 2 * ballR : bh;
    for (let i = 0; i < p.stripes; i++) {
      const y0 = y0base + (span * i) / p.stripes, y1 = y0base + (span * (i + 0.5)) / p.stripes;
      if (p.shape === "sphere") {
        const theta = (y: number) => Math.acos(Math.min(1, Math.max(-1, (y - cy) / ballR)));
        const ts = theta(y1), tl = theta(y0) - ts;
        if (tl > 1e-4) t.add(band, new SphereGeometry(ballR + 0.003, seg, 6, 0, Math.PI * 2, ts, tl).translate(0, cy, 0));
      } else if (p.shape === "cone" && y0 < joint && y1 > joint) {
        // Split at the joint: a straight frustum over both parts would run inside the body
        t.add(band, new CylinderGeometry(r + 0.003, r + 0.003, joint - y0, seg, 1, true).translate(0, (y0 + joint) / 2, 0));
        t.add(band, new CylinderGeometry(radAt(y1) + 0.003, r + 0.003, y1 - joint, seg, 1, true).translate(0, (joint + y1) / 2, 0));
      } else t.add(band, new CylinderGeometry(radAt(y1) + 0.003, radAt(y0) + 0.003, y1 - y0, seg, 1, true).translate(0, (y0 + y1) / 2, 0));
    }
    if (p.topMark) {
      const mastH = 0.3 * h, mastR = Math.max(0.008, 0.022 * p.diameter), markY = bodyTop + mastH;
      t.add(metal, new CylinderGeometry(mastR, mastR, mastH, 8).translate(0, bodyTop + mastH / 2, 0));
      if (p.shape === "can") t.add(body, new CylinderGeometry(0.12 * p.diameter, 0.12 * p.diameter, 0.15 * p.diameter, 12).translate(0, markY + 0.075 * p.diameter, 0));
      else if (p.shape === "cone") t.add(body, new ConeGeometry(0.14 * p.diameter, 0.18 * p.diameter, 12).translate(0, markY + 0.09 * p.diameter, 0));
      else t.add(body, new SphereGeometry(0.1 * p.diameter, 12, 8).translate(0, markY + 0.1 * p.diameter, 0));
    }
    return t.cylinder(r, h).group();
  },
});
