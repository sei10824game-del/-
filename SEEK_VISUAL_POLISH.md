# Seek derivative visual polish

Dedicated render-only profiles for dr_seek_dam, dr_seek_hand, dr_seek_sludge and dr_seek_worm in tools/five-factions-runtime.js, embedded by the existing generator.

- Dam: layered oily pool, rising viscous columns and forward-directed eyes.
- Hand: curved arm, palm, four separately curved fingers and thumb; existing attack windup curls the fingers and release extends the hand.
- Sludge: low layered body, forward head/eye and stretching arms.
- Worm: curved tubular silhouette with ridged surface and a directional circular maw with twelve teeth.
- Existing attack clocks drive windup and decaying extension/gape. No new attacks, damage, movement rules, spawn rules or population changes. These are stylized visual interpretations, not a claim of complete original-game fidelity.

Validation:
- tools/test-seek-polish.cjs: four models × five native Canvas poses; facing/charge/release pixel differences and sampled combat-state invariance.
- /home/user/seek-polish-poses.png inspected visually; this is not live-browser performance verification.
- All 50 tools/test-*.cjs passed.
- Animation audit: 2299 definitions, zero missing keys, zero mock draw errors.
- Render audit: 1095 species, zero errors; sixteen manual-review markers remain, including these four profiles inspected in the native sheet.
- Embedded HTML regeneration identical and git diff --check clean.
