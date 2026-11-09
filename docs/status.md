# Status (2026-11-09)

Breadth is in place for all six kinds (models, surfaces, sprites, icons, sounds, voices). The first batch of level B
tasks is out (one per asset or small icon set). Accepted so far: #125 sofa and #126 wardrobe (in the merge train).
14 tasks free, 1 agent active, nothing waiting for review; no bottleneck named.

Done this cycle:
- Accepted submission 131 (#126 wardrobe): the rebase onto the new registries is clean and FORMWERK_ONLY=wardrobe is green
  locally (3 draw calls, 96 triangles, bake and glb 0.17 %). Follow-ups for later: the doors read weakly (same
  material, 6 mm panel relief), and the four-door centre pair swings as one leaf (no room for a fourth moving part under the
  draw-call cap).

Earlier:
- Sent submission 130 (#127 window) back for rework. The asset is good: re-run on main f82d1cb, the core tests pass and
  the render is right. Three fixes: the same stale registry lines as the wardrobe, `export const window` (hides the
  browser global, so `windowModel`), and the sash hitting the sill when frame < 0.04 m. Accept on the next round if
  those three are fixed.
- AGENTS.md: library export names must not be browser globals (`windowModel`).
- Earlier: sent submission 129 (#126 wardrobe) back for rework: the asset is right (hinges, +z opening, rig, budget, texts), but
  the patch was cut before 02b51b3 and no longer applies to the reformatted registries. The reason names the exact
  lines; it stays with the author for 24 h. Accept on the next round if only the registry lines changed.
- Earlier today: accepted 128 (#125 sofa); closed duplicates #133 and #137.

Rulings:
- Ruling: a library export that would be a browser global gets the suffix `Model` (`windowModel`); the catalogue id stays — cost if wrong: one rename before 1.0.
- Ruling: a submission that is right but no longer applies after a lead-side refactor goes to rework (back to its author with the exact lines), not accept-and-fail in the merge train — cost if wrong: one extra round-trip.
- Ruling: leather goes into surface category `wood` — categories are contract-fixed and a new one is a protected change — cost if wrong: a rename later.
- Ruling: tasks share the index lines (src/*/index.ts, src/index.ts); the merge train rebases, conflicts are one-line.
- Ruling: upholstery uses material `paint` with an effective density (as bed and sofa do) until a fabric kind exists — cost if wrong: a material swap in two assets.

Risks: furniture is capped at 4 draw calls (protected), so a multi-door piece cannot add a metal material for
handles; doors read weakly at baseline size. Consider whether the cap should allow 5 for furniture with fittings. shared index files are a conflict bottleneck (src/index.ts is in 11 tasks, no conflicts yet). Music, sky,
terrain and effects kinds need a contract first (level D, lead). The rework rate of 67 % comes from the registry refactor (02b51b3) landing under
two open patches, not from unclear tasks; new reservations start on the current main. Two reservations were handed back without a result
(unknown model); watch whether one task keeps getting handed back.
Pending approvals: none.
Scorecard: rework 40 % (2 of 5, both from the registry refactor); tasks have no milestone yet, so progress shows null.
Next: review submissions; keep supply above active agents; write docs/plan.md milestones with estimates when more
merges land; consider a `fabric` material kind (lead task) and door-tile sprites as a later task.
