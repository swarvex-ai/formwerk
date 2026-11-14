import { CLEAR, hex, Pixels, ramp, type RGBA } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const ROT = "#c0302c", SCHWARZ = "#2a2a34";
// The four suits as 5 × 5 pixel shapes (big symbol) and 5 × 4 (small one on the small card), rows top to bottom
const ZEICHEN: Record<string, { gross: string[]; klein: string[]; rot: boolean }> = {
  hearts: { gross: ["XX.XX", "XXXXX", "XXXXX", ".XXX.", "..X.."], klein: ["XX.XX", "XXXXX", ".XXX.", "..X.."], rot: true },
  diamonds: { gross: ["..X..", ".XXX.", "XXXXX", ".XXX.", "..X.."], klein: ["..X..", ".XXX.", ".XXX.", "..X.."], rot: true },
  clubs: { gross: [".XXX.", ".XXX.", "XXXXX", "X.X.X", "..X.."], klein: [".XXX.", "XXXXX", "X.X.X", "..X.."], rot: false },
  spades: { gross: ["..X..", ".XXX.", "XXXXX", "XXXXX", "..X.."], klein: ["..X..", ".XXX.", "XXXXX", "..X.."], rot: false },
};
// The rank in the top-left corner as a 3 × 5 pixel letter or number: A, 2 to 10, J, Q, K
const RANG: Record<number, string[]> = {
  1: [".X.", "X.X", "XXX", "X.X", "X.X"], 2: ["XXX", "..X", "XXX", "X..", "XXX"], 3: ["XXX", "..X", ".XX", "..X", "XXX"],
  4: ["X.X", "X.X", "XXX", "..X", "..X"], 5: ["XXX", "X..", "XXX", "..X", "XXX"], 6: ["XXX", "X..", "XXX", "X.X", "XXX"],
  7: ["XXX", "..X", ".X.", ".X.", ".X."], 8: ["XXX", "X.X", "XXX", "X.X", "XXX"], 9: ["XXX", "X.X", "XXX", "..X", "XXX"],
  10: ["X.XXX", "X.X.X", "X.X.X", "X.X.X", "X.XXX"], 11: ["..X", "..X", "..X", "X.X", ".X."], 12: [".X.", "X.X", "X.X", "XX.", ".XX"],
  13: ["X.X", "X.X", "XX.", "X.X", "X.X"],
};
// Width of the card during the flip, as a share of its width: the back narrows to the edge, then the face widens
const DREHUNG = [1, 0.6, 0.15, 0.15, 0.6, 1];

export const card = defineSprite({
  id: "card", category: "items",
  title: { de: "Spielkarte", en: "Playing card" },
  description: {
    de: "Eine Spielkarte als Pixel-Symbol für Kartenspiele, Poker und Solitär: Farbe, Wert, Größe, Ecken und die Farben von Vorder- und Rückseite frei wählbar, mit einer Animation, in der sie sich von der Rückseite auf die Vorderseite umdreht. 16 × 16 Pixel.",
    en: "A playing card as a pixel icon for card games, poker and solitaire: suit, rank, size, corners and the colours of face and back as you like, with an animation in which it turns over from its back to its face. 16 × 16 pixels.",
  },
  params: {
    suit: { type: "choice", options: ["hearts", "diamonds", "clubs", "spades"], default: "spades", label: { de: "Farbe", en: "Suit" },
      labels: { hearts: { de: "Herz", en: "hearts" }, diamonds: { de: "Karo", en: "diamonds" }, clubs: { de: "Kreuz", en: "clubs" }, spades: { de: "Pik", en: "spades" } },
      describe: { de: "Das Zeichen der Karte: Herz und Karo rot, Kreuz und Pik schwarz.", en: "The symbol of the card: hearts and diamonds red, clubs and spades black." } },
    rank: { type: "integer", min: 1, max: 13, default: 1, label: { de: "Wert", en: "Rank" },
      describe: { de: "Der Wert oben links: 1 das Ass (A), 2 bis 10, 11 Bube (J), 12 Dame (Q), 13 König (K).", en: "The rank in the top-left corner: 1 the ace (A), 2 to 10, 11 jack (J), 12 queen (Q), 13 king (K)." } },
    size: { type: "integer", min: 12, max: 14, default: 14, label: { de: "Größe", en: "Size" },
      describe: { de: "Höhe der Karte in Pixeln, die Breite folgt im Seitenverhältnis einer echten Karte: 14 groß (10 Pixel breit) mit großem Zeichen, 13 mittel (9), 12 klein (8) mit kleinem Zeichen.", en: "Height of the card in pixels, the width follows the proportions of a real card: 14 big (10 pixels wide) with a big symbol, 13 medium (9), 12 small (8) with a small symbol." } },
    corners: { type: "choice", options: ["round", "sharp"], default: "round", label: { de: "Ecken", en: "Corners" },
      labels: { round: { de: "rund", en: "round" }, sharp: { de: "scharf", en: "sharp" } },
      describe: { de: "Abgerundete Ecken wie bei üblichen Spielkarten, oder scharfe wie bei alten oder selbst geschnittenen Karten.", en: "Rounded corners like everyday playing cards, or sharp ones like old or hand-cut cards." } },
    back: { type: "color", default: "#2f5aa8", label: { de: "Rückseite", en: "Back" },
      describe: { de: "Farbe der Rückseite: Blau #2f5aa8 oder Rot #b8312f wie bei Pokerkarten, Grün #2f7a4a.", en: "Colour of the back: blue #2f5aa8 or red #b8312f as on poker cards, green #2f7a4a." } },
    face: { type: "color", default: "#f4f0e6", label: { de: "Papier", en: "Paper" },
      describe: { de: "Farbe des Papiers: Weiß #f4f0e6 üblich, Elfenbein #e8dcbc für alte Karten.", en: "Colour of the paper: white #f4f0e6 usual, ivory #e8dcbc for old cards." } },
  },
  presets: {
    "ace-of-spades": { label: { de: "Pik-Ass", en: "Ace of spades" }, values: { suit: "spades", rank: 1 } },
    "red-back-hearts": { label: { de: "Herz-König mit roter Rückseite", en: "King of hearts, red back" }, values: { suit: "hearts", rank: 13, back: "#b8312f" } },
    "old-diamonds": { label: { de: "Alte Karo-Sieben", en: "Old seven of diamonds" }, values: { suit: "diamonds", rank: 7, size: 12, corners: "sharp", back: "#2f7a4a", face: "#e8dcbc" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "flip", frames: 6, fps: 12, loop: false }],
  grounded: false,
  build(p) {
    const papier = ramp(p.face), ruecken = ramp(p.back), zeichen = ZEICHEN[p.suit];
    const tinte = hex(zeichen.rot ? ROT : SCHWARZ), h = p.size, w = Math.round(h * 0.7), rund = p.corners === "round";
    const muster = (b: Pixels, x: number, y: number, zeilen: string[], c: RGBA) =>
      zeilen.forEach((z, j) => [...z].forEach((ch, i) => { if (ch === "X") b.set(x + i, y + j, c); }));
    // The sides drawn once at full width (the face also blank, as it shows while turned away); the flip squeezes them
    const seite = (art: "vorn" | "leer" | "hinten") => {
      const b = new Pixels(w, h);
      b.rect(0, 0, w, h, papier.base);
      b.rect(0, h - 1, w, 1, papier.dark);
      if (art === "vorn") {
        // The rank in the top-left corner, below it the suit at the right (big from 13 pixels on, small on the 12)
        muster(b, 1, 1, RANG[p.rank], tinte);
        const s = h >= 13 ? zeichen.gross : zeichen.klein;
        muster(b, w - 6, 7, s, tinte);
      } else if (art === "hinten") {
        // The back: a paper rim around a field with a diamond lattice
        for (let y = 1; y < h - 2; y++) for (let x = 1; x < w - 1; x++)
          b.set(x, y, (x + y) % 4 === 0 || (x - y + 64) % 4 === 0 ? ruecken.light : ruecken.base);
      }
      if (rund) for (const [x, y] of [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]]) b.set(x, y, CLEAR);
      return b;
    };
    const vorn = seite("vorn"), leer = seite("leer"), hinten = seite("hinten");
    const y0 = Math.floor((H - h) / 2);
    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      const anteil = animation === "flip" ? DREHUNG[f] : 1, zeigtVorn = animation !== "flip" || f >= 3;
      // Squeezed rank and suit would turn into stray marks: the face shows them only when it faces us fully
      const quelle = zeigtVorn ? (anteil === 1 ? vorn : leer) : hinten, breite = Math.max(2, Math.round(w * anteil)), x0 = Math.floor((W - breite) / 2);
      if (breite === w) { b.blit(quelle, x0, y0); return b; }
      // Squeezed: every column of the side, sampled from the full-width drawing
      for (let i = 0; i < breite; i++) {
        const sx = Math.min(w - 1, Math.floor(((i + 0.5) * w) / breite));
        for (let y = 0; y < h; y++) if (quelle.alpha(sx, y)) b.set(x0 + i, y0 + y, quelle.get(sx, y));
      }
      return b;
    };
  },
});
