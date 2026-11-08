import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const pop = defineSound({
  id: "pop", category: "ui",
  title: { de: "Pop", en: "Pop" },
  description: {
    de: "Ein kurzes Plopp mit gleitender Tonhöhe: Nachricht gesendet oder empfangen, ein Fenster geht auf oder zu, eine Blase platzt.",
    en: "A short pop with a gliding pitch: a message sent or received, a panel opening or closing, a bubble bursting.",
  },
  params: {
    pitch: { type: "number", min: 200, max: 2000, step: 10, default: 700, unit: "Hz", label: { de: "Tonhöhe", en: "Pitch" },
      describe: { de: "Wo das Plopp beginnt: 300 Hz dumpf wie ein Korken, 700 Hz freundlich, 1500 Hz hell wie ein Tropfen.", en: "Where the pop starts: 300 Hz dull like a cork, 700 Hz friendly, 1500 Hz bright like a drop." } },
    glide: { type: "number", min: -1, max: 1, step: 0.05, default: 0.6, label: { de: "Gleiten", en: "Glide" },
      describe: { de: "Wohin die Tonhöhe gleitet, in Oktaven: 0,6 aufwärts für Senden und Öffnen, −0,6 abwärts für Schließen, 0 ein gerader Ton.", en: "Where the pitch glides, in octaves: 0.6 up for send and open, −0.6 down for close, 0 a straight tone." } },
    length: { type: "number", min: 0.03, max: 0.25, step: 0.005, default: 0.09, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer des Plopps: 0,05 s knapp für Listen, 0,09 s üblich, 0,2 s weich wie eine Blase.", en: "Duration of the pop: 0.05 s brief for lists, 0.09 s usual, 0.2 s soft like a bubble." } },
    snap: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Knack", en: "Snap" },
      describe: { de: "Ein kurzes Knacken am Anfang: 0 ganz weich, 0,3 üblich, 0,8 wie ein platzender Ballon.", en: "A short snap at the start: 0 entirely soft, 0.3 usual, 0.8 like a bursting balloon." } },
  },
  presets: {
    send: { label: { de: "Senden", en: "Send" }, values: { pitch: 600, glide: 0.8, length: 0.08, snap: 0.2 } },
    receive: { label: { de: "Empfangen", en: "Receive" }, values: { pitch: 1100, glide: -0.4, length: 0.11, snap: 0.1 } },
    bubble: { label: { de: "Blase", en: "Bubble" }, values: { pitch: 350, glide: 1, length: 0.2, snap: 0.6 } },
  },
  loop: false, maxSeconds: 0.35,
  build(p, seed) {
    const r = rng(seed), s = buffer(p.length + 0.02), osc = new Osc("sine"), hp = new Biquad("highpass", 2500, 0.8);
    for (let i = 0; i < s.length; i++) {
      const t = i / RATE, weg = Math.min(1, t / p.length);
      // The pitch glides fast at first, then settles, like air leaving a bubble
      const f = p.pitch * 2 ** (p.glide * (1 - Math.exp(-weg * 3)) / (1 - Math.exp(-3)));
      s[i] = osc.next(f) * envelope(t, 0.003, p.length / 3.5) + hp.run(white(r)) * envelope(t, 0.0003, 0.0025) * p.snap * 0.9;
    }
    return s;
  },
});
