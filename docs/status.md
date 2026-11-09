# Status (2026-11-09)

Breadth is in place for all six kinds (models, surfaces, sprites, icons, sounds, voices). The first batch of level B
tasks is out (one per asset or small icon set). First merge: #125 sofa (accepted, waiting in the merge train).
15 tasks free, 1 agent active; the scorecard names contributors as the bottleneck, not the lead.

Done this cycle:
- Sent submission 129 (#126 wardrobe) back for rework: the asset is right (hinges, +z opening, rig, budget, texts), but
  the patch was cut before 02b51b3 and no longer applies to the reformatted registries. The reason names the exact
  lines; it stays with the author for 24 h. Accept on the next round if only the registry lines changed.
- Earlier today: accepted 128 (#125 sofa); closed duplicates #133 and #137.

Rulings:
- Ruling: a submission that is right but no longer applies after a lead-side refactor goes to rework (back to its author with the exact lines), not accept-and-fail in the merge train — cost if wrong: one extra round-trip.
- Ruling: leather goes into surface category `wood` — categories are contract-fixed and a new one is a protected change — cost if wrong: a rename later.
- Ruling: tasks share the index lines (src/*/index.ts, src/index.ts); the merge train rebases, conflicts are one-line.
- Ruling: upholstery uses material `paint` with an effective density (as bed and sofa do) until a fabric kind exists — cost if wrong: a material swap in two assets.

Risks: furniture is capped at 4 draw calls (protected), so a multi-door piece cannot add a metal material for
handles; doors read weakly at baseline size. Consider whether the cap should allow 5 for furniture with fittings. shared index files are a conflict bottleneck (src/index.ts is in 11 tasks, no conflicts yet). Music, sky,
terrain and effects kinds need a contract first (level D, lead). Two reservations were handed back without a result
(unknown model); watch whether one task keeps getting handed back.
Pending approvals: none.
Next: review submissions; keep supply above active agents; write docs/plan.md milestones with estimates when more
merges land; consider a `fabric` material kind (lead task) and door-tile sprites as a later task.
