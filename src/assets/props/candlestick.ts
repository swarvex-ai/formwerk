import { CatmullRomCurve3, ConeGeometry, CylinderGeometry, LatheGeometry, SphereGeometry, TorusGeometry, TubeGeometry, Vector2, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

// Turned column of the holder: round foot, two bulges, a cup whose rim sits at y = h; the profile runs back inside so
// the lathe closes both ends on the axis.
const saeule = (h: number, fuss: number, stab: number, cupR: number): Vector2[] => {
  const fussH = Math.min(0.028, h * 0.15);
  return [
    new Vector2(0.0006, 0), new Vector2(fuss, 0), new Vector2(fuss, fussH * 0.5), new Vector2(fuss * 0.42, fussH),
    new Vector2(stab * 1.1, h * 0.3), new Vector2(stab * 1.8, h * 0.42), new Vector2(stab * 0.9, h * 0.54),
    new Vector2(stab * 1.45, h * 0.66), new Vector2(stab * 0.95, h * 0.78),
    new Vector2(Math.max(stab, cupR * 0.45), h * 0.9), new Vector2(cupR, h * 0.985), new Vector2(cupR, h),
    new Vector2(cupR * 0.55, h - 0.005), new Vector2(0.0006, h - 0.008),
  ];
};

export const candlestick = defineAsset({
  id: "candlestick", category: "props",
  title: { de: "Kerzenständer", en: "Candlestick" },
  description: { de: "Ein Kerzenständer für Tisch, Regal und Altar: gedrehte Säule auf rundem Fuß oder flache Schale mit Ringgriff, darin eine Kerze aus Wachs mit Docht und Flamme; drei oder fünf Kerzen stehen an gebogenen Armen eines Leuchters nebeneinander.", en: "A candlestick for tables, shelves and altars: a turned column on a round foot or a flat dish with a ring handle, holding a wax candle with wick and flame; three or five candles stand side by side on the bent arms of a candelabra." },
  params: {
    arms: { type: "choice", label: { de: "Kerzen", en: "Candles" }, options: ["1", "3", "5"],
      labels: { "1": { de: "1 Kerze", en: "1 candle" }, "3": { de: "3 Kerzen", en: "3 candles" }, "5": { de: "5 Kerzen", en: "5 candles" } }, default: "1",
      describe: { de: "Zahl der Kerzen: 1 auf dem Ständer, 3 und 5 auf einem Leuchter mit gebogenen Armen in einer Reihe.", en: "Number of candles: 1 on the stick, 3 and 5 on a candelabra with bent arms in one row." } },
    holder: { type: "choice", label: { de: "Fuß", en: "Holder" }, options: ["dish", "stick"],
      labels: { dish: { de: "Schale", en: "Dish" }, stick: { de: "Säule", en: "Stick" } }, default: "stick",
      describe: { de: "Flache Schale mit Ringgriff (0,03 m hoch) wie ein Kerzenteller, oder gedrehte Säule auf rundem Fuß; drei und fünf Kerzen stehen immer auf der Säule.", en: "A flat dish with a ring handle (0.03 m high) like a candle plate, or a turned column on a round foot; three and five candles always stand on the column." } },
    holderHeight: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.08, max: 0.35, step: 0.005, default: 0.18, unit: "m",
      describe: { de: "Höhe der Säule bis zum Rand der Kerzentasse: 0,12 m kleiner Leuchter, 0,18 m Tischkerzenständer, 0,3 m Altarleuchter.", en: "Height of the column to the rim of the candle cup: 0.12 m a small stand, 0.18 m a table candlestick, 0.3 m an altar candelabra." } },
    candleHeight: { type: "number", label: { de: "Kerzenhöhe", en: "Candle height" }, min: 0.03, max: 0.25, step: 0.005, default: 0.15, unit: "m",
      describe: { de: "Das Wachs, das übrig ist: 0,04 m heruntergebrannt, 0,15 m neue Stumpenkerze, 0,22 m Altarkerze.", en: "The wax that is left: 0.04 m burnt down, 0.15 m a new stub candle, 0.22 m an altar candle." } },
    candleRadius: { type: "number", label: { de: "Kerzendicke", en: "Candle radius" }, min: 0.008, max: 0.03, step: 0.001, default: 0.012, unit: "m",
      describe: { de: "Radius der Kerze: 0,008 m Tafelkerze, 0,012 m Stumpenkerze, 0,025 m Altarkerze.", en: "Radius of the candle: 0.008 m a taper, 0.012 m a stub candle, 0.025 m an altar candle." } },
    lit: { type: "boolean", label: { de: "Beleuchtet", en: "Lit" }, default: true,
      describe: { de: "Ein kleiner Flammentropfen von 0,025-0,04 m über jedem Docht; aus bleiben die Kerzen dunkel.", en: "A small teardrop flame of 0.025-0.04 m above each wick; off leaves the candles dark." } },
    holderColour: { type: "color", label: { de: "Metall", en: "Metal" }, default: "#b08a3a",
      describe: { de: "Farbe des Metalls: #b08a3a Messing, #c8c8cc Zinn, #57493c bronziertes Eisen.", en: "Colour of the metal: #b08a3a brass, #c8c8cc pewter, #57493c bronzed iron." } },
    waxColour: { type: "color", label: { de: "Wachs", en: "Wax" }, default: "#efe6cc",
      describe: { de: "Farbe des Wachses: #efe6cc helles Bienenwachs, #f7f4ee Kirchenwachs, #c8503e rot gefärbt.", en: "Colour of the wax: #efe6cc light beeswax, #f7f4ee church wax, #c8503e dyed red." } },
  },
  presets: {
    table: { label: { de: "Tisch", en: "Table" }, values: { arms: "1", holder: "stick", holderHeight: 0.18 } },
    saucer: { label: { de: "Kerzenteller", en: "Saucer" }, values: { holder: "dish", candleHeight: 0.06 } },
    candelabra: { label: { de: "Leuchter", en: "Candelabra" }, values: { arms: "5", holderHeight: 0.3, holderColour: "#c8c8cc" } },
    church: { label: { de: "Kirche", en: "Church" }, values: { arms: "3", candleRadius: 0.025, candleHeight: 0.22 } },
  },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 3000, drawCalls: 3 },
  build(p, seed) {
    const r = rng(seed);
    const metall = material("metal", p.holderColour), wachs = material("paint", p.waxColour, 1, 870), flamme = material("glow", "#ffb347");
    const t = new Parts();
    const kerzen = Number(p.arms), cr = p.candleRadius, cupR = cr + 0.005;
    const stellen: number[] = []; // x of every candle, all cups level with the top of the holder
    let rand = 0; // rim height the candles stand in
    if (p.holder === "dish" && kerzen === 1) {
      // Low saucer, the candle in the middle of the well, a ring handle on +x
      const a = Math.max(0.045, cr * 2.2 + 0.032);
      t.add(metall, new LatheGeometry([
        new Vector2(0.0006, 0), new Vector2(a * 0.6, 0), new Vector2(a * 0.9, 0.003), new Vector2(a, 0.02), new Vector2(a, 0.03),
        new Vector2(a - 0.004, 0.03), new Vector2(a - 0.005, 0.009), new Vector2(cr * 1.6, 0.013), new Vector2(cr, 0.008), new Vector2(0.0006, 0.008),
      ], 24));
      const ring = Math.min(0.013, Math.max(0.009, a * 0.22));
      t.add(metall, new TorusGeometry(ring, 0.0032, 6, 14).translate(a + ring * 0.5, ring + 0.004, 0));
      stellen.push(0); rand = 0.008;
    } else {
      // Turned column; three and five candles hang their cups on bent tubes out to the sides
      const h = p.holderHeight, stab = Math.max(0.008, Math.min(0.022, h * 0.075));
      const fuss = Math.min(0.085, Math.max(0.032, h * (kerzen === 1 ? 0.34 : 0.28)));
      t.add(metall, new LatheGeometry(saeule(h, fuss, stab, cupR), 24));
      stellen.push(0); rand = h;
      for (const weite of kerzen === 5 ? [0.08, 0.16] : kerzen === 3 ? [0.08] : []) for (const seite of [-1, 1]) {
        const x = seite * weite;
        t.add(metall, new TubeGeometry(new CatmullRomCurve3([
          new Vector3(seite * stab * 0.6, h * 0.3, 0), new Vector3(x * 0.55, h * 0.52, 0),
          new Vector3(x * 0.93, h * 0.8, 0), new Vector3(x, h - 0.012, 0),
        ], false, "centripetal"), 12, Math.max(0.004, stab * 0.5), 6, false));
        t.add(metall, new CylinderGeometry(cupR, cupR * 0.45, 0.016, 8).translate(x, h - 0.008, 0));
        stellen.push(x);
      }
    }
    // Candles: the wax a little thinner on top, a few drops run down the side, the wick stands in the middle
    const flammenH = 0.025 + 0.015 * Math.min(1, Math.max(0, (cr - 0.008) / 0.022));
    for (const x of stellen) {
      const kerze = p.candleHeight * (0.85 + r() * 0.3), spitze = rand + kerze;
      t.add(wachs, new CylinderGeometry(cr * 0.93, cr, kerze, 8).translate(x, rand + kerze / 2, 0));
      for (let i = 0, tropfen = 2 + (r() < 0.5 ? 1 : 0); i < tropfen; i++) {
        const wink = r() * Math.PI * 2, hoehe = rand + kerze * (0.18 + r() * 0.7), dick = cr * (0.2 + r() * 0.15) + 0.0015;
        t.add(wachs, new SphereGeometry(dick, 6, 4).scale(0.8, 1.8, 0.8).translate(x + Math.cos(wink) * cr * 0.88, hoehe, Math.sin(wink) * cr * 0.88));
      }
      const docht = new CylinderGeometry(0.0025, 0.0012, 0.011, 4).translate(0, 0.0055, 0).rotateZ((r() - 0.5) * 0.08);
      t.add(p.lit ? flamme : wachs, docht.translate(x, spitze, 0));
      if (p.lit) {
        // Teardrop flame like the torch, tip up, standing on the glowing wick
        const fh = flammenH * (0.9 + r() * 0.2);
        t.add(flamme, new ConeGeometry(Math.max(0.0045, cr * 0.5), fh, 6).translate(x, spitze + 0.005 + fh / 2, 0));
      }
    }
    return t.group();
  },
});
