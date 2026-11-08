// The sounds tab: every sound with controls generated from its parameter schema, presets, playback (loops repeat
// until stopped), its spectrogram and waveform with a playhead, a share link, a code snippet and a .wav download made
// in the browser. No three.js: this tab loads without it.
import { metrics, RATE, spectrogram, toWav } from "../core/audio";
import { defaults, random, withPreset, type Param } from "../core/params";
import { rng } from "../core/rng";
import { SOUNDS, soundById } from "../sounds";
import { makeSound, SOUND_CATEGORIES, type AnySound } from "../sounds/define";
import { de, el, feld, hashSetzen, hashTeile, kebabZuCamel, knopf, kopieren, speichern, T, text, zahl, type Bereich, type Galerie } from "./shell";

const K = de
  ? { kategorien: { ui: "Bedienung", impact: "Treffer & Explosionen", movement: "Bewegung", effects: "Effekte", voice: "Stimmen", ambience: "Umgebung und Wetter" },
      spielen: "▶ Abspielen", stoppen: "■ Stopp", schleife: "nahtlose Schleife", einmal: "Einzelklang", spitze: "Spitze", lautheit: "Lautheit",
      wav: "Herunterladen (.wav, 48 kHz mono)", automatisch: "Nach jeder Änderung abspielen", bild: "Spektrogramm (Zeit nach rechts, Tonhöhe nach oben) und Wellenform" }
  : { kategorien: { ui: "Interface", impact: "Hits & explosions", movement: "Movement", effects: "Effects", voice: "Voices", ambience: "Ambience and weather" },
      spielen: "▶ Play", stoppen: "■ Stop", schleife: "seamless loop", einmal: "one-shot", spitze: "peak", lautheit: "loudness",
      wav: "Download (.wav, 48 kHz mono)", automatisch: "Play after every change", bild: "Spectrogram (time to the right, pitch up) and waveform" };

let audio: AudioContext | null = null;
const kontext = () => (audio ??= new AudioContext({ sampleRate: RATE }));

export async function start(b: Bereich): Promise<Galerie> {
  const dreid = b.buehne.querySelector<HTMLCanvasElement>("canvas.dreid");
  if (dreid) dreid.hidden = true;
  let bildflaeche = b.buehne.querySelector<HTMLCanvasElement>("canvas.klangbild");
  if (!bildflaeche) {
    bildflaeche = el("canvas", { class: "klangbild", role: "img", "aria-label": K.bild }) as HTMLCanvasElement;
    b.buehne.prepend(bildflaeche);
  }
  const canvas = bildflaeche;
  canvas.hidden = false;
  const g = canvas.getContext("2d")!;

  let klang: AnySound = SOUNDS[0], werte: Record<string, unknown> = {}, seed = 1;
  let samples = new Float32Array(1) as Float32Array<ArrayBuffer>;
  let quelle: AudioBufferSourceNode | null = null, startZeit = 0, rahmen = 0, standbild: ImageData | null = null;
  let automatisch = true;
  const spielKnopf = knopf(K.spielen, () => (quelle ? stoppen() : spielen()));
  spielKnopf.classList.add("haupt", "spielen");

  const nichtStandard = () => Object.fromEntries(Object.entries(werte).filter(([k, v]) => v !== klang.params[k].default));

  // Picture: spectrogram above, waveform below, frequency marks on the left
  const zeichnen = () => {
    const breite = Math.max(64, Math.round(canvas.clientWidth)), hoehe = Math.max(64, Math.round(canvas.clientHeight));
    canvas.width = breite; canvas.height = hoehe;
    const oben = Math.round(hoehe * 0.72), welle = hoehe - oben;
    g.putImageData(new ImageData(spectrogram(samples, breite, oben), breite, oben), 0, 0);
    g.fillStyle = "#0f1114"; g.fillRect(0, oben, breite, welle);
    g.fillStyle = "#22d3ee";
    const proSpalte = samples.length / breite, mitte = oben + welle / 2;
    for (let x = 0; x < breite; x++) {
      let lo = 0, hi = 0;
      for (let i = Math.floor(x * proSpalte); i < Math.min(samples.length, Math.floor((x + 1) * proSpalte) + 1); i++) { lo = Math.min(lo, samples[i]); hi = Math.max(hi, samples[i]); }
      g.fillRect(x, mitte - (hi * welle) / 2.2, 1, Math.max(1, ((hi - lo) * welle) / 2.2));
    }
    g.font = "11px ui-monospace, monospace"; g.fillStyle = "rgba(232,234,237,.75)";
    for (const [hz, name] of [[100, "100 Hz"], [1000, "1 kHz"], [10000, "10 kHz"]] as const) {
      const y = oben * (1 - Math.log(hz / 40) / Math.log(20000 / 40));
      g.fillRect(0, y, 6, 1); g.fillText(name, 9, y + 4);
    }
    g.fillText(`${zahl(samples.length / RATE, 2)} s`, breite - 60, oben - 6);
    standbild = g.getImageData(0, 0, breite, hoehe);
  };
  const kopf = () => {
    if (!quelle || !standbild || !audio) return;
    g.putImageData(standbild, 0, 0);
    const dauer = samples.length / RATE, t = (audio.currentTime - startZeit) % dauer;
    g.fillStyle = "#fff"; g.fillRect(Math.round((t / dauer) * canvas.width), 0, 2, canvas.height);
    rahmen = requestAnimationFrame(kopf);
  };

  const stoppen = () => {
    if (quelle) { quelle.onended = null; try { quelle.stop(); } catch { /* schon zu Ende */ } quelle = null; }
    cancelAnimationFrame(rahmen);
    if (standbild) g.putImageData(standbild, 0, 0);
    spielKnopf.textContent = K.spielen;
  };
  const spielen = () => {
    stoppen();
    const ctx = kontext();
    void ctx.resume();
    const puffer = ctx.createBuffer(1, samples.length, RATE);
    puffer.copyToChannel(samples, 0);
    const q = ctx.createBufferSource();
    q.buffer = puffer; q.loop = klang.loop;
    q.connect(ctx.destination);
    q.onended = () => { if (quelle === q) stoppen(); };
    startZeit = ctx.currentTime + 0.01;
    q.start(startZeit);
    quelle = q;
    if (klang.loop) spielKnopf.textContent = K.stoppen;
    rahmen = requestAnimationFrame(kopf);
  };

  const neuBauen = (abspielen = false) => {
    const lief = quelle !== null;
    samples = makeSound(klang, werte, seed).samples;
    const m = metrics(samples);
    b.werte.textContent = `${zahl(m.seconds, 3)} s · ${klang.loop ? K.schleife : K.einmal} · ${K.spitze} ${zahl(m.peakDb, 1)} dBFS · ${K.lautheit} ${zahl(m.rmsDb, 1)} dB RMS · 48 kHz mono`;
    zeichnen();
    hashSetzen(klang.id, nichtStandard(), seed);
    // Hear every change at once: one-shots play again, a running loop continues with the new sound
    if (lief || (abspielen && audio && automatisch && !klang.loop)) spielen();
    else stoppen();
  };

  const listeZeichnen = () => {
    b.liste.replaceChildren(...SOUND_CATEGORIES.filter((k) => SOUNDS.some((s) => s.category === k)).map((k) => el("section", {}, el("h2", {}, K.kategorien[k]),
      ...SOUNDS.filter((s) => s.category === k).map((s) => {
        const k2 = el("button", { type: "button", "aria-pressed": String(s.id === klang.id) }, text(s.title));
        k2.onclick = () => { stoppen(); klang = s; werte = defaults(s.params); seed = 1; listeZeichnen(); reglerZeichnen(); neuBauen(true); };
        return k2;
      }))));
  };

  const reglerZeichnen = () => {
    const seedFeld = el("input", { id: "p-seed", type: "number", min: "1", step: "1", value: String(seed) }) as HTMLInputElement;
    seedFeld.onchange = () => { seed = Math.max(1, Math.round(Number(seedFeld.value)) || 1); neuBauen(true); };
    const auto = el("input", { id: "k-auto", type: "checkbox" }) as HTMLInputElement;
    auto.checked = automatisch;
    auto.onchange = () => { automatisch = auto.checked; };
    const looks = el("div", { class: "looks", role: "group", "aria-label": T.looks }, ...Object.entries(klang.presets).map(([name, p]) =>
      knopf(text(p.label), () => { werte = withPreset(klang.params, klang.presets, { preset: name }); seed = 1; reglerZeichnen(); neuBauen(true); })));
    const wav = knopf(K.wav, () => speichern(toWav(samples), "audio/wav", `${klang.id}${seed !== 1 ? "-" + seed : ""}.wav`));
    wav.classList.add("haupt");
    b.regler.replaceChildren(
      el("h2", {}, text(klang.title)), el("p", { class: "leise" }, text(klang.description)),
      el("div", { class: "knoepfe" }, spielKnopf),
      el("label", { class: "haken", for: "k-auto" }, auto, K.automatisch),
      el("h3", {}, T.looks), looks,
      ...Object.entries(klang.params).map(([k, p]) => feld(k, p as Param, werte[k], (v) => { werte = { ...werte, [k]: v }; neuBauen(true); })),
      el("div", { class: "feld" }, el("label", { for: "p-seed" }, T.seed), seedFeld),
      el("div", { class: "knoepfe" },
        knopf(T.wuerfeln, () => { werte = random(klang.params, rng(Date.now() % 100000)); seed = 1 + Math.floor(Math.random() * 999); reglerZeichnen(); neuBauen(true); }),
        knopf(T.zurueck, () => { werte = defaults(klang.params); seed = 1; reglerZeichnen(); neuBauen(true); }),
        knopf(T.link, (k) => kopieren(k, location.href)),
        knopf(T.code, (k) => {
          const name = kebabZuCamel(klang.id);
          kopieren(k, `import { ${name}, toAudioBuffer } from "formwerk/sounds";\n\nconst samples = ${name}(${JSON.stringify(nichtStandard())}${seed !== 1 ? `, ${seed}` : ""}); // 48 kHz mono\nconst buffer = toAudioBuffer(audioContext, samples);\n`);
        })),
      el("div", { class: "export" }, el("h3", {}, T.export), wav));
  };

  const groesse = () => { zeichnen(); };
  addEventListener("resize", groesse);

  return {
    zeigen() {
      const h = hashTeile();
      stoppen();
      klang = soundById(h.id) ?? SOUNDS[0];
      werte = withPreset(klang.params, klang.presets, h.werte);
      seed = h.seed;
      listeZeichnen();
      reglerZeichnen();
      neuBauen();
    },
    stop() {
      stoppen();
      removeEventListener("resize", groesse);
      canvas.hidden = true;
    },
  };
}
