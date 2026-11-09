# Plan

Goal (brief): breadth first, every kind of asset with contract, tests and examples; then depth from the swarm.
Requests from other swarvex projects go ahead of everything else.

## Phase 1: breadth (lead, done)

Contracts, tests and reference assets for models, surfaces, sprites, icons, sounds and voices are on main.
Registries merge by union (a26e99c), so parallel asset tasks only share one-line index hunks.

## Phase 2: depth, first swarm batch (level B, one task per asset or small icon set)

No milestone is set on these tasks yet; they were created before milestones were planned.

| Task | Asset | State |
|---|---|---|
| #125 | sofa | merged |
| #126 | wardrobe | merged |
| #127 | window (`windowModel`) | merged |
| #128 | bridge | submission 133 waits for the visionary (own-account runner), lead recommends accept |
| #130 | flower patch / grass tuft | rework (one-sided blades), held for its author until 2026-11-10 15:43 |
| #131 | wheelbarrow | submission 134 waits for the visionary, lead recommends rework (wheel through the tray) |
| #139 | icons: sliders, folder, calendar | open |
| #140 | icons: warning, info, wifi | open |
| #141 | sound: door | open |
| #142 | sound: coins / cash register | open |
| #143 | sound: bird and cricket ambience | open |
| #144 | model: palm tree | open |
| #145 | model: torch | open |
| #146 | surface: leather (category `wood`) | open |
| #147 | sprite: treasure chest | open |

Dependencies: none between these tasks; all build on the contracts on main. Critical path: none (breadth is done).

## Next (lead, level D, not cut yet)

- `fabric` material kind (upholstery currently uses `paint` with an effective density).
- Contracts for the next kinds: music, sky, terrain, effects.
- Possibly raise the furniture draw-call cap from 4 to 5 for pieces with metal fittings (protected test; visionary-visible decision).
- Next batch from the second milestone on: put every new task into a named milestone and estimate it with `estimate_milestone`.
