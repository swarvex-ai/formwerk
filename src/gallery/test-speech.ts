// Test mode for speech (?test&speech): speaks lines and writes them back with Whisper (base.en), so a test can measure
// whether the speech is understandable: agents cannot listen, but a speech recogniser can. Both models come from
// Hugging Face (the quality test runs on a developer machine, not in CI).
import { metrics, RATE, toWav } from "../core/audio";
import { load, speak, type Voice } from "../../speech/src";

declare global {
  interface Window {
    __speech?: {
      speak(text: string, voice: Voice, speed: number): Promise<{ seconds: number; peakDb: number; rmsDb: number; first: number; last: number; ms: number; heard: string; wav: string }>;
    };
  }
}

type Asr = (audio: Float32Array) => Promise<{ text: string } | { text: string }[]>;
let whisper: Promise<Asr> | null = null;

/** 48 kHz to 16 kHz for Whisper, with the browser's own resampler. */
async function auf16k(s: Float32Array): Promise<Float32Array> {
  const ctx = new OfflineAudioContext(1, Math.ceil((s.length * 16000) / RATE), 16000);
  const b = ctx.createBuffer(1, s.length, RATE);
  b.copyToChannel(new Float32Array(s), 0);
  const q = ctx.createBufferSource();
  q.buffer = b; q.connect(ctx.destination); q.start();
  return (await ctx.startRendering()).getChannelData(0);
}

export async function startSpeechTest() {
  document.body.classList.add("test");
  await load();
  const { pipeline } = await import("@huggingface/transformers");
  whisper ??= pipeline("automatic-speech-recognition", "Xenova/whisper-base.en", { dtype: "q8", device: "wasm" }) as unknown as Promise<Asr>;
  const asr = await whisper;
  window.__speech = {
    speak: async (text, voice, speed) => {
      const start = performance.now();
      const s = await speak(text, voice, speed);
      const ms = Math.round(performance.now() - start), m = metrics(s);
      const r = await asr(await auf16k(s));
      const heard = (Array.isArray(r) ? r[0] : r).text.trim();
      const bytes = toWav(s);
      let bin = "";
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return { seconds: m.seconds, peakDb: m.peakDb, rmsDb: m.rmsDb, first: m.first, last: m.last, ms, heard, wav: btoa(bin) };
    },
  };
  document.body.dataset.ready = "1";
}
