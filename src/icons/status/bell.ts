import { line, onCircle, polygon, translate, type Pt } from "../../core/vector";
import { area, defineIcon, dot, gap, stroke, type Part } from "../define";

export const bell = defineIcon({
  id: "bell", category: "status",
  title: { de: "Glocke", en: "Bell" },
  description: {
    de: "Eine Glocke für Mitteilungen und Erinnerungen, mit Klöppel und durchgestrichen für stumm.",
    en: "A bell for notifications and reminders, with a clapper, and crossed out for muted.",
  },
  params: {
    width: { type: "number", min: 12, max: 18, step: 0.5, default: 16, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite am Rand in Rasterpunkten (von 24): 13 schlank, 16 üblich, 18 breit wie eine Schiffsglocke.", en: "Width at the rim in grid units (of 24): 13 slim, 16 usual, 18 wide like a ship's bell." } },
    height: { type: "number", min: 10, max: 15, step: 0.5, default: 13.5, label: { de: "Höhe", en: "Height" },
      describe: { de: "Höhe vom Scheitel bis zum Rand: 11 gedrungen, 13,5 üblich, 15 hoch wie eine Kirchenglocke.", en: "Height from the crown to the rim: 11 squat, 13.5 usual, 15 tall like a church bell." } },
    flare: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Ausstellung", en: "Flare" },
      describe: { de: "Wie weit der Rand ausschwingt: 0 gerade Seiten, 0,5 üblich, 1 weit ausgestellt wie eine klassische Glocke.", en: "How far the rim flares: 0 straight sides, 0.5 usual, 1 wide like a classic bell." } },
    clapper: { type: "boolean", default: true, label: { de: "Klöppel", en: "Clapper" },
      describe: { de: "Der Klöppel unter dem Rand; ohne wirkt die Glocke ruhiger und kompakter.", en: "The clapper below the rim; without it the bell looks calmer and more compact." } },
    muted: { type: "boolean", default: false, label: { de: "Stumm", en: "Muted" },
      describe: { de: "Ein Schrägstrich mit freiem Rand: Mitteilungen aus, nicht stören.", en: "A slash with a clear margin: notifications off, do not disturb." } },
  },
  presets: {
    notifications: { label: { de: "Mitteilungen", en: "Notifications" }, values: { clapper: true } },
    unread: { label: { de: "Ungelesen", en: "Unread" }, values: { badge: true } },
    mute: { label: { de: "Stumm", en: "Mute" }, values: { muted: true } },
  },
  build(p, pen) {
    const hw = pen.width / 2, rand = p.clapper ? 19 : 20.5, halb = p.width / 2;
    const knauf = 1.5, scheitel = Math.max(rand - p.height, 1 + hw + knauf);
    // Dome on top, straight sides, then the rim flares out
    const rd = Math.max(3, halb - p.flare * 2.75), schulter = scheitel + rd, knick = rand - 1.25 - p.flare * 1.5;
    const kuppel = Array.from({ length: 13 }, (_, i) => onCircle([12, schulter], rd, 270 + i * 15));
    const seite = (x: number): Pt[] => [[12 + x * Math.min(rd, halb), Math.max(knick, schulter)]];
    const umriss: Pt[] = [[12 - halb, rand], ...seite(-1), ...kuppel, ...seite(1), [12 + halb, rand]];
    const teile: Part[] = [area(polygon(...umriss)), stroke(line([12, scheitel], [12, scheitel - knauf]))];
    const klapper = Math.min(2.6, 23 - rand - 0.5);
    if (p.clapper) teile.push(dot(polygon(...Array.from({ length: 9 }, (_, i) => onCircle([12, rand], klapper, 90 + i * 22.5)))));
    // Centre top to bottom: from the knob to the clapper or the rim
    const dy = Math.min(0, 12 - (scheitel - knauf - hw + (p.clapper ? rand + klapper : rand + hw)) / 2);
    const mitte = teile.map((t) => ({ ...t, shape: translate(t.shape, 0, dy) }));
    if (p.muted) {
      const e = 1 + (pen.corners === "sharp" ? hw * Math.SQRT2 : hw) + 0.5, strich = line([e, e], [24 - e, 24 - e]);
      mitte.push(gap(strich, 1.25), stroke(strich));
    }
    return mitte;
  },
});
