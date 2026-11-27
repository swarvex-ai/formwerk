import { Biquad, buffer, envelope, LowPass, Osc, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Resonances of the drawer's body (frequency, Q) and the low thump of its front against the carcass
const KOERPER = { small: [[900, 5], [2200, 6]], large: [[350, 4], [900, 5]] } as const;
const DUMPF = { small: 160, large: 85 } as const;
// Where the rub of wood on wood sits
const REIBEN = { small: 1600, large: 800 } as const;
const VOR = 0.01, NACH = 0.32;

export const drawer = defineSound({
  id: "drawer", category: "movement",
  title: { de: "Schublade", en: "Drawer" },
  description: {
    de: "Eine Holzschublade, die aufgezogen oder zugeschoben wird: Holz reibt auf Holz, der Inhalt klappert, und am Ende ein Anschlag. Für Inventar öffnen, Spiele und Szenen.",
    en: "A wooden drawer pulled open or pushed shut: wood rubbing on wood, its contents rattling, and a knock at the end. For opening an inventory, games and scenes.",
  },
  params: {
    action: { type: "choice", options: ["open", "shut"], default: "open", label: { de: "Aktion", en: "Action" },
      labels: { open: { de: "Aufziehen", en: "Open" }, shut: { de: "Zuschieben", en: "Shut" } },
      describe: { de: "Aufziehen: schnell los, langsam aus, ein weicher Halt am Ende der Laufschienen; Zuschieben: langsam los, immer schneller, ein dumpfer Schlag der Front gegen den Korpus.", en: "Open: starts fast, slows down, a soft stop at the end of the runners; shut: starts slow, speeds up, a dull knock of the front against the carcass." } },
    travel: { type: "number", min: 0.15, max: 0.9, step: 0.05, default: 0.4, label: { de: "Weg", en: "Travel" },
      describe: { de: "Wie lange die Schublade gleitet, in Sekunden: 0,2 eine kleine Apothekerschublade, 0,4 eine Schreibtischschublade, 0,8 eine tiefe Kommode.", en: "How long the drawer slides, in seconds: 0.2 a small apothecary drawer, 0.4 a desk drawer, 0.8 a deep dresser." } },
    size: { type: "choice", options: ["small", "large"], default: "small", label: { de: "Größe", en: "Size" },
      labels: { small: { de: "Klein", en: "Small" }, large: { de: "Groß", en: "Large" } },
      describe: { de: "Klein klingt höher und dünner (Resonanzen um 900 und 2200 Hz), groß tiefer und voller (um 350 und 900 Hz).", en: "Small sounds higher and thinner (resonances near 900 and 2200 Hz), large lower and fuller (near 350 and 900 Hz)." } },
    contents: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Inhalt", en: "Contents" },
      describe: { de: "Was darin klappert: 0 leer, 0,3 ein paar Dinge, 1 eine Schublade voller Glas.", en: "What rattles inside: 0 empty, 0.3 a few things, 1 a drawer full of glass." } },
    stiff: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Klemmen", en: "Stiff" },
      describe: { de: "Wie sehr die Laufschienen klemmen: 0 glatt gewachst, 0,3 gewöhnlich, 0,9 eine alte, verzogene Kommode; höher reibt rauer und lauter, mit kurzem Rucken.", en: "How much the runners stick: 0 smoothly waxed, 0.3 ordinary, 0.9 an old warped dresser; higher rubs rougher and louder, with short judders." } },
  },
  presets: {
    apothecary: { label: { de: "Apothekerschrank", en: "Apothecary cabinet" }, values: { size: "small", travel: 0.2, contents: 0.7 } },
    "desk-shut": { label: { de: "Schreibtisch zuschieben", en: "Shut a desk drawer" }, values: { action: "shut", size: "large", travel: 0.35, contents: 0.2 } },
    "old-dresser": { label: { de: "Alte Kommode", en: "Old dresser" }, values: { size: "large", travel: 0.8, stiff: 0.9, contents: 0 } },
  },
  loop: false, maxSeconds: 1.3,
  build(p, seed) {
    const r = rng(seed), shut = p.action === "shut", gross = p.size as keyof typeof KOERPER, T = p.travel;
    const s = buffer(VOR + T + NACH), von = Math.round(VOR * RATE), n = Math.round(T * RATE);
    // Speed over the travel: opening starts fast and slows down, shutting starts slow and speeds up
    const tempo = (x: number) => Math.min(1, x * T / 0.025) * (shut ? 0.35 + 0.65 * x ** 1.5 : (1 - x) ** 0.8);
    // The slide: band-passed noise, roughened every few ms, and the stick-slip judders of stiff runners
    const rub = new Biquad("bandpass", REIBEN[gross], 1.1), weich = new Biquad("lowpass", REIBEN[gross] * 2), luft = new LowPass();
    const koerper = KOERPER[gross].map(([f, q]) => new Biquad("bandpass", f, q));
    const rau = smooth(r, T + 0.05, 0.004), wandern = smooth(r, T + 0.1, 0.06);
    const laut = 0.45 * (0.6 + 0.8 * p.stiff), rate = 18 + 22 * p.stiff;
    let phase = 0;
    for (let i = 0; i < n; i++) {
      const x = i / n, v = tempo(x), ende = Math.min(1, (n - i) / (0.008 * RATE));
      const rough = 0.35 + (0.65 + 0.5 * p.stiff) * rau(i / RATE) ** 2;
      phase += rate * (0.3 + v) * (0.7 + 0.6 * wandern(i / RATE)) / RATE;
      const zufall = r();
      let ruck = 0;
      if (phase >= 1) { phase -= 1; ruck = p.stiff * p.stiff * (0.5 + 0.5 * zufall) * 0.6; }
      let y = 0;
      koerper.forEach((f, k) => { y += f.run(ruck + white(r) * 0.01) / (k + 1); });
      s[von + i] += (weich.run(rub.run(white(r))) * rough * laut + luft.run(white(r), 400) * 0.03) * v * ende + y * 2.5 * v;
    }
    // The end: a dull knock of the front when shutting, a softer stop at the end of the runners when opening
    const an = von + n, amp = shut ? 0.5 : 0.17, tau = shut ? 0.022 : 0.016, angriff = shut ? 0.0015 : 0.004;
    const tiefes = new Osc("sine"), klick = new LowPass(), resonanz = KOERPER[gross].map(([f, q]) => new Biquad("bandpass", f, q * 1.5));
    for (let i = 0; an + i < s.length && i < 0.25 * RATE; i++) {
      const t = i / RATE, stoss = white(r) * envelope(t, 0.0005, 0.003);
      let y = 0;
      resonanz.forEach((f, k) => { y += f.run(stoss) * (k ? 0.6 : 1); });
      s[an + i] += (tiefes.next(DUMPF[gross] * (1 + 0.15 * Math.exp(-t / 0.01))) * envelope(t, angriff, tau)
        + klick.run(white(r), (shut ? 1.6 : 0.8) * DUMPF[gross] * 6) * envelope(t, angriff * 0.5, 0.006) * 1.2 + y * 3) * amp;
    }
    // The rattle of the contents, from its own stream: small knocks of glass and tools while it slides, a few after the end
    if (p.contents > 0) {
      const d = rng(seed + 1), count = Math.round(p.contents * (4 + 30 * T));
      for (let c = 0; c < count; c++) {
        const nach = d() < 0.25, at = nach ? T + 0.004 + 0.07 * d() ** 2 : T * (shut ? Math.sqrt(d()) : 1 - Math.sqrt(d()));
        const glas = d() < 0.6, hz = glas ? 2600 + 3400 * d() : 1100 + 1200 * d(), dauer = glas ? 0.006 + 0.01 * d() : 0.004;
        const lautst = (0.012 + 0.03 * p.contents) * (0.4 + 0.6 * d()) * (nach ? (shut ? 1.4 : 0.8) : 1);
        const a = Math.round((VOR + at) * RATE), o = new Osc("sine", d()), o2 = new Osc("sine", d()), bp = new Biquad("bandpass", hz, 2);
        for (let i = 0; a + i < s.length && i < dauer * 6 * RATE; i++) {
          const t = i / RATE;
          s[a + i] += ((glas ? o.next(hz) + 0.5 * o2.next(hz * 2.76) : 0) * envelope(t, 0.0003, dauer) * 0.6
            + bp.run(white(d)) * envelope(t, 0.0002, 0.002) * 3) * lautst;
        }
      }
    }
    return s;
  },
});
