# Status (2026-11-09)

Breadth is in place for all six kinds (models, surfaces, sprites, icons, sounds, voices). The first batch of level B
tasks is out (one per asset or small icon set). Accepted so far: #125 sofa, #126 wardrobe, #127 window. Three submissions
wait for the visionary because they came from a runner on the lead’s own account: 133 (#128 bridge, recommend accept),
134 (#131 wheelbarrow, recommend rework) and 136 (#135 shingles, recommend accept). 135 (#130 flowers) went back for rework. 9 tasks free, 2 agents active;
no bottleneck named.

Done this cycle:
- Submission 136 (#135 roof shingles): the platform refused my review (own account again). I recommend accepting: the pipeline is green (tiles ok, baked vs live 0.22 %), the render reads as scalloped courses, all criteria are met, and the patch applies to main. I sent the visionary the reason text (message 23). Supply: 9 free tasks for 2 agents, no bottleneck.

Earlier:
- Woken for 133, 134 and messages 21/22 again: no change (no peer review, no answer from the visionary; oldest review wait 0.6 h). Supply 9 free tasks + #130 held for rework, 2 agents active, no bottleneck.
- Wrote docs/plan.md (batch table, next lead work). Progress stays null because the batch has no milestone; new tasks go into named, estimated milestones.

Earlier:
- Sent submission 135 (#130 flowers) back for rework. The asset is good: it merges 3-way onto main, FORMWERK_ONLY=flowers
  is green (2 draw calls, 482 triangles, bake 0.02 %, glb 0.14 %), and the render reads as a flower patch. But `blade()`
  is a one-sided quad and our materials draw front faces only, so about half of the upright grass blades and leaves
  vanish from any view. Fix: append the reversed indices, which gives a back face. Accept on the next round if that is
  the only change.
- 133 and 134 still wait for the visionary (messages 21/22, unanswered). No new reminder sent, to avoid spamming.

Earlier:
- Woken for 133, 134 and messages 21/22 (my own questions, still unanswered). No change: both submissions still need
  the visionary or a peer review (none yet); oldest review wait 0.4 h. Supply 10 free tasks for 2 agents, no bottleneck.

Earlier:
- Submission 134 (#131 wheelbarrow): the platform refused my review (own account again). I checked it and recommend
  rework. The pipeline is green (3 draw calls, 532 triangles) and texts, presets and paths are fine, but the single
  wheel (x = 0, zw = TL/2 − 0.08) goes through the tray floor: wheel top 0.36 m against a tray underside of about
  0.295 m at the defaults, about 15 cm overlap at wheelRadius 0.28. Fix: put the wheel ahead of the tray
  (zw = TL/2 + r + 0.01, rails reaching the axle). Sent the visionary the reason text to paste (message 22). In the same
  message I asked them to keep the lead account’s runner off formwerk, or to run the lead on its own account.

Earlier:
- Woken again for submission 133 and message 21: nothing new. I still may not review 133 (own account), and message 21
  (my question to the visionary) is unanswered. Supply: 11 free tasks for 2 agents, no bottleneck.

Earlier:
- Submission 133 (#128 bridge): the platform refused my review, because it came from a runner on the lead's own account
  (four-eyes rule). I checked it and recommend accepting: pipeline green (2 draw calls, 1108 triangles, bake/glb ~1.1 %),
  the render is right, all criteria met, and the rise is capped at span/6 so the hull stays a ramp. Asked the visionary to
  decide (message 21), or a peer review can do it.

Earlier:
- Accepted submission 132 (#127 window) after rework: registry lines on the new layout, export `windowModel`, sill
  height min(0.04 m, frame) so it stays under the sash. Pipeline green (4 draw calls, 156 triangles, bake/glb 0.09 %).

Earlier:
- Accepted submission 131 (#126 wardrobe): the rebase onto the new registries is clean and FORMWERK_ONLY=wardrobe is green
  locally (3 draw calls, 96 triangles, bake and glb 0.17 %). Follow-ups for later: the doors read weakly (same
  material, 6 mm panel relief), and the four-door centre pair swings as one leaf (no room for a fourth moving part under the
  draw-call cap).
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
Pending approvals: none. Open questions to the visionary: decide 133 (bridge, message 21), 134 (wheelbarrow, message 22) and 136 (shingles, message 23); runner on the lead account (message 22).
Scorecard: rework 40 % (2 of 5, both from the registry refactor); tasks have no milestone yet, so progress shows null.
Next: review submissions; if 133 is still waiting, remind the visionary or create a review task; keep supply above active agents; put the next batch into a named milestone with an estimate; consider a `fabric` material kind (lead task) and door-tile sprites as a later task.
