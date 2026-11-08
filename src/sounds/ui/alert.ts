import { buffer, Osc, RATE, semitones } from "../../core/audio";
import { defineSound } from "../define";

export const alert = defineSound({
  id: "alert", category: "ui",
  title: { de: "Hinweiston", en: "Alert" },
  description: {
    de: "Pieptöne in einem Muster: eine Erinnerung, ein abgelaufener Timer, ein Alarm. Dringlichkeit über Zahl, Tempo und Klangfarbe.",
    en: "Beeps in a pattern: a reminder, a finished timer, an alarm. Urgency through count, pace and timbre.",
  },
  params: {
    pitch: { type: "number", min: 400, max: 3000, step: 10, default: 1000, unit: "Hz", label: { de: "Tonhöhe", en: "Pitch" },
      describe: { de: "Höhe der Töne: 600 Hz ruhig, 1000 Hz üblich, 2500 Hz durchdringend wie ein Wecker.", en: "Pitch of the beeps: 600 Hz calm, 1000 Hz usual, 2500 Hz piercing like an alarm clock." } },
    beeps: { type: "integer", min: 1, max: 8, default: 2, label: { de: "Töne", en: "Beeps" },
      describe: { de: "Wie viele Töne: 1 bis 2 für eine Mitteilung, 4 für einen Timer, 6 bis 8 für einen Alarm.", en: "How many beeps: 1 to 2 for a notification, 4 for a timer, 6 to 8 for an alarm." } },
    interval: { type: "number", min: 0.08, max: 0.5, step: 0.01, default: 0.16, unit: "s", label: { de: "Takt", en: "Interval" },
      describe: { de: "Zeit von Ton zu Ton: 0,1 s hektisch, 0,16 s üblich, 0,4 s gelassen.", en: "Time from beep to beep: 0.1 s hectic, 0.16 s usual, 0.4 s relaxed." } },
    beep: { type: "number", min: 0.03, max: 0.3, step: 0.01, default: 0.08, unit: "s", label: { de: "Tonlänge", en: "Beep length" },
      describe: { de: "Dauer jedes Tons (höchstens bis zum nächsten): 0,05 s kurz, 0,08 s üblich, 0,25 s gehalten.", en: "Duration of each beep (at most until the next): 0.05 s short, 0.08 s usual, 0.25 s held." } },
    wave: { type: "choice", options: ["sine", "triangle", "square"], default: "sine", label: { de: "Klangfarbe", en: "Timbre" },
      labels: { sine: { de: "Sinus (sanft)", en: "Sine (gentle)" }, triangle: { de: "Dreieck (klar)", en: "Triangle (clear)" }, square: { de: "Rechteck (dringend)", en: "Square (urgent)" } },
      describe: { de: "Sinus für sanfte Hinweise, Dreieck klar und freundlich, Rechteck dringend wie ein Rauchmelder.", en: "Sine for gentle notes, triangle clear and friendly, square urgent like a smoke alarm." } },
    pattern: { type: "choice", options: ["same", "alternate", "rising"], default: "same", label: { de: "Muster", en: "Pattern" },
      labels: { same: { de: "Gleich", en: "Same" }, alternate: { de: "Wechselnd", en: "Alternate" }, rising: { de: "Steigend", en: "Rising" } },
      describe: { de: "Gleich bleibende Töne, abwechselnd hoch und tief wie ein Martinshorn, oder steigend für Fortschritt und Erinnerungen.", en: "Steady beeps, alternating high and low like a siren, or rising for progress and reminders." } },
  },
  presets: {
    notification: { label: { de: "Mitteilung", en: "Notification" }, values: { pitch: 880, beeps: 2, interval: 0.14, beep: 0.09, wave: "sine", pattern: "rising" } },
    timer: { label: { de: "Timer", en: "Timer" }, values: { pitch: 1400, beeps: 4, interval: 0.12, beep: 0.06, wave: "triangle", pattern: "same" } },
    alarm: { label: { de: "Alarm", en: "Alarm" }, values: { pitch: 2000, beeps: 8, interval: 0.15, beep: 0.12, wave: "square", pattern: "alternate" } },
    reminder: { label: { de: "Erinnerung", en: "Reminder" }, values: { pitch: 700, beeps: 1, beep: 0.25, wave: "sine" } },
  },
  loop: false, maxSeconds: 4,
  build(p) {
    const dauer = Math.min(p.beep, p.interval * 0.85), s = buffer((p.beeps - 1) * p.interval + dauer + 0.06);
    for (let n = 0; n < p.beeps; n++) {
      const stufe = p.pattern === "alternate" ? (n % 2 ? -4 : 0) : p.pattern === "rising" ? Math.min(n, 4) * 4 : 0;
      const hz = semitones(p.pitch, stufe), osc = new Osc(p.wave), at = Math.round(n * p.interval * RATE);
      const laut = p.wave === "square" ? 0.5 : p.wave === "triangle" ? 0.85 : 1;
      for (let i = 0; i < (dauer + 0.04) * RATE && at + i < s.length; i++) {
        const t = i / RATE, an = Math.min(1, t / 0.004), aus = t < dauer ? 1 : Math.exp(-(t - dauer) / 0.008);
        s[at + i] += osc.next(hz) * an * aus * laut;
      }
    }
    return s;
  },
});
