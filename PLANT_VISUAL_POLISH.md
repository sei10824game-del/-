# DOORS plant visual polish

Render-only profiles for dr_world_lotus, dr_eyestalk, dr_bramble and dr_mandrake, replacing their shared generic plant drawing in tools/five-factions-runtime.js.

- World Lotus: layered petals, veined leaves, stem, center and a brief bloom/ring during the existing ability animation.
- Eyestalk: curved stalk, leaves, shaded eye with directional pupil and windup/release bending.
- Bramble: six curved vines with individual thorns and leaves; existing attack clock retracts/extends the tips.
- Mandrake: root body, branched root limbs, leafy crown, face and opening mouth.

These are stylized visual interpretations, not a claim of exact original-game anatomy. No new abilities, damage, timings, movement logic, spawning, infection or population changes. Snare keeps its previously improved environmental-trap renderer.

Validation:
- tools/test-plant-polish.cjs: four models × five native Canvas poses; directional and windup/release pixel differences; sampled combat-state invariance and zero drawing errors.
- /home/user/plant-polish-poses.png inspected visually (render fixtures, not browser or large-battle verification).
- All 51 tools/test-*.cjs passed.
- Animation audit: 2299 definitions, zero missing keys and zero mock draw errors.
- Render audit: 1095 species, zero errors; twenty manual-review markers remain, including these four inspected profiles.
- Embedded HTML regeneration identical; git diff --check clean.
