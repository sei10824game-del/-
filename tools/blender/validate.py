"""Re-import each exported GLB in a clean Blender scene, check skin/animations/orientation and render
a 3-view turntable strip plus posed animation frames.  Usage: python validate.py [zombie human headcrab]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *  # noqa

POSES = {'zombie': [('Attack', 14), ('Death', 61)], 'human': [('Attack', 13), ('Death', 55)],
         'headcrab': [('Attack', 18), ('Death', 49)]}


def stitch(paths, out):
    imgs = []
    for p in paths:
        im = bpy.data.images.load(p)
        w, h = im.size
        a = np.empty(w * h * 4, np.float32)
        im.pixels.foreach_get(a)
        imgs.append(a.reshape(h, w, 4))
    big = np.concatenate(imgs, axis=1)
    h, w = big.shape[:2]
    im = bpy.data.images.new('strip', w, h)
    im.pixels.foreach_set(big.ravel())
    im.filepath_raw = out
    im.file_format = 'PNG'
    im.save()


def check(name):
    path = os.path.join(ASSETS, name + '.glb')
    info = inspect_glb(path)
    rep = reimport_check(path)
    arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
    mesh = [o for o in bpy.data.objects if o.type == 'MESH' and any(m.type == 'ARMATURE' for m in o.modifiers)][0]
    # orientation in three.js terms (glTF Y-up): feet/claws at y=0, front toward +Z
    c = coords(mesh) @ np.array(mesh.matrix_world.to_3x3()).T + np.array(mesh.matrix_world.translation)
    gl = np.stack([c[:, 0], c[:, 2], -c[:, 1]], 1)  # blender -> glTF axes
    low = gl[gl[:, 1] < 0.04]
    print('[%s] size %.2f MB tris %d clips %s skins %s' % (name, info['bytes'] / 1e6, info['triangles'],
          [a[0] for a in info['animations']], info['skins']))
    print('[%s] glTF bounds min %s max %s; ground-contact mean z %.3f (>0 => toes/claws face +Z)' % (
        name, gl.min(0).round(3), gl.max(0).round(3), low[:, 2].mean() if len(low) else float('nan')))
    print('[%s] reimport %s' % (name, rep))
    tgt = (0, 0, 0.92) if name != 'headcrab' else (0, 0, 0.15)
    dist = 3.4 if name != 'headcrab' else 1.3
    pitch = 6 if name != 'headcrab' else 22
    shots = []
    for k, yaw in enumerate((0, 120, 240)):
        setup_preview(target=tgt, dist=dist, yaw=yaw + 20, pitch=pitch, res=(480, 640), samples=32)
        p = os.path.join(TMP, 'val_%s_%d.png' % (name, k))
        render(p)
        shots.append(p)
    stitch(shots, os.path.join(TMP, 'val_%s_turntable.png' % name))
    shots = []
    for act, f in POSES[name]:
        apply_action(arm, bpy.data.actions[act], f)
        setup_preview(target=tgt, dist=dist * 1.05, yaw=55, pitch=pitch, res=(480, 640), samples=32)
        p = os.path.join(TMP, 'val_%s_%s.png' % (name, act))
        render(p)
        shots.append(p)
    stitch(shots, os.path.join(TMP, 'val_%s_poses.png' % name))


if __name__ == '__main__':
    for n in (sys.argv[1:] or ['zombie', 'human', 'headcrab']):
        check(n)
