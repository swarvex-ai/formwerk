import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite, type Direction } from "../define";

const W = 24, H = 32;
const SCHUHE = ramp("#3a2a30"), AUGE = hex("#201828"), HAUT = ramp("#e0ac83"), HAAR = ramp("#d5d5de"), HOLZ = ramp("#7a5230");
// cast: how far the staff is raised in each frame; the glow shows in the last two
const HEBEN = [0, 2, 3, 3];

export const wizard = defineSprite({
  id: "wizard", category: "characters",
  title: { de: "Zauberer", en: "Wizard" },
  description: {
    de: "Ein Zauberer in langer Robe mit Spitzhut oder Kapuze, Bart und Stab, in vier Richtungen mit Stehen, Laufen und Zaubern: beim Zaubern hebt er den Stab und dessen Spitze leuchtet auf. Robe, Hut, Bart, Stab und Leuchtfarbe frei wählbar. 24 × 32 Pixel pro Bild, Füße auf der untersten Zeile.",
    en: "A wizard in a long robe with a pointed hat or a hood, a beard and a staff, in four directions standing, walking and casting: when casting he raises the staff and its tip lights up. Robe, hat, beard, staff and glow colour as you like. 24 × 32 pixels per frame, feet on the bottom row.",
  },
  params: {
    hat: { type: "choice", options: ["pointed", "hood"], default: "pointed", label: { de: "Kopfbedeckung", en: "Hat" },
      labels: { pointed: { de: "Spitzhut", en: "pointed" }, hood: { de: "Kapuze", en: "hood" } },
      describe: { de: "Spitzer Hut mit breiter Krempe für Meister oder Kapuze in der Farbe der Robe für Schüler.", en: "A pointed hat with a wide brim for masters or a hood in the robe's colour for apprentices." } },
    beard: { type: "choice", options: ["none", "short", "long"], default: "long", label: { de: "Bart", en: "Beard" },
      labels: { none: { de: "keiner", en: "none" }, short: { de: "kurz", en: "short" }, long: { de: "lang", en: "long" } },
      describe: { de: "Bart: keiner, kurz am Kinn oder lang bis auf die Brust. Von hinten sieht man dann längeres Haar.", en: "Beard: none, short on the chin or long down to the chest. Seen from behind, a long beard means longer hair." } },
    staff: { type: "choice", options: ["wooden", "crystal"], default: "wooden", label: { de: "Stab", en: "Staff" },
      labels: { wooden: { de: "Holz", en: "wooden" }, crystal: { de: "Kristall", en: "crystal" } },
      describe: { de: "Knorriger Holzstab oder Stab mit Kristall an der Spitze, der in der Leuchtfarbe glimmt.", en: "A gnarled wooden staff or a staff with a crystal at the tip that gleams in the glow colour." } },
    robe: { type: "color", default: "#5a5f86", label: { de: "Robe", en: "Robe" },
      describe: { de: "Farbe von Robe, Hut und Kapuze.", en: "Colour of the robe, hat and hood." } },
    glow: { type: "color", default: "#7fd8ff", label: { de: "Leuchtfarbe", en: "Glow" },
      describe: { de: "Farbe des Kristalls und des Leuchtens an der Stabspitze beim Zaubern.", en: "Colour of the crystal and of the glow at the staff tip when casting." } },
  },
  presets: {
    "grey-wizard": { label: { de: "Grauer Zauberer", en: "Grey wizard" }, values: { hat: "pointed", beard: "long", staff: "wooden", robe: "#6b6e78", glow: "#d8e8ff" } },
    "fire-mage": { label: { de: "Feuermagier", en: "Fire mage" }, values: { hat: "pointed", beard: "short", staff: "crystal", robe: "#a8322c", glow: "#ff9a2e" } },
    apprentice: { label: { de: "Lehrling", en: "Apprentice" }, values: { hat: "hood", beard: "none", staff: "wooden", robe: "#4f7a5c", glow: "#9cff9c" } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "cast", frames: 4, fps: 6, loop: false },
  ],
  grounded: true,
  build(p) {
    const robe = ramp(p.robe), glow = ramp(p.glow);
    const kristall = p.staff === "crystal", kapuze = p.hat === "hood";

    // The staff: two pixels wide from `top` to the floor, a knob or a crystal on top; x is its left column
    const stab = (b: Pixels, x: number, top: number, leuchten: boolean) => {
      for (let y = top; y < H - 1; y++) { b.set(x, y, HOLZ.light); b.set(x + 1, y, HOLZ.base); }
      if (kristall) {
        const reihen = [[1, 2], [0, 4], [0, 4], [1, 2]];
        reihen.forEach(([von, n], j) => { for (let i = 0; i < n; i++) b.set(x - 1 + von + i, top - 4 + j, i === 0 ? glow.light : i === n - 1 ? glow.dark : glow.base); });
        if (leuchten) { b.set(x, top - 3, hex("#ffffff")); }
      } else {
        b.part(x - 1, top - 3, 4, 3, HOLZ, true);
      }
    };
    // A ring of light round the tip, thinned out towards the edge so it reads as a glow
    const schein = (b: Pixels, cx: number, cy: number) => {
      for (let y = Math.ceil(cy - 3); y <= Math.floor(cy + 3); y++) for (let x = Math.ceil(cx - 3); x <= Math.floor(cx + 3); x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (y < 1 || d > 3.2) continue;
        if (d <= 1.6) b.set(x, y, glow.light);
        else if ((x + y) % 2 === 0) b.set(x, y, d <= 2.4 ? glow.base : glow.dark);
      }
    };

    // One frame facing right; left is its mirror image
    const seitlich = (animation: string, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", zaubern = animation === "cast";
      const hub = gehen ? (f % 2 === 1 ? -1 : 0) : zaubern ? (f === 0 ? 1 : 0) : f === 1 ? 1 : 0;
      const schritt = gehen ? [2, 0, -2, 0][f] : 0, heben = zaubern ? HEBEN[f] : 0;
      const sy = gehen ? hub : 0, spitze = 10 + sy - heben;
      // feet under the hem
      b.part(10 - schritt, 29, 3, 2, SCHUHE); b.part(12 + schritt, 29, 3, 2, SCHUHE);
      b.part(7, 21, 10, 8, robe);
      b.part(8, 15 + hub, 8, 8, robe);
      b.rect(8, 21, 8, 1, robe.dark);
      // head: a hood sits over it, a hat on top
      if (kapuze) { b.part(8, 7 + hub, 10, 10, robe, true); b.part(13, 9 + hub, 5, 6, HAUT, true); }
      else {
        b.part(9, 9 + hub, 8, 7, HAUT, true);
        b.part(8, 9 + hub, 3, 5, HAAR);
      }
      b.set(17, 12 + hub, HAUT.base);
      b.set(15, 11 + hub, AUGE);
      if (!kapuze) {
        b.part(7, 8 + hub, 11, 2, robe);
        b.part(9, 5 + hub, 7, 3, robe); b.part(9, 3 + hub, 5, 2, robe); b.rect(8, 2 + hub, 3, 1, robe.dark);
      }
      if (p.beard === "short") b.part(13, 14 + hub, 4, 3, HAAR);
      if (p.beard === "long") { b.part(12, 14 + hub, 5, 6, HAAR); b.part(13, 20 + hub, 3, 3, HAAR); }
      if (zaubern && f >= 2) schein(b, 19, spitze - 1.5);
      stab(b, 18, spitze, zaubern && f >= 2);
      // the arm reaches forward and the hand closes round the staff
      const hy = 20 + sy - heben, oben = Math.max(15, hy - 4);
      b.part(11, oben + hub * 0, 5, hy - oben, robe); b.part(16, hy, 4, 2, HAUT, true);
      return b;
    };

    const frontal = (animation: string, d: Direction, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", zaubern = animation === "cast", hinten = d === "up";
      const hub = gehen ? (f % 2 === 1 ? -1 : 0) : zaubern ? (f === 0 ? 1 : 0) : f === 1 ? 1 : 0;
      const heben = zaubern ? HEBEN[f] : 0, sy = gehen ? hub : 0;
      // the staff hand is on the wizard's right: screen left seen from the front, screen right seen from behind
      const sx = (x: number, w: number) => (hinten ? W - x - w : x);
      const links = gehen && f === 0 ? -1 : 0, rechts = gehen && f === 2 ? -1 : 0;
      b.part(8, 29 + links, 3, 2, SCHUHE); b.part(13, 29 + rechts, 3, 2, SCHUHE);
      b.part(6, 21, 12, 8, robe);
      b.part(7, 15 + hub, 10, 8, robe);
      b.rect(7, 21, 10, 1, robe.dark);
      // free arm on the other side
      const hy2 = 20 + hub - heben, oben2 = Math.max(15, hy2 - 4);
      b.part(sx(17, 2), oben2, 2, hy2 - oben2, robe); b.part(sx(17, 3), hy2, 3, 2, HAUT, true);
      const spitze = 10 + sy - heben;
      if (kapuze) b.part(6, 6 + hub, 12, 11, robe, true);
      else b.part(8, 9 + hub, 8, 7, HAUT, true);
      if (hinten) {
        if (!kapuze) {
          const lang = p.beard === "long" ? 10 : 7;
          b.part(8, 8 + hub, 8, lang, HAAR, true);
          for (let y = 11; y < 8 + lang - 1; y++) { b.set(10, y + hub, HAAR.dark); b.set(13, y + hub, HAAR.dark); if (y % 2) b.set(11, y + hub, HAAR.base); }
        }
      } else {
        if (kapuze) b.part(9, 9 + hub, 6, 6, HAUT, true);
        b.set(10, 12 + hub, AUGE); b.set(13, 12 + hub, AUGE);
        b.rect(11, 14 + hub, 2, 1, HAUT.dark);
        if (p.beard === "short") b.part(9, 14 + hub, 6, 3, HAAR);
        if (p.beard === "long") { b.part(9, 14 + hub, 6, 6, HAAR); b.part(10, 20 + hub, 4, 3, HAAR); }
      }
      if (!kapuze) {
        b.part(6, 8 + hub, 12, 2, robe);
        b.part(8, 5 + hub, 8, 3, robe); b.part(10, 3 + hub, 5, 2, robe); b.rect(12, 2 + hub, 3, 1, robe.dark);
      }
      if (zaubern && f >= 2) schein(b, sx(4, 2) + 1, spitze - 1.5);
      stab(b, sx(4, 2), spitze, zaubern && f >= 2);
      // the staff hand on the staff
      const hy = 20 + sy - heben, oben = Math.max(15, hy - 4);
      b.part(sx(5, 2), oben, 2, hy - oben, robe); b.part(sx(4, 3), hy, 3, 2, HAUT, true);
      return b;
    };

    return (animation, d, f) => {
      if (d === "right") return seitlich(animation, f);
      if (d === "left") return seitlich(animation, f).mirrored();
      return frontal(animation, d, f);
    };
  },
});
