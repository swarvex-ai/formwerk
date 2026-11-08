// Test mode for the scene tests (?test&asset=<id>): the asset at its defaults, seed 1, WebGL 2 through SwiftShader.
// bake() swaps in the export copy with baked patterns, so the test can compare it with the live TSL materials.
import type { Material, Mesh } from "three";
import { ASSETS, assetById } from "../assets";
import { make, measure } from "../assets/define";
import { exportCopy, toGLB } from "../core/export";
import { exportInfo } from "../materials";
import { SURFACES } from "../surfaces";
import { createViewer } from "./viewer";

declare global {
  interface Window {
    __swarvex?: { step(n: number): { drawCalls: number; triangles: number }; tick(): number };
    __formwerk?: {
      ids(): string[]; budget(id: string): { triangles: number; drawCalls: number }; measure(): { triangles: number; drawCalls: number };
      surfaces(): string[]; patterned(): boolean; bake(): Promise<{ textured: number; ms: number }>; roundtrip(): Promise<{ bytes: number; images: number }>; backend(): string;
    };
  }
}

export async function startTest(params: URLSearchParams) {
  if (params.has("surface")) { await (await import("./test-surface")).startSurfaceTest(params); return; }
  if (params.has("speech")) { await (await import("./test-speech")).startSpeechTest(); return; }
  document.body.classList.add("test");
  const canvas = document.querySelector("canvas")!;
  // Standard WebGL 2 (läuft überall gleich); ?webgpu prüft den WebGPU-Pfad, wo der Browser einen Adapter hat
  const viewer = await createViewer(canvas, { forceWebGL: !params.has("webgpu"), antialias: false, background: "#16191d" });
  viewer.resize(canvas.clientWidth, canvas.clientHeight);
  const asset = assetById(params.get("asset") ?? "");
  const objekt = asset ? make(asset) : null;
  if (objekt) { viewer.show(objekt); viewer.frame(); }
  window.__formwerk = {
    ids: () => ASSETS.map((a) => a.id),
    surfaces: () => SURFACES.map((s) => s.id),
    budget: (id) => assetById(id)!.budget,
    measure: () => (objekt ? measure(objekt) : { triangles: 0, drawCalls: 0 }),
    backend: () => ((viewer.renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ? "webgpu" : "webgl2"),
    patterned: () => {
      let ja = false;
      objekt?.traverse((x) => { const m = x as Mesh; if (m.isMesh && exportInfo(m.material as Material)?.pattern) ja = true; });
      return ja;
    },
    bake: async () => {
      const start = performance.now();
      const kopie = await exportCopy(objekt!, { bake: true });
      let textured = 0;
      kopie.traverse((x) => { const m = x as Mesh; if (m.isMesh && (m.material as { map?: unknown }).map) textured++; });
      viewer.show(kopie);
      return { textured, ms: Math.round(performance.now() - start) };
    },
    // Wie es in Godot oder Blender ankommt: als .glb exportieren und mit dem GLTFLoader wieder laden
    roundtrip: async () => {
      const glb = await toGLB(objekt!, { bake: true });
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      const gltf = await new GLTFLoader().parseAsync(glb, "");
      let images = 0;
      gltf.scene.traverse((x) => { const m = x as Mesh; if (m.isMesh && (m.material as { map?: unknown }).map) images++; });
      viewer.show(gltf.scene);
      return { bytes: glb.byteLength, images };
    },
  };
  window.__swarvex = { step: () => viewer.render(), tick: () => 0 };
  document.body.dataset.ready = "1";
}
