// Shared materials as TSL nodes: they compile to WGSL (WebGPU) or GLSL (WebGL 2) and need no image files. Every
// material also knows plain PBR values for the .glb export (procedural detail is not baked into textures yet).
import { MeshStandardMaterial, type Material } from "three";
import { MeshStandardNodeMaterial } from "three/webgpu";
import { color, float, mix, mx_noise_float, positionLocal, sin } from "three/tsl";

export const MATERIALS = ["wood", "metal", "paint", "stone", "plastic", "bark", "leaf", "glow"] as const;
export type MaterialKind = (typeof MATERIALS)[number];

const PBR: Record<MaterialKind, { roughness: number; metalness: number }> = {
  wood: { roughness: 0.7, metalness: 0 }, metal: { roughness: 0.4, metalness: 0.6 }, paint: { roughness: 0.5, metalness: 0 },
  stone: { roughness: 0.9, metalness: 0 }, plastic: { roughness: 0.45, metalness: 0 }, bark: { roughness: 0.95, metalness: 0 },
  leaf: { roughness: 0.8, metalness: 0 }, glow: { roughness: 0.4, metalness: 0 },
};

export function material(kind: MaterialKind, hex: string, scale = 1): MeshStandardNodeMaterial {
  const m = new MeshStandardNodeMaterial(PBR[kind]);
  const base = color(hex);
  const p = positionLocal.mul(float(scale));
  switch (kind) {
    case "wood": m.colorNode = mix(base, base.mul(0.62), sin(p.x.mul(60).add(mx_noise_float(p.mul(4)).mul(8))).mul(0.3).add(0.3)); break;
    case "stone": m.colorNode = mix(base.mul(0.72), base, mx_noise_float(p.mul(6)).mul(0.5).add(0.5)); break;
    case "bark": m.colorNode = mix(base.mul(0.55), base, sin(p.y.mul(40).add(mx_noise_float(p.mul(10)).mul(5))).mul(0.5).add(0.5)); break;
    case "leaf": m.colorNode = mix(base.mul(0.75), base.mul(1.15), mx_noise_float(p.mul(9)).mul(0.5).add(0.5)); break;
    case "glow": m.colorNode = base; m.emissiveNode = base.mul(2); break;
    default: m.colorNode = base;
  }
  m.userData.export = { color: hex, emissive: kind === "glow" ? hex : "#000000", ...PBR[kind] };
  return m;
}

/** A plain PBR material for the .glb export, from the values a material() carries. */
export function exportMaterial(m: Material): MeshStandardMaterial {
  const e = (m.userData.export ?? { color: "#cccccc", emissive: "#000000", roughness: 0.6, metalness: 0 }) as { color: string; emissive: string; roughness: number; metalness: number };
  return new MeshStandardMaterial({ color: e.color, emissive: e.emissive, roughness: e.roughness, metalness: e.metalness, flatShading: Boolean((m as { flatShading?: boolean }).flatShading) });
}
