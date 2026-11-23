import { hex, Pixels, ramp, type Ramp } from "../../core/pixels";
import { defineSprite, type Direction } from "../define";

const W = 24, H = 32;
const SCHUHE = ramp("#4a3428"), AUGE = hex("#201828");

export const blacksmith = defineSprite({
  id: "blacksmith", category: "characters",
  title: { de: "Schmied", en: "Blacksmith" },
  description: {
    de: "Ein Schmied in einer ledernen Schürze, der einen Hammer schwingt: Statur, Frisur, Bart, Ärmel, dazu Haut-, Haar-, Hemd-, Schürzen- und Hosenfarbe. 24 × 32 Pixel pro Bild, Füße auf der untersten Zeile.",
    en: "A blacksmith in a leather apron swinging a hammer: build, hair, beard, sleeves, plus skin, hair, shirt, apron and trouser colours. 24 × 32 pixels per frame, feet on the bottom row.",
  },
  params: {
    build: { type: "choice", options: ["slim", "stout"], default: "stout", label: { de: "Statur", en: "Build" },
      labels: { slim: { de: "schlank", en: "slim" }, stout: { de: "kräftig", en: "stout" } },
      describe: { de: "Schlank oder kräftig: ein kräftiger Körper ist zwei Pixel breiter, die Arme sitzen weiter außen.", en: "Slim or stout: a stout body is two pixels wider, the arms sit further out." } },
    hair: { type: "choice", options: ["short", "bald"], default: "short", label: { de: "Frisur", en: "Hair" },
      labels: { short: { de: "kurze Haare", en: "short hair" }, bald: { de: "kahl", en: "bald" } },
      describe: { de: "Kurze Haare auf dem Kopf in der Haarfarbe, oder ein kahl geschorener Kopf in der Hautfarbe.", en: "Short hair on top of the head in the hair colour, or a bald head in the skin colour." } },
    beard: { type: "choice", options: ["none", "short", "full"], default: "full", label: { de: "Bart", en: "Beard" },
      labels: { none: { de: "keiner", en: "none" }, short: { de: "kurz", en: "short" }, full: { de: "voll", en: "full" } },
      describe: { de: "Kein Bart, ein kurzer Bart am Kinn oder ein voller Bart an Wangen und Kinn bis zum Kragen, in der Haarfarbe.", en: "No beard, a short beard on the chin only, or a full beard on cheeks and chin down to the collar, in the hair colour." } },
    apron: { type: "boolean", default: true, label: { de: "Schürze", en: "Apron" },
      describe: { de: "Eine Schürze über der Vorderseite des Körpers, von der Brust bis knapp über die Füße; von hinten nur die Schürzenbinde.", en: "An apron over the front of the body, from the chest to just above the feet; from behind only its tie." } },
    sleeves: { type: "boolean", default: false, label: { de: "Ärmel", en: "Sleeves" },
      describe: { de: "Lange Ärmel in der Hemdfarbe bis zum Handgelenk, oder kurze Ärmel mit bloßen Unterarmen in der Hautfarbe.", en: "Long sleeves in the shirt colour to the wrist, or short sleeves with bare forearms in the skin colour." } },
    skin: { type: "color", default: "#c8906a", label: { de: "Haut", en: "Skin" },
      describe: { de: "Hautfarbe von Gesicht, Hals, Armen und Händen, von hell bis dunkel.", en: "Skin colour of face, neck, arms and hands, from light to dark." } },
    hairColour: { type: "color", default: "#3a2a1e", label: { de: "Haarfarbe", en: "Hair colour" },
      describe: { de: "Farbe von Haaren und Bart.", en: "Colour of hair and beard." } },
    shirt: { type: "color", default: "#8a7a68", label: { de: "Hemd", en: "Shirt" },
      describe: { de: "Farbe von Hemd und Ärmeln.", en: "Colour of the shirt and sleeves." } },
    apronColour: { type: "color", default: "#5a3a24", label: { de: "Schürzenfarbe", en: "Apron colour" },
      describe: { de: "Farbe der ledernen Schürze.", en: "Colour of the leather apron." } },
    trousers: { type: "color", default: "#3a3a40", label: { de: "Hose", en: "Trousers" },
      describe: { de: "Farbe der Hose.", en: "Colour of the trousers." } },
  },
  presets: {
    smith: { label: { de: "Schmied", en: "Smith" }, values: { build: "stout" } },
    farrier: { label: { de: "Hufschmied", en: "Farrier" }, values: { build: "slim", beard: "short", apronColour: "#6a4a30" } },
    apprentice: { label: { de: "Lehrling", en: "Apprentice" }, values: { build: "slim", beard: "none", apron: false, sleeves: true } },
    "old-smith": { label: { de: "Alter Schmied", en: "Old Smith" }, values: { hair: "bald", hairColour: "#b8b0a8" } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "hammer", frames: 4, fps: 8, loop: true },
  ],
  grounded: true,
  build(p) {
    const haut = ramp(p.skin), haar = ramp(p.hairColour), hemd = ramp(p.shirt), schuerze = ramp(p.apronColour), hose = ramp(p.trousers);
    const stout = p.build === "stout";
    const k = stout ? 1 : 0;
    const bart = p.beard, tragenSchuerze = p.apron, langeAermel = p.sleeves, kurzeHaare = p.hair === "short";
    const unterarm = langeAermel ? hemd : haut;
    const GRIFF = hex("#7a5a3a"), KOPF = hex("#4a4a50");
    const schlag = (b: Pixels, x: number, y: number, oben: boolean, lang: number) => {
      if (oben) {
        for (let i = 1; i <= lang; i++) b.set(x, y - i, GRIFF);
        b.rect(x - 1, y - lang - 1, 3, 2, KOPF);
      } else {
        b.rect(x - 1, y + lang + 1, 3, 2, KOPF);
        for (let i = 1; i <= lang; i++) b.set(x, y + i, GRIFF);
      }
    };

    // One frame facing right; left is its mirror image
    const seitlich = (animation: string, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk";
      const hub = gehen ? (f % 2 === 1 ? -1 : 0) : animation === "hammer" ? 0 : f === 1 ? 1 : 0;
      const schritt = gehen ? [2, 0, -2, 0][f] : 0, schwung = gehen ? [-1, 0, 1, 0][f] : 0;
      const bein = (x: number, r: Ramp) => { b.part(x, 24, 3, 5, r); b.part(x, 29, 4, 2, SCHUHE); };
      bein(10 - schritt, { ...hose, base: hose.dark, light: hose.base });
      bein(11 + schritt, hose);
      b.part(9 - k, 16 + hub, 6 + 2 * k, 8, hemd);
      if (tragenSchuerze) b.part(10 - k, 16 + hub, 4 + 2 * k, 12, schuerze);
      b.part(9, 6 + hub, 9, 10, haut, true);
      b.set(17, 12 + hub, haut.base);
      b.set(15, 11 + hub, AUGE);
      if (kurzeHaare) b.part(9, 6 + hub, 9, 2, haar);
      if (bart === "short") b.part(17, 15 + hub, 1, 1, haar);
      else if (bart === "full") { b.part(16, 14 + hub, 1, 2, haar); b.part(17, 15 + hub, 1, 2, haar); }
      if (animation === "hammer") {
        b.part(11, 16 + hub, 2, 5, hemd); b.part(11, 21 + hub, 2, 2, unterarm);
        if (f === 0) { b.part(13, 16 + hub, 2, 3, hemd); b.part(13, 19 + hub, 2, 2, unterarm); schlag(b, 14, 19, false, 2); }
        else if (f === 3) { b.part(13, 16 + hub, 2, 4, hemd); b.part(13, 20 + hub, 2, 2, unterarm); schlag(b, 14, 20, false, 2); }
        else { b.part(17, 16 + hub, 2, 1, hemd); b.set(19, 16 + hub, unterarm.base); schlag(b, 19, 16 + hub, true, f === 1 ? 3 : 6); }
      } else {
        b.part(11 + schwung, 16 + hub, 2, 5, hemd); b.part(11 + schwung, 21 + hub, 2, 2, unterarm);
      }
      return b;
    };

    const frontal = (animation: string, d: Direction, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", hinten = d === "up";
      const hub = gehen ? (f % 2 === 1 ? -1 : 0) : animation === "hammer" ? 0 : f === 1 ? 1 : 0;
      const links = gehen && f === 0 ? -1 : 0, rechts = gehen && f === 2 ? -1 : 0;
      const arm = (x: number, vor: number) => { b.part(x, 16 + hub + vor, 2, 5, hemd); b.part(x, 21 + hub + vor, 2, 2, unterarm); };
      b.part(8, 24 + links, 4, 5, hose); b.part(12, 24 + rechts, 4, 5, hose);
      b.part(8, 29 + links, 4, 2, SCHUHE); b.part(12, 29 + rechts, 4, 2, SCHUHE);
      b.part(7 - k, 16 + hub, 10 + 2 * k, 8, hemd);
      if (tragenSchuerze && !hinten) b.part(8 - k, 16 + hub, 8 + 2 * k, 12, schuerze);
      b.part(7, 6 + hub, 10, 10, haut, true);
      if (!hinten) {
        b.rect(11, 13 + hub, 2, 1, haut.base);
        b.set(9, 11 + hub, AUGE); b.set(14, 11 + hub, AUGE);
      }
      if (kurzeHaare) {
        if (hinten) b.part(7, 6 + hub, 10, 4, haar, true);
        else b.part(7, 6 + hub, 10, 2, haar);
      }
      if (!hinten) {
        if (bart === "short") b.part(11, 15 + hub, 2, 1, haar);
        else if (bart === "full") { b.part(10, 14 + hub, 1, 2, haar); b.part(13, 14 + hub, 1, 2, haar); b.part(11, 15 + hub, 2, 2, haar); }
      }
      if (hinten && tragenSchuerze) b.part(11, 15 + hub, 2, 2, schuerze);
      if (animation === "hammer") {
        arm(5 - k, 0);
        if (!hinten) {
          if (f === 0) { b.part(11, 16 + hub, 2, 4, hemd); b.part(11, 20 + hub, 2, 2, unterarm); schlag(b, 12, 20, false, 2); }
          else if (f === 3) { b.part(11, 16 + hub, 2, 4, hemd); b.part(11, 21 + hub, 2, 2, unterarm); schlag(b, 12, 21, false, 2); }
          else { b.part(16, 16 + hub, 2, 2, hemd); b.set(18, 16 + hub, unterarm.base); schlag(b, 18, 16 + hub, true, f === 1 ? 3 : 6); }
        }
      } else {
        arm(5 - k, gehen && f === 2 ? 1 : 0); arm(17 + k, gehen && f === 0 ? 1 : 0);
      }
      if (hinten && animation === "hammer" && (f === 1 || f === 2)) {
        const fy = f === 1 ? 11 : 8;
        b.rect(17, fy, 3, 2, KOPF);
        for (let i = 1; i <= (f === 1 ? 3 : 6); i++) b.set(18, fy + 2 + i, GRIFF);
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
