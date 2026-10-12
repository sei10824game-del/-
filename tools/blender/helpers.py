"""Shared helpers for building skinned, animated glTF characters headlessly in Blender 5.x.

Conventions (Blender space): Z up, character faces -Y, character's left side is +X.
glTF export with export_yup=True maps this to three.js: Y up, facing +Z, feet at y=0.
"""
import bpy, bmesh, math, os, json, struct, time
import numpy as np
from mathutils import Vector, Matrix, Quaternion, noise as mnoise
from mathutils.bvhtree import BVHTree
from mathutils.interpolate import poly_3d_calc

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.abspath(os.path.join(HERE, '..', '..', 'game3d', 'assets'))
TMP = os.environ.get('BLD_TMP', '/tmp/blender_build')
os.makedirs(TMP, exist_ok=True)
os.makedirs(ASSETS, exist_ok=True)

V = Vector
T0 = time.time()


def log(*a):
    print('[%6.1fs]' % (time.time() - T0), *a, flush=True)


# ----------------------------------------------------------------------------- scene
def reset(fps=30):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.render.fps = fps
    w = bpy.data.worlds.new('World')
    sc.world = w
    w.light_settings.distance = 0.25
    w.color = (0.05, 0.05, 0.05)
    return sc


def link(o):
    bpy.context.scene.collection.objects.link(o)
    return o


def obj_from_bm(name, bm, mat=None, smooth=True):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me))
    if mat is not None:
        me.materials.append(mat)
    if smooth:
        me.shade_smooth() if hasattr(me, 'shade_smooth') else None
        for p in me.polygons:
            p.use_smooth = True
    return o


def set_smooth(o, flag=True):
    for p in o.data.polygons:
        p.use_smooth = flag


def apply_mods(o):
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
    old = o.data
    o.modifiers.clear()
    o.data = me
    if old.users == 0:
        bpy.data.meshes.remove(old)
    return o


def tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)


def coords(o):
    a = np.empty(len(o.data.vertices) * 3, np.float32)
    o.data.vertices.foreach_get('co', a)
    return a.reshape(-1, 3)


def set_coords(o, c):
    o.data.vertices.foreach_set('co', np.ascontiguousarray(c, np.float32).ravel())
    o.data.update()


def vnormals(o):
    me = o.data
    a = np.empty(len(me.vertices) * 3, np.float32)
    me.vertex_normals.foreach_get('vector', a)
    return a.reshape(-1, 3)


def join(objs, name=None):
    objs = [o for o in objs if o is not None]
    act = objs[0]
    with bpy.context.temp_override(active_object=act, object=act, selected_objects=objs,
                                   selected_editable_objects=objs):
        bpy.ops.object.join()
    if name:
        act.name = name
        act.data.name = name
    return act


def delete(o):
    me = o.data if o.type == 'MESH' else None
    bpy.data.objects.remove(o, do_unlink=True)
    if me is not None and me.users == 0:
        bpy.data.meshes.remove(me)


def copy_obj(o, name):
    n = o.copy()
    n.data = o.data.copy()
    n.name = name
    link(n)
    return n


# ----------------------------------------------------------------------------- geometry builders
def spline(pts, n=6):
    """Catmull-Rom through pts (list of Vector) with n samples per segment."""
    pts = [V(p) for p in pts]
    if len(pts) < 3:
        out = []
        for i in range(len(pts) - 1):
            for k in range(n):
                out.append(pts[i].lerp(pts[i + 1], k / n))
        out.append(pts[-1])
        return out
    P = [pts[0] * 2 - pts[1]] + pts + [pts[-1] * 2 - pts[-2]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(P[-2])
    return out


def interp_list(vals, m):
    """resample list of floats/tuples to m entries linearly"""
    vals = list(vals)
    out = []
    for i in range(m):
        x = i / (m - 1) * (len(vals) - 1)
        a = int(math.floor(x))
        b = min(a + 1, len(vals) - 1)
        f = x - a
        va, vb = vals[a], vals[b]
        if isinstance(va, (tuple, list)):
            out.append(tuple(va[k] * (1 - f) + vb[k] * f for k in range(len(va))))
        else:
            out.append(va * (1 - f) + vb * f)
    return out


def bm_sweep(bm, pts, radii, seg=12, cap=True, up=None, twist=0.0, nsub=4, rnoise=0.0, seed=0):
    """Tube along a smooth curve. radii: per control point, float or (rx, ry). Ends with radius 0 become points."""
    P = spline(pts, nsub)
    R = interp_list(radii, len(P))
    R = [(r, r) if not isinstance(r, (tuple, list)) else r for r in R]
    tangents = []
    for i in range(len(P)):
        a = P[max(i - 1, 0)]
        b = P[min(i + 1, len(P) - 1)]
        tangents.append((b - a).normalized())
    t0 = tangents[0]
    ref = V(up) if up is not None else (V((0, 0, 1)) if abs(t0.z) < 0.9 else V((1, 0, 0)))
    n = (ref - t0 * ref.dot(t0)).normalized()
    rings = []
    for i, p in enumerate(P):
        t = tangents[i]
        n = (n - t * n.dot(t))
        if n.length < 1e-6:
            n = t.orthogonal()
        n.normalize()
        b = t.cross(n)
        rx, ry = R[i]
        if rx < 1e-5 and ry < 1e-5:
            rings.append([bm.verts.new(p)])
            continue
        ring = []
        for k in range(seg):
            a = 2 * math.pi * k / seg + twist * i / len(P)
            off = n * (math.cos(a) * rx) + b * (math.sin(a) * ry)
            q = p + off
            if rnoise:
                q = q + off * (rnoise * mnoise.noise(q * 40 + V((seed, seed * 2, 0))))
            ring.append(bm.verts.new(q))
        rings.append(ring)
    faces = []
    for i in range(len(rings) - 1):
        A, B = rings[i], rings[i + 1]
        if len(A) == 1 and len(B) == 1:
            continue
        if len(A) == 1:
            for k in range(seg):
                faces.append(bm.faces.new((A[0], B[k], B[(k + 1) % seg])))
        elif len(B) == 1:
            for k in range(seg):
                faces.append(bm.faces.new((A[k], B[0], A[(k + 1) % seg])))
        else:
            for k in range(seg):
                faces.append(bm.faces.new((A[k], B[k], B[(k + 1) % seg], A[(k + 1) % seg])))
    if cap:
        for ring, rev in ((rings[0], True), (rings[-1], False)):
            if len(ring) > 2:
                c = bm.verts.new(sum((v.co for v in ring), V()) / len(ring))
                for k in range(seg):
                    vs = (c, ring[(k + 1) % seg], ring[k]) if rev else (c, ring[k], ring[(k + 1) % seg])
                    faces.append(bm.faces.new(vs))
    return faces


def bm_ellipsoid(bm, c, r, rot=None, u=24, v=14):
    M = Matrix.Translation(V(c))
    if rot is not None:
        M = M @ (rot.to_matrix().to_4x4() if isinstance(rot, Quaternion) else rot.to_4x4())
    M = M @ Matrix.Diagonal((r[0], r[1], r[2], 1.0))
    res = bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=1.0, matrix=M)
    return res['verts']


def look_rot(d, up=(0, 0, 1)):
    """Quaternion rotating +Z to direction d."""
    return V((0, 0, 1)).rotation_difference(V(d).normalized())


def skin_object(name, verts, edges, radii, root=0, subdiv=2):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], edges, [])
    o = link(bpy.data.objects.new(name, me))
    m = o.modifiers.new('skin', 'SKIN')
    m.use_smooth_shade = True
    m.branch_smoothing = 0.6
    sv = me.skin_vertices[0].data
    for i, r in enumerate(radii):
        sv[i].radius = r if isinstance(r, (tuple, list)) else (r, r)
    sv[root].use_root = True
    s = o.modifiers.new('sub', 'SUBSURF')
    s.levels = subdiv
    s.render_levels = subdiv
    apply_mods(o)
    return o


def remesh(o, voxel, smooth_iter=0, smooth_fac=0.5):
    m = o.modifiers.new('rm', 'REMESH')
    m.mode = 'VOXEL'
    m.voxel_size = voxel
    m.adaptivity = 0.0
    m.use_smooth_shade = True
    if smooth_iter:
        s = o.modifiers.new('sm', 'LAPLACIANSMOOTH')
        s.iterations = smooth_iter
        s.lambda_factor = smooth_fac
        s.use_volume_preserve = True
        s.use_normalized = True
    apply_mods(o)
    set_smooth(o)
    return o


def smooth(o, iters=3, fac=0.5, vgroup=None):
    s = o.modifiers.new('sm', 'SMOOTH')
    s.iterations = iters
    s.factor = fac
    if vgroup:
        s.vertex_group = vgroup
    apply_mods(o)
    return o


def decimate(o, target):
    n = tris(o)
    if n > target:
        m = o.modifiers.new('dec', 'DECIMATE')
        m.decimate_type = 'COLLAPSE'
        m.ratio = target / n
        m.use_collapse_triangulate = True
        apply_mods(o)
    set_smooth(o)
    return o


def solidify(o, thick, offset=-1.0):
    m = o.modifiers.new('so', 'SOLIDIFY')
    m.thickness = thick
    m.offset = offset
    m.use_rim = True
    m.use_even_offset = False
    m.use_quality_normals = False
    m.use_flip_normals = False
    apply_mods(o)
    return o


def lap_smooth(o, w, iters=2):
    """masked laplacian smooth; w per-vertex factor 0..1"""
    me = o.data
    e = np.empty(len(me.edges) * 2, np.int32)
    me.edges.foreach_get('vertices', e)
    e = e.reshape(-1, 2)
    c = coords(o)
    cnt = np.zeros(len(c), np.float32)
    np.add.at(cnt, e[:, 0], 1)
    np.add.at(cnt, e[:, 1], 1)
    cnt[cnt == 0] = 1
    w = np.asarray(w, np.float32)[:, None]
    for _ in range(iters):
        acc = np.zeros_like(c)
        np.add.at(acc, e[:, 0], c[e[:, 1]])
        np.add.at(acc, e[:, 1], c[e[:, 0]])
        c = c * (1 - w) + w * acc / cnt[:, None]
    set_coords(o, c)
    return o


def set_lp(o, c=None, scale=1.0):
    """store pattern coordinates as point attribute 'lp' (defaults to current rest coords)"""
    me = o.data
    c = coords(o) if c is None else c
    if 'lp' in me.attributes:
        me.attributes.remove(me.attributes['lp'])
    at = me.attributes.new('lp', 'FLOAT_VECTOR', 'POINT')
    at.data.foreach_set('vector', np.ascontiguousarray(c * scale, np.float32).ravel())
    return o


def displace(o, fn):
    """sculpt-like: fn(co[N,3], n[N,3]) -> offset along normal (N,) or vector offsets (N,3)."""
    c = coords(o)
    n = vnormals(o)
    d = fn(c, n)
    if d.ndim == 1:
        c = c + n * d[:, None]
    else:
        c = c + d
    set_coords(o, c)
    return o


def noise3(c, scale=1.0, seed=0.0, octaves=1):
    """mathutils perlin noise for an array of points -> (N,) in ~[-1,1]"""
    off = V((seed * 13.1, seed * 7.7, seed * 3.3))
    out = np.empty(len(c), np.float32)
    if octaves == 1:
        for i, p in enumerate(c):
            out[i] = mnoise.noise(V(p) * scale + off)
    else:
        for i, p in enumerate(c):
            out[i] = mnoise.fractal(V(p) * scale + off, 0.5, 2.0, octaves)
    return out


def gauss(c, center, radius):
    d2 = ((c - np.array(center)) ** 2).sum(1)
    return np.exp(-d2 / (radius * radius))


def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def seg_dist(c, a, b):
    a = np.array(a, np.float32)
    b = np.array(b, np.float32)
    ab = b - a
    t = np.clip(((c - a) @ ab) / max(ab @ ab, 1e-12), 0, 1)
    p = a + t[:, None] * ab
    return np.linalg.norm(c - p, axis=1), t


def classify(c, segs):
    """segs: dict name -> (a, b). returns (names array index, t, dist) of nearest segment"""
    names = list(segs)
    D = []
    Ts = []
    for nm in names:
        d, t = seg_dist(c, *segs[nm])
        D.append(d)
        Ts.append(t)
    D = np.stack(D, 1)
    Ts = np.stack(Ts, 1)
    idx = D.argmin(1)
    r = np.arange(len(c))
    return np.array(names)[idx], Ts[r, idx], D[r, idx]


def delete_faces(o, face_mask):
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bm.faces.ensure_lookup_table()
    kill = [f for f in bm.faces if face_mask[f.index]]
    bmesh.ops.delete(bm, geom=kill, context='FACES')
    bm.to_mesh(o.data)
    bm.free()
    o.data.update()
    return o


def face_mask_from_verts(o, vmask, mode='all'):
    me = o.data
    loops = np.empty(len(me.loops), np.int32)
    me.loops.foreach_get('vertex_index', loops)
    starts = np.empty(len(me.polygons), np.int32)
    me.polygons.foreach_get('loop_start', starts)
    tot = np.empty(len(me.polygons), np.int32)
    me.polygons.foreach_get('loop_total', tot)
    vals = vmask[loops].astype(np.int32)
    s = np.add.reduceat(vals, starts)
    return (s == tot) if mode == 'all' else (s > 0)


def remove_small_islands(o, min_faces=30):
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bm.faces.ensure_lookup_table()
    seen = set()
    kill = []
    for f in bm.faces:
        if f.index in seen:
            continue
        stack = [f]
        comp = []
        seen.add(f.index)
        while stack:
            g = stack.pop()
            comp.append(g)
            for e in g.edges:
                for h in e.link_faces:
                    if h.index not in seen:
                        seen.add(h.index)
                        stack.append(h)
        if len(comp) < min_faces:
            kill.extend(comp)
    if kill:
        bmesh.ops.delete(bm, geom=kill, context='FACES')
    bm.to_mesh(o.data)
    bm.free()
    return o


def grow_mask(o, vmask, rings):
    me = o.data
    e = np.empty(len(me.edges) * 2, np.int32)
    me.edges.foreach_get('vertices', e)
    e = e.reshape(-1, 2)
    m = vmask.copy()
    for _ in range(rings):
        a = m[e[:, 0]] | m[e[:, 1]]
        m2 = m.copy()
        m2[e[a, 0]] = True
        m2[e[a, 1]] = True
        m = m2
    return m


def bvh_of(objs):
    bm = bmesh.new()
    for o in objs:
        tmp = o.data.copy()
        tmp.transform(o.matrix_world)
        bm.from_mesh(tmp)
        bpy.data.meshes.remove(tmp)
    t = BVHTree.FromBMesh(bm)
    bm.free()
    return t


def remove_hidden(body, covers, maxdist=0.07, keep_rings=4, protect=None):
    """delete body faces whose vertices all lie under a cover shell (ray along normal hits it)."""
    tree = bvh_of(covers)
    c = coords(body)
    n = vnormals(body)
    hidden = np.zeros(len(c), bool)
    for i in range(len(c)):
        p = V(c[i]) + V(n[i]) * 0.002
        hit = tree.ray_cast(p, V(n[i]), maxdist)
        hidden[i] = hit[0] is not None
    if protect is not None:
        hidden &= ~protect
    vis = grow_mask(body, ~hidden, keep_rings)
    fm = face_mask_from_verts(body, ~vis, 'all')
    delete_faces(body, fm)
    return fm.sum()


def shell(src, name, keep, offset, wrinkle=None, thick=0.004, min_island=60):
    """Clothing shell from body surface: keep(c) -> vertex bool mask. offset along normal + optional wrinkle fn."""
    o = copy_obj(src, name)
    c = coords(o)
    km = keep(c)
    delete_faces(o, face_mask_from_verts(o, ~km, 'any'))
    remove_small_islands(o, min_island)
    lap_smooth(o, np.full(len(o.data.vertices), 0.5, np.float32), 4)
    c = coords(o)
    n = vnormals(o)
    d = np.full(len(c), offset, np.float32)
    if wrinkle is not None:
        d = d + wrinkle(c, n)
    set_coords(o, c + n * d[:, None])
    smooth(o, 2, 0.4)
    if thick:
        solidify(o, thick, -1.0)
    set_smooth(o)
    return o


# ----------------------------------------------------------------------------- materials
class NB:
    """tiny node-builder for procedural principled materials"""

    def __init__(self, name):
        self.mat = bpy.data.materials.new(name)
        self.nt = self.mat.node_tree
        self.nt.nodes.clear()
        self.out = self.nt.nodes.new('ShaderNodeOutputMaterial')
        self.bsdf = self.nt.nodes.new('ShaderNodeBsdfPrincipled')
        self.nt.links.new(self.bsdf.outputs[0], self.out.inputs[0])
        # all procedural patterns are driven by the per-vertex 'lp' (local/rest position) attribute so
        # they stay stable when parts are moved/joined (e.g. headcrab placed on the zombie head)
        at = self.nt.nodes.new('ShaderNodeAttribute')
        at.attribute_name = 'lp'
        at.attribute_type = 'GEOMETRY'
        self.obj = at.outputs['Vector']

    def _set(self, sock, v):
        if isinstance(v, bpy.types.NodeSocket):
            self.nt.links.new(v, sock)
        else:
            if sock.type == 'RGBA' and not isinstance(v, (tuple, list)):
                v = (v, v, v, 1.0)
            if sock.type == 'RGBA' and len(v) == 3:
                v = tuple(v) + (1.0,)
            if sock.type == 'VECTOR' and not isinstance(v, (tuple, list)):
                v = (v, v, v)
            sock.default_value = v

    def node(self, t, ins=None, **props):
        nd = self.nt.nodes.new(t)
        for k, v in props.items():
            setattr(nd, k, v)
        for k, v in (ins or {}).items():
            self._set(nd.inputs[k], v)
        return nd

    def vec(self, scale=(1, 1, 1), offset=(0, 0, 0), src=None):
        src = src or self.obj
        m = self.node('ShaderNodeVectorMath', {0: src, 1: tuple(scale)}, operation='MULTIPLY')
        a = self.node('ShaderNodeVectorMath', {0: m.outputs[0], 1: tuple(offset)}, operation='ADD')
        return a.outputs[0]

    def noise(self, scale, detail=4.0, rough=0.55, dist=0.0, vec=None, lac=2.0):
        nd = self.node('ShaderNodeTexNoise', {'Vector': vec or self.obj, 'Scale': scale, 'Detail': detail,
                                              'Roughness': rough, 'Distortion': dist, 'Lacunarity': lac})
        return nd.outputs['Fac']

    def voronoi(self, scale, feature='F1', vec=None, rand=1.0, out='Distance'):
        nd = self.node('ShaderNodeTexVoronoi', {'Vector': vec or self.obj, 'Scale': scale, 'Randomness': rand},
                       feature=feature)
        return nd.outputs[out]

    def wave(self, scale, direction='X', dist=0.0, detail=0.0, vec=None, profile='SIN', wtype='BANDS'):
        nd = self.node('ShaderNodeTexWave', {'Vector': vec or self.obj, 'Scale': scale, 'Distortion': dist,
                                             'Detail': detail}, wave_type=wtype, bands_direction=direction,
                       rings_direction='X' if direction not in ('X', 'Y', 'Z', 'SPHERICAL') else direction,
                       wave_profile=profile)
        return nd.outputs['Fac']

    def math(self, op, a, b=0.0, clamp=False):
        nd = self.node('ShaderNodeMath', {0: a, 1: b}, operation=op, use_clamp=clamp)
        return nd.outputs[0]

    def ramp(self, fac, stops, interp='LINEAR'):
        nd = self.nt.nodes.new('ShaderNodeValToRGB')
        self._set(nd.inputs[0], fac)
        cr = nd.color_ramp
        cr.interpolation = interp
        while len(cr.elements) > len(stops):
            cr.elements.remove(cr.elements[-1])
        while len(cr.elements) < len(stops):
            cr.elements.new(0.5)
        for el, (p, col) in zip(cr.elements, stops):
            el.position = p
            el.color = tuple(col) + ((1.0,) if len(col) == 3 else ())
        return nd.outputs[0]

    def mapr(self, fac, a, b, c=0.0, d=1.0, clamp=True):
        nd = self.node('ShaderNodeMapRange', {'Value': fac, 'From Min': a, 'From Max': b, 'To Min': c, 'To Max': d},
                       clamp=clamp)
        return nd.outputs[0]

    def mix(self, fac, a, b, blend='MIX'):
        nd = self.node('ShaderNodeMix', None, data_type='RGBA', blend_type=blend)
        self._set(nd.inputs[0], fac)
        self._set(nd.inputs[6], a)
        self._set(nd.inputs[7], b)
        return nd.outputs[2]

    def mixf(self, fac, a, b):
        nd = self.node('ShaderNodeMix', None, data_type='FLOAT')
        self._set(nd.inputs[0], fac)
        self._set(nd.inputs[2], a)
        self._set(nd.inputs[3], b)
        return nd.outputs[0]

    def sep(self, vec):
        nd = self.node('ShaderNodeSeparateXYZ', {0: vec})
        return nd.outputs

    def attr(self, name):
        nd = self.node('ShaderNodeAttribute', None, attribute_name=name)
        return nd

    def bump(self, height, strength=0.5, dist=0.01, normal=None):
        ins = {'Height': height, 'Strength': strength, 'Distance': dist}
        if normal is not None:
            ins['Normal'] = normal
        nd = self.node('ShaderNodeBump', ins)
        return nd.outputs['Normal']

    def finish(self, base, rough, normal=None, metal=0.0, coat=0.0, coat_rough=0.1):
        self._set(self.bsdf.inputs['Base Color'], base)
        self._set(self.bsdf.inputs['Roughness'], rough)
        self._set(self.bsdf.inputs['Metallic'], metal)
        if normal is not None:
            self._set(self.bsdf.inputs['Normal'], normal)
        self.bsdf.inputs['Coat Weight'].default_value = coat
        self.bsdf.inputs['Coat Roughness'].default_value = coat_rough
        return self.mat


# ----------------------------------------------------------------------------- UV + bake
def _edit(o):
    bpy.context.view_layer.objects.active = o
    for ob in bpy.context.scene.objects:
        ob.select_set(ob == o)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')


def smart_uv(o, angle=72.0):
    """unwrap a (smooth, high-res) part; islands are packed later on the joined mesh"""
    _edit(o)
    bpy.ops.uv.smart_project(angle_limit=math.radians(angle), island_margin=0.002, area_weight=0.0,
                             correct_aspect=True, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    return o


def uv_islands(bm, uvl):
    parent = list(range(len(bm.faces)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i
    for e in bm.edges:
        lf = e.link_faces
        if len(lf) != 2:
            continue
        f1, f2 = lf
        ok = True
        for v in e.verts:
            u1 = [l[uvl].uv for l in f1.loops if l.vert == v][0]
            u2 = [l[uvl].uv for l in f2.loops if l.vert == v][0]
            if (u1 - u2).length > 1e-6:
                ok = False
                break
        if ok:
            a, b = find(f1.index), find(f2.index)
            if a != b:
                parent[a] = b
    isl = {}
    for f in bm.faces:
        isl.setdefault(find(f.index), []).append(f)
    return list(isl.values())


def enlarge_tiny_islands(o, size=1024, min_px=20.0):
    """sub-pixel UV islands never get baked (black specks): scale tiny islands up around their centre."""
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bm.faces.ensure_lookup_table()
    uvl = bm.loops.layers.uv.active

    def uvarea(f):
        uv = [l[uvl].uv for l in f.loops]
        a = 0.0
        for i in range(1, len(uv) - 1):
            a += abs((uv[i] - uv[0]).cross(uv[i + 1] - uv[0])) * 0.5
        return a
    islands = uv_islands(bm, uvl)
    areas = [sum(uvarea(f) for f in isl) for isl in islands]
    tot = sum(areas)
    px = tot / (0.62 * size * size)  # uv area of one texel after packing
    n = 0
    for isl, a in zip(islands, areas):
        if a < min_px * px:
            k = math.sqrt(min_px * px / max(a, 1e-12))
            k = min(k, 6.0)
            loops = [l for f in isl for l in f.loops]
            cen = sum((l[uvl].uv for l in loops), V((0, 0))) / len(loops)
            for l in loops:
                l[uvl].uv = cen + (l[uvl].uv - cen) * k
            n += 1
    bm.to_mesh(o.data)
    bm.free()
    log('uv islands', len(islands), 'enlarged', n)


def pack_uv(o, margin=0.004, size=1024):
    _edit(o)
    bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.average_islands_scale()
    bpy.ops.object.mode_set(mode='OBJECT')
    enlarge_tiny_islands(o, size)
    _edit(o)
    bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.pack_islands(rotate=True, margin=margin, shape_method='CONCAVE')
    bpy.ops.object.mode_set(mode='OBJECT')


def uv_unwrap(o, margin=0.004, angle=66.0):
    smart_uv(o, angle)
    pack_uv(o, margin)


def _img(name, size, noncolor):
    im = bpy.data.images.new(name, size, size, alpha=False, float_buffer=False)
    if noncolor:
        im.colorspace_settings.name = 'Non-Color'
    return im


def bake_textures(o, size, prefix, ao_samples=24, ao_strength=0.55, margin=6):
    """Bake procedural materials of o into base color / normal / ORM images (returns dict)."""
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.render.bake.margin = margin
    sc.render.bake.margin_type = 'EXTEND'
    sc.render.bake.use_selected_to_active = False
    for ob in sc.objects:
        ob.select_set(ob == o)
    bpy.context.view_layer.objects.active = o
    imgs = {}
    nodes = []
    for m in o.data.materials:
        nd = m.node_tree.nodes.new('ShaderNodeTexImage')
        nodes.append((m, nd))

    def run(kind, img, samples, **kw):
        for m, nd in nodes:
            nd.image = img
            for x in m.node_tree.nodes:
                x.select = False
            nd.select = True
            m.node_tree.nodes.active = nd
        sc.cycles.samples = samples
        t = time.time()
        bpy.ops.object.bake(type=kind, **kw)
        log('baked', kind, img.name, '%.1fs' % (time.time() - t))

    col = _img(prefix + '_basecolor', size, False)
    run('DIFFUSE', col, 1, pass_filter={'COLOR'})
    rough = _img(prefix + '_rough', size, True)
    run('ROUGHNESS', rough, 1)
    nrm = _img(prefix + '_normal', size, True)
    run('NORMAL', nrm, 1, normal_space='TANGENT')
    ao = _img(prefix + '_ao', size, True)
    # AO needs bump-free shading; plain geometric AO from the mesh
    run('AO', ao, ao_samples)
    for m, nd in nodes:
        m.node_tree.nodes.remove(nd)

    def px(im):
        a = np.empty(size * size * 4, np.float32)
        im.pixels.foreach_get(a)
        return a.reshape(size, size, 4)

    C = px(col)
    A = px(ao)[..., 0]
    R = px(rough)[..., 0]
    aof = 1.0 - ao_strength * (1.0 - A)
    C[..., :3] *= aof[..., None]
    col.pixels.foreach_set(C.ravel())
    orm = _img(prefix + '_orm', size, True)
    O = np.ones((size, size, 4), np.float32)
    O[..., 0] = A
    O[..., 1] = R
    O[..., 2] = 0.0
    orm.pixels.foreach_set(O.ravel())
    for im in (col, nrm, orm):
        im.filepath_raw = os.path.join(TMP, im.name + '.png')
        im.file_format = 'PNG'
        im.save()
    bpy.data.images.remove(rough)
    bpy.data.images.remove(ao)
    imgs.update(color=col, normal=nrm, orm=orm)
    return imgs


def baked_material(name, imgs, coat=0.0, coat_rough=0.08, normal_strength=1.0):
    m = bpy.data.materials.new(name)
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    nt.links.new(b.outputs[0], out.inputs[0])
    uv = nt.nodes.new('ShaderNodeUVMap')
    uv.uv_map = 'UVMap'
    ic = nt.nodes.new('ShaderNodeTexImage')
    ic.image = imgs['color']
    io = nt.nodes.new('ShaderNodeTexImage')
    io.image = imgs['orm']
    inn = nt.nodes.new('ShaderNodeTexImage')
    inn.image = imgs['normal']
    for i in (ic, io, inn):
        nt.links.new(uv.outputs[0], i.inputs[0])
    sep = nt.nodes.new('ShaderNodeSeparateColor')
    nm = nt.nodes.new('ShaderNodeNormalMap')
    nm.inputs['Strength'].default_value = normal_strength
    nt.links.new(ic.outputs['Color'], b.inputs['Base Color'])
    nt.links.new(io.outputs['Color'], sep.inputs[0])
    nt.links.new(sep.outputs[1], b.inputs['Roughness'])
    nt.links.new(sep.outputs[2], b.inputs['Metallic'])
    nt.links.new(inn.outputs['Color'], nm.inputs['Color'])
    nt.links.new(nm.outputs[0], b.inputs['Normal'])
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = coat_rough
    return m


def replace_materials(o, imgs, wet_names=(), prefix='M'):
    """Map every procedural slot to one of two baked materials (Main / Wet)."""
    main = baked_material(prefix + '_Main', imgs)
    wet = baked_material(prefix + '_Wet', imgs, coat=1.0, coat_rough=0.06) if wet_names else None
    slot_to = [1 if (m.name.split('.')[0] in wet_names) else 0 for m in o.data.materials]
    idx = np.empty(len(o.data.polygons), np.int32)
    o.data.polygons.foreach_get('material_index', idx)
    new = np.array(slot_to, np.int32)[idx]
    o.data.materials.clear()
    o.data.materials.append(main)
    if wet is not None:
        o.data.materials.append(wet)
    else:
        new[:] = 0
    o.data.polygons.foreach_set('material_index', new)
    o.data.update()


# ----------------------------------------------------------------------------- rig + skin
def build_armature(name, bones):
    """bones: list of (name, head, tail, parent_or_None, connect)"""
    arm = bpy.data.armatures.new(name)
    ao = link(bpy.data.objects.new(name, arm))
    bpy.context.view_layer.objects.active = ao
    for ob in bpy.context.scene.objects:
        ob.select_set(ob == ao)
    bpy.ops.object.mode_set(mode='EDIT')
    for b in bones:
        nm, h, t, par = b[:4]
        con = b[4] if len(b) > 4 else False
        eb = arm.edit_bones.new(nm)
        eb.head = V(h)
        eb.tail = V(t)
        d = (V(t) - V(h)).normalized()
        eb.align_roll(V((0, 0, 1)) if abs(d.y) > 0.8 else V((0, -1, 0)))
        if par:
            eb.parent = arm.edit_bones[par]
            eb.use_connect = con
    bpy.ops.object.mode_set(mode='OBJECT')
    return ao


def heat_weights(mesh, arm):
    for ob in bpy.context.scene.objects:
        ob.select_set(False)
    mesh.select_set(True)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')


def weight_matrix(o, bone_names):
    W = np.zeros((len(o.data.vertices), len(bone_names)), np.float32)
    gi = {g.index: bone_names.index(g.name) for g in o.vertex_groups if g.name in bone_names}
    for v in o.data.vertices:
        for g in v.groups:
            if g.group in gi:
                W[v.index, gi[g.group]] = g.weight
    return W


def fill_missing_weights(o, W, arm, bone_names):
    """vertices with no weight get nearest-bone weights"""
    s = W.sum(1)
    bad = np.where(s < 1e-4)[0]
    if len(bad):
        c = coords(o)[bad]
        segs = {b.name: (b.head_local, b.tail_local) for b in arm.data.bones if b.name in bone_names}
        nm, _, _ = classify(c, segs)
        for k, i in enumerate(bad):
            W[i, bone_names.index(nm[k])] = 1.0
    return W, len(bad)


def set_weights(o, W, bone_names, max_inf=4, min_w=0.02):
    for g in list(o.vertex_groups):
        o.vertex_groups.remove(g)
    groups = [o.vertex_groups.new(name=b) for b in bone_names]
    W = W.copy()
    if W.shape[1] > max_inf:
        thr = -np.sort(-W, 1)[:, max_inf - 1:max_inf]
        W[W < thr] = 0
    W[W < min_w] = 0
    s = W.sum(1, keepdims=True)
    s[s == 0] = 1
    W = W / s
    for j, g in enumerate(groups):
        idx = np.nonzero(W[:, j])[0]
        for i in idx:
            g.add([int(i)], float(W[i, j]), 'REPLACE')


def transfer_weights(src, Wsrc, dst):
    """interpolate weights from nearest face of src (barycentric)."""
    me = src.data
    tree = BVHTree.FromPolygons([v.co for v in me.vertices], [p.vertices[:] for p in me.polygons])
    polys = [p.vertices[:] for p in me.polygons]
    co = [v.co for v in me.vertices]
    c = coords(dst)
    out = np.zeros((len(c), Wsrc.shape[1]), np.float32)
    for i, p in enumerate(c):
        loc, nrm, fi, d = tree.find_nearest(V(p))
        vs = polys[fi]
        w = poly_3d_calc([co[k] for k in vs], loc)
        for k, wk in zip(vs, w):
            out[i] += wk * Wsrc[k]
    return out


def rigid_weights(o, bone_names, bone):
    W = np.zeros((len(o.data.vertices), len(bone_names)), np.float32)
    W[:, bone_names.index(bone)] = 1
    return W


def smooth_weights(o, W, iters=2, fac=0.5):
    me = o.data
    e = np.empty(len(me.edges) * 2, np.int32)
    me.edges.foreach_get('vertices', e)
    e = e.reshape(-1, 2)
    for _ in range(iters):
        acc = np.zeros_like(W)
        cnt = np.zeros(len(W), np.float32)
        np.add.at(acc, e[:, 0], W[e[:, 1]])
        np.add.at(acc, e[:, 1], W[e[:, 0]])
        np.add.at(cnt, e[:, 0], 1)
        np.add.at(cnt, e[:, 1], 1)
        cnt[cnt == 0] = 1
        W = W * (1 - fac) + fac * acc / cnt[:, None]
    return W


def bind(mesh, arm):
    mesh.parent = arm
    mesh.matrix_parent_inverse = Matrix()
    for m in list(mesh.modifiers):
        if m.type == 'ARMATURE':
            mesh.modifiers.remove(m)
    m = mesh.modifiers.new('Armature', 'ARMATURE')
    m.object = arm


# ----------------------------------------------------------------------------- animation
AX = {'x': V((1, 0, 0)), 'y': V((0, 1, 0)), 'z': V((0, 0, 1))}


def world_rot(rots):
    q = Quaternion()
    for axis, deg in rots:
        a = AX[axis] if isinstance(axis, str) else V(axis)
        q = Quaternion(a, math.radians(deg)) @ q
    return q


def make_action(arm, name, nframes, fn, step=1):
    """fn(t in [0,1]) -> {bone: {'r': [(axis, deg), ...], 'l': (x,y,z) armature-space offset}}.
    Rotations are about armature rest axes at each bone (X: +bend forward for upward bones)."""
    if arm.animation_data is None:
        arm.animation_data_create()
    act = bpy.data.actions.new(name)
    act.use_fake_user = True
    arm.animation_data.action = act
    prev = {}
    frames = list(range(0, nframes + 1, step))
    if frames[-1] != nframes:
        frames.append(nframes)
    rest = {b.name: b.matrix_local.to_3x3() for b in arm.data.bones}
    for f in frames:
        pose = fn(f / nframes)
        for pb in arm.pose.bones:
            pb.rotation_mode = 'QUATERNION'
            spec = pose.get(pb.name, {})
            M = rest[pb.name]
            Rw = world_rot(spec.get('r', []))
            q = (M.inverted() @ Rw.to_matrix() @ M).to_quaternion()
            if pb.name in prev and prev[pb.name].dot(q) < 0:
                q.negate()
            prev[pb.name] = q.copy()
            pb.rotation_quaternion = q
            pb.location = M.inverted() @ V(spec.get('l', (0, 0, 0)))
            pb.keyframe_insert('rotation_quaternion', frame=f + 1, group=pb.name)
            pb.keyframe_insert('location', frame=f + 1, group=pb.name)
    act.frame_range = (1, nframes + 1)
    act.use_frame_range = True
    arm.animation_data.action = None
    for pb in arm.pose.bones:
        pb.rotation_quaternion = Quaternion()
        pb.location = V()
    return act


def apply_action(arm, act, frame):
    arm.animation_data.action = act
    bpy.context.scene.frame_set(frame)


# ----------------------------------------------------------------------------- export / validate
def export_glb(path, objs, ):
    for ob in bpy.context.scene.objects:
        ob.select_set(ob in objs)
    bpy.context.view_layer.objects.active = objs[0]
    for o in objs:
        if o.type == 'ARMATURE' and o.animation_data:
            o.animation_data.action = None
    bpy.context.scene.frame_set(1)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format='GLB', use_selection=True, export_yup=True, export_apply=False,
        export_texcoords=True, export_normals=True, export_tangents=False, export_materials='EXPORT',
        export_image_format='JPEG', export_jpeg_quality=82, export_image_quality=82,
        export_animations=True, export_animation_mode='ACTIONS', export_force_sampling=True,
        export_frame_step=1, export_optimize_animation_size=True, export_anim_slide_to_zero=True,
        export_skins=True, export_influence_nb=4, export_def_bones=False, export_leaf_bone=False,
        export_reset_pose_bones=True, export_morph=False, export_cameras=False, export_lights=False,
        export_extras=False, export_draco_mesh_compression_enable=False)
    log('exported', path, '%.2f MB' % (os.path.getsize(path) / 1e6))


def inspect_glb(path):
    with open(path, 'rb') as f:
        data = f.read()
    magic, ver, total = struct.unpack_from('<III', data, 0)
    clen, ctype = struct.unpack_from('<II', data, 12)
    js = json.loads(data[20:20 + clen])
    tri = 0
    for m in js['meshes']:
        for p in m['primitives']:
            acc = js['accessors'][p['indices']]
            tri += acc['count'] // 3
    info = {
        'bytes': len(data),
        'triangles': tri,
        'skins': [{'joints': len(s['joints'])} for s in js.get('skins', [])],
        'animations': [(a['name'], round(max(js['accessors'][s['input']]['max'][0] for s in a['samplers']), 3))
                       for a in js.get('animations', [])],
        'images': [(i.get('mimeType'), js['bufferViews'][i['bufferView']]['byteLength']) for i in js.get('images', [])],
        'materials': [m['name'] for m in js.get('materials', [])],
        'extensionsUsed': js.get('extensionsUsed', []),
    }
    # bounds in glTF space (rest) from POSITION accessor
    for m in js['meshes']:
        for p in m['primitives']:
            a = js['accessors'][p['attributes']['POSITION']]
            info.setdefault('pos_bounds', []).append((a['min'], a['max']))
    return info


def reimport_check(path):
    reset()
    bpy.ops.import_scene.gltf(filepath=path)
    arms = [o for o in bpy.data.objects if o.type == 'ARMATURE']
    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    skinned = [o.name for o in meshes if any(m.type == 'ARMATURE' for m in o.modifiers)]
    return {'armatures': [(a.name, len(a.data.bones)) for a in arms], 'skinned_meshes': skinned,
            'actions': sorted(a.name for a in bpy.data.actions)}


# ----------------------------------------------------------------------------- preview render
def setup_preview(target=(0, 0, 0.9), dist=3.2, yaw=30, pitch=8, lens=50, res=(960, 720), samples=48):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = samples
    sc.cycles.use_denoising = False
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.view_settings.view_transform = 'AgX'
    w = sc.world
    w.use_nodes = True if hasattr(w, 'use_nodes') else None
    bg = w.node_tree.nodes.get('Background')
    if bg is None:
        bg = w.node_tree.nodes.new('ShaderNodeBackground')
        w.node_tree.links.new(bg.outputs[0], w.node_tree.nodes.new('ShaderNodeOutputWorld').inputs[0])
    bg.inputs[0].default_value = (0.18, 0.19, 0.21, 1)
    bg.inputs[1].default_value = 0.25
    cam = bpy.data.objects.get('PrevCam')
    if cam is None:
        cam = link(bpy.data.objects.new('PrevCam', bpy.data.cameras.new('PrevCam')))
        for nm, e, loc, rot in (('Key', 230, (2.5, -3.0, 3.5), None), ('Rim', 180, (-2.5, 2.5, 3.0), None),
                                ('Fill', 70, (-3.0, -2.0, 1.2), None)):
            L = bpy.data.lights.new(nm, 'AREA')
            L.energy = e
            L.size = 2.0
            lo = link(bpy.data.objects.new(nm, L))
            lo.location = loc
            d = V(target) - V(loc)
            lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        fl = bpy.data.objects.get('Floor')
        if fl is None:
            bm = bmesh.new()
            bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=6)
            m = bpy.data.materials.new('floor')
            m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.12, 0.12, 0.12, 1)
            m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.8
            obj_from_bm('Floor', bm, m)
    cam.data.lens = lens
    y, p = math.radians(yaw), math.radians(pitch)
    d = V((math.sin(y) * math.cos(p), -math.cos(y) * math.cos(p), math.sin(p)))
    cam.location = V(target) + d * dist
    cam.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam


def render(path):
    sc = bpy.context.scene
    sc.render.filepath = path
    sc.render.image_settings.file_format = 'PNG'
    t = time.time()
    bpy.ops.render.render(write_still=True)
    log('render', path, '%.1fs' % (time.time() - t))


# ----------------------------------------------------------------------------- humanoid body (shared by zombie/human)
def humanoid(P):
    """Build a high-res organic humanoid body (skin-modifier trunk/limbs + sculpted head/hands, voxel-unioned).
    P keys: height, shoulder_w, hip_w, limb (radius mult), arm_len, hand_len, finger_len, finger_r, chest_d,
    muscle, belly, arm_angle, voxel. Returns dict(body=obj, J=joints, segs=classification segments, tips=[...])."""
    H = P.get('height', 1.75)
    s = H / 1.75
    lr = P.get('limb', 1.0)
    mu = P.get('muscle', 1.0)
    J = {}
    J['pelvis'] = V((0, 0.0, 0.95 * s))
    J['hips_root'] = V((0, 0.0, 0.93 * s))
    J['spine'] = V((0, 0.005, 1.07 * s))
    J['chest'] = V((0, 0.01, 1.22 * s))
    J['chest_top'] = V((0, 0.01, 1.42 * s))
    J['neck'] = V((0, 0.012, 1.455 * s))
    J['head'] = V((0, 0.0, 1.575 * s))
    J['head_top'] = V((0, 0.0, 1.765 * s))
    tips = []
    verts, edges, radii = [], [], []

    def add(p, r, parent=None):
        verts.append(V(p))
        r = r if isinstance(r, tuple) else (r, r)
        radii.append((r[0] * SK, r[1] * SK))  # skin+subsurf shrinks the hull
        i = len(verts) - 1
        if parent is not None:
            edges.append((parent, i))
        return i

    hw, sw, cd = P.get('hip_w', 1.0), P.get('shoulder_w', 1.0), P.get('chest_d', 1.0)
    bl = P.get('belly', 1.0)
    SK = 1.26
    pel = add((0, 0.005, 0.96 * s), (0.150 * hw * s, 0.105 * s))
    wst = add((0, 0.0, 1.07 * s), (0.122 * s * bl, 0.090 * s * bl), pel)
    rib = add((0, -0.005, 1.19 * s), (0.150 * s * sw, 0.102 * s * cd), wst)
    che = add((0, 0.0, 1.30 * s), (0.162 * s * sw, 0.108 * s * cd), rib)
    uch = add((0, 0.01, 1.39 * s), (0.150 * s * sw, 0.092 * s * cd), che)
    nk = P.get('neck', 1.0)
    nb = add((0, 0.018, 1.465 * s), (0.050 * s * nk, 0.050 * s * nk), uch)
    nt = add((0, 0.012, 1.57 * s), (0.043 * s * nk, 0.045 * s * nk), nb)
    a = math.radians(P.get('arm_angle', 42))
    al = P.get('arm_len', 1.0)
    for sx, sfx in ((1, 'L'), (-1, 'R')):
        sh = V((0.172 * s * sx * sw, 0.018 * s, 1.415 * s))
        d1 = V((math.sin(a) * sx, -0.04, -math.cos(a))).normalized()
        el = sh + d1 * 0.285 * s * al
        d2 = V((math.sin(a - 0.05) * sx, -0.16, -math.cos(a - 0.05))).normalized()
        wr = el + d2 * 0.255 * s * al
        J['clav.' + sfx] = V((0.025 * sx * s, 0.0, 1.405 * s))
        J['shoulder.' + sfx], J['elbow.' + sfx], J['wrist.' + sfx] = sh, el, wr
        i = add(sh - d1 * 0.02, 0.054 * s * lr * mu, uch)
        i = add(sh.lerp(el, 0.45), (0.047 * s * lr * mu, 0.050 * s * lr * mu), i)
        i = add(el, 0.036 * s * lr, i)
        i = add(el.lerp(wr, 0.3), (0.039 * s * lr * mu, 0.035 * s * lr), i)
        i = add(wr, (0.028 * s * lr, 0.019 * s * lr), i)
        hp = V((0.088 * sx * s * hw, 0.0, 0.905 * s))
        kn = V((0.098 * sx * s, -0.012 * s, 0.50 * s))
        an = V((0.104 * sx * s, 0.022 * s, 0.088 * s))
        J['hip.' + sfx], J['knee.' + sfx], J['ankle.' + sfx] = hp, kn, an
        J['ball.' + sfx] = V((0.11 * sx * s, -0.085 * s, 0.03 * s))
        J['toe.' + sfx] = V((0.115 * sx * s, -0.165 * s, 0.03 * s))
        i = add(hp + V((0, 0, 0.03 * s)), 0.088 * s * lr * mu, pel)
        i = add(hp.lerp(kn, 0.35), (0.078 * s * lr * mu, 0.082 * s * lr * mu), i)
        i = add(hp.lerp(kn, 0.8), (0.058 * s * lr, 0.060 * s * lr), i)
        i = add(kn, 0.050 * s * lr, i)
        i = add(kn.lerp(an, 0.28) + V((0, 0.012 * s, 0)), (0.050 * s * lr * mu, 0.056 * s * lr * mu), i)
        i = add(kn.lerp(an, 0.75), (0.036 * s * lr, 0.036 * s * lr), i)
        i = add(an, 0.034 * s * lr, i)
    trunk = skin_object('trunk', verts, edges, radii, root=pel, subdiv=3)

    bm = bmesh.new()
    E = lambda c, r, rot=None, u=24, v=14: bm_ellipsoid(bm, V(c) * 1.0, r, rot, u, v)
    for sx, sfx in ((1, 'L'), (-1, 'R')):
        X = lambda x: x * sx
        # muscles
        E((X(0.064 * s * sw), -0.080 * s * cd, 1.325 * s), (0.058 * s * mu, 0.012 * s * mu, 0.038 * s),
          Quaternion((0, 1, 0), -sx * 0.35))  # pec
        E(J['shoulder.' + sfx] + V((X(0.012 * s), 0.0, -0.03 * s)), (0.05 * s * mu, 0.054 * s * mu, 0.07 * s * mu),
          Quaternion((0, 1, 0), sx * 0.5))  # deltoid
        E((X(0.075 * s), 0.035 * s, 1.45 * s), (0.075 * s, 0.040 * s, 0.032 * s * mu))  # trapezius
        E((X(0.068 * s * hw), 0.05 * s, 0.91 * s), (0.075 * s * mu, 0.06 * s * mu, 0.08 * s))  # glute
        E((X(0.07 * s), 0.075 * s, 1.30 * s), (0.065 * s, 0.03 * s, 0.09 * s))  # scapula/lat
        kn, an = J['knee.' + sfx], J['ankle.' + sfx]
        E(kn.lerp(an, 0.3) + V((0, 0.03 * s, 0)), (0.040 * s * mu * lr, 0.038 * s * mu * lr, 0.085 * s))  # calf
        # shoe/foot
        ax = an.x
        E((ax, 0.035 * s, 0.05 * s), (0.044 * s, 0.055 * s, 0.05 * s))
        E((ax + X(0.004), -0.06 * s, 0.045 * s), (0.050 * s, 0.085 * s, 0.042 * s))
        E((ax + X(0.008), -0.14 * s, 0.035 * s), (0.046 * s, 0.045 * s, 0.032 * s))
        # hand
        tips += hand(bm, J, sfx, sx, s, P)
    # head
    hs = P.get('head_s', 1.0)
    hc = V((0, 0.016 * s, 1.672 * s))
    E(hc, (0.074 * s * hs, 0.095 * s * hs, 0.094 * s * hs), u=40, v=24)  # cranium
    E((0, -0.024 * s, 1.606 * s), (0.057 * s, 0.066 * s, 0.064 * s), u=32, v=18)  # face / jaw mass
    E((0, -0.058 * s, 1.556 * s), (0.021 * s, 0.015 * s, 0.014 * s))  # chin
    for sx in (1, -1):
        er = Quaternion((0, 0, 1), sx * 0.25)
        E((sx * 0.074 * s, 0.016 * s, 1.648 * s), (0.009 * s, 0.022 * s, 0.030 * s), er, 16, 10)  # ear
        E((sx * 0.011 * s, -0.088 * s, 1.620 * s), (0.008 * s, 0.008 * s, 0.007 * s), None, 12, 8)  # nostril wing
    bm_sweep(bm, [(0, -0.080 * s, 1.672 * s), (0, -0.092 * s, 1.645 * s), (0, -0.099 * s, 1.625 * s)],
             [0.006 * s, 0.008 * s, 0.0098 * s], seg=12)  # nose
    bm_sweep(bm, [(-0.050 * s, -0.060 * s, 1.684 * s), (-0.028 * s, -0.076 * s, 1.688 * s), (0, -0.080 * s, 1.690 * s),
                  (0.028 * s, -0.076 * s, 1.688 * s), (0.050 * s, -0.060 * s, 1.684 * s)],
             [0.003 * s, 0.008 * s, 0.008 * s, 0.008 * s, 0.003 * s], seg=10)  # brow
    bm_sweep(bm, [(-0.022 * s, -0.078 * s, 1.601 * s), (0, -0.087 * s, 1.603 * s), (0.022 * s, -0.078 * s, 1.601 * s)],
             [0.003 * s, 0.0065 * s, 0.003 * s], seg=10)  # upper lip
    bm_sweep(bm, [(-0.019 * s, -0.076 * s, 1.588 * s), (0, -0.084 * s, 1.586 * s), (0.019 * s, -0.076 * s, 1.588 * s)],
             [0.003 * s, 0.007 * s, 0.003 * s], seg=10)  # lower lip
    parts = obj_from_bm('parts', bm)
    body = join([trunk, parts], 'body_hi')
    remesh(body, P.get('voxel', 0.0045) * s, smooth_iter=3, smooth_fac=0.6)
    c = coords(body)
    # flat shoe soles + feet exactly on ground
    c[:, 2] = np.where(c[:, 2] < 0.012 * s, 0.012 * s + (c[:, 2] - 0.012 * s) * 0.15, c[:, 2])
    c[:, 2] -= c[:, 2].min()
    set_coords(body, c)
    # eye sockets / mouth line / philtrum (sculpt-like)
    eyes = []
    for sx in (1, -1):
        ec = np.array((sx * 0.031 * s, -0.072 * s, 1.662 * s))
        eyes.append(V(ec) + V((0, 0.006 * s, 0)))
    def face(c, n):
        d = np.zeros(len(c), np.float32)
        for e in eyes:
            d -= 0.008 * s * gauss(c, np.array(e) + np.array((0, -0.006 * s, 0)), 0.015 * s)
        d -= 0.003 * s * gauss(c, (0, -0.086 * s, 1.5945 * s), 0.005 * s) * (np.abs(c[:, 0]) < 0.03 * s)
        d -= 0.002 * s * gauss(c, (0, -0.090 * s, 1.612 * s), 0.004 * s)
        return d
    hm = gauss(coords(body), (0, -0.03 * s, 1.63 * s), 0.07 * s)
    lap_smooth(body, hm * 0.5, 3)
    displace(body, face)
    lap_smooth(body, hm * 0.4, 2)
    segs = {
        'torso': (V((0, 0, 0.88 * s)), J['chest_top']), 'neck': (J['chest_top'], J['head']),
        'head': (J['head'], J['head_top'])}
    for sfx in 'LR':
        segs['clav.' + sfx] = (J['clav.' + sfx], J['shoulder.' + sfx])
        segs['uarm.' + sfx] = (J['shoulder.' + sfx], J['elbow.' + sfx])
        segs['farm.' + sfx] = (J['elbow.' + sfx], J['wrist.' + sfx])
        segs['hand.' + sfx] = (J['wrist.' + sfx], J['handtip.' + sfx])
        segs['thigh.' + sfx] = (J['hip.' + sfx], J['knee.' + sfx])
        segs['shin.' + sfx] = (J['knee.' + sfx], J['ankle.' + sfx])
        segs['foot.' + sfx] = (J['ankle.' + sfx], J['toe.' + sfx])
    return dict(body=body, J=J, segs=segs, tips=tips, eyes=eyes, s=s)


def hand(bm, J, sfx, sx, s, P):
    hl = P.get('hand_len', 1.0) * s
    fl = P.get('finger_len', 1.0)
    fr = P.get('finger_r', 1.0) * s
    wr = J['wrist.' + sfx]
    el = J['elbow.' + sfx]
    d = (wr - el).normalized()
    inward = V((-sx, 0, 0))
    n = (inward - d * d.dot(inward)).normalized()  # palm normal (palm faces thigh)
    w = d.cross(n).normalized()
    if w.y > 0:
        w = -w  # w points forward (-Y): index finger side
    rot = Matrix((w, n, d)).transposed()
    bm_ellipsoid(bm, wr + d * 0.048 * hl - n * 0.002 * hl, (0.041 * hl, 0.017 * hl, 0.052 * hl), rot, 24, 14)
    bm_ellipsoid(bm, wr + d * 0.03 * hl + w * 0.022 * hl + n * 0.008 * hl, (0.018 * hl, 0.015 * hl, 0.03 * hl), rot, 16, 10)
    knuck = wr + d * 0.094 * hl
    J['knuckle.' + sfx] = knuck
    tips = []
    offs = [0.027, 0.009, -0.009, -0.026]
    lens = [0.074, 0.082, 0.077, 0.061]
    curl = P.get('curl', 1.0)
    maxtip = 0
    for k in range(4):
        base = knuck + w * offs[k] * hl - d * (0.004 * abs(k - 1.3)) * hl
        L = lens[k] * hl * fl
        segl = [0.46, 0.31, 0.23]
        ang = [math.radians(a * curl) for a in (12, 22, 16)]
        pts = [base - d * 0.012 * hl]
        p = V(base)
        dirv = (d + w * (offs[k] * 0.9)).normalized()
        pts.append(p.copy())
        for j in range(3):
            dirv = Quaternion(w, -ang[j] * sx) @ dirv  # curl toward palm (mirrored axis => flip sense)
            p = p + dirv * L * segl[j]
            pts.append(p.copy())
        r0 = 0.0095 * fr
        bm_sweep(bm, pts, [r0 * 1.05, r0, r0 * 0.9, r0 * 0.82, r0 * 0.66], seg=10, nsub=3)
        for j in range(1, 4):
            bm_ellipsoid(bm, pts[j], (r0 * 0.95,) * 3, None, 10, 6)
        tips.append((pts[-1], dirv.copy(), n.copy(), r0 * 0.66))
        maxtip = max(maxtip, (pts[-1] - wr).length)
    # thumb
    tb = wr + d * 0.022 * hl + w * 0.028 * hl + n * 0.012 * hl
    td = (d * 0.55 + w * 0.6 + n * 0.5).normalized()
    p1 = tb + td * 0.03 * hl * fl
    td2 = (td + d * 0.6 + n * 0.25).normalized()
    p2 = p1 + td2 * 0.028 * hl * fl
    p3 = p2 + (td2 + n * 0.4).normalized() * 0.022 * hl * fl
    bm_sweep(bm, [tb - td * 0.01, tb, p1, p2, p3], [0.016 * fr, 0.014 * fr, 0.011 * fr, 0.009 * fr, 0.0072 * fr], seg=10, nsub=3)
    tips.append((p3, (p3 - p2).normalized(), n.copy(), 0.0072 * fr))
    J['handtip.' + sfx] = wr + d * maxtip
    J['palm_n.' + sfx] = n
    J['hand_w.' + sfx] = w
    return tips


def humanoid_bones(J):
    b = [('Hips', J['hips_root'], J['spine'], None),
         ('Spine', J['spine'], J['chest'], 'Hips', True),
         ('Chest', J['chest'], J['chest_top'], 'Spine', True),
         ('Neck', J['neck'], J['head'], 'Chest'),
         ('Head', J['head'], J['head_top'], 'Neck', True)]
    for sx in 'LR':
        b += [('Shoulder.' + sx, J['clav.' + sx], J['shoulder.' + sx], 'Chest'),
              ('UpperArm.' + sx, J['shoulder.' + sx], J['elbow.' + sx], 'Shoulder.' + sx, True),
              ('LowerArm.' + sx, J['elbow.' + sx], J['wrist.' + sx], 'UpperArm.' + sx, True),
              ('Hand.' + sx, J['wrist.' + sx], J['knuckle.' + sx], 'LowerArm.' + sx, True),
              ('Fingers.' + sx, J['knuckle.' + sx], J['handtip.' + sx], 'Hand.' + sx, True),
              ('UpperLeg.' + sx, J['hip.' + sx], J['knee.' + sx], 'Hips'),
              ('LowerLeg.' + sx, J['knee.' + sx], J['ankle.' + sx], 'UpperLeg.' + sx, True),
              ('Foot.' + sx, J['ankle.' + sx], J['ball.' + sx], 'LowerLeg.' + sx, True),
              ('Toes.' + sx, J['ball.' + sx], J['toe.' + sx], 'Foot.' + sx, True)]
    return b


# ----------------------------------------------------------------------------- humanoid clips
def bdir(arm, name):
    b = arm.data.bones[name]
    return (b.tail_local - b.head_local).normalized()


def humanoid_anims(arm, zombie=True):
    """Idle/Walk/Run/Attack/Hurt/Death. Rotations about armature rest axes:
    x+ bends upward bones forward / swings downward bones back; hinge() axes bend toward the front."""
    F = V((0, -1, 0))
    hip_h = arm.data.bones['Hips'].head_local.z

    def hinge(name, toward=F):
        return tuple(bdir(arm, name).cross(toward).normalized())

    H = {n: hinge(n) for n in ('UpperArm.L', 'UpperArm.R', 'LowerArm.L', 'LowerArm.R')}
    FC = {sx: tuple(bdir(arm, 'Fingers.' + sx).cross(V((-1 if sx == 'L' else 1, 0, 0))).normalized()) for sx in 'LR'}
    sgn = {'L': 1, 'R': -1}
    hunch = 1.0 if zombie else 0.0

    def armp(P, sx, lower=0.0, swing=0.0, elbow=0.0, twist=0.0, curl=0.0, wrist=0.0, shrug=0.0):
        P['Shoulder.' + sx] = {'r': [('y', -sgn[sx] * shrug)]}
        P['UpperArm.' + sx] = {'r': [(H['UpperArm.' + sx], swing), ('y', sgn[sx] * lower), ('z', sgn[sx] * twist)]}
        P['LowerArm.' + sx] = {'r': [(H['LowerArm.' + sx], elbow)]}
        P['Hand.' + sx] = {'r': [(FC[sx], wrist)]}
        P['Fingers.' + sx] = {'r': [(FC[sx], curl)]}

    def legp(P, sx, thigh=0.0, knee=0.0, foot=0.0, spread=0.0, toe=0.0):
        P['UpperLeg.' + sx] = {'r': [('x', thigh), ('y', sgn[sx] * spread)]}
        P['LowerLeg.' + sx] = {'r': [('x', knee)]}
        P['Foot.' + sx] = {'r': [('x', foot)]}
        P['Toes.' + sx] = {'r': [('x', toe)]}

    def posture(P, bend=0.0, twist=0.0, lean=0.0, look=0.0, turn=0.0, tilt=0.0, hip=(0, 0, 0), hip_r=None):
        P['Hips'] = {'l': hip, 'r': hip_r or []}
        P['Spine'] = {'r': [('x', 10 * hunch + bend * 0.45), ('z', twist * 0.5), ('y', lean * 0.5)]}
        P['Chest'] = {'r': [('x', 16 * hunch + bend * 0.55), ('z', twist * 0.5), ('y', lean * 0.5)]}
        P['Neck'] = {'r': [('x', -12 * hunch + look * 0.5), ('z', turn * 0.5), ('y', tilt * 0.5)]}
        P['Head'] = {'r': [('x', -10 * hunch + look * 0.5), ('z', turn * 0.5), ('y', tilt * 0.5)]}

    s = math.sin
    c = math.cos
    tau = 2 * math.pi
    hang = 33 if zombie else 36

    # ------------------------------------------------------------------ idle
    def idle(t):
        w = tau * t
        P = {}
        br = s(w * 2)
        posture(P, bend=2 * br + (3 * s(w) if zombie else 0), twist=4 * s(w) if zombie else 1.5 * s(w),
                lean=3 * s(w + 1) if zombie else 1.2 * s(w), look=3 * s(w * 3) if zombie else 0,
                turn=(8 * s(w) + 5 * s(w * 4)) if zombie else 6 * s(w), tilt=8 * s(w + 0.5) if zombie else 2 * s(w),
                hip=(0.01 * s(w), 0, -0.02 * hunch - 0.004 * br))
        for sx in 'LR':
            ph = 0 if sx == 'L' else 1.7
            if zombie:
                armp(P, sx, lower=hang - 4, swing=14 + 5 * s(w + ph), elbow=22 + 6 * s(w + ph), curl=25 + 8 * s(w * 2 + ph),
                     wrist=10, shrug=4 * s(w + ph))
                legp(P, sx, thigh=-8 + (3 if sx == 'L' else -2), knee=14 + 2 * br, foot=-4, spread=3)
            else:
                armp(P, sx, lower=hang, swing=4 + 1.5 * s(w + ph), elbow=10 + 2 * s(w + ph), curl=18, wrist=4)
                legp(P, sx, thigh=-1 + 1.5 * s(w) * sgn[sx], knee=2 - 1.5 * s(w) * sgn[sx], foot=-1, spread=2)
        return P

    # ------------------------------------------------------------------ walk (shamble / normal)
    def walk(t):
        w = tau * t
        P = {}
        if zombie:
            bob = -0.03 - 0.018 * abs(c(w))
            posture(P, bend=4 + 3 * s(2 * w), twist=-9 * s(w), lean=7 * s(w), turn=6 * s(w), tilt=-6 * s(w),
                    hip=(0.025 * s(w), 0, bob), hip_r=[('z', 7 * s(w)), ('y', -4 * s(w))])
            for sx, ph in (('L', 0.0), ('R', math.pi)):
                a = s(w + ph)
                drag = 0.6 if sx == 'R' else 1.0  # dragging right leg
                lift = max(0.0, c(w + ph))
                legp(P, sx, thigh=-6 - 24 * a * drag, knee=16 + 40 * lift * drag, foot=-8 * a - 10 * lift * drag + 6,
                     spread=3)
                armp(P, sx, lower=hang - 12, swing=40 + 10 * s(w + ph + 2.4), elbow=28 + 8 * s(w + ph + 2), curl=30,
                     wrist=12, shrug=6 * s(w + ph))
        else:
            posture(P, bend=3, twist=-6 * s(w), turn=3 * s(w), hip=(0.018 * s(w), 0, -0.012 * abs(c(w)) + 0.004),
                    hip_r=[('z', 6 * s(w))])
            for sx, ph in (('L', 0.0), ('R', math.pi)):
                a = s(w + ph)
                lift = max(0.0, c(w + ph))
                legp(P, sx, thigh=-25 * a, knee=6 + 45 * lift, foot=-10 * a - 6 * lift + 4)
                armp(P, sx, lower=hang + 2, swing=-22 * a, elbow=14 + 12 * max(0.0, -a), curl=20, wrist=3)
        return P

    # ------------------------------------------------------------------ run
    def run(t):
        w = tau * t
        P = {}
        lean = 26 if zombie else 12
        posture(P, bend=lean + 3 * s(2 * w), twist=-12 * s(w), turn=5 * s(w), look=-lean * 0.7,
                hip=(0.02 * s(w), 0, -0.04 + 0.04 * abs(s(w)) - (0.03 if zombie else 0.0)), hip_r=[('z', 9 * s(w))])
        for sx, ph in (('L', 0.0), ('R', math.pi)):
            a = s(w + ph)
            lift = max(0.0, c(w + ph))
            legp(P, sx, thigh=-12 - 38 * a, knee=20 + 75 * lift, foot=-14 * a + 10, spread=2)
            if zombie:
                armp(P, sx, lower=hang - 20, swing=70 + 18 * s(w + ph + 0.5), elbow=35 + 15 * s(w + ph), curl=40, wrist=15,
                     shrug=10)
            else:
                armp(P, sx, lower=hang, swing=-38 * a + 8, elbow=75 + 15 * max(0.0, -a), curl=60, wrist=5)
        return P

    # ------------------------------------------------------------------ attack
    def attack(t):
        P = {}
        up = sstep(0.0, 0.35, t) * (1 - sstep(0.38, 0.52, t))
        strike = sstep(0.38, 0.52, t) * (1 - sstep(0.7, 1.0, t))
        if zombie:
            posture(P, bend=-14 * up + 28 * strike, twist=-12 * up + 14 * strike, look=10 * up - 18 * strike,
                    hip=(0, 0.04 * up - 0.06 * strike, -0.03 - 0.04 * strike))
            for sx in 'LR':
                k = 1.0 if sx == 'R' else 0.85
                armp(P, sx, lower=hang - 25 * up * k - 10 * strike, swing=20 + 125 * up * k + 35 * strike,
                     elbow=30 + 50 * up - 20 * strike, curl=20 + 50 * strike, wrist=-20 * up + 30 * strike, shrug=18 * up)
                legp(P, sx, thigh=-10 + (-18 * strike if sx == 'L' else 8 * strike), knee=18 + 22 * strike, foot=-6,
                     spread=4)
        else:  # right straight punch with left guard
            wind = sstep(0.0, 0.3, t) * (1 - sstep(0.32, 0.45, t))
            hit = sstep(0.32, 0.45, t) * (1 - sstep(0.62, 1.0, t))
            posture(P, bend=6, twist=18 * wind - 30 * hit, turn=-10 * wind + 18 * hit,
                    hip=(0, -0.05 * hit, -0.03), hip_r=[('z', 8 * wind - 12 * hit)])
            armp(P, 'L', lower=hang - 20, swing=55, elbow=110, curl=85, wrist=5)
            armp(P, 'R', lower=hang - 20 - 25 * hit, swing=40 - 20 * wind + 60 * hit, elbow=115 * (1 - hit) + 15 * hit,
                 curl=85, wrist=0)
            legp(P, 'L', thigh=-20, knee=25, foot=-5, spread=4)
            legp(P, 'R', thigh=12, knee=18, foot=6, spread=4)
        return P

    # ------------------------------------------------------------------ hurt
    def hurt(t):
        k = s(math.pi * min(1.0, t * 1.6)) * (1 - 0.5 * t)
        P = {}
        posture(P, bend=-20 * k, twist=10 * k, look=-25 * k, tilt=12 * k, hip=(0, 0.06 * k, -0.02 - 0.02 * k))
        for sx in 'LR':
            if zombie:
                armp(P, sx, lower=hang - 4 - 20 * k, swing=14 + 20 * k, elbow=22 + 20 * k, curl=25 + 30 * k, wrist=10)
                legp(P, sx, thigh=-8 + 10 * k, knee=14 + 10 * k, foot=-4, spread=3)
            else:
                armp(P, sx, lower=hang - 15 * k, swing=4 + 30 * k, elbow=10 + 60 * k, curl=18 + 40 * k)
                legp(P, sx, thigh=-1 + 8 * k, knee=2 + 12 * k, foot=-1, spread=2)
        return P

    # ------------------------------------------------------------------ death (fall backwards onto the back)
    def death(t):
        P = {}
        stag = sstep(0.0, 0.25, t)
        fall = sstep(0.18, 0.62, t) ** 1.6
        settle = sstep(0.62, 0.8, t)
        bounce = s(math.pi * sstep(0.6, 0.75, t)) * 0.04
        rot = -88 * fall
        drop = -(hip_h - 0.11) * fall + 0.05 * stag * (1 - fall) * -1 + bounce
        posture(P, bend=-12 * stag * (1 - fall) + 10 * fall - 8 * settle, twist=10 * stag, look=-20 * stag + 25 * fall,
                turn=25 * settle, tilt=15 * settle, hip=(0, 0.25 * fall, drop), hip_r=[('x', rot), ('z', 8 * fall)])
        for sx in 'LR':
            o = 1 if sx == 'L' else -1
            armp(P, sx, lower=hang - 10 - 40 * stag * (1 - fall) - 45 * settle, swing=10 + 30 * stag * (1 - fall) - 40 * fall,
                 elbow=20 + 30 * stag - 10 * settle * o, curl=40 * settle, wrist=10)
            legp(P, sx, thigh=-30 * stag * (1 - fall) - 10 * fall + (6 * o * settle), knee=40 * stag * (1 - fall) + 18 * settle,
                 foot=20 * fall, spread=6 * settle)
        return P

    if zombie:
        clips = [('Idle', 90, idle), ('Walk', 44, walk), ('Run', 24, run), ('Attack', 36, attack), ('Hurt', 15, hurt),
                 ('Death', 60, death)]
    else:
        clips = [('Idle', 90, idle), ('Walk', 32, walk), ('Run', 20, run), ('Attack', 24, attack), ('Hurt', 15, hurt),
                 ('Death', 54, death)]
    return [make_action(arm, n, nf, fn) for n, nf, fn in clips]
