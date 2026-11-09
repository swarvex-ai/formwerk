import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const windowAsset = defineAsset({
  id: "window", category: "architecture",
  title: { de: "Fenster", en: "Window" },
  description: { de: "Ein Fenster mit Rahmen, Sprossen und Glas in einer Wandöffnung; der Flügel schwingt an der linken Seite nach vorn (bewegliches Teil „sash“).", en: "A window with a frame, glazing bars and glass in a wall opening; the casement swings open on its left side (movable part \"sash\")." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.5, max: 2, step: 0.01, default: 1, unit: "m",
      describe: { de: "Breite der Wandöffnung: 0,6 m ein schmales Badfenster, 1 m ein Zimmerfenster, 1,8 m ein großes Wohnzimmerfenster.", en: "Width of the wall opening: 0.6 m a narrow bathroom window, 1 m a room window, 1.8 m a large living-room window." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.6, max: 2.2, step: 0.01, default: 1.2, unit: "m",
      describe: { de: "Höhe der Wandöffnung: 0,8 m ein Kellerfenster, 1,2 m üblich, 2 m eine Fenstertür.", en: "Height of the wall opening: 0.8 m a basement window, 1.2 m usual, 2 m a French window." } },
    panesAcross: { type: "integer", label: { de: "Scheiben nebeneinander", en: "Panes across" }, min: 1, max: 4, default: 2,
      describe: { de: "Zahl der Glasscheiben nebeneinander; dazwischen sitzt je eine senkrechte Sprosse.", en: "Number of glass panes side by side; a vertical glazing bar sits between each pair." } },
    panesDown: { type: "integer", label: { de: "Scheiben übereinander", en: "Panes down" }, min: 1, max: 4, default: 2,
      describe: { de: "Zahl der Glasscheiben übereinander; dazwischen sitzt je eine waagerechte Sprosse.", en: "Number of glass panes stacked; a horizontal glazing bar sits between each pair." } },
    frame: { type: "number", label: { de: "Rahmenstärke", en: "Frame thickness" }, min: 0.03, max: 0.12, step: 0.005, default: 0.06, unit: "m",
      describe: { de: "Breite der Rahmenhölzer: 0,05 m ein schlanker Stahlrahmen, 0,06 m Holz, 0,1 m ein massiver Altbaurahmen.", en: "Width of the frame members: 0.05 m a slim steel frame, 0.06 m timber, 0.1 m a solid old-building frame." } },
    sillDepth: { type: "number", label: { de: "Fensterbanktiefe", en: "Sill depth" }, min: 0, max: 0.3, step: 0.01, default: 0.12, unit: "m",
      describe: { de: "Tiefe der nach vorn vorstehenden Fensterbank: 0 ohne Bank, 0,12 m üblich, 0,25 m für Blumen.", en: "Depth of the sill projecting to the front: 0 without a sill, 0.12 m usual, 0.25 m for flower pots." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#e8e2d6",
      describe: { de: "Farbe von Rahmen, Sprossen und Fensterbank.", en: "Colour of the frame, glazing bars and sill." } },
  },
  presets: {
    casement: { label: { de: "Drehflügelfenster", en: "Casement window" }, values: { width: 1, height: 1.2, panesAcross: 2, panesDown: 2, frame: 0.06, sillDepth: 0.12 } },
    "sash-small": { label: { de: "Kleines Fenster", en: "Small sash window" }, values: { width: 0.6, height: 0.8, panesAcross: 1, panesDown: 2, frame: 0.05, sillDepth: 0.08, color: "#7a5c3e" } },
    "shop-front": { label: { de: "Schaufenster", en: "Shop front" }, values: { width: 1.8, height: 2.2, panesAcross: 3, panesDown: 2, frame: 0.05, sillDepth: 0.08, color: "#33403f" } },
  },
  rig: { sash: { label: { de: "Flügel", en: "Casement" }, type: "rotate", axis: [0, -1, 0], min: 0, max: 100 } },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 3000, drawCalls: 4 },
  build(p) {
    const holz = material("wood", p.color), glas = material("plastic", "#a9c6d6"), metall = material("metal", "#b8b2a6");
    const t = new Parts();
    const W = p.width, H = p.height, f = p.frame, d = 0.08, g = 0.005;
    // Aussenrahmen: zwei Pfosten und zwei Riegel in der Wandöffnung
    for (const s of [-1, 1]) t.box(holz, f, H, d, s * (W / 2 - f / 2), H / 2, 0);
    t.box(holz, W - 2 * f, f, d, 0, H - f / 2, 0);
    t.box(holz, W - 2 * f, f, d, 0, f / 2, 0);
    // Fensterbank: oben bei min(0,04 m, Rahmenstärke), damit der Flügel darüber schwingt
    if (p.sillDepth > 0.001) {
      const sh = Math.min(0.04, f);
      t.box(holz, W + 0.08, sh, p.sillDepth, 0, sh / 2, (p.sillDepth - d) / 2);
    }
    // Der Flügel mit Sprossen und Glas schwingt an seiner linken Kante nach vorn
    const sx0 = -W / 2 + f + g, sx1 = W / 2 - f - g, sy0 = f + g, sy1 = H - f - g;
    const sw = sx1 - sx0, sh = sy1 - sy0, xc = (sx0 + sx1) / 2, yc = (sy0 + sy1) / 2;
    const sf = Math.min(f * 0.7, 0.045), sd = 0.04, sash = t.moving("sash", sx0, f, 0);
    sash.box(holz, sf, sh, sd, sx0 + sf / 2, yc, 0);
    sash.box(holz, sf, sh, sd, sx1 - sf / 2, yc, 0);
    sash.box(holz, sw - 2 * sf, sf, sd, xc, sy1 - sf / 2, 0);
    sash.box(holz, sw - 2 * sf, sf, sd, xc, sy0 + sf / 2, 0);
    // Sprossen teilen die lichte Fläche in panesAcross × panesDown Scheiben
    const ix0 = sx0 + sf, ix1 = sx1 - sf, iy0 = sy0 + sf, iy1 = sy1 - sf;
    const iw = ix1 - ix0, ih = iy1 - iy0, bt = Math.min(sf * 0.5, 0.02);
    for (let i = 1; i < p.panesAcross; i++) sash.box(holz, bt, ih, sd * 0.7, ix0 + (i * iw) / p.panesAcross, (iy0 + iy1) / 2, 0);
    for (let j = 1; j < p.panesDown; j++) sash.box(holz, iw, bt, sd * 0.7, xc, iy0 + (j * ih) / p.panesDown, 0);
    sash.box(glas, iw, ih, 0.006, xc, (iy0 + iy1) / 2, -0.01);
    // Ein schlichter Griff am rechten Flügelrand
    sash.box(metall, 0.02, 0.12, 0.02, sx1 - sf / 2, yc, sd / 2 + 0.012);
    return t.group();
  },
});
