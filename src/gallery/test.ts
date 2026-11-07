// Test mode for the scene tests (?test&asset=<id>): the asset at its defaults, seed 1, WebGL 2 through SwiftShader.
import { ASSETS, assetById } from "../assets";
import { measure } from "../assets/define";
import { defaults } from "../core/params";
import { createViewer } from "./viewer";

declare global {
  interface Window {
    __swarvex?: { step(n: number): { drawCalls: number; triangles: number }; tick(): number };
    __formwerk?: { ids(): string[]; budget(id: string): { triangles: number; drawCalls: number }; measure(): { triangles: number; drawCalls: number } };
  }
}

export async function startTest(params: URLSearchParams) {
  document.body.classList.add("test");
  const canvas = document.querySelector("canvas")!;
  const viewer = await createViewer(canvas, { forceWebGL: true, antialias: false, background: "#16191d" });
  viewer.resize(canvas.clientWidth, canvas.clientHeight);
  const asset = assetById(params.get("asset") ?? "");
  let objekt = asset ? asset.build(defaults(asset.params), 1) : null;
  if (objekt) { viewer.show(objekt); viewer.frame(); }
  window.__formwerk = {
    ids: () => ASSETS.map((a) => a.id),
    budget: (id) => assetById(id)!.budget,
    measure: () => (objekt ? measure(objekt) : { triangles: 0, drawCalls: 0 }),
  };
  window.__swarvex = { step: () => viewer.render(), tick: () => 0 };
  document.body.dataset.ready = "1";
  objekt = objekt ?? null;
}
