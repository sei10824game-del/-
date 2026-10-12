"""Headcrab: spider-like parasite, 4 jointed leg pairs, toothy ventral mouth, wrinkled tan skin.
Run:  python headcrab.py   (bpy as module)  ->  game3d/assets/headcrab.glb
`build_headcrab()` is also used by zombie.py (crab clamped on the zombie's head, legs in a grip pose)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *  # noqa

BODY_C = V((0, 0.015, 0.185))
BODY_R = V((0.135, 0.158, 0.085))
MOUTH_C = V((0, -0.010, 0.112))

# psi: degrees from forward(-Y) toward the side; ra: attach radius; L1/L2: femur/tibia length;
# e1/e2/e3: segment elevations (deg); r: thickness multiplier; L3: tarsus length (None = reach ground)
STAND = [dict(psi=24, ra=0.090, L1=0.135, e1=52, L2=0.14, e2=-18, e3=-72, r=1.6, L3=None),
         dict(psi=62, ra=0.105, L1=0.110, e1=48, L2=0.12, e2=-38, e3=-80, r=1.0, L3=None),
         dict(psi=104, ra=0.110, L1=0.105, e1=46, L2=0.115, e2=-40, e3=-82, r=1.0, L3=None),
         dict(psi=146, ra=0.100, L1=0.095, e1=42, L2=0.105, e2=-44, e3=-84, r=0.92, L3=None)]


def leg_points(L, sx, z0=0.152):
    if 'pts' in L:  # explicit (e.g. conformed to the zombie head)
        return [V(p) for p in L['pts'][sx]]
    psi = math.radians(L['psi'])
    rh = V((math.sin(psi) * sx, -math.cos(psi), 0))
    Z = V((0, 0, 1))
    ang = L.get('twist', 0.0)
    if ang:
        rh = Quaternion(Z, math.radians(ang) * -sx) @ rh
    d = lambda e: (rh * math.cos(math.radians(e)) + Z * math.sin(math.radians(e)))
    p0 = V((0, BODY_C.y * 0.5, z0)) + V((rh.x * L['ra'], rh.y * L['ra'] * 1.12, 0))
    p1 = p0 + d(L['e1']) * L['L1']
    p2 = p1 + d(L['e2']) * L['L2']
    if L.get('L3') is None:
        L3 = max(0.02, p2.z / -math.sin(math.radians(L['e3'])))
    else:
        L3 = L['L3']
    dd = d(L['e3'])
    if L.get('curl'):
        dd = (dd - rh * L['curl']).normalized()
    p3 = p2 + dd * L3
    return [p0, p1, p2, p3]


def materials():
    mats = {}
    # wrinkled tan skin, paler fleshy belly, mouth region dark red
    nb = NB('crab_skin')
    P = nb.obj
    x, y, z = nb.sep(P)
    dv = nb.node('ShaderNodeTexNoise', {'Vector': P, 'Scale': 6.0, 'Detail': 3.0}).outputs['Color']
    pw = nb.node('ShaderNodeVectorMath', {0: P, 1: dv}, operation='ADD').outputs[0]
    pw = nb.node('ShaderNodeVectorMath', {0: pw, 1: (1.0, 1.6, 1.0)}, operation='MULTIPLY').outputs[0]
    wr = nb.voronoi(18.0, 'DISTANCE_TO_EDGE', vec=pw)          # big soft skin folds
    wr2 = nb.voronoi(60.0, 'DISTANCE_TO_EDGE', vec=pw)         # fine wrinkles
    rid = nb.math('ABSOLUTE', nb.math('SUBTRACT', nb.noise(24.0, 4.0, 0.6, 0.8), 0.5))
    mott = nb.noise(7.0, 5.0, 0.55)
    rxy = nb.node('ShaderNodeVectorMath', {0: P, 1: (1.0, 0.85, 0.0)}, operation='MULTIPLY').outputs[0]
    rxy = nb.node('ShaderNodeVectorMath', {0: rxy}, operation='LENGTH').outputs['Value']
    belly = nb.math('MULTIPLY', nb.mapr(z, 0.165, 0.125), nb.mapr(rxy, 0.16, 0.12))  # 1 underneath body
    belly = nb.math('MULTIPLY', belly, nb.mapr(z, 0.07, 0.10))
    base = nb.ramp(mott, [(0.25, (0.27, 0.17, 0.08)), (0.5, (0.42, 0.29, 0.15)), (0.75, (0.52, 0.40, 0.24))])
    base = nb.mix(belly, base, (0.50, 0.30, 0.22), 'MIX')
    base = nb.mix(nb.math('MULTIPLY', nb.mapr(z, 0.09, -0.1), 0.45), base, (0.20, 0.12, 0.07))  # dark leg ends
    crease = nb.math('MULTIPLY', nb.mapr(wr, 0.0, 0.05, 1.0, 0.0), 0.6)
    crease2 = nb.math('MULTIPLY', nb.mapr(rid, 0.0, 0.06, 1.0, 0.0), 0.45)
    base = nb.mix(crease, base, (0.20, 0.11, 0.06), 'MIX')
    base = nb.mix(crease2, base, (0.24, 0.14, 0.08), 'MIX')
    spots = nb.mapr(nb.noise(26.0, 2.0, 0.5), 0.64, 0.72)
    base = nb.mix(nb.math('MULTIPLY', spots, 0.45), base, (0.30, 0.17, 0.10))
    md = nb.node('ShaderNodeVectorMath', {0: P, 1: tuple(MOUTH_C)}, operation='DISTANCE').outputs['Value']
    mouth = nb.mapr(md, 0.05, 0.036)
    base = nb.mix(mouth, base, nb.ramp(nb.noise(60.0, 3.0), [(0.3, (0.16, 0.015, 0.02)), (0.7, (0.38, 0.05, 0.05))]))
    rough = nb.mixf(mouth, nb.mapr(mott, 0.3, 0.8, 0.34, 0.55), 0.2)
    h = nb.math('ADD', nb.math('MULTIPLY', wr, 1.6), nb.math('MULTIPLY', wr2, 0.5))
    h = nb.math('ADD', h, nb.math('MULTIPLY', rid, 0.8))
    mats['crab_skin'] = nb.finish(base, rough, nb.bump(h, 0.45, 0.005))
    nb = NB('crab_claw')
    t = nb.noise(80.0, 3.0)
    mats['crab_claw'] = nb.finish(nb.ramp(t, [(0.2, (0.06, 0.04, 0.03)), (0.8, (0.20, 0.15, 0.10))]), 0.32,
                                  nb.bump(nb.wave(120, 'Z', 2.0), 0.2, 0.002))
    nb = NB('crab_tooth')
    mats['crab_tooth'] = nb.finish(nb.ramp(nb.noise(90.0), [(0.3, (0.62, 0.55, 0.40)), (0.8, (0.80, 0.74, 0.58))]), 0.3)
    nb = NB('crab_mouth')
    mats['crab_mouth'] = nb.finish(nb.ramp(nb.noise(50.0, 4.0), [(0.3, (0.14, 0.01, 0.015)), (0.75, (0.40, 0.05, 0.05))]),
                                   0.18, nb.bump(nb.voronoi(70.0, 'DISTANCE_TO_EDGE'), 0.5, 0.003))
    return mats


def build_headcrab(legs=STAND, mats=None, voxel=0.0028, budget=(8600, 1100, 900, 300), seed=3, name='crab'):
    """Returns dict(objs=[skin, claws, teeth, mouth], legs={(i,sfx): pts}) in crab-local space (z up, -Y forward)."""
    mats = mats or materials()
    bm = bmesh.new()
    E = lambda c, r, rot=None, u=28, v=16: bm_ellipsoid(bm, c, r, rot, u, v)
    E(BODY_C, BODY_R, None, 48, 28)
    E((0, 0.075, 0.215), (0.085, 0.078, 0.055))
    E((0, -0.095, 0.192), (0.075, 0.062, 0.052))
    E((0, 0.0, 0.148), (0.118, 0.135, 0.045))
    # wavy skin skirt around the rim
    for sx in (1, -1):
        pts, rad = [], []
        for k in range(13):
            a = math.pi * (-0.05 + 1.1 * k / 12)
            pts.append((sx * math.sin(a) * 0.132, -math.cos(a) * 0.16 + 0.012, 0.158 + 0.006 * math.sin(k * 2.1)))
            rad.append(0.021 + 0.005 * math.sin(k * 1.7 + sx))
        bm_sweep(bm, pts, rad, seg=12, nsub=3)
    # mouth lip ring
    for sx in (1, -1):
        pts = [(sx * math.sin(math.pi * k / 10) * 0.046, MOUTH_C.y - math.cos(math.pi * k / 10) * 0.046, MOUTH_C.z + 0.004)
               for k in range(-1, 12)]
        bm_sweep(bm, pts, [0.011] * len(pts), seg=10, nsub=2)
    legpts = {}
    claws_bm = bmesh.new()
    for i, L in enumerate(legs):
        for sx, sfx in ((1, 'L'), (-1, 'R')):
            p = leg_points(L, sx)
            legpts[(i, sfx)] = p
            r = L['r']
            dtip = (p[3] - p[2]).normalized()
            pend = p[3] - dtip * 0.03
            mid1 = p[0].lerp(p[1], 0.5) + V((0, 0, 0.012))
            mid2 = p[1].lerp(p[2], 0.5) + V((0, 0, 0.006))
            bm_sweep(bm, [p[0] - (p[1] - p[0]).normalized() * 0.03, p[0], mid1, p[1], mid2, p[2], pend],
                     [0.022 * r, 0.021 * r, 0.019 * r, 0.016 * r, 0.013 * r, 0.011 * r, 0.0085 * r], seg=12, nsub=3)
            E(p[1], (0.019 * r,) * 3, None, 14, 8)
            E(p[2], (0.0135 * r,) * 3, None, 14, 8)
            # pointed claw (separate material), slightly hooked
            side = (p[2] - p[1]).normalized()
            hz = V((dtip.x, dtip.y, 0)).normalized()
            hook = p[3] + hz * 0.012 + V((0, 0, 0.003))
            bm_sweep(claws_bm, [pend - dtip * 0.012, pend, p[3], hook],
                     [0.0088 * r, 0.0083 * r, 0.004 * r, 0.0], seg=10, nsub=3)
    skin = obj_from_bm(name + '_skin', bm, mats['crab_skin'])
    remesh(skin, voxel, smooth_iter=2, smooth_fac=0.5)
    smart_uv(skin)
    c = coords(skin)
    n = vnormals(skin)
    # ventral mouth cavity (sculpt: push the underside in)
    cav = gauss(c, MOUTH_C - V((0, 0, 0.01)), 0.034) * (n[:, 2] < -0.2)
    # wrinkles / folds: creases at zero crossings of fractal noise, strongest on the dome
    nz = noise3(c, 22.0, seed, 3)
    nz2 = noise3(c, 55.0, seed + 5, 2)
    dome = sstep(0.10, 0.17, c[:, 2]) * gauss(c, BODY_C, 0.22)
    d = -0.0045 * (1 - np.abs(nz)) ** 6 * dome - 0.0015 * (1 - np.abs(nz2)) ** 6 * dome + 0.002 * nz * dome
    d -= 0.030 * cav
    set_coords(skin, c + n * d[:, None])
    lap_smooth(skin, 0.25 * np.ones(len(c)), 1)
    decimate(skin, budget[0])
    claws = obj_from_bm(name + '_claws', claws_bm, mats['crab_claw'])
    smart_uv(claws)
    decimate(claws, budget[1])
    # teeth ring
    tb = bmesh.new()
    R = np.random.RandomState(seed)
    nt = 18
    for k in range(nt):
        a = 2 * math.pi * k / nt + R.uniform(-0.08, 0.08)
        rad = V((math.sin(a), -math.cos(a), 0))
        base = MOUTH_C + rad * 0.037 + V((0, 0, 0.004))
        tl = R.uniform(0.016, 0.026)
        tip = base - rad * tl * 0.45 + V((0, 0, -tl))
        midp = base.lerp(tip, 0.5) - rad * 0.002
        bm_sweep(tb, [base + V((0, 0, 0.006)), base, midp, tip], [0.0055, 0.0052, 0.0035, 0.0], seg=7, nsub=2)
    teeth = obj_from_bm(name + '_teeth', tb, mats['crab_tooth'])
    smart_uv(teeth)
    decimate(teeth, budget[2])
    # mouth interior (wet throat cup above the cavity)
    mb = bmesh.new()
    bm_ellipsoid(mb, MOUTH_C + V((0, 0, 0.02)), (0.038, 0.038, 0.022), None, 20, 10)
    mouth = obj_from_bm(name + '_mouth', mb, mats['crab_mouth'])
    smart_uv(mouth)
    decimate(mouth, budget[3])
    for o in (skin, claws, teeth, mouth):
        set_lp(o)
    return dict(objs=[skin, claws, teeth, mouth], legs=legpts, mats=mats)


def crab_bones(legpts):
    b = [('Root', (0, 0, 0), (0, 0, 0.1), None),
         ('Body', (0, 0.07, BODY_C.z), (0, -0.07, BODY_C.z), 'Root')]
    for (i, sfx), p in sorted(legpts.items()):
        nm = 'Leg%d.%s' % (i, sfx)
        b += [(nm + '.1', p[0], p[1], 'Body'), (nm + '.2', p[1], p[2], nm + '.1', True),
              (nm + '.3', p[2], p[3], nm + '.2', True)]
    return b


def crab_weights(o, bone_names, legpts, legs=STAND, sigma=0.006):
    c = coords(o)
    nb = len(bone_names)
    D = np.full((len(c), nb), 9.0, np.float32)
    q = (c - np.array(BODY_C)) / np.array((0.12, 0.14, 0.07))
    D[:, bone_names.index('Body')] = (np.linalg.norm(q, axis=1) - 1.0) * 0.07
    for (i, sfx), p in legpts.items():
        r = legs[i]['r']
        rads = [(0.022 * r, 0.016 * r), (0.016 * r, 0.011 * r), (0.011 * r, 0.004 * r)]
        for k in range(3):
            d, t = seg_dist(c, p[k], p[k + 1])
            D[:, bone_names.index('Leg%d.%s.%d' % (i, sfx, k + 1))] = d - (rads[k][0] * (1 - t) + rads[k][1] * t)
    Dm = D.min(1, keepdims=True)
    W = np.exp(-(D - Dm) / sigma)
    W[(D - Dm) > 3.5 * sigma] = 0
    return W


# ----------------------------------------------------------------------------- animation
def crab_anims(arm, legpts):
    Z = V((0, 0, 1))

    def leg_axes(i, sfx):
        p = legpts[(i, sfx)]
        rh = (p[1] - p[0])
        rh.z = 0
        rh.normalize()
        return rh, rh.cross(Z)  # radial, lift-axis (rot about it by +deg raises)... sign checked below

    def lift_axis(i, sfx):
        rh, _ = leg_axes(i, sfx)
        return tuple(rh.cross(Z))  # +deg lifts the leg up (rotates radial dir toward +Z)

    groupA = {(0, 'L'), (1, 'R'), (2, 'L'), (3, 'R')}

    def legs_pose(P, f):
        for i in range(4):
            for sfx in 'LR':
                lift, swing, knee, tars = f(i, sfx)
                la = lift_axis(i, sfx)
                sgn = 1 if sfx == 'L' else -1
                P['Leg%d.%s.1' % (i, sfx)] = {'r': [('z', swing * sgn), (la, lift)]}
                P['Leg%d.%s.2' % (i, sfx)] = {'r': [(la, knee)]}
                P['Leg%d.%s.3' % (i, sfx)] = {'r': [(la, tars)]}
        return P

    def idle(t):
        w = 2 * math.pi * t
        P = {'Root': {'l': (0, 0, 0.004 * math.sin(w * 2))},
             'Body': {'r': [('x', 2.0 * math.sin(w)), ('y', 1.5 * math.sin(w * 2 + 1))]}}
        return legs_pose(P, lambda i, s: (2.5 * math.sin(w * 2 + i + (s == 'L')), 3 * math.sin(w + i * 1.3),
                                          -2 * math.sin(w * 2 + i), 0))

    def walk(t):
        w = 2 * math.pi * t
        P = {'Root': {'l': (0, 0, 0.012 + 0.008 * math.sin(w * 2))},
             'Body': {'r': [('y', 4 * math.sin(w)), ('x', -2 + 2 * math.sin(2 * w))]}}

        def f(i, s):
            ph = w + (0 if (i, s) in groupA else math.pi)
            up = max(0.0, math.sin(ph))
            return (22 * up, 16 * math.cos(ph), -18 * up, -10 * up)
        return legs_pose(P, f)

    def attack(t):  # crouch, leap with front legs thrown up, land
        crouch = sstep(0.0, 0.22, t) * (1 - sstep(0.22, 0.32, t))
        air = sstep(0.24, 0.32, t) * (1 - sstep(0.78, 0.92, t))
        land = sstep(0.82, 0.9, t) * (1 - sstep(0.9, 1.0, t))
        h = 4 * max(0.0, min(1.0, (t - 0.26) / 0.6)) * (1 - max(0.0, min(1.0, (t - 0.26) / 0.6)))
        z = -0.05 * crouch + 0.38 * h - 0.03 * land
        P = {'Root': {'l': (0, -0.05 * air, z), 'r': [('x', 18 * air - 8 * crouch)]},
             'Body': {'r': [('x', -6 * crouch)]}}

        def f(i, s):
            if i == 0:
                return (-25 * crouch + 60 * air, 10 * air, -30 * crouch + 25 * air, 20 * air)
            return (-25 * crouch - 25 * air, -12 * air * (i - 1.5), -20 * crouch + 25 * air, 15 * air)
        return legs_pose(P, f)

    def hurt(t):
        k = math.sin(math.pi * min(1.0, t * 1.4)) * (1 - t * 0.3)
        P = {'Root': {'l': (0, 0.04 * k, 0.03 * k)}, 'Body': {'r': [('x', -22 * k), ('y', 8 * k)]}}
        return legs_pose(P, lambda i, s: (25 * k, 8 * k, -25 * k, -10 * k))

    def death(t):
        flip = sstep(0.05, 0.45, t)
        hop = math.sin(math.pi * sstep(0.05, 0.45, t))
        curl = sstep(0.3, 0.8, t)
        tw = math.sin(t * 40) * (1 - sstep(0.6, 1.0, t)) * sstep(0.4, 0.5, t)
        P = {'Root': {'l': (0, 0, 0.16 * hop + 0.255 * flip), 'r': [('y', 180 * flip)]},
             'Body': {'r': [('x', 6 * tw)]}}
        return legs_pose(P, lambda i, s: (-35 * curl + 8 * tw, 10 * curl * (1.5 - i), -55 * curl, -40 * curl))

    clips = [('Idle', 60, idle), ('Walk', 24, walk), ('Attack', 36, attack), ('Hurt', 14, hurt), ('Death', 48, death)]
    return [make_action(arm, n, nf, fn, step=1) for n, nf, fn in clips]


def main():
    reset()
    R = build_headcrab()
    skin, claws, teeth, mouth = R['objs']
    dz = -min(coords(o)[:, 2].min() for o in R['objs'])  # claw tips exactly on the ground
    for o in R['objs']:
        o.data.transform(Matrix.Translation((0, 0, dz)))
    R['legs'] = {k: [p + V((0, 0, dz)) for p in v] for k, v in R['legs'].items()}
    bones = crab_bones(R['legs'])
    arm = build_armature('HeadcrabRig', bones)
    names = [b[0] for b in bones]
    set_weights(skin, smooth_weights(skin, crab_weights(skin, names, R['legs']), 2, 0.4), names)
    set_weights(claws, crab_weights(claws, names, R['legs'], sigma=0.002), names)
    set_weights(teeth, rigid_weights(teeth, names, 'Body'), names)
    set_weights(mouth, rigid_weights(mouth, names, 'Body'), names)
    mesh = join([skin, claws, teeth, mouth], 'Headcrab')
    log('headcrab tris', tris(mesh))
    pack_uv(mesh, 0.006, 512)
    imgs = bake_textures(mesh, 512, 'headcrab', ao_samples=24, ao_strength=0.5, margin=4)
    replace_materials(mesh, imgs, wet_names=('crab_mouth',), prefix='Headcrab')
    bind(mesh, arm)
    acts = crab_anims(arm, R['legs'])
    out = os.path.join(ASSETS, 'headcrab.glb')
    export_glb(out, [arm, mesh])
    info = inspect_glb(out)
    log(json.dumps(info, indent=None))
    if os.environ.get('PREVIEW', '1') == '1':
        setup_preview(target=(0, 0, 0.15), dist=1.25, yaw=35, pitch=22, res=(960, 720), samples=40)
        render(os.path.join(TMP, 'headcrab_still.png'))
        apply_action(arm, bpy.data.actions['Attack'], 18)
        setup_preview(target=(0, 0, 0.3), dist=1.5, yaw=60, pitch=10, res=(960, 720), samples=40)
        render(os.path.join(TMP, 'headcrab_attack.png'))
        apply_action(arm, bpy.data.actions['Walk'], 7)
        bpy.data.objects['Floor'].hide_render = True
        apply_action(arm, bpy.data.actions['Idle'], 1)
        setup_preview(target=(0, 0, 0.12), dist=1.0, yaw=-20, pitch=-35, res=(960, 720), samples=40)
        render(os.path.join(TMP, 'headcrab_under.png'))
        bpy.data.objects['Floor'].hide_render = False
    log('reimport', reimport_check(out))


if __name__ == '__main__':
    main()
