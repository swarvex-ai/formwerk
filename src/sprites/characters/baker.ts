import { hex, Pixels, ramp, type Ramp } from "../../core/pixels";
import { defineSprite, type Direction } from "../define";

const W = 24, H = 32;
const SCHUHE = ramp("#4a3428"), AUGE = hex("#201828"), MEHL = hex("#f4efe4");

export const baker = defineSprite({
  id: "baker", category: "characters",
  title: { de: "Bäcker", en: "Baker" },
  description: {
    de: "Ein Bäcker im weißen Hemd mit Schürze und Bäckerhut, der vor sich Teig knetet: Statur, Hut, Schürze und Mehlstaub, dazu Haut-, Haar-, Hemd-, Schürzen- und Hosenfarbe. 24 × 32 Pixel pro Bild, Füße auf der untersten Zeile.",
    en: "A baker in a white shirt with an apron and a baker's hat who kneads dough in front of him: build, hat, apron and flour dust, plus skin, hair, shirt, apron and trouser colours. 24 × 32 pixels per frame, feet on the bottom row.",
  },
  params: {
    build: { type: "choice", options: ["slim", "stout"], default: "stout", label: { de: "Statur", en: "Build" },
      labels: { slim: { de: "schlank", en: "slim" }, stout: { de: "kräftig", en: "stout" } },
      describe: { de: "Schlank oder kräftig: ein kräftiger Körper ist zwei Pixel breiter, die Arme sitzen weiter außen.", en: "Slim or stout: a stout body is two pixels wider, the arms sit further out." } },
    hat: { type: "choice", options: ["toque", "cap", "none"], default: "toque", label: { de: "Hut", en: "Hat" },
      labels: { toque: { de: "hohe Kochmütze", en: "toque" }, cap: { de: "Käppchen", en: "cap" }, none: { de: "keiner", en: "none" } },
      describe: { de: "Eine hohe weiße Kochmütze mit eingebogenem Bund über der Stirn, ein flaches weißes Käppchen von zwei Pixeln auf dem Kopf oder nacktes Haar.", en: "A tall white chef's toque with a puffed top and a one-pixel band at the brow, a flat white cap two pixels high lying on the head, or bare hair." } },
    apron: { type: "boolean", default: true, label: { de: "Schürze", en: "Apron" },
      describe: { de: "Eine Schürze über der Vorderseite des Körpers, von der Brust bis knapp über die Füße; von hinten nur die Schürzenbinde.", en: "An apron over the front of the body, from the chest to just above the feet; from behind only its tie." } },
    flour: { type: "boolean", default: true, label: { de: "Mehlstaub", en: "Flour" },
      describe: { de: "Ein paar helle Mehlpixel auf der Vorderseite der Schürze und auf den Rücken der Unterarme.", en: "A few single light flour pixels on the apron or shirt front and the backs of the forearms." } },
    skin: { type: "color", default: "#c8906a", label: { de: "Haut", en: "Skin" },
      describe: { de: "Hautfarbe von Gesicht, Hals, Armen und Händen, von hell bis dunkel.", en: "Skin colour of face, neck, arms and hands, from light to dark." } },
    hairColour: { type: "color", default: "#3a2a1e", label: { de: "Haarfarbe", en: "Hair colour" },
      describe: { de: "Farbe der Haare unter dem Hut.", en: "Colour of the hair under the hat." } },
    shirt: { type: "color", default: "#ece6da", label: { de: "Hemd", en: "Shirt" },
      describe: { de: "Farbe des leinenen Hemdes und der Ärmel.", en: "Colour of the linen shirt and sleeves." } },
    apronColour: { type: "color", default: "#d8cbb4", label: { de: "Schürzenfarbe", en: "Apron colour" },
      describe: { de: "Farbe der Schürze aus ungebleichter Baumwolle.", en: "Colour of the unbleached cotton apron." } },
    trousers: { type: "color", default: "#5a5048", label: { de: "Hose", en: "Trousers" },
      describe: { de: "Farbe der Hose.", en: "Colour of the trousers." } },
  },
  presets: {
    "master-baker": { label: { de: "Meisterbäcker", en: "Master baker" }, values: { hat: "toque" } },
    apprentice: { label: { de: "Lehrling", en: "Apprentice" }, values: { build: "slim", hat: "cap", flour: false } },
    "village-baker": { label: { de: "Dorfbäcker", en: "Village baker" }, values: { hat: "none", apronColour: "#8a6a48", shirt: "#c8b89a" } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "knead", frames: 4, fps: 6, loop: true },
  ],
  grounded: true,
  build(p) {
    const haut = ramp(p.skin), haar = ramp(p.hairColour), hemd = ramp(p.shirt), schuerze = ramp(p.apronColour), hose = ramp(p.trousers);
    const HUT = ramp("#f6f3ec");
    const k = p.build === "stout" ? 1 : 0;
    const hut = p.hat, tragenSchuerze = p.apron, mehl = p.flour;

    // One frame facing right; left is its mirror image
    const seitlich = (animation: string, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", knete = animation === "knead";
      const bob = gehen ? (f % 2 === 1 ? -1 : 0) : knete ? (f < 2 ? 1 : 0) : f === 1 ? 1 : 0;
      const schritt = gehen ? [2, 0, -2, 0][f] : 0, schwung = gehen ? [-1, 0, 1, 0][f] : 0;
      const bein = (x: number, r: Ramp) => { b.part(x, 24, 3, 5, r); b.part(x, 29, 4, 2, SCHUHE); };
      bein(10 - schritt, { ...hose, base: hose.dark, light: hose.base });
      bein(11 + schritt, hose);
      b.part(9 - k, 16 + bob, 6 + 2 * k, 8, hemd);
      if (tragenSchuerze) b.part(10 - k, 16 + bob, 4 + 2 * k, 12, schuerze);
      b.part(9, 7 + bob, 9, 9, haut, true);
      b.set(17, 12 + bob, haut.base);
      b.set(15, 11 + bob, AUGE);
      if (hut === "toque") { b.part(8, 2 + bob, 10, 5, HUT, true); b.rect(9, 7 + bob, 9, 1, HUT.dark); }
      else { if (hut === "cap") b.part(8, 5 + bob, 10, 2, HUT, true); b.part(9, 7 + bob, 9, 2, haar); }
      if (knete) {
        if (f < 2) { b.part(11, 16 + bob, 2, 2, hemd); b.part(12, 18 + bob, 3, 2, haut); b.part(15, 20 + bob, 3, 2, haut); }
        else { b.part(11, 16 + bob, 2, 3, hemd); b.part(12, 19 + bob, 6, 2, haut); }
      } else {
        b.part(11 + schwung, 16 + bob, 2, 5, hemd); b.part(11 + schwung, 21 + bob, 2, 2, haut);
      }
      if (mehl) { b.set(11, 19 + bob, MEHL); b.set(12, 23 + bob, MEHL); b.set(10, 25 + bob, MEHL); b.set(11, 22 + bob, MEHL); }
      return b;
    };

    const frontal = (animation: string, d: Direction, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", knete = animation === "knead", hinten = d === "up";
      const bob = gehen ? (f % 2 === 1 ? -1 : 0) : knete ? (f < 2 ? 1 : 0) : f === 1 ? 1 : 0;
      const druck = knete && f < 2 ? 1 : 0;
      const links = gehen && f === 0 ? -1 : 0, rechts = gehen && f === 2 ? -1 : 0;
      const arm = (x: number, vor: number) => { b.part(x, 16 + bob + vor, 2, 5, hemd); b.part(x, 21 + bob + vor, 2, 2, haut); };
      b.part(8, 24 + links, 4, 5, hose); b.part(12, 24 + rechts, 4, 5, hose);
      b.part(8, 29 + links, 4, 2, SCHUHE); b.part(12, 29 + rechts, 4, 2, SCHUHE);
      b.part(7 - k, 16 + bob, 10 + 2 * k, 8, hemd);
      if (tragenSchuerze && !hinten) b.part(8 - k, 16 + bob, 8 + 2 * k, 12, schuerze);
      b.part(7, 7 + bob, 10, 9, haut, true);
      if (!hinten) {
        b.rect(11, 13 + bob, 2, 1, haut.base);
        b.set(9, 11 + bob, AUGE); b.set(14, 11 + bob, AUGE);
      }
      if (hut === "toque") { b.part(6, 2 + bob, 12, 5, HUT, true); b.rect(7, 7 + bob, 10, 1, HUT.dark); }
      else {
        if (hut === "cap") b.part(7, 5 + bob, 10, 2, HUT, true);
        if (hinten) b.part(7, 7 + bob, 10, 4, haar, true);
        else b.part(7, 7 + bob, 10, 2, haar);
      }
      if (hinten && tragenSchuerze) b.part(11, 16 + bob, 2, 2, schuerze);
      if (knete && !hinten) {
        b.part(5 - k, 16 + bob, 2, 3, hemd); b.part(6 - k, 19 + bob, 3, 2, haut); b.part(9 - k, 20 + bob + druck, 4, 2, haut);
        b.part(17 + k, 16 + bob, 2, 3, hemd); b.part(15 + k, 19 + bob, 3, 2, haut); b.part(11 + k, 20 + bob + druck, 4, 2, haut);
      } else if (knete) {
        const e = f < 2 ? 1 : 0;
        b.part(5 - k, 16 + bob, 2, 3, hemd); b.part(4 - k - e, 19 + bob, 2, 2, haut);
        b.part(17 + k, 16 + bob, 2, 3, hemd); b.part(18 + k + e, 19 + bob, 2, 2, haut);
      } else {
        arm(5 - k, gehen && f === 2 ? 1 : 0); arm(17 + k, gehen && f === 0 ? 1 : 0);
      }
      if (mehl && !hinten) {
        b.set(10, 19 + bob, MEHL); b.set(13, 22 + bob, MEHL); b.set(9, 24 + bob, MEHL);
        if (knete) { b.set(7 - k, 19 + bob, MEHL); b.set(16 + k, 19 + bob, MEHL); }
        else { b.set(6 - k, 21 + bob, MEHL); b.set(17 + k, 22 + bob, MEHL); }
      }
      if (mehl && hinten) { b.set(9, 18 + bob, MEHL); b.set(12, 20 + bob, MEHL); b.set(14, 18 + bob, MEHL); }
      return b;
    };

    return (animation, d, f) => {
      if (d === "right") return seitlich(animation, f);
      if (d === "left") return seitlich(animation, f).mirrored();
      return frontal(animation, d, f);
    };
  },
});
