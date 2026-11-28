import { Pixels, ramp, type RGBA } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const GLAS = ramp("#b8d4e0");

export const hourglass = defineSprite({
  id: "hourglass", category: "items",
  title: { de: "Sanduhr", en: "Hourglass" },
  description: {
    de: "Eine Sanduhr als Pixel-Symbol für Inventar, Schreibtische, Timer, Rätsel und Zaubertürme: zwei Glaskolben mit engem Hals zwischen einer oberen und einer unteren Platte, Sand in beiden Kolben und ein im Idle-Lauf die Rinne hinab rieselnder Sandstrom. 16 × 16 Pixel.",
    en: "An hourglass as a pixel icon for inventories, desks, timers, puzzles and wizard towers: two glass bulbs joined at a narrow neck between a top and a bottom plate, sand in both bulbs, and a thin stream of sand running down the neck in the idle loop. 16 × 16 pixels.",
  },
  params: {
    height: { type: "integer", min: 8, max: 12, default: 10, label: { de: "Höhe", en: "Height" },
      describe: { de: "Reihen Glas zwischen den Platten: 8 ein kurzes Eiertimerglas, 10 üblich, 12 eine hohe Sanduhr. Der Hals sitzt in der Mitte; bei ungerader Höhe geht die zusätzliche Reihe an den unteren Kolben.", en: "Rows of glass between the plates: 8 a short egg timer, 10 usual, 12 a tall hourglass. The neck sits in the middle; for an odd height the extra row goes to the bottom bulb." } },
    width: { type: "choice", options: ["slim", "round"], default: "round", label: { de: "Breite", en: "Width" },
      labels: { slim: { de: "schmal", en: "slim" }, round: { de: "rund", en: "round" } },
      describe: { de: "Die breiteste Reihe jedes Kolbens: 4 Pixel schmal oder 6 Pixel rund, verjüngt auf 2 Pixel am Hals. Gerundeter Umriss, nicht spitz.", en: "The widest row of each bulb: 4 pixels slim or 6 pixels round, narrowing to 2 pixels at the neck. A rounded outline, not a triangle." } },
    stand: { type: "choice", options: ["posts", "plates"], default: "posts", label: { de: "Gestell", en: "Stand" },
      labels: { posts: { de: "Stützen", en: "posts" }, plates: { de: "Platten", en: "plates" } },
      describe: { de: "Platten ist eine obere und eine untere Platte (je 1 Reihe, 2 Pixel breiter als der Kolben auf jeder Seite); Stützen fügt an den äußeren Enden zwei 1 Pixel breite Stützen hinzu, die die Platten verbinden.", en: "Plates is a top and a bottom plate (1 row each, 2 pixels wider than the bulb on each side); posts adds two 1-pixel posts at the outer ends joining the plates." } },
    fill: { type: "number", min: 0.1, max: 0.9, step: 0.1, default: 0.6, label: { de: "Füllstand", en: "Fill" },
      describe: { de: "Der Anteil des Sandes, der noch im oberen Kolben ist: 0,1 fast leer oben, 0,6 üblich, 0,9 fast ganz oben. Der Rest liegt im unteren Kolben; der Sand läuft immer.", en: "The share of the sand still in the top bulb: 0.1 almost empty at the top, 0.6 usual, 0.9 almost all at the top. The rest lies in the bottom bulb; the sand is always running." } },
    sand: { type: "color", default: "#d8b46a", label: { de: "Sand", en: "Sand" },
      describe: { de: "Farbe des Sandes: #d8b46a gelber Sand, #e8e0d0 weißer Sand, #6a8ad8 magischer blauer Sand.", en: "Colour of the sand: #d8b46a yellow sand, #e8e0d0 white sand, #6a8ad8 magic blue sand." } },
    frameColour: { type: "color", default: "#7a5232", label: { de: "Gestell", en: "Frame" },
      describe: { de: "Farbe von Platten und Stützen: #7a5232 Holz, #c89a3a Messing, #4a4a52 Eisen.", en: "Colour of the plates and posts: #7a5232 wood, #c89a3a brass, #4a4a52 iron." } },
  },
  presets: {
    hourglass: { label: { de: "Sanduhr", en: "Hourglass" }, values: { stand: "posts" } },
    brass: { label: { de: "Messing", en: "Brass" }, values: { frameColour: "#c89a3a", width: "slim", height: 12 } },
    magic: { label: { de: "Magie", en: "Magic" }, values: { sand: "#6a8ad8", frameColour: "#4a4a52", fill: 0.3 } },
    "egg-timer": { label: { de: "Eieruhr", en: "Egg timer" }, values: { stand: "plates", height: 8, width: "slim" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 4, fps: 8, loop: true }],
  grounded: false,
  build(p, _seed) {
    const sand = ramp(p.sand), frame = ramp(p.frameColour);
    const breit = p.width === "round" ? 6 : 4;
    const h = p.height;
    const nt = Math.floor(h / 2), nb = Math.ceil(h / 2);
    const topPlateY = 1 + Math.floor((12 - h) / 2);
    const glassTop = topPlateY + 1;
    const botPlateY = topPlateY + h + 1;
    const plateLeft = 8 - Math.ceil((breit + 4) / 2);
    const plateRight = plateLeft + breit + 3;
    const streamX = 7;
    const sandRows = Math.max(1, Math.round(p.fill * nt));
    let mound = Math.max(1, Math.round((1 - p.fill) * nb));
    mound = Math.min(mound, nb - 1);
    const bulbWidth = (r: number) => {
      const j = r < nt ? nt - 1 - r : r - nt;
      if (j === 0) return 2;
      if (j === 1) return Math.max(2, breit - 2);
      return breit;
    };
    const bulbLeft = (r: number) => 8 - Math.ceil(bulbWidth(r) / 2);
    const istGlas = (c: RGBA) => c.join() === GLAS.base.join() || c.join() === GLAS.light.join();
    return (_animation, _direction, f) => {
      const b = new Pixels(W, H);
      // Platten oben und unten
      b.rect(plateLeft, topPlateY, breit + 4, 1, frame.base);
      b.set(plateLeft, topPlateY, frame.light); b.set(plateRight, topPlateY, frame.dark);
      b.rect(plateLeft, botPlateY, breit + 4, 1, frame.base);
      b.set(plateLeft, botPlateY, frame.light); b.set(plateRight, botPlateY, frame.dark);
      if (p.stand === "posts")
        for (let y = glassTop; y < glassTop + h; y++) { b.set(plateLeft, y, frame.base); b.set(plateRight, y, frame.base); }
      // Die beiden Glaskolben: jede Reihe mit der Glasbasis füllen, dann den hellen Umriss (Endpixel, erste und letzte Reihe)
      for (let r = 0; r < h; r++) {
        const w = bulbWidth(r), l = bulbLeft(r), rr = l + w - 1;
        const zeile = glassTop + r;
        b.rect(l, zeile, w, 1, GLAS.base);
        b.set(l, zeile, GLAS.light); b.set(rr, zeile, GLAS.light);
        if (r === 0 || r === nt - 1 || r === nt || r === h - 1)
          for (let x = l; x <= rr; x++) b.set(x, zeile, GLAS.light);
      }
      // Sand im oberen Kolben: die untersten sandRows Reihen bis zum Hals, die oberste Reihe mit einer Delle in der Mitte
      for (let r = nt - sandRows; r <= nt - 1; r++) {
        const w = bulbWidth(r), l = bulbLeft(r), rr = l + w - 1;
        const dip = l + Math.floor((w - 1) / 2);
        for (let x = l; x <= rr; x++)
          b.set(x, glassTop + r, x === dip ? GLAS.base : x === l ? sand.light : x === rr ? sand.dark : sand.base);
      }
      // Sand im unteren Kolben: ein vom Boden aus aufgeschütteter Hügel, jede Reihe 2 Pixel schmaler, mindestens 2
      for (let r = h - mound; r <= h - 1; r++) {
        const mw = Math.max(2, breit - 2 * (h - 1 - r));
        const l = 8 - Math.ceil(mw / 2), rr = l + mw - 1;
        for (let x = l; x <= rr; x++)
          b.set(x, glassTop + r, x === l ? sand.light : x === rr ? sand.dark : sand.base);
      }
      // Der Sandstrom: eine Spalte in der Mitte (7) vom Hals bis zum Hügel, die Lücke wandert eine Reihe pro Frame
      for (let r = nt; r <= h - mound - 1; r++) {
        const y = glassTop + r;
        if (((y - f) % 4 + 4) % 4 === 0) b.set(streamX, y, GLAS.base);
        else b.set(streamX, y, sand.light);
      }
      // Ein 1-Pixel-Helles im oberen Linken jedes Kolbens, nur wo es keinen Sand bedeckt
      const helle = (x: number, y: number) => { if (istGlas(b.get(x, y))) b.set(x, y, GLAS.light); };
      helle(bulbLeft(1) + 1, glassTop + 1);
      const rUnten = nt + 1;
      if (rUnten <= h - 1) helle(bulbLeft(rUnten) + 1, glassTop + rUnten);
      return b;
    };
  },
});
