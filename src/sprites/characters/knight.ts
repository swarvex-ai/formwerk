import { hex, Pixels, ramp, type Ramp } from "../../core/pixels";
import { defineSprite, type Direction } from "../define";

const W = 24, H = 32;
const AUGE = hex("#201828");

export const knight = defineSprite({
  id: "knight", category: "characters",
  title: { de: "Ritter", en: "Knight" },
  description: {
    de: "Ein gepanzerter Ritter mit Helm, Waffe und Schild: Rüstung, Federbusch, Helmform und Bewaffnung frei wählbar, in vier Richtungen mit Stehen, Laufen und einem Hieb über drei Bilder. 24 × 32 Pixel pro Bild, Füße auf der untersten Zeile.",
    en: "An armoured knight with helm, weapon and shield: armour, plume, helm style and armament as you like, in four directions with idle, walk and a three-frame strike. 24 × 32 pixels per frame, feet on the bottom row.",
  },
  params: {
    helmet: { type: "choice", options: ["open", "visor", "great"], default: "open", label: { de: "Helm", en: "Helm" },
      labels: { open: { de: "offen", en: "open" }, visor: { de: "mit Visier", en: "visor" }, great: { de: "Topfhelm", en: "great" } },
      describe: { de: "Helmform: offen mit freiem Gesicht, mit Sehschlitz oder ein hoher Topfhelm.", en: "Helm style: open with a free face, with a visor slit, or a tall bucket helm." } },
    weapon: { type: "choice", options: ["sword", "mace"], default: "sword", label: { de: "Waffe", en: "Weapon" },
      labels: { sword: { de: "Schwert", en: "sword" }, mace: { de: "Keule", en: "mace" } },
      describe: { de: "Waffe in der rechten Hand: Schwert oder Keule.", en: "Weapon in the right hand: sword or mace." } },
    shield: { type: "boolean", default: true, label: { de: "Schild", en: "Shield" },
      describe: { de: "Schild in der linken Hand oder kein Schild, dann bleibt der Arm frei.", en: "A shield in the left hand or none, then the arm stays free." } },
    armourColour: { type: "color", default: "#8a93a4", label: { de: "Rüstung", en: "Armour" },
      describe: { de: "Farbe der Rüstung: poliertes Stahlgrau #8a93a4, Silber #c8cdd8, geschwärzt #3a3d46.", en: "Colour of the armour: polished steel grey #8a93a4, silver #c8cdd8, blackened #3a3d46." } },
    plumeColour: { type: "color", default: "#b03a3a", label: { de: "Federbusch", en: "Plume" },
      describe: { de: "Farbe des Federbuschs oben auf dem Helm.", en: "Colour of the plume on top of the helm." } },
    shieldColour: { type: "color", default: "#3f5a8a", label: { de: "Schildfarbe", en: "Shield colour" },
      describe: { de: "Farbe der Schildvorderseite.", en: "Colour of the shield face." } },
  },
  presets: {
    paladin: { label: { de: "Paladin", en: "Paladin" }, values: { armourColour: "#c8cdd8", plumeColour: "#f0eee6", helmet: "great" } },
    squire: { label: { de: "Knappe", en: "Squire" }, values: { helmet: "open", shield: false, weapon: "sword" } },
    "black-knight": { label: { de: "Schwarzer Ritter", en: "Black knight" }, values: { armourColour: "#3a3d46", plumeColour: "#c23a3a", helmet: "visor", weapon: "mace" } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [{ name: "idle", frames: 2, fps: 2, loop: true }, { name: "walk", frames: 4, fps: 8, loop: true }, { name: "attack", frames: 3, fps: 6, loop: false }],
  grounded: true,
  build(p) {
    const ru = ramp(p.armourColour), fe = ramp(p.plumeColour), sch = ramp(p.shieldColour);
    const haut = ramp("#d8a074"), stahl = ramp("#c2cbd8"), leder = ramp("#5a4030");

    // Weapon held in the hand at (x, y), blade along the column towards hin (-1 up, 1 down); the grip is the gauntlet
    const klinge = (b: Pixels, x: number, y: number, hin: number) => {
      if (p.weapon === "sword") {
        b.rect(x - 1, y + hin, 4, 1, stahl.dark);
        for (let i = 2; i <= 10; i++) { const yy = y + hin * i; if (yy >= 1) { b.set(x, yy, stahl.light); b.set(x + 1, yy, stahl.base); } }
      } else {
        for (let i = 2; i <= 6; i++) { const yy = y + hin * i; if (yy >= 1) { b.set(x, yy, leder.dark); b.set(x + 1, yy, leder.base); } }
        b.ellipse(x + 0.5, y + hin * 8, 2.4, 2.4, stahl);
      }
      b.rect(x, y, 2, 2, ru.base);
    };
    // Weapon held at (x, y) pointing forward to the right (the view facing right)
    const klingeVor = (b: Pixels, x: number, y: number) => {
      if (p.weapon === "sword") {
        b.rect(x + 1, y - 1, 1, 4, stahl.dark);
        for (let i = 2; i <= 9; i++) { const xx = x + i; if (xx <= 22) { b.set(xx, y, stahl.light); b.set(xx, y + 1, stahl.base); } }
      } else {
        for (let i = 2; i <= 4; i++) { b.set(x + i, y, leder.dark); b.set(x + i, y + 1, leder.base); }
        b.ellipse(x + 6, y + 0.5, 2.4, 2.4, stahl);
      }
      b.rect(x, y, 2, 2, ru.base);
    };
    const schild = (b: Pixels, x: number, y: number) => { b.part(x, y, 5, 7, sch, true); b.set(x + 2, y + 3, stahl.light); };

    // One frame facing right; left is its mirror image
    const seitlich = (animation: string, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", angriff = animation === "attack";
      const hub = gehen ? (f % 2 === 1 ? -1 : 0) : f === 1 ? 1 : 0;
      const schritt = gehen ? [2, 0, -2, 0][f] : 0, schwung = gehen ? [-1, 0, 1, 0][f] : 0;
      const oben = 6 + hub;
      // shield on the far arm, a sliver at the back
      if (p.shield) schild(b, 5, 15 + hub);
      // legs: the far one darker, behind; both boots reach the bottom row
      const bein = (x: number, r: Ramp) => { b.part(x, 24, 3, 5, r); b.part(x, 29, 4, 2, leder); };
      bein(10 - schritt, { ...ru, base: ru.dark, light: ru.base });
      bein(11 + schritt, ru);
      // torso of plate with a leather belt
      b.part(9, 16 + hub, 6, 8, ru, true);
      b.rect(9, 22 + hub, 6, 1, leder.dark);
      // helm: open shows face and eye, visor a slit, great a bucket with a slit near the front
      if (p.helmet === "open") {
        b.part(9, oben, 9, 10, haut, true);
        b.set(17, oben + 6, haut.base); b.set(15, oben + 5, AUGE);
        b.part(8, oben - 1, 9, 3, ru, true); b.rect(16, oben + 1, 3, 1, ru.dark);
      } else if (p.helmet === "visor") {
        b.part(9, oben - 1, 9, 11, ru, true);
        b.rect(14, oben + 4, 4, 1, AUGE);
      } else {
        b.part(8, oben - 2, 10, 12, ru, true);
        b.rect(15, oben + 3, 3, 1, AUGE); b.rect(15, oben - 2, 1, 4, ru.dark);
      }
      b.ellipse(8, oben - 2.5, 2, 1.5, fe);
      // the near arm carries the weapon
      if (!angriff) {
        b.part(11 + schwung, 16 + hub, 2, 5, ru);
        klinge(b, 11 + schwung, 21 + hub, -1);
      } else if (f === 0) {
        const hy = p.weapon === "mace" ? 13 : 10;
        b.rect(13, 14, 6, 2, ru.base); b.rect(17, hy + 2, 2, 15 - hy, ru.base);
        klinge(b, 17, hy, -1);
      } else if (f === 1) {
        b.rect(13, 16, 3, 2, ru.base);
        klingeVor(b, 15, 16);
      } else {
        b.part(13, 16, 2, 5, ru);
        klinge(b, 13, 21, -1);
      }
      return b;
    };

    const frontal = (animation: string, d: Direction, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", angriff = animation === "attack", hinten = d === "up";
      const hub = gehen ? (f % 2 === 1 ? -1 : 0) : f === 1 ? 1 : 0;
      const links = gehen && f === 0 ? -1 : 0, rechts = gehen && f === 2 ? -1 : 0;
      const oben = 6 + hub;
      // the right hand holds the weapon: screen left from the front, screen right from behind
      const wx = hinten ? 17 : 5, ox = hinten ? 5 : 17;
      // legs with boots on the bottom row
      b.part(8, 24 + links, 4, 5, ru); b.part(8, 29 + links, 4, 2, leder);
      b.part(12, 24 + rechts, 4, 5, ru); b.part(12, 29 + rechts, 4, 2, leder);
      // torso of plate with a leather belt
      b.part(7, 16 + hub, 10, 8, ru, true);
      b.rect(7, 22 + hub, 10, 1, leder.dark);
      // helm: open face with eyes and nasal bar, visor with slit and breath holes, great a bucket with a cross
      if (p.helmet === "open") {
        b.part(7, oben, 10, 10, haut, true);
        if (!hinten) { b.set(9, oben + 5, AUGE); b.set(14, oben + 5, AUGE); b.rect(11, oben + 7, 2, 1, haut.dark); }
        b.part(7, oben - 1, 10, hinten ? 5 : 3, ru, true);
        if (!hinten) { b.rect(11, oben + 2, 2, 3, ru.base); b.rect(7, oben + 2, 1, 5, ru.base); b.rect(16, oben + 2, 1, 5, ru.base); }
      } else if (p.helmet === "visor") {
        b.part(7, oben - 1, 10, 11, ru, true);
        if (hinten) b.rect(11, oben + 1, 2, 8, ru.dark);
        else { b.rect(8, oben + 4, 8, 1, AUGE); b.rect(9, oben + 7, 6, 1, ru.deep); }
      } else {
        b.part(6, oben - 2, 12, 12, ru, true);
        if (hinten) b.rect(11, oben, 2, 9, ru.dark);
        else { b.rect(7, oben + 3, 10, 1, AUGE); b.rect(11, oben + 4, 2, 6, ru.dark); }
      }
      b.ellipse(12, oben - 2.5, 1.6, 1.5, fe);
      // arms: the off arm hangs, the shield covers it; the weapon arm strikes on attack
      b.part(ox, 16 + hub, 2, 5, ru);
      if (p.shield) schild(b, hinten ? 2 : 16, 15 + hub);
      if (!angriff) { b.part(wx, 16 + hub, 2, 5, ru); klinge(b, wx, 21 + hub, -1); }
      else if (f === 0) {
        const hy = p.weapon === "mace" ? 13 : 8;
        b.rect(wx, hy + 1, 2, 16 - hy, ru.base);
        klinge(b, wx, hy, -1);
      } else if (f === 1) {
        b.rect(hinten ? 14 : 5, 16, 4, 2, ru.base);
        klinge(b, hinten ? 13 : 8, 16, 1);
      } else {
        b.part(wx, 17, 2, 5, ru);
        klinge(b, wx, 22, -1);
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
