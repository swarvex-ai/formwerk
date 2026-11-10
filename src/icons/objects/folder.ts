import { line, polygon, rect } from "../../core/vector";
import { area, defineIcon, detail, gap, type Part } from "../define";
import { centre, CLEAR, EDGE } from "../shared";

export const folder = defineIcon({
  id: "folder", category: "objects",
  title: { de: "Ordner", en: "Folder" },
  description: {
    de: "Ein Ordner für Dateien und Ablagen, geschlossen oder geöffnet, mit oder ohne Lasche und mit Hinweispunkt für neue Inhalte.",
    en: "A folder for files and storage, closed or open, with or without a tab and with a badge for new contents.",
  },
  params: {
    width: { type: "number", min: 15, max: 21.5, step: 0.5, default: 19, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite des Ordners in Rasterpunkten (von 24): 16 kompakt, 19 üblich, 21,5 randlos.", en: "Width of the folder in grid units (of 24): 16 compact, 19 usual, 21.5 edge to edge." } },
    height: { type: "number", min: 12, max: 17, step: 0.5, default: 14, label: { de: "Höhe", en: "Height" },
      describe: { de: "Höhe des Ordners ohne Lasche: 12 flach wie ein Umschlag, 14 üblich, 17 hoch wie ein Archivordner.", en: "Height of the folder without the tab: 12 flat like a sleeve, 14 usual, 17 tall like an archive folder." } },
    tab: { type: "boolean", default: true, label: { de: "Lasche", en: "Tab" },
      describe: { de: "Die Lasche oben links, an der man den Ordner beschriftet; ohne wirkt er wie ein einfacher Umschlag.", en: "The tab at the top left where the folder is labelled; without it looks like a plain sleeve." } },
    open: { type: "boolean", default: false, label: { de: "Geöffnet", en: "Open" },
      describe: { de: "Die Vorderklappe ist schräg aufgeklappt, etwa beim Hineinziehen einer Datei oder für einen geöffneten Ordner.", en: "The front flap is tilted open, for dragging a file in or for an opened folder." } },
  },
  presets: {
    folder: { label: { de: "Ordner", en: "Folder" }, values: { tab: true, open: false } },
    "open-folder": { label: { de: "Geöffnet", en: "Open folder" }, values: { open: true, tab: true } },
    documents: { label: { de: "Dokumente", en: "Documents" }, values: { badge: true, height: 15 } },
  },
  build(p, pen) {
    const hw = pen.width / 2, tabH = Math.max(3.2, pen.width + 1);
    const w = Math.min(p.width, 24 - 2 * EDGE - pen.width);
    const h = Math.min(p.height, 24 - 2 * EDGE - pen.width - (p.tab ? tabH : 0));
    const links = -w / 2, rechts = w / 2, oben = 0, unten = h, teile: Part[] = [];
    if (p.tab) teile.push(area(rect(links, oben - tabH, Math.max(5, w * 0.42), tabH + 0.5, 1)));
    teile.push(area(rect(links, oben, w, h, 1.5)));
    if (p.open) {
      // The back reaches the bottom; the front flap leans open inside its outline
      const e = Math.min(3, w * 0.18), vorn = oben + h * 0.35;
      const klappe = polygon([links + e, vorn], [rechts, vorn], [rechts - e, unten], [links, unten]);
      teile.push(gap(klappe), area(klappe));
    } else {
      // A fold line across the front, clear of the outline
      const rand = 2 * hw + CLEAR;
      teile.push(detail(line([links + rand, oben + h * 0.55], [rechts - rand, oben + h * 0.55])));
    }
    return centre(teile, pen);
  },
});
