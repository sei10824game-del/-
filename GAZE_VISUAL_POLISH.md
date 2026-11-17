# DOORS gaze-entity visual polish

Dedicated read-only drawing profiles for dr_eyes and dr_lookman in tools/five-factions-runtime.js, embedded into mansion_war.html with the existing generator.

- Eyes: eight individually shaded eyes with directional pupils, independent opening and bobbing, purple mist and wisps. Existing gaze animation narrows the eyes during windup and opens them with a brief expanding arc during release.
- Lookman: dark humanoid silhouette rather than the generic eye cluster, with separate head, uneven shoulders, hanging arms, split legs, subtle folds and pale eyes. Asymmetric face and body mirror with facing. Existing gaze clock controls eyelids and a brief facial arc.

Stylized visual interpretations, not a claim of exact original-game fidelity. No attack definitions, damage, timing, gaze detection, movement rules, spawns, infection or population settings changed. Forget-Me-Not is outside this pass.

Validation:
- tools/test-gaze-polish.cjs: two models × five native Canvas states, facing and windup/release image differences, sampled combat state unchanged, zero drawing errors.
- /home/user/gaze-polish-poses.png visually inspected; fixture rendering is not browser or large-battle performance verification.
- All 53 tools/test-*.cjs passed.
- Animation audit: 2299 definitions, zero missing keys, zero mock draw errors.
- Render audit: 1095 species, zero errors; twenty-five manual-review markers remain, including Lookman reviewed in the native sheet.
- Embedded HTML regenerated identically; git diff --check clean.
