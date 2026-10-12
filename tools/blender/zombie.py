"""Half-Life-2-style headcrab zombie: emaciated body with the torso split open (ribs, organs, wet flesh),
torn dark jacket + trousers as separate thick shells, long clawed hands, headcrab clamped over the head.
Run:  python zombie.py   ->  game3d/assets/zombie.glb"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *  # noqa
import headcrab as HC

PARAMS = dict(height=1.80, limb=0.84, muscle=0.82, belly=0.86, chest_d=0.95, shoulder_w=1.0, hip_w=0.95,
              arm_len=1.08, hand_len=1.22, finger_len=1.38, finger_r=0.86, curl=1.7, arm_angle=42, voxel=0.0042, neck=1.12)

# crab clamped on the head: (psi deg from forward, tip height factor, thickness); legs are conformed to the
# head surface by ray casting, knees bulging outward
GRIP = [(30, 1.585, 1.25, -4.0), (74, 1.55, 0.95, 6.0), (114, 1.52, 0.95, 10.0), (152, 1.50, 0.9, 6.0)]
CRAB_SCALE = 1.05


def materials():
    M = {}
    # pallid, bruised, veiny dead skin; shoes below ankle; blood running down from the wound
    nb = NB('zskin')
    P = nb.obj
    x, y, z = nb.sep(P)
    mott = nb.noise(5.0, 6.0, 0.6)
    bruise = nb.mapr(nb.noise(3.0, 3.0, 0.5, 0.0, nb.vec((1, 1, 1), (7, 3, 1))), 0.58, 0.72)
    vein = nb.mapr(nb.voronoi(28.0, 'DISTANCE_TO_EDGE', vec=nb.vec((1, 1, 0.45))), 0.0, 0.025, 1.0, 0.0)
    vein = nb.math('MULTIPLY', vein, nb.mapr(nb.noise(6.0, 2.0), 0.45, 0.6))
    base = nb.ramp(mott, [(0.3, (0.16, 0.17, 0.12)), (0.55, (0.27, 0.27, 0.19)), (0.8, (0.36, 0.33, 0.24))])
    base = nb.mix(nb.math('MULTIPLY', bruise, 0.7), base, (0.28, 0.16, 0.20))
    base = nb.mix(nb.math('MULTIPLY', vein, 0.5), base, (0.20, 0.22, 0.30))
    # blood streaks below / around the open chest
    wound_d = nb.node('ShaderNodeVectorMath', {0: nb.vec((1.0, 0.6, 0.45)), 1: (0, -0.06, 1.22 * 0.45)},
                      operation='DISTANCE').outputs['Value']
    drip = nb.wave(55.0, 'X', 6.0, 2.0, vec=nb.vec((1, 1, 0.1)))
    streak = nb.math('MULTIPLY', nb.mapr(wound_d, 0.13, 0.06), nb.mapr(drip, 0.35, 0.75))
    blood = nb.math('MAXIMUM', streak, nb.mapr(wound_d, 0.085, 0.06))
    blood = nb.math('MAXIMUM', blood, nb.math('MULTIPLY', nb.mapr(nb.noise(9.0, 4.0), 0.66, 0.72), 0.8))
    base = nb.mix(blood, base, nb.ramp(nb.noise(30.0), [(0.3, (0.12, 0.01, 0.01)), (0.7, (0.30, 0.03, 0.02))]))
    dirt = nb.mapr(nb.noise(14.0, 6.0, 0.7), 0.55, 0.75)
    base = nb.mix(nb.math('MULTIPLY', dirt, 0.5), base, (0.10, 0.09, 0.07))
    # mouth hole below the crab
    md = nb.node('ShaderNodeVectorMath', {0: nb.vec((1.0, 1.0, 1.7)), 1: (0, -0.09 * 1.0286, 1.594 * 1.0286 * 1.7)},
                 operation='DISTANCE').outputs['Value']
    base = nb.mix(nb.mapr(md, 0.024, 0.012), base, (0.03, 0.006, 0.006))
    # shoes
    shoe = nb.mapr(z, 0.115, 0.105)
    leather = nb.ramp(nb.noise(40.0, 5.0), [(0.3, (0.035, 0.028, 0.022)), (0.7, (0.09, 0.07, 0.05))])
    base = nb.mix(shoe, base, leather)
    rough = nb.mixf(shoe, nb.mixf(blood, nb.mapr(mott, 0.3, 0.8, 0.5, 0.72), 0.28), 0.55)
    pores = nb.noise(160.0, 2.0)
    wrink = nb.voronoi(22.0, 'DISTANCE_TO_EDGE', vec=nb.vec((1.0, 1.0, 2.2)))
    h = nb.math('ADD', nb.math('MULTIPLY', pores, 0.25), nb.math('MULTIPLY', wrink, 0.5))
    h = nb.math('ADD', h, nb.math('MULTIPLY', vein, -0.4))
    M['zskin'] = nb.finish(base, rough, nb.bump(h, 0.22, 0.004))
    # glistening torn flesh: muscle fibres, fat, dark crevices
    nb = NB('zflesh')
    fib = nb.wave(60.0, 'Z', 8.0, 3.0)
    cells = nb.voronoi(40.0, 'DISTANCE_TO_EDGE')
    n1 = nb.noise(18.0, 6.0, 0.65)
    col = nb.ramp(n1, [(0.25, (0.10, 0.008, 0.01)), (0.5, (0.36, 0.03, 0.03)), (0.75, (0.55, 0.08, 0.06))])
    col = nb.mix(nb.math('MULTIPLY', nb.mapr(cells, 0.0, 0.03, 1.0, 0.0), 0.7), col, (0.06, 0.005, 0.008))
    fat = nb.mapr(nb.noise(35.0, 3.0), 0.72, 0.76)
    col = nb.mix(nb.math('MULTIPLY', fat, 0.35), col, (0.55, 0.42, 0.22))
    h = nb.math('ADD', nb.math('MULTIPLY', fib, 0.35), nb.math('MULTIPLY', cells, 2.5))
    M['zflesh'] = nb.finish(col, nb.mapr(n1, 0.3, 0.7, 0.12, 0.3), nb.bump(nb.math('ADD', h, n1), 0.6, 0.006),
                            coat=1.0, coat_rough=0.05)
    nb = NB('zbone')
    n1 = nb.noise(50.0, 4.0)
    col = nb.ramp(n1, [(0.3, (0.42, 0.32, 0.24)), (0.7, (0.62, 0.52, 0.40))])
    col = nb.mix(nb.mapr(nb.noise(12.0, 3.0), 0.35, 0.6), col, (0.28, 0.03, 0.025))
    M['zbone'] = nb.finish(col, 0.35, nb.bump(n1, 0.2, 0.002))
    nb = NB('zorgan')
    n1 = nb.noise(25.0, 5.0)
    col = nb.ramp(n1, [(0.3, (0.16, 0.03, 0.05)), (0.65, (0.36, 0.10, 0.11)), (0.9, (0.48, 0.24, 0.22))])
    vv = nb.mapr(nb.voronoi(30.0, 'DISTANCE_TO_EDGE'), 0.0, 0.02, 1.0, 0.0)
    col = nb.mix(nb.math('MULTIPLY', vv, 0.6), col, (0.25, 0.05, 0.12))
    M['zorgan'] = nb.finish(col, 0.18, nb.bump(n1, 0.4, 0.004), coat=1.0)
    nb = NB('zclaw')
    M['zclaw'] = nb.finish(nb.ramp(nb.noise(70.0, 3.0), [(0.3, (0.16, 0.12, 0.06)), (0.7, (0.38, 0.30, 0.16))]), 0.35,
                           nb.bump(nb.wave(200, 'Z', 3.0), 0.25, 0.002))
    # torn canvas jacket: weave, grime, blood soaked front edges
    nb = NB('zjacket')
    P = nb.obj
    x, y, z = nb.sep(P)
    weave = nb.noise(140.0, 2.0, 0.5, 0.0, nb.vec((1.0, 1.0, 0.25)))
    grime = nb.noise(6.0, 6.0, 0.65)
    col = nb.ramp(grime, [(0.3, (0.035, 0.035, 0.03)), (0.55, (0.075, 0.068, 0.05)), (0.8, (0.12, 0.10, 0.07))])
    frontedge = nb.math('MULTIPLY', nb.mapr(nb.math('ABSOLUTE', x), 0.16, 0.10), nb.mapr(y, -0.02, -0.08))
    bl = nb.math('MAXIMUM', nb.math('MULTIPLY', frontedge, nb.mapr(nb.noise(8.0, 4.0), 0.35, 0.55)),
                 nb.mapr(nb.noise(5.0, 4.0, 0.6, 0.0, nb.vec((1, 1, 1), (3, 3, 3))), 0.64, 0.7))
    col = nb.mix(bl, col, (0.09, 0.012, 0.01))
    col = nb.mix(nb.math('MULTIPLY', weave, 0.12), col, (0.0, 0.0, 0.0))
    folds = nb.noise(12.0, 4.0, 0.6, 0.0, nb.vec((1, 1, 2.5)))
    h = nb.math('ADD', nb.math('MULTIPLY', weave, 0.15), nb.math('MULTIPLY', folds, 1.0))
    M['zjacket'] = nb.finish(col, nb.mixf(bl, nb.mapr(grime, 0.3, 0.8, 0.95, 0.75), 0.45), nb.bump(h, 0.35, 0.006))
    nb = NB('zpants')
    P = nb.obj
    x, y, z = nb.sep(P)
    twill = nb.noise(110.0, 2.0, 0.5, 0.0, nb.vec((1.0, 1.0, 0.12)))
    grime = nb.noise(5.0, 6.0, 0.65)
    col = nb.ramp(grime, [(0.3, (0.025, 0.03, 0.04)), (0.6, (0.06, 0.065, 0.075)), (0.85, (0.10, 0.10, 0.10))])
    mud = nb.math('MULTIPLY', nb.mapr(z, 0.55, 0.15), nb.mapr(nb.noise(10.0, 5.0), 0.4, 0.6))
    col = nb.mix(mud, col, (0.10, 0.075, 0.045))
    col = nb.mix(nb.mapr(nb.noise(7.0, 4.0, 0.5, 0.0, nb.vec((1, 1, 1), (9, 1, 2))), 0.66, 0.72), col, (0.08, 0.01, 0.01))
    h = nb.math('ADD', nb.math('MULTIPLY', twill, 0.2), nb.noise(14.0, 4.0, 0.6, 0.0, nb.vec((1, 1, 3))))
    M['zpants'] = nb.finish(col, 0.9, nb.bump(h, 0.35, 0.006))
    M.update(HC.materials())
    return M


def main():
    reset()
    M = materials()
    R = humanoid(PARAMS)
    body, J, segs, s = R['body'], R['J'], R['segs'], R['s']
    body.data.materials.append(M['zskin'])
    body.data.materials.append(M['zflesh'])
    log('body hi', tris(body))
    c0 = coords(body)
    region, tpar, _ = classify(c0, segs)

    # ---------------------------------------------------------------- clothes (from the pristine surface)
    def cloth_wr(amp, f):
        def fn(c, n):
            a = noise3(c * np.array((1, 1, 2.6)), f, 11.0, 2)
            b = noise3(c, f * 2.3, 4.0)
            return amp * (0.7 * a + 0.3 * b) + amp * 0.5
        return fn

    def jacket_keep(c):
        reg, t, _ = classify(c, segs)
        nz = noise3(c, 9.0, 2.0, 2)
        keep = np.isin(reg, ['torso', 'clav.L', 'clav.R', 'uarm.L', 'uarm.R'])
        keep |= np.isin(reg, ['farm.L', 'farm.R']) & (t < 0.62 + 0.18 * nz)
        keep |= (reg == 'neck') & (c[:, 2] < 1.475 * s + 0.01 * nz) & (c[:, 1] > -0.01)
        keep &= c[:, 2] > (0.80 + 0.03 * nz) * s
        openf = (np.abs(c[:, 0]) < (0.11 + 0.035 * sstep(1.2 * s, 0.9 * s, c[:, 2]) + 0.012 * nz) * s) & (c[:, 1] < 0.0)
        keep &= ~(openf & (c[:, 2] < 1.47 * s))
        holes = noise3(c, 6.5, 7.0, 2) > 0.60
        keep &= ~(holes & (c[:, 1] > -0.02))  # tears in back / sleeves
        keep &= ~((noise3(c, 11.0, 3.0, 2) > 0.62))
        return keep

    jacket = shell(body, 'jacket', jacket_keep, 0.016, cloth_wr(0.007, 7.0), thick=0.006, min_island=80)
    jacket.data.materials.clear()
    jacket.data.materials.append(M['zjacket'])

    def pants_keep(c):
        reg, t, _ = classify(c, segs)
        nz = noise3(c, 10.0, 5.0, 2)
        keep = (reg == 'torso') & (c[:, 2] < 1.0 * s)
        keep |= np.isin(reg, ['thigh.L', 'thigh.R'])
        keep |= np.isin(reg, ['shin.L', 'shin.R']) & (t < 0.86 + 0.06 * nz)
        keep &= c[:, 2] > 0.11 * s
        keep &= ~(noise3(c, 7.5, 13.0, 2) > 0.55)
        return keep

    pants = shell(body, 'pants', pants_keep, 0.010, cloth_wr(0.005, 8.0), thick=0.005, min_island=80)
    pants.data.materials.clear()
    pants.data.materials.append(M['zpants'])

    # gaping mouth below the crab (sculpt)
    displace(body, lambda c, n: -0.013 * s * gauss(c * np.array((1.0, 1.0, 1.6)), (0, -0.088 * s, 1.594 * s * 1.6), 0.015 * s))

    # ---------------------------------------------------------------- heat-weight proxy (closed body)
    proxy = copy_obj(body, 'proxy')
    decimate(proxy, 9000)

    # ---------------------------------------------------------------- split-open torso (sculpted cavity)
    zc = 1.22 * s
    nzw = noise3(c0, 14.0, 21.0, 2)
    e = (c0[:, 0] / (0.085 * s)) ** 2 + ((c0[:, 2] - zc) / (0.165 * s)) ** 2 + 0.35 * nzw
    front = (c0[:, 1] < -0.02) & (region == 'torso')
    wound = front & (e < 1.0)
    depth = 0.072 * s * np.clip(1 - e, 0, 1) ** 0.55 + 0.010 * noise3(c0, 30.0, 5.0, 2) * (e < 1)
    c1 = c0.copy()
    c1[:, 1] += np.where(wound, depth, 0.0)
    set_coords(body, c1)
    lap_smooth(body, wound.astype(np.float32) * 0.5, 2)
    fm = face_mask_from_verts(body, wound, 'all')
    mi = fm.astype(np.int32)
    body.data.polygons.foreach_set('material_index', mi)

    # torn lip of skin/flesh along the wound boundary
    me = body.data
    ev = np.empty(len(me.edges) * 2, np.int32)
    me.edges.foreach_get('vertices', ev)
    ev = ev.reshape(-1, 2)
    bnd = np.unique(ev[wound[ev[:, 0]] != wound[ev[:, 1]]].ravel())
    bnd = bnd[wound[bnd]]
    Rr = np.random.RandomState(5)
    rb = bmesh.new()
    taken = []
    for i in Rr.permutation(bnd):
        p = V(c1[i])
        if any((p - q).length < 0.011 for q in taken):
            continue
        taken.append(p)
        r = Rr.uniform(0.006, 0.011)
        bm_ellipsoid(rb, p + V((0, -0.002, 0)), (r * 1.2, r * 0.8, r * 1.3), None, 10, 6)
    rim = obj_from_bm('rim', rb, M['zflesh'])
    remesh(rim, 0.003, 1, 0.5)

    # ribs: stay at the original rib-cage surface, broken and splayed at the front
    tree = BVHTree.FromPolygons([V(p) for p in c0], [p.vertices[:] for p in me.polygons])

    def surf_y(x, z):
        hit = tree.ray_cast(V((x, -0.5, z)), V((0, 1, 0)), 1.0)
        return hit[0].y if hit[0] is not None else -0.1

    ribs_bm = bmesh.new()
    for k in range(4):
        zr = (1.345 - k * 0.058) * s
        for sx in (1, -1):
            pts, rad = [], []
            xe = Rr.uniform(0.025, 0.05)
            for u in np.linspace(0, 1, 8):
                xx = sx * (0.13 - (0.13 - xe) * u) * s
                zz = zr - 0.04 * u * u * s
                yy = surf_y(xx, zz) + 0.010 * (1 - u) + 0.004 - 0.006 * u ** 4
                pts.append(V((xx, yy, zz)))
                rad.append((0.0088 * s, 0.0058 * s) if u < 0.92 else (0.005, 0.0035))
            bm_sweep(ribs_bm, pts, rad, seg=8, nsub=3, up=(0, 0, 1))
    ribs = obj_from_bm('ribs', ribs_bm, M['zbone'])
    remesh(ribs, 0.0025, 1, 0.4)

    # organs: intestine coils in the lower cavity + a loop sagging out, stomach, lung edges
    ob = bmesh.new()
    for row, (zz, xs) in enumerate(((1.10, (-0.05, -0.015, 0.02, 0.055)), (1.145, (0.05, 0.015, -0.02, -0.05)))):
        pts = []
        for j, xx in enumerate(xs):
            yy = surf_y(xx * s, zz * s) + 0.045 * s
            pts.append(V((xx * s, yy, (zz + 0.012 * math.sin(j * 2.1)) * s)))
        bm_sweep(ob, pts, [0.017 * s] * len(pts), seg=12, nsub=6, rnoise=0.12, seed=row)
    y0 = surf_y(0, 1.08 * s)
    bm_sweep(ob, [V((-0.03 * s, y0 + 0.03, 1.10 * s)), V((-0.02 * s, y0 - 0.025, 1.05 * s)), V((0.01 * s, y0 - 0.04, 1.0 * s)),
                  V((0.04 * s, y0 - 0.02, 1.03 * s)), V((0.03 * s, y0 + 0.03, 1.08 * s))], [0.016 * s] * 5, seg=12, nsub=6,
             rnoise=0.1, seed=7)
    bm_ellipsoid(ob, (0.035 * s, surf_y(0.035 * s, 1.21 * s) + 0.05, 1.21 * s), (0.04 * s, 0.03 * s, 0.035 * s))
    bm_ellipsoid(ob, (-0.04 * s, surf_y(-0.04 * s, 1.30 * s) + 0.055, 1.30 * s), (0.045 * s, 0.03 * s, 0.06 * s))
    bm_ellipsoid(ob, (0.045 * s, surf_y(0.045 * s, 1.31 * s) + 0.055, 1.31 * s), (0.045 * s, 0.03 * s, 0.06 * s))
    organs = obj_from_bm('organs', ob, M['zorgan'])
    remesh(organs, 0.003, 2, 0.5)
    displace(organs, lambda c, n: 0.006 * noise3(c, 35.0, 3.0, 2) - 0.003)

    # ---------------------------------------------------------------- claws
    cb = bmesh.new()
    for (tip, d, n, r) in R['tips']:
        p1 = tip + d * 0.018
        p2 = p1 + (d - n * 0.9).normalized() * 0.016
        bm_sweep(cb, [tip - d * 0.006, tip, p1, p2], [r * 0.95, r * 0.9, r * 0.6, 0.0], seg=8, nsub=3)
    claws = obj_from_bm('claws', cb, M['zclaw'])

    # ---------------------------------------------------------------- headcrab on the head
    cm = Matrix.Translation((0, 0.012, 1.70 - 0.135 * CRAB_SCALE)) @ Matrix.Rotation(math.radians(-6), 4, 'X') @ \
        Matrix.Diagonal((CRAB_SCALE,) * 3 + (1.0,))
    cmi = cm.inverted()
    head_tree = BVHTree.FromPolygons([V(p) for p in c0], [p.vertices[:] for p in me.polygons])

    def head_pt(psi, z, off):
        dv = V((math.sin(psi), -math.cos(psi), 0))
        o = V((0, 0.012, z))
        hit = head_tree.ray_cast(o + dv * 0.4, -dv, 0.5)
        r = (hit[0] - o).length if hit[0] is not None else 0.07
        return o + dv * (r + off)

    legs = []
    for psi_d, ztip, th, drift in GRIP:
        L = dict(r=th, pts={})
        for sx in (1, -1):
            z0, z3 = 1.715, ztip
            zs = [z0, z0 - 0.28 * (z0 - z3), z0 - 0.68 * (z0 - z3), z3]
            offs = [0.012, 0.022 * th, 0.016 * th, 0.006]
            pts = []
            for k in range(4):
                psi = math.radians(psi_d + drift * k / 3.0) * sx
                pts.append(cmi @ head_pt(psi, zs[k], offs[k]))
            L['pts'][sx] = pts
        legs.append(L)
    crab = HC.build_headcrab(legs, M, voxel=0.0028, budget=(6600, 700, 250, 120), name='zcrab')
    for o in crab['objs']:
        o.data.transform(cm)
    crab_objs = crab['objs']

    # ---------------------------------------------------------------- hide body under clothes / crab, uv
    protect = (wound | np.isin(region, ['hand.L', 'hand.R']))
    nk = remove_hidden(body, [jacket, pants], 0.06, 4, protect=None)
    log('removed hidden faces', nk)
    head_hidden = coords(body)[:, 2] > 1.70 * s
    delete_faces(body, face_mask_from_verts(body, head_hidden, 'all'))
    remove_small_islands(body, 50)
    for o in [body, jacket, pants, rim, ribs, organs, claws]:
        smart_uv(o)
    set_lp(body)
    for o in [jacket, pants, rim, ribs, organs, claws]:
        set_lp(o)
    log('bbox pre-dec', {o.name: (coords(o).min(0).round(2).tolist(), coords(o).max(0).round(2).tolist()) for o in [body, jacket, pants, rim, ribs, organs, claws]})
    budgets = {body: 13500, jacket: 7000, pants: 4600, rim: 1300, ribs: 1300, organs: 1700, claws: 500}
    for o, b in budgets.items():
        decimate(o, b)
    parts = [body, jacket, pants, rim, ribs, organs, claws] + crab_objs
    log('tris per part', {o.name: tris(o) for o in parts})
    log('bbox per part', {o.name: (coords(o).min(0).round(2).tolist(), coords(o).max(0).round(2).tolist()) for o in parts})

    # ---------------------------------------------------------------- rig + skin
    bones = humanoid_bones(J)
    arm = build_armature('ZombieRig', bones)
    names = [b[0] for b in bones]
    heat_weights(proxy, arm)
    Wp = weight_matrix(proxy, names)
    Wp, nbad = fill_missing_weights(proxy, Wp, arm, names)
    log('proxy verts without heat weight', nbad)
    for o in [body, jacket, pants, rim, ribs, organs, claws]:
        W = transfer_weights(proxy, Wp, o)
        if o in (jacket, pants):
            W = smooth_weights(o, W, 3, 0.5)
        set_weights(o, W, names)
    for o in crab_objs:
        set_weights(o, rigid_weights(o, names, 'Head'), names)
    delete(proxy)
    mesh = join(parts, 'Zombie')
    for m in list(mesh.modifiers):
        mesh.modifiers.remove(m)
    mesh.parent = None
    log('zombie tris', tris(mesh))
    pack_uv(mesh, 0.003)
    imgs = bake_textures(mesh, 1024, 'zombie', ao_samples=24, ao_strength=0.6, margin=6)
    replace_materials(mesh, imgs, wet_names=('zflesh', 'zorgan', 'crab_mouth'), prefix='Zombie')
    bind(mesh, arm)
    humanoid_anims(arm, zombie=True)
    out = os.path.join(ASSETS, 'zombie.glb')
    export_glb(out, [arm, mesh])
    info = inspect_glb(out)
    log(json.dumps(info))
    if os.environ.get('PREVIEW', '1') == '1':
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(TMP, 'zombie.blend'))
        setup_preview(target=(0, 0, 0.95), dist=3.3, yaw=28, pitch=6, res=(720, 960), samples=40)
        render(os.path.join(TMP, 'zombie_still.png'))
        setup_preview(target=(0, -0.05, 1.45), dist=1.25, yaw=12, pitch=4, res=(960, 720), samples=40)
        render(os.path.join(TMP, 'zombie_close.png'))
        apply_action(arm, bpy.data.actions['Walk'], 12)
        setup_preview(target=(0, 0, 0.9), dist=3.4, yaw=-50, pitch=6, res=(720, 960), samples=40)
        render(os.path.join(TMP, 'zombie_walk.png'))
    log('reimport', reimport_check(out))


if __name__ == '__main__':
    main()
