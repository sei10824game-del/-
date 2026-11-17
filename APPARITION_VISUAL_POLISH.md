# DOORS apparition visual polish

Render-only profiles for dr_rush, dr_ambush, dr_screech and dr_halt in tools/five-factions-runtime.js, embedded by the existing generator.

- Rush: irregular dark outline, deterministic mottling, eyes, toothed grin and trailing wisps.
- Ambush: elongated pale green outline, recessed eyes, long mouth and trailing wisps.
- Screech: dark body, pale facial surface, six curved appendages, eyes and toothed mouth. Existing attack windup/release changes appendage reach and mouth opening.
- Halt: translucent blue sheet-like silhouette, illuminated eyes, folds, rippling hem and trailing wisps.
- Existing attack clock drives windup withdrawal, brief forward release and recovery. Facing mirrors the asymmetric face and trailing effects.

No attacks, damage, attack timings, movement logic, infection, spawn rules or population settings changed. These are stylized interpretations, not claims of complete original-game fidelity. The existing glitched variants are not included in this pass.

Validation:
- tools/test-apparition-polish.cjs: four models × five native Canvas poses; facing and windup/release pixel differences; sampled combat-state invariance and zero drawing errors.
- /home/user/apparition-polish-poses.png visually inspected; fixture rendering is not live-browser or large-battle verification.
- All 52 tools/test-*.cjs passed.
- Animation audit: 2299 definitions, zero missing keys and zero mock draw errors.
- Render audit: 1095 species, zero errors; twenty-four manual-review markers remain, including these four inspected profiles.
- Embedded HTML regeneration identical; git diff --check clean.
