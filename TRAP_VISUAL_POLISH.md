# DOORS environmental-trap visual polish

## Scope
- Shared fake-door renderer for Hotel/Mines Dupe: dimensional wooden frame, panels, number plate and handle. Before interaction the same renderer is used as for real doors; no advance face reveal. Existing Dupe event briefly opens the leaf and reveals a face, then closes it. Existing blurred-number state remains visible afterwards.
- Real doors use the same frame and animate their existing opened state.
- Containers have dimensional sides, latch and opening lid. Timothy emerges with articulated eight legs for 0.8 seconds after the existing container-open event, then disappears. Other containers do not show a spider.
- Snare gains soil, roots, central hole and nine spikes, raised while its existing contact set is occupied or briefly after the existing step event.
- Thrown containers gain dimensional box rendering.

Only drawing code and read-only event-age helpers changed in `tools/canon-world-runtime.js`. Damage, nonlethal handling, stopping duration, contacts, interaction rules, spawns, infection and population settings are unchanged. This does not add new attacks or claim full original-game visual parity.

## Verification
- `tools/test-trap-polish.cjs`: native Canvas contact/event fixtures, real/fake door, Timothy container and Snare at four stages. Checks image changes and no mutation of sampled health, position, flags, contacts or events. Fixtures use existing event format; actual interaction rules are separately covered by the canon-world tests.
- `/home/user/trap-polish.png`: inspected before/after contact sheet. This is a rendering fixture, not browser gameplay verification.
- All 48 `tools/test-*.cjs` passed.
- Animation audit: 2299 attack definitions, zero missing keys and zero mock drawing errors.
- Species renderer audit: 1095 species, zero errors. Ten manual-review markers remain, including world-rendered traps; these are not missing-renderer failures.
- Embedded HTML regenerated identically; `git diff --check` clean.
