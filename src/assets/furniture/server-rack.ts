import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

const HE = 0.04445; // eine Höheneinheit (1U) in Metern

export const serverRack = defineAsset({
  id: "server-rack", category: "furniture",
  title: { de: "Serverschrank", en: "Server rack" },
  description: { de: "19-Zoll-Schrank mit Servern und leuchtenden Status-LEDs.", en: "A 19-inch rack with servers and glowing status LEDs." },
  params: {
    units: { type: "integer", label: { de: "Höheneinheiten (U)", en: "Height units (U)" }, min: 6, max: 48, default: 42 },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.55, max: 0.8, step: 0.05, default: 0.6, unit: "m" },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.5, max: 1.2, step: 0.05, default: 1, unit: "m" },
    servers: { type: "integer", label: { de: "Server", en: "Servers" }, min: 0, max: 48, default: 18 },
    serverHeight: { type: "integer", label: { de: "Höhe je Server (U)", en: "Height per server (U)" }, min: 1, max: 4, default: 1 },
    leds: { type: "boolean", label: { de: "Status-LEDs", en: "Status LEDs" }, default: true },
    ledColor: { type: "color", label: { de: "LED-Farbe", en: "LED colour" }, default: "#22c55e" },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#2b3036" },
  },
  budget: { triangles: 12000, drawCalls: 3 },
  build(p) {
    const gehaeuse = material("paint", p.color), geraet = material("metal", "#5b636d"), led = material("glow", p.ledColor);
    const t = new Parts();
    const w = p.width, d = p.depth, innen = p.units * HE, h = innen + 0.12, s = 0.02;
    for (const sx of [-1, 1]) t.box(gehaeuse, s, h, d, sx * (w / 2 - s / 2), h / 2, 0);
    t.box(gehaeuse, w, s, d, 0, h - s / 2, 0).box(gehaeuse, w, 0.08, d, 0, 0.04, 0).box(gehaeuse, w - 2 * s, h - 0.1, s, 0, h / 2, -d / 2 + s / 2);
    const anzahl = Math.min(p.servers, Math.floor(p.units / p.serverHeight));
    for (let i = 0; i < anzahl; i++) {
      const y = 0.08 + (i + 0.5) * p.serverHeight * HE;
      t.box(geraet, w - 2 * s - 0.01, p.serverHeight * HE - 0.004, d - 0.08, 0, y, 0.02);
      if (p.leds) for (let k = 0; k < 2; k++) t.box(led, 0.008, 0.006, 0.004, -w / 2 + s + 0.03 + k * 0.016, y, d / 2 - 0.018);
    }
    return t.group();
  },
});
