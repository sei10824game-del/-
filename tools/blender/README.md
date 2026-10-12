Rebuild (headless Blender 5.x as the `bpy` Python module, numpy required): `cd tools/blender && for c in headcrab zombie human; do /tmp/claude-0/bpyenv/bin/python $c.py; done`
Each script models, rigs, weight-skins, animates, bakes 1024/512 PBR textures and exports to `game3d/assets/<name>.glb`; `helpers.py` holds the shared modelling/bake/rig/animation code (zombie.py imports headcrab.py for the head crab).
Set `PREVIEW=0` to skip the Cycles preview renders (written with intermediate textures to `$BLD_TMP`, default `/tmp/blender_build`).
