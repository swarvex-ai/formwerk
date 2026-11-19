import { rounded, turned } from "../shapes";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

const HE = 0.04445; // eine Höheneinheit (1U) in Metern
const ZOLL19 = 0.4826; // Breite einer 19-Zoll-Frontplatte
// Server sind als volle Blöcke gezeichnet, aber innen hohl: ein 1-U-Server wiegt etwa 15 kg, nicht 50

export const serverRack = defineAsset({
  id: "server-rack", category: "furniture",
  title: { de: "Serverschrank", en: "Server rack" },
  description: { de: "19-Zoll-Schrank mit Servern, leuchtenden Status-LEDs und Fronttür.", en: "A 19-inch rack with servers, glowing status LEDs and a front door." },
  params: {
    units: { type: "integer", label: { de: "Höheneinheiten (U)", en: "Height units (U)" }, min: 6, max: 48, default: 42,
      describe: { de: "Nutzbare Höhe in Höheneinheiten (1 U = 44,45 mm): 42 U ist ein voller Schrank, 12 U ein Wandschrank.", en: "Usable height in rack units (1 U = 44.45 mm): 42 U is a full rack, 12 U a wall cabinet." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.55, max: 0.8, step: 0.05, default: 0.6, unit: "m",
      describe: { de: "Außenbreite: 0,6 m ist Standard, 0,8 m lässt Platz für Kabel.", en: "Outer width: 0.6 m is standard, 0.8 m leaves room for cables." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.5, max: 1.2, step: 0.05, default: 1, unit: "m",
      describe: { de: "Außentiefe: 0,6 m für Netzwerktechnik, 1 bis 1,2 m für Server.", en: "Outer depth: 0.6 m for network gear, 1 to 1.2 m for servers." } },
    servers: { type: "integer", label: { de: "Server", en: "Servers" }, min: 0, max: 48, default: 18,
      describe: { de: "Anzahl eingebauter Geräte, von unten gefüllt; was nicht hineinpasst, entfällt.", en: "Number of installed devices, filled from the bottom; any that do not fit are left out." } },
    serverHeight: { type: "integer", label: { de: "Höhe je Server (U)", en: "Height per server (U)" }, min: 1, max: 4, default: 1,
      describe: { de: "Höhe jedes Geräts in Höheneinheiten.", en: "Height of each device in rack units." } },
    leds: { type: "boolean", label: { de: "Status-LEDs", en: "Status LEDs" }, default: true,
      describe: { de: "Leuchtende Status-LEDs an jedem Gerät.", en: "Glowing status LEDs on every device." } },
    ledColor: { type: "color", label: { de: "LED-Farbe", en: "LED colour" }, default: "#22c55e",
      describe: { de: "Farbe der LEDs; sie leuchten selbst.", en: "Colour of the LEDs; they emit light." } },
    door: { type: "boolean", label: { de: "Fronttür", en: "Front door" }, default: false,
      describe: { de: "Fronttür als Rahmen, links angeschlagen (bewegliches Teil „door“).", en: "A front door frame hinged on the left (movable part \"door\")." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#2b3036",
      describe: { de: "Farbe des lackierten Gehäuses.", en: "Colour of the painted housing." } },
  },
  presets: {
    "network-cabinet": { label: { de: "Netzwerkschrank", en: "Network cabinet" }, values: { units: 12, depth: 0.6, servers: 4, door: true } },
    "storage-array": { label: { de: "Speichersystem", en: "Storage array" }, values: { servers: 10, serverHeight: 4, ledColor: "#38bdf8" } },
    "empty-rack": { label: { de: "Leerer Schrank", en: "Empty rack" }, values: { servers: 0 } },
  },
  rig: { door: { label: { de: "Tür", en: "Door" }, type: "rotate", axis: [0, -1, 0], min: 0, max: 120 } },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 26000, drawCalls: 4 },
  build(p) {
    const gehaeuse = material("metal", p.color), geraet = material("metal", "#5b636d", 1, 700), led = material("glow", p.ledColor);
    const t = new Parts();
    const w = p.width, d = p.depth, innen = p.units * HE, h = innen + 0.12, s = 0.02;
    // Sockel 1,5 cm eingerückt auf vier Stellfüßen
    t.add(gehaeuse, rounded(w - 0.03, 0.06, d - 0.03, 0.004, 0, 0.05, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      t.add(geraet, turned([[0, 0], [0.022, 0], [0.022, 0.006], [0.008, 0.01], [0.008, 0.02], [0, 0.02]], 12, sx * (w / 2 - 0.05), 0, sz * (d / 2 - 0.05)));
    }
    for (const sx of [-1, 1]) t.add(gehaeuse, rounded(s, h - 0.08, d, 0.005, sx * (w / 2 - s / 2), 0.08 + (h - 0.08) / 2, 0));
    t.add(gehaeuse, rounded(w, s, d, 0.006, 0, h - s / 2, 0));
    t.add(gehaeuse, rounded(w - 2 * s - 0.002, h - 0.1, s, 0.004, 0, h / 2, -d / 2 + s / 2));
    // Zwei 19-Zoll-Profilschienen, an denen die Geräte mit ihren Ohren hängen
    for (const sx of [-1, 1]) t.add(geraet, rounded(0.016, innen, 0.02, 0.002, sx * (ZOLL19 / 2 - 0.008), 0.08 + innen / 2, d / 2 - 0.05));
    const anzahl = Math.min(p.servers, Math.floor(p.units / p.serverHeight));
    for (let i = 0; i < anzahl; i++) {
      const hh = p.serverHeight * HE, y = 0.08 + (i + 0.5) * hh;
      // Gehäuse hinter den Schienen, Frontplatte mit Ohren und je ein Griff auf jedem Ohr
      t.add(geraet, rounded(ZOLL19 - 0.05, hh - 0.004, d - 0.14, 0.003, 0, y, -0.02, 1));
      t.add(geraet, rounded(ZOLL19, hh - 0.003, 0.006, 0.002, 0, y, d / 2 - 0.037, 1));
      for (const sx of [-1, 1]) t.add(geraet, rounded(0.01, Math.min(0.03, hh * 0.6), 0.012, 0.003, sx * (ZOLL19 / 2 - 0.012), y, d / 2 - 0.028, 1));
      if (p.leds) for (let k = 0; k < 2; k++) t.box(led, 0.008, 0.006, 0.004, -ZOLL19 / 2 + 0.04 + k * 0.016, y, d / 2 - 0.032);
    }
    if (p.door) {
      // Rahmentür vor der Front, Scharnier an der linken Vorderkante
      const z = d / 2 + 0.012, b = 0.04, tuer = t.moving("door", -w / 2, 0, d / 2);
      for (const sx of [-1, 1]) tuer.add(gehaeuse, rounded(b, h - 0.1, 0.02, 0.004, sx * (w / 2 - b / 2), 0.08 + (h - 0.1) / 2, z));
      tuer.add(gehaeuse, rounded(w - 2 * b - 0.002, b, 0.02, 0.004, 0, h - 0.02 - b / 2, z));
      tuer.add(gehaeuse, rounded(w - 2 * b - 0.002, b, 0.02, 0.004, 0, 0.08 + b / 2, z));
      tuer.add(gehaeuse, rounded(0.02, 0.18, 0.03, 0.006, w / 2 - 0.03, h / 2, z + 0.02));
    }
    return t.group();
  },
});
