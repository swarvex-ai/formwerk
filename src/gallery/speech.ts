// The speech tab: any line of English text spoken by Kokoro-82M in the browser, in one of eight voices, at a speed;
// played, shown as spectrogram and waveform, downloaded as .wav. The model comes from Hugging Face only after the
// person agrees (about 92 MB, once; the browser keeps it). This tab and the speech package are GPL-3.0-or-later (eSpeak
// NG inside kokoro-js); the rest of Formwerk is MIT, the spoken files are CC0.
import { metrics, RATE, spectrogram, toWav, type Samples } from "../core/audio";
import { DOWNLOAD_MB, load, MAX_CHARACTERS, speak, VOICES, type Voice } from "../../speech/src";
import { de, el, hashSetzen, hashTeile, knopf, kopieren, speichern, T, zahl, type Bereich, type Galerie } from "./shell";

const DATENSCHUTZ = de ? "https://swarvex.ai/datenschutz#vorschauen" : "https://swarvex.ai/en/privacy#previews";
const ZUSTIMMUNG = "formwerk.speech.consent";

const S = de
  ? { titel: "Sprache (Englisch)", text: "Text (Englisch)", stimme: "Stimme", tempo: "Tempo", sprechen: "▶ Sprechen", spricht: "Spricht …",
      beschreibung: "Jeder Satz auf Englisch, gesprochen vom Sprachmodell Kokoro-82M direkt in deinem Browser: acht Stimmen, Tempo einstellbar, fertig als Formwerk-Klang (48 kHz mono, −1 dBFS) zum Herunterladen.",
      hinweis: `Zum Sprechen lädt dein Browser das Modell Kokoro-82M (etwa ${DOWNLOAD_MB} MB, einmalig) und die Stimmen von Hugging Face. Dabei erhält Hugging Face deine IP-Adresse und die Angaben deines Browsers. Danach läuft alles in deinem Browser, kein Text verlässt ihn.`,
      laden: "Modell von Hugging Face laden und sprechen", datenschutz: "Datenschutz", laedt: "Lade", bereit: "Modell bereit",
      lizenz: "Die Sprache nutzt kokoro-js mit eSpeak NG (GPL-3.0); dieser Teil von Formwerk steht unter GPL-3.0, die gesprochenen Dateien unter CC0.",
      beispiele: "Beispiele", wav: "Herunterladen (.wav, 48 kHz mono)", fehler: "Fehler", zeichen: "Zeichen" }
  : { titel: "Speech (English)", text: "Text (English)", stimme: "Voice", tempo: "Speed", sprechen: "▶ Speak", spricht: "Speaking …",
      beschreibung: "Any line in English, spoken by the Kokoro-82M speech model right in your browser: eight voices, adjustable speed, finished as a Formwerk sound (48 kHz mono, −1 dBFS) to download.",
      hinweis: `To speak, your browser loads the Kokoro-82M model (about ${DOWNLOAD_MB} MB, once) and the voices from Hugging Face. Hugging Face receives your IP address and your browser's details. After that everything runs in your browser; no text leaves it.`,
      laden: "Load the model from Hugging Face and speak", datenschutz: "Privacy", laedt: "Loading", bereit: "Model ready",
      lizenz: "Speech uses kokoro-js with eSpeak NG (GPL-3.0); this part of Formwerk is GPL-3.0, the spoken files are CC0.",
      beispiele: "Examples", wav: "Download (.wav, 48 kHz mono)", fehler: "Error", zeichen: "characters" };

const BEISPIELE: { de: string; en: string; text: string; voice: Voice; speed: number }[] = [
  { de: "Wache", en: "Guard", text: "Halt! Who goes there? State your name and business.", voice: "am_fenrir", speed: 0.95 },
  { de: "Händlerin", en: "Merchant", text: "Welcome, traveller! Fresh bread, sharp swords, and potions for every ache.", voice: "af_bella", speed: 1.05 },
  { de: "Erzähler", en: "Narrator", text: "Long ago, before the towers fell, the valley was quiet and green.", voice: "bm_george", speed: 0.9 },
  { de: "Ansage", en: "Announcer", text: "Mission complete. Returning to base in ten seconds.", voice: "af_nicole", speed: 1 },
  { de: "Kind", en: "Child", text: "Did you see that? It jumped all the way over the river!", voice: "am_puck", speed: 1.15 },
];

const zugestimmt = () => { try { return localStorage.getItem(ZUSTIMMUNG) === "1"; } catch { return false; } };
const zustimmen = () => { try { localStorage.setItem(ZUSTIMMUNG, "1"); } catch { /* ohne Speicher: einmal pro Besuch fragen */ } };

let audio: AudioContext | null = null;

export async function start(b: Bereich): Promise<Galerie> {
  const dreid = b.buehne.querySelector<HTMLCanvasElement>("canvas.dreid");
  if (dreid) dreid.hidden = true;
  let bildflaeche = b.buehne.querySelector<HTMLCanvasElement>("canvas.klangbild");
  if (!bildflaeche) { bildflaeche = el("canvas", { class: "klangbild", role: "img" }) as HTMLCanvasElement; b.buehne.prepend(bildflaeche); }
  const canvas = bildflaeche;
  canvas.hidden = false;
  const g = canvas.getContext("2d")!;

  let text = BEISPIELE[0].text, stimme: Voice = BEISPIELE[0].voice, tempo = BEISPIELE[0].speed, samples: Samples | null = null, bereit = false;
  let einverstanden = zugestimmt();

  const zeichnen = () => {
    const breite = Math.max(64, Math.round(canvas.clientWidth)), hoehe = Math.max(64, Math.round(canvas.clientHeight));
    canvas.width = breite; canvas.height = hoehe;
    g.fillStyle = "#0f1114"; g.fillRect(0, 0, breite, hoehe);
    if (!samples) return;
    const oben = Math.round(hoehe * 0.72), welle = hoehe - oben;
    g.putImageData(new ImageData(spectrogram(samples, breite, oben), breite, oben), 0, 0);
    g.fillStyle = "#22d3ee";
    const proSpalte = samples.length / breite, mitte = oben + welle / 2;
    for (let x = 0; x < breite; x++) {
      let lo = 0, hi = 0;
      for (let i = Math.floor(x * proSpalte); i < Math.min(samples.length, Math.floor((x + 1) * proSpalte) + 1); i++) { lo = Math.min(lo, samples[i]); hi = Math.max(hi, samples[i]); }
      g.fillRect(x, mitte - (hi * welle) / 2.2, 1, Math.max(1, ((hi - lo) * welle) / 2.2));
    }
  };
  const abspielen = () => {
    if (!samples) return;
    audio ??= new AudioContext({ sampleRate: RATE });
    void audio.resume();
    const puffer = audio.createBuffer(1, samples.length, RATE);
    puffer.copyToChannel(samples, 0);
    const q = audio.createBufferSource();
    q.buffer = puffer; q.connect(audio.destination); q.start();
  };

  const status = el("p", { class: "leise", role: "status" });
  const sprechenKnopf = knopf(S.sprechen, () => void sprechen());
  sprechenKnopf.classList.add("haupt");
  const zustimmung = el("div", { class: "export" },
    el("p", {}, S.hinweis), el("p", {}, el("a", { href: DATENSCHUTZ, target: "_blank", rel: "noopener" }, S.datenschutz)),
    (() => { const k = knopf(S.laden, () => { einverstanden = true; zustimmen(); zustimmung.hidden = true; void sprechen(); }); k.classList.add("haupt"); return k; })());

  async function sprechen() {
    if (!einverstanden) { zustimmung.hidden = false; zustimmung.scrollIntoView({ block: "nearest" }); return; }
    sprechenKnopf.disabled = true; sprechenKnopf.textContent = S.spricht;
    try {
      if (!bereit) {
        const dateien = new Map<string, [number, number]>();
        await load((p) => {
          dateien.set(p.file, [p.loaded, p.total]);
          const [l, t] = [...dateien.values()].reduce(([a, c], [x, y]) => [a + x, c + y], [0, 0]);
          status.textContent = `${S.laedt} ${zahl(l / 1e6, 0)} / ${zahl(t / 1e6, 0)} MB`;
        });
        bereit = true; status.textContent = S.bereit;
      }
      const start = performance.now();
      samples = await speak(text, stimme, tempo);
      const m = metrics(samples);
      b.werte.textContent = `${zahl(m.seconds, 2)} s · ${stimme} · ${S.tempo} ${zahl(tempo, 2)} · ${zahl((performance.now() - start) / 1000, 1)} s · 48 kHz mono`;
      zeichnen();
      abspielen();
    } catch (e) {
      status.textContent = `${S.fehler}: ${(e as Error).message}`;
    } finally { sprechenKnopf.disabled = false; sprechenKnopf.textContent = S.sprechen; }
  }

  const listeZeichnen = () => {
    b.liste.replaceChildren(el("section", {}, el("h2", {}, S.beispiele), ...BEISPIELE.map((x) => {
      const k = el("button", { type: "button", "aria-pressed": String(x.text === text) }, de ? x.de : x.en);
      k.onclick = () => { text = x.text; stimme = x.voice; tempo = x.speed; listeZeichnen(); reglerZeichnen(); merken(); };
      return k;
    })));
  };
  const merken = () => hashSetzen("speech", { text, voice: stimme, speed: tempo }, 1);

  const reglerZeichnen = () => {
    const feldText = el("textarea", { id: "s-text", rows: "4", maxlength: String(MAX_CHARACTERS) }) as HTMLTextAreaElement;
    feldText.value = text;
    const zaehler = el("small", {}, `${text.length} / ${MAX_CHARACTERS} ${S.zeichen}`);
    feldText.oninput = () => { text = feldText.value; zaehler.textContent = `${text.length} / ${MAX_CHARACTERS} ${S.zeichen}`; merken(); };
    const wahl = el("select", { id: "s-stimme" }, ...Object.entries(VOICES).map(([k, v]) => el("option", { value: k }, de ? v.de : v.en))) as HTMLSelectElement;
    wahl.value = stimme;
    wahl.onchange = () => { stimme = wahl.value as Voice; merken(); };
    const regler = el("input", { id: "s-tempo", type: "range", min: "0.7", max: "1.3", step: "0.05", value: String(tempo) }) as HTMLInputElement;
    const ausgabe = el("output", { for: "s-tempo" }, zahl(tempo, 2));
    regler.oninput = () => { tempo = Number(regler.value); ausgabe.textContent = zahl(tempo, 2); merken(); };
    const wav = knopf(S.wav, () => { if (samples) speichern(toWav(samples), "audio/wav", `speech-${stimme}.wav`); });
    zustimmung.hidden = true;
    b.regler.replaceChildren(
      el("h2", {}, S.titel), el("p", { class: "leise" }, S.beschreibung),
      el("div", { class: "feld" }, el("label", { for: "s-text" }, S.text), feldText, zaehler),
      el("div", { class: "feld" }, el("label", { for: "s-stimme" }, S.stimme), wahl),
      el("div", { class: "feld" }, el("label", { for: "s-tempo" }, S.tempo), regler, ausgabe),
      el("div", { class: "knoepfe" }, sprechenKnopf, knopf(T.link, (k) => kopieren(k, location.href))),
      status, zustimmung,
      el("div", { class: "export" }, el("h3", {}, T.export), wav, el("small", {}, S.lizenz)));
  };

  const groesse = () => zeichnen();
  addEventListener("resize", groesse);
  return {
    zeigen() {
      const h = hashTeile();
      if (h.werte.text) text = h.werte.text.slice(0, MAX_CHARACTERS);
      if (h.werte.voice && h.werte.voice in VOICES) stimme = h.werte.voice as Voice;
      if (h.werte.speed) tempo = Math.min(1.3, Math.max(0.7, Number(h.werte.speed) || 1));
      listeZeichnen();
      reglerZeichnen();
      zeichnen();
    },
    stop() { removeEventListener("resize", groesse); canvas.hidden = true; },
  };
}
