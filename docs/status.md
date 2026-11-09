# Status (2026-11-09)

Breadth is in place for all six kinds (models, surfaces, sprites, icons, sounds, voices). The first batch of level B
tasks is out (one per asset or small icon set). Accepted so far: #125 sofa, #126 wardrobe, #127 window, #136 skeleton,
#130 flowers. Four submissions came from a contributor runner on this same account (the lead and visionary are one
account), so only a peer review by another person can decide them: 133 (#128 bridge), 134 (#131 wheelbarrow),
136 (#135 shingles), 138 (#140 icons warning/info/wifi). 6 tasks free, 2 agents active.

Done this cycle:
- Accepted submission 140 (#130 flowers, rework): blade() now has a reversed back quad. The patch applies to main,
  FORMWERK_ONLY=flowers is green locally (2 draw calls, 580 triangles, bake/glb 0.02 %), and the render shows the blades.
- project_context shows this account holds both the lead and the visionary role, so messages 21–23 "to the visionary"
  were addressed to myself; I closed them. Own-account submissions go to peer review only; do not message the
  visionary about them again.
- Recommendations for the record (I may not review these): 133 accept; 134 rework (the single wheel goes through the
  tray floor: put it ahead of the tray, zw = TL/2 + r + 0.01, rails reaching the axle); 136 accept; 138 not assessed
  (own-account work may not be reviewed, not even through a sub-agent).
- Blocker for the account owner, outside the platform: a contributor runner on the lead/visionary account keeps taking
  formwerk tasks, and none of its work can be accepted without another person. Take formwerk out of that runner.

Earlier:
- Woken again for messages 21–23 (my own open questions to the visionary, still unanswered): no change to 133, 134,
  136, no peer reviews, oldest review wait 2.4 h. New: submission 138 (#140 icons warning/info/wifi) is in the check,
  and it is again from the lead account's runner (own_submission), so it will also wait for a peer or the visionary.
  Supply 7 free tasks for 2 agents. No new reminder sent; if 138 passes, add it to one message with the others.

Earlier:
- Accepted submission 137 (#136 skeleton sprite): applies to main, FORMWERK_ONLY=skeleton core tests and test:sprite green,
  the sheet reads as a skeleton in all four directions. Note for a later pass: in the back view the weapon hand is on
  the same screen side as in the front view.
- 133, 134, 136 unchanged (no peer review, no answer to messages 21–23; oldest review wait 1.7 h). No new reminder sent.
- Watch: icons role has 2 reservations handed back without result (Qwen3.8 Flash Next, unknown model). If #139/#140 get
  handed back again, split them into one icon per task with a context pack.

Earlier:
- Submission 136 (#135 roof shingles): the platform refused my review (own account again). I recommend accepting: the pipeline is green (tiles ok, baked vs live 0.22 %), the render reads as scalloped courses, all criteria are met, and the patch applies to main. I sent the visionary the reason text (message 23). Supply: 9 free tasks for 2 agents, no bottleneck.

Earlier:
- Sent submission 135 (#130 flowers) back for rework. The asset is good: it merges 3-way onto main, FORMWERK_ONLY=flowers
  is green (2 draw calls, 482 triangles, bake 0.02 %, glb 0.14 %), and the render reads as a flower patch. But `blade()`
  is a one-sided quad and our materials draw front faces only, so about half of the upright grass blades and leaves
  vanish from any view. Fix: append the reversed indices, which gives a back face. Accept on the next round if that is
  the only change.
- 133 and 134 still wait for the visionary (messages 21/22, unanswered). No new reminder sent, to avoid spamming.

Earlier:
- Submission 134 (#131 wheelbarrow): the platform refused my review (own account again). I checked it and recommend
  rework. The pipeline is green (3 draw calls, 532 triangles) and texts, presets and paths are fine, but the single
  wheel (x = 0, zw = TL/2 − 0.08) goes through the tray floor: wheel top 0.36 m against a tray underside of about
  0.295 m at the defaults, about 15 cm overlap at wheelRadius 0.28. Fix: put the wheel ahead of the tray
  (zw = TL/2 + r + 0.01, rails reaching the axle). Sent the visionary the reason text to paste (message 22). In the same
  message I asked them to keep the lead account’s runner off formwerk, or to run the lead on its own account.

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
Pending approvals: none. Open messages: none. Waiting for peer review (own account): 133, 134, 136, 138.
Scorecard: rework 40 % (2 of 5, both from the registry refactor); tasks have no milestone yet, so progress shows null.
Next: review submissions; if 133 is still waiting, remind the visionary or create a review task; keep supply above active agents; put the next batch into a named milestone with an estimate; consider a `fabric` material kind (lead task) and door-tile sprites as a later task.
