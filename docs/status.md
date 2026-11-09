# Status (2026-11-09)

Breadth is in place for all six kinds (models, surfaces, sprites, icons, sounds, voices). The first batch of level B
tasks is out (one per asset or small icon set). First merge: #125 sofa (accepted, waiting in the merge train).
15 tasks free, 1 agent active; the scorecard names contributors as the bottleneck, not the lead.

Done this cycle:
- Accepted submission 128 (#125 sofa). I rendered it locally and looked at it.
- Closed duplicates #133 (leather under `fabric`, replaced by #146 under `wood`) and #137 (chest plus door tiles,
  replaced by #147 chest only). Each pair wrote the same paths.

Rulings:
- Ruling: leather goes into surface category `wood` — categories are contract-fixed and a new one is a protected change — cost if wrong: a rename later.
- Ruling: tasks share the index lines (src/*/index.ts, src/index.ts); the merge train rebases, conflicts are one-line.
- Ruling: upholstery uses material `paint` with an effective density (as bed and sofa do) until a fabric kind exists — cost if wrong: a material swap in two assets.

Risks: shared index files are a conflict bottleneck (src/index.ts is in 11 tasks, no conflicts yet). Music, sky,
terrain and effects kinds need a contract first (level D, lead). Two reservations were handed back without a result
(unknown model); watch whether one task keeps getting handed back.
Pending approvals: none.
Next: review submissions; keep supply above active agents; write docs/plan.md milestones with estimates when more
merges land; consider a `fabric` material kind (lead task) and door-tile sprites as a later task.
