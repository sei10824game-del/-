"""Ordinary survivor: zipped canvas jacket, jeans, sneakers, short hair. 1.75 m.
Run:  python human.py   ->  game3d/assets/human.glb"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *  # noqa

PARAMS = dict(height=1.75, limb=1.0, muscle=1.0, belly=1.0, chest_d=1.0, shoulder_w=1.03, hip_w=0.98,
              arm_len=1.0, hand_len=1.0, finger_len=1.0, finger_r=1.0, curl=1.2, arm_angle=42, voxel=0.0040, neck=1.18)


def materials(s, eyes):
    M = {}
    nb = NB('hskin')
    P = nb.obj
    x, y, z = nb.sep(P)
    mott = nb.noise(9.0, 5.0, 0.55)
    base = nb.ramp(mott, [(0.3, (0.42, 0.27, 0.19)), (0.6, (0.52, 0.35, 0.25)), (0.85, (0.58, 0.40, 0.29))])
    # redness: nose / cheeks / ears / knuckles
    def blob(c, r):
        d = nb.node('ShaderNodeVectorMath', {0: P, 1: c}, operation='DISTANCE').outputs['Value']
        return nb.mapr(d, r * 1.3, 0.0)
    red = nb.math('MAXIMUM', blob((0, -0.098 * s, 1.63 * s), 0.025 * s), blob((0.045 * s, -0.07 * s, 1.625 * s), 0.03 * s))
    red = nb.math('MAXIMUM', red, blob((-0.045 * s, -0.07 * s, 1.625 * s), 0.03 * s))
    red = nb.math('MAXIMUM', red, blob((0.075 * s, 0.016 * s, 1.648 * s), 0.035 * s))
    red = nb.math('MAXIMUM', red, blob((-0.075 * s, 0.016 * s, 1.648 * s), 0.035 * s))
    base = nb.mix(nb.math('MULTIPLY', red, 0.14), base, (0.55, 0.24, 0.20))
    # lips
    lip = nb.node('ShaderNodeVectorMath', {0: nb.vec((1.0, 1.6, 2.6)), 1: (0, -0.086 * s * 1.6, 1.595 * s * 2.6)},
                  operation='DISTANCE').outputs['Value']
    lipm = nb.mapr(lip, 0.03 * s, 0.022 * s)
    base = nb.mix(nb.math('MULTIPLY', lipm, 0.6), base, (0.42, 0.17, 0.15))
    ml = nb.node('ShaderNodeVectorMath', {0: nb.vec((0.35, 1.0, 6.0)), 1: (0, -0.09 * s, 1.5945 * s * 6.0)},
                 operation='DISTANCE').outputs['Value']
    base = nb.mix(nb.math('MULTIPLY', nb.mapr(ml, 0.016, 0.006), 0.85), base, (0.12, 0.04, 0.035))
    # stubble on jaw / chin / upper lip
    jaw = nb.math('MULTIPLY', nb.mapr(z, 1.62 * s, 1.60 * s), nb.mapr(z, 1.53 * s, 1.56 * s))
    jaw = nb.math('MULTIPLY', jaw, nb.mapr(y, 0.0, -0.04 * s))
    jaw = nb.math('MULTIPLY', jaw, nb.math('SUBTRACT', 1.0, lipm))
    stub = nb.math('MULTIPLY', jaw, nb.mapr(nb.noise(900.0, 1.0), 0.45, 0.6))
    base = nb.mix(nb.math('MULTIPLY', jaw, 0.25), base, (0.25, 0.16, 0.11))
    base = nb.mix(nb.math('MULTIPLY', stub, 0.6), base, (0.10, 0.07, 0.05))
    # eyebrows
    for sx in (1, -1):
        bd = nb.node('ShaderNodeVectorMath', {0: nb.vec((0.55, 1.0, 2.6)),
                                               1: (sx * 0.033 * s * 0.55, -0.079 * s, 1.687 * s * 2.6)},
                     operation='DISTANCE').outputs['Value']
        brow = nb.math('MULTIPLY', nb.mapr(bd, 0.02, 0.012), nb.mapr(nb.noise(400.0, 1.0), 0.35, 0.55))
        base = nb.mix(nb.math('MULTIPLY', brow, 0.9), base, (0.05, 0.035, 0.025))
    # sneakers below the ankle: dark canvas upper, off-white rubber sole
    shoe = nb.mapr(z, 0.118, 0.108)
    sole = nb.mapr(z, 0.026, 0.020)
    sh = nb.mix(sole, nb.ramp(nb.noise(60.0, 4.0), [(0.3, (0.07, 0.075, 0.085)), (0.7, (0.13, 0.13, 0.14))]),
                (0.62, 0.60, 0.55))
    base = nb.mix(shoe, base, sh)
    rough = nb.mixf(shoe, nb.mixf(lipm, nb.mapr(mott, 0.3, 0.8, 0.42, 0.6), 0.32), 0.7)
    pores = nb.noise(220.0, 2.0)
    fine = nb.voronoi(120.0, 'F1')
    h = nb.math('ADD', nb.math('MULTIPLY', pores, 0.3), nb.math('MULTIPLY', fine, 0.25))
    M['hskin'] = nb.finish(base, rough, nb.bump(h, 0.12, 0.002))
    # hair: dark brown short strands with clumps
    nb = NB('hhair')
    P = nb.obj
    st = nb.noise(5.0, 3.0, 0.6, 0.0, nb.vec((260.0, 260.0, 30.0)))
    cl = nb.noise(25.0, 4.0)
    col = nb.ramp(nb.math('ADD', nb.math('MULTIPLY', st, 0.6), nb.math('MULTIPLY', cl, 0.4)),
                  [(0.3, (0.018, 0.012, 0.008)), (0.55, (0.05, 0.035, 0.022)), (0.8, (0.10, 0.07, 0.045))])
    M['hhair'] = nb.finish(col, nb.mapr(st, 0.2, 0.8, 0.55, 0.38), nb.bump(nb.math('ADD', st, cl), 0.7, 0.004))
    # eye (lp is eye-local): sclera / brown iris / pupil
    nb = NB('heye')
    P = nb.obj
    x, y, z = nb.sep(P)
    rr = nb.node('ShaderNodeVectorMath', {0: nb.vec((1, 0, 1))}, operation='LENGTH').outputs['Value']
    front = nb.mapr(y, -0.006, -0.009)
    iris = nb.math('MULTIPLY', nb.mapr(rr, 0.0058, 0.0050), front)
    pupil = nb.math('MULTIPLY', nb.mapr(rr, 0.0026, 0.0020), front)
    irc = nb.ramp(nb.noise(900.0, 2.0, 0.5, 2.0), [(0.3, (0.10, 0.05, 0.02)), (0.7, (0.30, 0.17, 0.07))])
    col = nb.mix(iris, nb.ramp(nb.noise(300.0), [(0.4, (0.62, 0.56, 0.52)), (0.8, (0.70, 0.64, 0.60))]), irc)
    col = nb.mix(pupil, col, (0.01, 0.01, 0.01))
    M['heye'] = nb.finish(col, 0.08, None, coat=1.0)
    # canvas jacket: olive drab, seams, zipper, cuffs/hem bands, grime
    nb = NB('hjacket')
    P = nb.obj
    x, y, z = nb.sep(P)
    weave = nb.noise(140.0, 2.0, 0.5, 0.0, nb.vec((1.0, 1.0, 0.25)))
    grime = nb.noise(6.0, 6.0, 0.6)
    col = nb.ramp(grime, [(0.3, (0.07, 0.075, 0.04)), (0.6, (0.12, 0.12, 0.07)), (0.85, (0.16, 0.15, 0.09))])
    zip_ = nb.math('MULTIPLY', nb.mapr(nb.math('ABSOLUTE', x), 0.006, 0.003), nb.mapr(y, -0.02, -0.06))
    hem = nb.mapr(z, 0.93 * s, 0.91 * s)
    col = nb.mix(nb.math('MULTIPLY', hem, 0.5), col, (0.05, 0.05, 0.03))
    col = nb.mix(zip_, col, (0.02, 0.02, 0.02))
    col = nb.mix(nb.math('MULTIPLY', weave, 0.10), col, (0.0, 0.0, 0.0))
    folds = nb.noise(12.0, 4.0, 0.6, 0.0, nb.vec((1, 1, 2.5)))
    h = nb.math('ADD', nb.math('MULTIPLY', weave, 0.12), folds)
    h = nb.math('ADD', h, nb.math('MULTIPLY', zip_, 0.6))
    M['hjacket'] = nb.finish(col, nb.mixf(zip_, nb.mapr(grime, 0.3, 0.8, 0.88, 0.72), 0.35), nb.bump(h, 0.35, 0.006))
    # jeans: indigo twill with fading on thighs / knees, outer seams
    nb = NB('hjeans')
    P = nb.obj
    x, y, z = nb.sep(P)
    twill = nb.noise(110.0, 2.0, 0.5, 0.0, nb.vec((1.0, 1.0, 0.12)))
    fade = nb.math('MULTIPLY', nb.mapr(nb.noise(4.0, 4.0, 0.5, 0.0, nb.vec((3, 1, 0.6))), 0.4, 0.7), nb.mapr(y, 0.0, -0.06))
    col = nb.ramp(nb.noise(30.0, 4.0), [(0.3, (0.035, 0.05, 0.11)), (0.7, (0.06, 0.08, 0.15))])
    col = nb.mix(nb.math('MULTIPLY', fade, 0.7), col, (0.20, 0.25, 0.34))
    col = nb.mix(nb.math('MULTIPLY', twill, 0.25), col, (0.30, 0.32, 0.38))
    h = nb.math('ADD', nb.math('MULTIPLY', twill, 0.5), nb.math('MULTIPLY', nb.noise(10.0, 3.0, 0.5, 0.0, nb.vec((1, 1, 3))), 0.5))
    M['hjeans'] = nb.finish(col, 0.85, nb.bump(h, 0.18, 0.004))
    return M


def main():
    reset()
    R = humanoid(PARAMS)
    body, J, segs, s = R['body'], R['J'], R['segs'], R['s']
    M = materials(s, R['eyes'])
    body.data.materials.append(M['hskin'])
    log('body hi', tris(body))
    c0 = coords(body)
    region, tpar, _ = classify(c0, segs)

    def cloth_wr(amp, f):
        def fn(c, n):
            a = noise3(c * np.array((1, 1, 2.8)), f, 11.0, 2)
            b = noise3(c, f * 2.3, 4.0)
            return amp * (0.7 * a + 0.3 * b) + amp * 0.5
        return fn

    def jacket_keep(c):
        reg, t, _ = classify(c, segs)
        keep = np.isin(reg, ['torso', 'clav.L', 'clav.R', 'uarm.L', 'uarm.R'])
        keep |= np.isin(reg, ['farm.L', 'farm.R']) & (t < 0.94)
        keep |= (reg == 'neck') & (c[:, 2] < 1.50 * s)
        keep &= c[:, 2] > (0.925 + 0.02 * (np.abs(c[:, 0]) < 0.06 * s)) * s
        return keep

    jacket = shell(body, 'jacket', jacket_keep, 0.015, cloth_wr(0.006, 7.0), thick=0.006, min_island=200)
    jacket.data.materials.clear()
    jacket.data.materials.append(M['hjacket'])

    def jeans_keep(c):
        reg, t, _ = classify(c, segs)
        keep = (reg == 'torso') & (c[:, 2] < 1.02 * s)
        keep |= np.isin(reg, ['thigh.L', 'thigh.R'])
        keep |= np.isin(reg, ['shin.L', 'shin.R']) & (t < 0.93)
        keep &= c[:, 2] > 0.10 * s
        return keep

    def jeans_wr(c, n):
        return cloth_wr(0.0025, 7.0)(c, n) + 0.014 * sstep(0.55 * s, 0.15 * s, c[:, 2])

    jeans = shell(body, 'jeans', jeans_keep, 0.009, jeans_wr, thick=0.005, min_island=200)
    jeans.data.materials.clear()
    jeans.data.materials.append(M['hjeans'])

    # short hair: scalp shell above an irregular hairline, ears excluded
    def hair_keep(c):
        reg, t, _ = classify(c, segs)
        y, z = c[:, 1], c[:, 2]
        nz = noise3(c, 60.0, 3.0)
        line = np.where(y < -0.03 * s, 1.705 * s, np.where(y < 0.03 * s, 1.675 * s, 1.60 * s))
        line = line + 0.004 * nz - 0.02 * sstep(-0.02 * s, -0.06 * s, y) * sstep(0.03 * s, 0.06 * s, np.abs(c[:, 0])) * 0
        keep = np.isin(reg, ['head', 'neck']) & (z > line)
        for sx in (1, -1):
            keep &= gauss(c, (sx * 0.074 * s, 0.016 * s, 1.648 * s), 0.028 * s) < 0.35
        return keep

    def hair_wr(c, n):
        clumps = noise3(c, 45.0, 2.0, 2)
        return 0.004 * clumps + 0.004 * sstep(1.66 * s, 1.75 * s, c[:, 2])

    hair = shell(body, 'hair', hair_keep, 0.006, hair_wr, thick=0.004, min_island=200)
    hair.data.materials.clear()
    hair.data.materials.append(M['hhair'])
    # collar band
    cb = bmesh.new()
    pts = []
    for k in range(17):
        a = math.pi * (-1 + 2 * k / 16)
        pts.append(V((math.sin(a) * 0.066 * s, -math.cos(a) * 0.060 * s + 0.018 * s, (1.468 + 0.012 * math.cos(a)) * s)))
    bm_sweep(cb, pts, [(0.009 * s, 0.022 * s)] * len(pts), seg=10, nsub=3)
    collar = obj_from_bm('collar', cb, M['hjacket'])
    remesh(collar, 0.003, 1, 0.5)

    # eyes
    eyes, lids = [], []
    for k, e in enumerate(R['eyes']):
        eb = bmesh.new()
        bm_ellipsoid(eb, (0, 0, 0), (0.0120 * s,) * 3, None, 20, 12)
        eo = obj_from_bm('eye%d' % k, eb, M['heye'])
        set_lp(eo)
        eo.data.transform(Matrix.Translation(e + V((0, 0.0060 * s, 0))))
        eyes.append(eo)
        # eyelid rims hugging the eyeball (skin)
        lb = bmesh.new()
        ce = e + V((0, 0.0060 * s, 0))
        for phi, rr in ((30, 0.0042), (-34, 0.0032)):
            pts = []
            for th in np.linspace(-80, 80, 9):
                t_, p_ = math.radians(th), math.radians(phi * (1 - 0.25 * (th / 80) ** 2))
                pts.append(ce + V((math.sin(t_) * math.cos(p_), -math.cos(t_) * math.cos(p_), math.sin(p_))) * 0.0128 * s)
            bm_sweep(lb, pts, [rr * 0.5] + [rr * s] * 7 + [rr * 0.5], seg=8, nsub=3)
        lid = obj_from_bm('lid%d' % k, lb, M['hskin'])
        lids.append(lid)

    proxy = copy_obj(body, 'proxy')
    decimate(proxy, 9000)
    protect = np.isin(region, ['head', 'hand.L', 'hand.R'])
    nk = remove_hidden(body, [jacket, jeans], 0.06, 3)
    log('removed hidden faces', nk)
    for o in [body, jacket, jeans, hair, collar] + eyes + lids:
        smart_uv(o)
    for o in [body, jacket, jeans, hair, collar] + lids:
        set_lp(o)
    budgets = {body: 10100, jacket: 6600, jeans: 4300, hair: 2400, collar: 500}
    for o, b in budgets.items():
        decimate(o, b)
    for o in eyes:
        decimate(o, 240)
    for o in lids:
        decimate(o, 200)
    parts = [body, jacket, jeans, hair, collar] + eyes + lids
    log('tris per part', {o.name: tris(o) for o in parts})

    bones = humanoid_bones(J)
    arm = build_armature('HumanRig', bones)
    names = [b[0] for b in bones]
    heat_weights(proxy, arm)
    Wp = weight_matrix(proxy, names)
    Wp, nbad = fill_missing_weights(proxy, Wp, arm, names)
    log('proxy verts without heat weight', nbad)
    for o in [body, jacket, jeans, collar]:
        W = transfer_weights(proxy, Wp, o)
        if o in (jacket, jeans):
            W = smooth_weights(o, W, 3, 0.5)
        set_weights(o, W, names)
    for o in [hair] + eyes + lids:
        set_weights(o, rigid_weights(o, names, 'Head'), names)
    delete(proxy)
    mesh = join(parts, 'Human')
    for m in list(mesh.modifiers):
        mesh.modifiers.remove(m)
    mesh.parent = None
    log('human tris', tris(mesh))
    pack_uv(mesh, 0.003)
    imgs = bake_textures(mesh, 1024, 'human', ao_samples=24, ao_strength=0.55, margin=6)
    replace_materials(mesh, imgs, wet_names=('heye',), prefix='Human')
    bind(mesh, arm)
    humanoid_anims(arm, zombie=False)
    out = os.path.join(ASSETS, 'human.glb')
    export_glb(out, [arm, mesh])
    log(json.dumps(inspect_glb(out)))
    if os.environ.get('PREVIEW', '1') == '1':
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(TMP, 'human.blend'))
        setup_preview(target=(0, 0, 0.92), dist=3.3, yaw=28, pitch=6, res=(720, 960), samples=40)
        render(os.path.join(TMP, 'human_still.png'))
        setup_preview(target=(0, -0.02, 1.62), dist=0.8, yaw=18, pitch=2, res=(960, 720), samples=40)
        render(os.path.join(TMP, 'human_close.png'))
        apply_action(arm, bpy.data.actions['Run'], 6)
        setup_preview(target=(0, 0, 0.9), dist=3.4, yaw=-60, pitch=6, res=(720, 960), samples=40)
        render(os.path.join(TMP, 'human_run.png'))
    log('reimport', reimport_check(out))


if __name__ == '__main__':
    main()
