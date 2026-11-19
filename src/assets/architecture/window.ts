import { BoxGeometry } from "three";
import { material, grained } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

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
  budget: { triangles: 5000, drawCalls: 4 },
  build(p) {
    const holz = material("wood", p.color, 1, undefined, { grain: "part" }), glas = material("plastic", "#a9c6d6"), metall = material("metal", "#b8b2a6");
    const t = new Parts();
    const W = p.width, H = p.height, f = p.frame, d = 0.08, g = 0.005;
    const seg = 2;
    // Aussenrahmen: zwei Pfosten und zwei Riegel in der Wandöffnung, gerundete Kanten (3 mm)
    for (const s of [-1, 1]) t.add(holz, rounded(f, H, d, 0.003, s * (W / 2 - f / 2), H / 2, 0, seg));
    t.add(holz, grained(rounded(W - 2 * f, f, d, 0.003, 0, H - f / 2, 0, seg), "x"));
    t.add(holz, grained(rounded(W - 2 * f, f, d, 0.003, 0, f / 2, 0, seg), "x"));
    // Fensterbank: oben bei min(0,04 m, Rahmenstärke), damit der Flügel darüber schwingt; Rückseite 2 mm vor der Rahmenrückseite
    if (p.sillDepth > 0.001) {
      const sb = Math.min(0.04, f);
      t.add(holz, grained(rounded(W + 0.08, sb, p.sillDepth, 0.005, 0, sb / 2, (p.sillDepth - d) / 2 + 0.002, seg), "x"));
    }
    // Der Flügel mit Sprossen und Glas schwingt an seiner linken Kante nach vorn
    const sx0 = -W / 2 + f + g, sx1 = W / 2 - f - g, sy0 = f + g, sy1 = H - f - g;
    const sw = sx1 - sx0, sh = sy1 - sy0, xc = (sx0 + sx1) / 2, yc = (sy0 + sy1) / 2;
    const sf = Math.min(f * 0.7, 0.045), sd = 0.04;
    const sash = t.moving("sash", sx0, f, 0);
    sash.add(holz, rounded(sf, sh, sd, 0.003, sx0 + sf / 2, yc, 0, seg));
    sash.add(holz, rounded(sf, sh, sd, 0.003, sx1 - sf / 2, yc, 0, seg));
    sash.add(holz, grained(rounded(sw - 2 * sf, sf, sd, 0.003, xc, sy1 - sf / 2, 0, seg), "x"));
    sash.add(holz, grained(rounded(sw - 2 * sf, sf, sd, 0.003, xc, sy0 + sf / 2, 0, seg), "x"));
    // Sprossen teilen die lichte Fläche in panesAcross × panesDown Scheiben. Die senkrechten Sprossen sind 2 mm
    // tiefer als die waagerechten, sodass an den Kreuzungen keine Fläche auf Fläche trifft.
    const ix0 = sx0 + sf, ix1 = sx1 - sf, iy0 = sy0 + sf, iy1 = sy1 - sf;
    const iw = ix1 - ix0, ih = iy1 - iy0, bt = Math.min(sf * 0.5, 0.02);
    const stiefe = sd * 0.7, waagerecht = stiefe - 0.002;
    for (let i = 1; i < p.panesAcross; i++) sash.add(holz, rounded(bt, ih, stiefe, 0.002, ix0 + (i * iw) / p.panesAcross, yc, 0, seg));
    for (let j = 1; j < p.panesDown; j++) sash.add(holz, grained(rounded(iw, bt, waagerecht, 0.002, xc, iy0 + (j * ih) / p.panesDown, 0, seg), "x"));
    // Glas liegt im Falz: die Rahmenteile und Sprossen reichen 3 mm über die Glasrand hinaus, das Glas ist also etwas
    // grösser als die lichte Fläche und sitzt tief im Flügel, ohne dass ein Spalt darum sichtbar wäre
    sash.add(glas, new BoxGeometry(iw + 0.006, ih + 0.006, 0.006).translate(xc, yc, -0.008));
    // Griff: Rosette am rechten Flügelrand, Hebel zeigt von der Rosette nach unten
    const rosette = turned([[0.001, 0], [0.015, 0], [0.015, 0.008], [0.001, 0.008]], 16);
    rosette.rotateX(Math.PI / 2);
    rosette.translate(sx1 - sf / 2, yc, 0.02);
    sash.add(metall, rosette);
    // Hebel 12 cm lang, 1,5 cm quadratisch mit gerundeten Enden; seine Rückseite berührt die Rosette-Vorderseite (z = 0,028)
    sash.add(metall, rounded(0.015, 0.12, 0.015, 0.003, sx1 - sf / 2, yc - 0.06, 0.0355, 2));
    return t.group();
  },
});
