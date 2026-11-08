import { hex, Pixels, ramp, type Ramp } from "../../core/pixels";
import { defineSprite, type Direction } from "../define";

const W = 24, H = 32;
const SCHUHE = ramp("#4a3428"), AUGE = hex("#201828");

export const villager = defineSprite({
  id: "villager", category: "characters",
  title: { de: "Dorfbewohner", en: "Villager" },
  description: {
    de: "Eine Figur aus Pixeln mit Stehen und Laufen in vier Richtungen: Haut, Haare, Kleidung, Statur und Kopfbedeckung frei wählbar, so wird aus einem Bauplan ein ganzes Dorf. 24 × 32 Pixel pro Bild, Füße auf der untersten Zeile.",
    en: "A pixel figure standing and walking in four directions: skin, hair, clothes, build and headwear as you like, so one blueprint makes a whole village. 24 × 32 pixels per frame, feet on the bottom row.",
  },
  params: {
    hair: { type: "choice", options: ["short", "long", "bun", "bald"], default: "short", label: { de: "Frisur", en: "Hair" },
      labels: { short: { de: "kurz", en: "short" }, long: { de: "lang", en: "long" }, bun: { de: "Dutt", en: "bun" }, bald: { de: "Glatze", en: "bald" } },
      describe: { de: "Frisur: kurz, lang bis über die Schultern, mit Dutt oder keine Haare.", en: "Hairstyle: short, long past the shoulders, a bun, or no hair." } },
    headwear: { type: "choice", options: ["none", "cap", "hood"], default: "none", label: { de: "Kopfbedeckung", en: "Headwear" },
      labels: { none: { de: "keine", en: "none" }, cap: { de: "Mütze", en: "cap" }, hood: { de: "Kapuze", en: "hood" } },
      describe: { de: "Mütze in der Hosenfarbe oder Kapuze in der Farbe des Hemds, für Reisende und Mönche.", en: "A cap in the trouser colour or a hood in the shirt colour, for travellers and monks." } },
    build: { type: "choice", options: ["slim", "stocky"], default: "slim", label: { de: "Statur", en: "Build" },
      labels: { slim: { de: "schlank", en: "slim" }, stocky: { de: "kräftig", en: "stocky" } },
      describe: { de: "Schlank oder kräftig: ein kräftiger Körper ist zwei Pixel breiter, die Arme sitzen weiter außen.", en: "Slim or stocky: a stocky body is two pixels wider, the arms sit further out." } },
    skin: { type: "color", default: "#e0ac83", label: { de: "Haut", en: "Skin" },
      describe: { de: "Hautfarbe, von hell bis dunkel.", en: "Skin colour, from light to dark." } },
    hairColor: { type: "color", default: "#5a3a22", label: { de: "Haarfarbe", en: "Hair colour" },
      describe: { de: "Farbe der Haare.", en: "Colour of the hair." } },
    shirt: { type: "color", default: "#3f7a4a", label: { de: "Hemd", en: "Shirt" },
      describe: { de: "Farbe von Hemd oder Kittel (und der Kapuze).", en: "Colour of the shirt or tunic (and the hood)." } },
    trousers: { type: "color", default: "#4b4f6b", label: { de: "Hose", en: "Trousers" },
      describe: { de: "Farbe der Hose (und der Mütze).", en: "Colour of the trousers (and the cap)." } },
  },
  presets: {
    farmer: { label: { de: "Bäuerin", en: "Farmer" }, values: { hair: "long", headwear: "none", shirt: "#b07a3c", trousers: "#3f5a7a", hairColor: "#8a5a2a" } },
    merchant: { label: { de: "Händler", en: "Merchant" }, values: { hair: "short", headwear: "cap", build: "stocky", shirt: "#7a2f3a", trousers: "#3a3030", skin: "#c68a5e" } },
    traveller: { label: { de: "Reisender", en: "Traveller" }, values: { hair: "short", headwear: "hood", shirt: "#5b5f46", trousers: "#4a3f35", skin: "#8d5a3b", hairColor: "#1e1a18" } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [{ name: "idle", frames: 2, fps: 2, loop: true }, { name: "walk", frames: 4, fps: 8, loop: true }],
  grounded: true,
  build(p) {
    const haut = ramp(p.skin), haar = ramp(p.hairColor), hemd = ramp(p.shirt), hose = ramp(p.trousers);
    const kraeftig = p.build === "stocky";
    const huelle: Ramp | null = p.headwear === "cap" ? hose : p.headwear === "hood" ? hemd : null;

    // One frame facing right; left is its mirror image
    const seitlich = (animation: string, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk";
      const hub = gehen ? (f % 2 === 1 ? -1 : 0) : f === 1 ? 1 : 0;
      const schritt = gehen ? [2, 0, -2, 0][f] : 0, schwung = gehen ? [-1, 0, 1, 0][f] : 0;
      const k = kraeftig ? 1 : 0;
      // legs: the far one darker, behind
      const bein = (x: number, r: Ramp) => { b.part(x, 24, 3, 5, r); b.part(x, 29, 4, 2, SCHUHE); };
      bein(10 - schritt, { ...hose, base: hose.dark, light: hose.base });
      bein(11 + schritt, hose);
      if (p.hair === "long" && !huelle) b.part(8, 8 + hub, 3, 10, haar);
      b.part(9 - k, 16 + hub, 6 + 2 * k, 8, hemd);
      b.part(9, 6 + hub, 9, 10, haut, true);
      b.set(17, 12 + hub, haut.base); // nose
      b.set(15, 11 + hub, AUGE);
      if (huelle && p.headwear === "hood") { b.part(8, 5 + hub, 9, 4, huelle); b.part(8, 9 + hub, 3, 8, huelle); }
      else if (huelle) { b.part(8, 5 + hub, 10, 3, huelle); b.rect(16, 7 + hub, 3, 1, huelle.dark); }
      else if (p.hair !== "bald") {
        b.part(9, 5 + hub, 9, 3, haar); b.part(8, 7 + hub, 3, p.hair === "long" ? 10 : 5, haar);
        if (p.hair === "bun") b.ellipse(10, 4.5 + hub, 2, 1.6, haar);
      }
      // the near arm swings opposite to the near leg
      b.part(11 + schwung, 16 + hub, 3, 5, hemd); b.part(11 + schwung, 21 + hub, 3, 2, haut);
      return b;
    };

    const frontal = (animation: string, d: Direction, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", hinten = d === "up";
      const hub = gehen ? (f % 2 === 1 ? -1 : 0) : f === 1 ? 1 : 0;
      const k = kraeftig ? 1 : 0;
      // walking towards or away: one leg lifted, the arm on the other side forward
      const links = gehen && f === 0 ? -1 : 0, rechts = gehen && f === 2 ? -1 : 0;
      if (p.hair === "long" && !huelle && !hinten) { b.part(6, 8 + hub, 2, 10, haar); b.part(16, 8 + hub, 2, 10, haar); }
      b.part(8, 24 + links, 4, 5, hose); b.part(12, 24 + rechts, 4, 5, hose);
      b.part(8, 29 + links, 4, 2, SCHUHE); b.part(12, 29 + rechts, 4, 2, SCHUHE);
      b.part(7 - k, 16 + hub, 10 + 2 * k, 8, hemd);
      const arm = (x: number, vor: number) => { b.part(x, 16 + hub + vor, 2, 5, hemd); b.part(x, 21 + hub + vor, 2, 2, haut); };
      arm(5 - k, gehen && f === 2 ? 1 : 0); arm(17 + k, gehen && f === 0 ? 1 : 0);
      b.part(7, 6 + hub, 10, 10, haut, true);
      if (hinten) {
        if (huelle) b.part(6, 5 + hub, 12, p.headwear === "hood" ? 12 : 4, huelle, true);
        if (p.hair !== "bald" && !(huelle && p.headwear === "hood")) b.part(7, (huelle ? 9 : 5) + hub, 10, p.hair === "long" ? 13 : huelle ? 5 : 9, haar, true);
        if (p.hair === "bun" && !huelle) b.ellipse(12, 4.5 + hub, 2.2, 1.6, haar);
        return b;
      }
      b.set(9, 11 + hub, AUGE); b.set(14, 11 + hub, AUGE);
      b.rect(11, 13 + hub, 2, 1, haut.dark);
      if (huelle && p.headwear === "hood") { b.part(6, 5 + hub, 12, 3, huelle, true); b.part(6, 8 + hub, 2, 9, huelle); b.part(16, 8 + hub, 2, 9, huelle); }
      else if (huelle) { b.part(6, 5 + hub, 12, 3, huelle, true); b.rect(7, 8 + hub, 10, 1, huelle.dark); }
      else if (p.hair !== "bald") {
        b.part(7, 5 + hub, 10, 3, haar, true); b.part(7, 8 + hub, 1, 3, haar); b.part(16, 8 + hub, 1, 3, haar);
        if (p.hair === "bun") b.ellipse(12, 4.5 + hub, 2.2, 1.6, haar);
      }
      return b;
    };

    return (animation, d, f) => {
      if (d === "right") return seitlich(animation, f);
      if (d === "left") return seitlich(animation, f).mirrored();
      return frontal(animation, d, f);
    };
  },
});
