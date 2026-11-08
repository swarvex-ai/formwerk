// The 3D stage of the gallery: one renderer and one camera control for the page, shared by the tabs that show 3D
// (models, surfaces). A canvas keeps its context, so switching tabs reuses it.
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createViewer } from "./viewer";

/** Reflections of a room for metal surfaces; weak, because the viewer's lights already light the scene. */
export const ENVIRONMENT = 0.35;

export type Stage = { viewer: Awaited<ReturnType<typeof createViewer>>; controls: OrbitControls };
let buehne: Promise<Stage> | null = null;

export function stage(canvas: HTMLCanvasElement): Promise<Stage> {
  buehne ??= createViewer(canvas, { forceWebGL: new URLSearchParams(location.search).has("webgl"), antialias: true, background: "#16191d" })
    .then((viewer) => { const controls = new OrbitControls(viewer.camera, canvas); controls.enableDamping = true; return { viewer, controls }; });
  return buehne;
}
