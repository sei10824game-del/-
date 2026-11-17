# Grumble visual polish

## Scope
Dedicated rendering for `dr_grumble` and `dr_queen_grumble` in `tools/five-factions-runtime.js`, embedded into the HTML by the existing generator.

- Broad, rounded skin-covered body with dorsal folds and deterministic surface markings.
- Four far-side and four near-side articulated legs with joints and gait offsets.
- Forward-facing mouth, upper/lower pointed teeth, recessed eye cluster and asymmetric silhouette that mirrors with facing.
- Existing attack windup drives withdrawal and mouth opening; release drives a brief forward lunge and wider gape, decaying into recovery.
- Queen retains its existing larger scale and gains a darker palette and facial scar, not invented armor or equipment.

Rendering only: existing attack definitions/counts, damage, timings, movement logic, spawning, infection and population settings remain unchanged. Visual interpretation is not a claim of complete original-game anatomical fidelity.

## Validation
- `tools/test-grumble-polish.cjs`: two models × five states on native Canvas, facing/charge/release pixel differences, sampled combat state unchanged, zero draw errors.
- `/home/user/grumble-polish-poses.png` inspected visually. Native rendering fixtures are not live-browser or large-battle performance tests.
- All 49 `tools/test-*.cjs` passed.
- Animation audit: 2299 attack definitions, zero missing keys, zero mock draw errors.
- Render audit: 1095 species, zero errors; twelve manual-material-review markers remain (including both Grumbles, which were reviewed in the native sheet).
- HTML regenerated identically; diff whitespace check clean.
