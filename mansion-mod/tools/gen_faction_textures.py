#!/usr/bin/env python3
"""洋館の黙示録: 陣営 Mob のテクスチャを生成する (Pillow 必須: pip install pillow)。

バニラのモデル UV レイアウトに合わせて描く:
  - 人型 (ZombieModel / HumanoidModel.createMesh)   64x64
  - クモ (SpiderModel)                              64x32
  - シルバーフィッシュ (SilverfishModel)            64x32
出力: src/main/resources/assets/yakata/textures/entity/<name>.png
      tools/preview_factions.png (確認用の拡大一覧)

使い方: python3 tools/gen_faction_textures.py
"""
import os
import random

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "main", "resources", "assets", "yakata", "textures", "entity")

# ---------------------------------------------------------------------------
# UV ヘルパー
# ---------------------------------------------------------------------------

def faces(u, v, w, h, d):
    """Minecraft の箱 UV 展開。各面の (x, y, 幅, 高さ)。front = 北面 (顔)。"""
    return {
        "top": (u + d, v, w, d),
        "bottom": (u + d + w, v, w, d),
        "right": (u, v + d, d, h),
        "front": (u + d, v + d, w, h),
        "left": (u + d + w, v + d, d, h),
        "back": (u + 2 * d + w, v + d, w, h),
    }


HUMANOID = {  # name: (u, v, w, h, d)
    "head": (0, 0, 8, 8, 8),
    "body": (16, 16, 8, 12, 4),
    "arm": (40, 16, 4, 12, 4),
    "leg": (0, 16, 4, 12, 4),
}
HAT = (32, 0, 8, 8, 8)
SPIDER = {
    "head": (32, 4, 8, 8, 8),
    "neck": (0, 0, 6, 6, 6),
    "body": (0, 12, 10, 8, 12),
    "leg": (18, 0, 16, 2, 2),
}
_SF_SIZES = [(3, 2, 2), (4, 3, 2), (6, 4, 3), (3, 3, 3), (2, 2, 3), (2, 1, 2), (1, 1, 2)]
_SF_TEX = [(0, 0), (0, 4), (0, 9), (0, 16), (0, 22), (11, 0), (13, 4)]
SILVERFISH = {f"seg{i}": (_SF_TEX[i][0], _SF_TEX[i][1], *_SF_SIZES[i]) for i in range(7)}
SILVERFISH.update({"plate0": (20, 0, 10, 8, 3), "plate1": (20, 11, 6, 4, 3), "plate2": (20, 18, 6, 5, 2)})


def hexc(s, a=255):
    s = s.lstrip("#")
    return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16), a)


def jitter(c, rnd, amount):
    return tuple(max(0, min(255, c[i] + rnd.randint(-amount, amount))) for i in range(3)) + (c[3],)


def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(4))


class Tex:
    def __init__(self, w, h, seed):
        self.img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        self.px = self.img.load()
        self.rnd = random.Random(seed)

    def fill(self, rect, palette, noise=12):
        x0, y0, w, h = rect
        for y in range(y0, y0 + h):
            for x in range(x0, x0 + w):
                self.px[x, y] = jitter(self.rnd.choice(palette), self.rnd, noise)

    def put(self, x, y, c):
        if 0 <= x < self.img.width and 0 <= y < self.img.height:
            self.px[x, y] = c

    def splotch(self, rect, colors, count, size=(1, 2)):
        """rect 内に色の斑点 (血・胞子・傷) を散らす"""
        x0, y0, w, h = rect
        for _ in range(count):
            cx, cy = x0 + self.rnd.randrange(w), y0 + self.rnd.randrange(h)
            r = self.rnd.randint(*size)
            c = self.rnd.choice(colors)
            for yy in range(cy - r + 1, cy + r):
                for xx in range(cx - r + 1, cx + r):
                    if x0 <= xx < x0 + w and y0 <= yy < y0 + h and self.rnd.random() < 0.8:
                        self.px[xx, yy] = jitter(c, self.rnd, 10)

    def drip(self, rect, color, count):
        """上から垂れる筋 (血・酸)"""
        x0, y0, w, h = rect
        for _ in range(count):
            x = x0 + self.rnd.randrange(w)
            length = self.rnd.randint(2, max(2, h - 1))
            for y in range(y0, min(y0 + h, y0 + length)):
                self.px[x, y] = jitter(color, self.rnd, 12)

    def stripes(self, rect, color, every=2, vertical=False):
        x0, y0, w, h = rect
        for y in range(y0, y0 + h):
            for x in range(x0, x0 + w):
                k = (x - x0) if vertical else (y - y0)
                if k % every == 0:
                    self.px[x, y] = jitter(color, self.rnd, 8)

    def box(self, b, palette, noise=12, sides=None):
        """箱の全面を塗る。sides で面ごとに別パレットを指定可"""
        fs = faces(*b)
        for name, rect in fs.items():
            pal = (sides or {}).get(name, palette)
            self.fill(rect, pal, noise)
        return fs

    def eye(self, x, y, white, iris, w=2):
        for i in range(w):
            self.put(x + i, y, white)
        self.put(x + (w - 1 if w > 1 else 0), y, iris)

    def save(self, name):
        os.makedirs(OUT, exist_ok=True)
        path = os.path.join(OUT, name + ".png")
        self.img.save(path)
        return path


# ---------------------------------------------------------------------------
# 人型 (64x64)
# ---------------------------------------------------------------------------

def humanoid(name, seed, skin, shirt, pants, eyes, extra=None, hat=None):
    t = Tex(64, 64, seed)
    head = t.box(HUMANOID["head"], skin)
    body = t.box(HUMANOID["body"], shirt)
    arm = t.box(HUMANOID["arm"], shirt)
    leg = t.box(HUMANOID["leg"], pants)
    # 腕の下半分は素肌、脚の先は靴
    for k in ("right", "front", "left", "back"):
        x, y, w, h = arm[k]
        t.fill((x, y + 5, w, h - 5), skin)
        x, y, w, h = leg[k]
        t.fill((x, y + 10, w, 2), [hexc("#2a2420"), hexc("#1f1a17")], 6)
    t.fill(arm["bottom"], skin)
    # 顔
    fx, fy, _, _ = head["front"]
    if eyes:
        white, iris = eyes
        t.eye(fx + 1, fy + 4, white, iris)
        t.eye(fx + 5, fy + 4, white, iris)
        t.put(fx + 2, fy + 4, iris)
        t.put(fx + 5, fy + 4, iris)
    for x in range(fx + 2, fx + 6):  # 口
        t.put(x, fy + 6, jitter(hexc("#2a0a0a"), t.rnd, 10))
    regions = {"head": head, "body": body, "arm": arm, "leg": leg}
    if extra:
        extra(t, regions)
    if hat:
        hat(t, faces(*HAT))
    return t


def blood(t, regions, amount=1.0, color="#5a0a0a"):
    c = [hexc(color), hexc("#7a1010")]
    t.splotch(regions["body"]["front"], c, int(6 * amount))
    t.splotch(regions["head"]["front"], c, int(2 * amount), (1, 1))
    t.drip(regions["body"]["front"], hexc("#6a0c0c"), int(3 * amount))
    t.splotch(regions["arm"]["front"], c, int(3 * amount), (1, 1))
    t.drip((regions["head"]["front"][0] + 2, regions["head"]["front"][1] + 6, 4, 2), hexc("#6a0c0c"), int(2 * amount))


def wounds(t, rect, count):
    t.splotch(rect, [hexc("#8c1c1c"), hexc("#b03030"), hexc("#d8c8b0")], count, (1, 2))


# ---- t-ウイルス ------------------------------------------------------------

def t_zombie():
    skin = [hexc("#7d8a6a"), hexc("#748262"), hexc("#86917a")]
    shirt = [hexc("#3b4a6b"), hexc("#34425f"), hexc("#425275")]
    pants = [hexc("#4a3b2a"), hexc("#3f3224")]

    def extra(t, r):
        blood(t, r, 1.2)
        wounds(t, r["arm"]["front"], 2)
        t.splotch(r["body"]["front"], skin, 4, (1, 2))  # 破れた服から肌
    return humanoid("t_zombie", 1, skin, shirt, pants, (hexc("#d8d0b0"), hexc("#7a1a1a")), extra)


def crimson_head():
    skin = [hexc("#8b1a1a"), hexc("#a02222"), hexc("#7a1414"), hexc("#b22a2a")]
    shirt = [hexc("#2a2224"), hexc("#221c1e"), hexc("#8b1a1a")]
    pants = [hexc("#2b2622"), hexc("#241f1c")]

    def extra(t, r):
        blood(t, r, 1.5, "#3a0505")
        # 長い爪 (腕の先)
        for k in ("front", "back", "left", "right"):
            x, y, w, h = r["arm"][k]
            for i in range(w):
                t.put(x + i, y + h - 1, jitter(hexc("#e8e0c8"), t.rnd, 10))
        t.fill(r["arm"]["bottom"], [hexc("#e8e0c8")], 8)
        # 赤熱した目の周り
        fx, fy, _, _ = r["head"]["front"]
        for x in (fx + 1, fx + 2, fx + 5, fx + 6):
            t.put(x, fy + 3, hexc("#4a0606"))
    return humanoid("crimson_head", 2, skin, shirt, pants, (hexc("#ffb020"), hexc("#ff5a00")), extra)


def tyrant():
    skin = [hexc("#8c8c8c"), hexc("#7f8082"), hexc("#999a9c")]
    coat = [hexc("#2f3b2a"), hexc("#2a3426"), hexc("#35422f")]
    pants = coat

    def extra(t, r):
        # コートの合わせ目とボタン
        x, y, w, h = r["body"]["front"]
        for yy in range(y, y + h):
            t.put(x + 3, yy, hexc("#1c2418"))
        for yy in (y + 2, y + 5, y + 8):
            t.put(x + 2, yy, hexc("#9a8a50"))
        # 襟
        t.fill((x, y, w, 2), [hexc("#1e261b")], 4)
        # 黒い手袋
        for k in ("front", "back", "left", "right"):
            ax, ay, aw, ah = r["arm"][k]
            t.fill((ax, ay + 9, aw, 3), [hexc("#151515"), hexc("#1d1d1d")], 4)
        t.fill(r["arm"]["bottom"], [hexc("#151515")], 4)
        # 傷跡
        fx, fy, _, _ = r["head"]["front"]
        t.put(fx + 6, fy + 2, hexc("#5a5050"))
        t.put(fx + 6, fy + 3, hexc("#5a5050"))

    def fedora(t, hat):
        # 帽子 (帽子レイヤーの上面と上段 3 行だけ塗る。残りは透明)
        brim = [hexc("#1a1c18"), hexc("#22251f")]
        t.fill(hat["top"], brim, 5)
        for k in ("front", "back", "left", "right"):
            x, y, w, h = hat[k]
            t.fill((x, y, w, 2), brim, 5)
            for xx in range(x, x + w):
                t.put(xx, y + 2, hexc("#3a2a1a"))  # 帽子のリボン
    return humanoid("tyrant", 3, skin, coat, pants, (hexc("#f0f0f0"), hexc("#202020")), extra, fedora)


# ---- G-ウイルス ------------------------------------------------------------

G_FLESH = [hexc("#7a2a4a"), hexc("#8e3456"), hexc("#6a2040"), hexc("#a04060")]
G_EYE_WHITE = hexc("#f0e8c8")
G_IRIS = hexc("#e8b020")


def big_eye(t, x, y, size=3):
    for yy in range(size):
        for xx in range(size):
            t.put(x + xx, y + yy, jitter(G_EYE_WHITE, t.rnd, 6))
    t.put(x + size // 2, y + size // 2, hexc("#c06010"))
    if size >= 3:
        t.put(x + size // 2, y + size // 2 - 1, G_IRIS)
    # 血管
    t.put(x - 1, y + size // 2, hexc("#b02020"))
    t.put(x + size, y + size // 2, hexc("#b02020"))


def g_birkin(stage):
    skin = [hexc("#c8b8a8"), hexc("#bcaa98")]
    coat = [hexc("#d9d9d0"), hexc("#cfcfc4"), hexc("#e2e2da")]
    pants = [hexc("#3a3a40"), hexc("#323238")]
    if stage == 3:
        skin = G_FLESH
        coat = G_FLESH
        pants = G_FLESH

    def extra(t, r):
        blood(t, r, 0.8 + stage * 0.4)
        # 右腕の巨大な眼球 (第1形態から)
        ax, ay, aw, ah = r["arm"]["front"]
        t.fill((ax, ay, aw, ah), G_FLESH, 14)
        big_eye(t, ax + 0, ay + 3, 3)
        for k in ("left", "right", "back", "top", "bottom"):
            t.fill(r["arm"][k], G_FLESH, 14)
        if stage >= 2:
            # 肉の侵食が胴と頭へ広がる
            bx, by, bw, bh = r["body"]["front"]
            t.fill((bx, by, bw // 2 + 1, bh), G_FLESH, 14)
            big_eye(t, bx + 1, by + 2, 2)
            t.fill(r["body"]["right"], G_FLESH, 14)
            hx, hy, hw, hh = r["head"]["front"]
            t.splotch((hx, hy, hw, hh), G_FLESH, 6, (1, 2))
            t.splotch(r["leg"]["front"], G_FLESH, 4, (1, 2))
        if stage == 3:
            # 全身の目と牙の並ぶ口
            for k in ("back", "left", "right"):
                x, y, w, h = r["body"][k]
                big_eye(t, x + max(0, w // 2 - 1), y + 3, 2)
            hx, hy, _, _ = r["head"]["front"]
            for x in range(hx + 1, hx + 7):
                t.put(x, hy + 6, hexc("#1a0508"))
                t.put(x, hy + 5 + (x % 2), hexc("#f0ead0"))
            big_eye(t, hx + 2, hy + 1, 3)
    eyes = (G_EYE_WHITE, hexc("#c06010")) if stage < 3 else None
    return humanoid(f"g_birkin_{stage}", 10 + stage, skin, coat, pants, eyes, extra)


def g_adult():
    t = Tex(64, 32, 20)
    vein = hexc("#c03050")
    for part, b in SPIDER.items():
        fs = t.box(b, G_FLESH, 14)
        if part != "leg":
            for rect in fs.values():
                t.drip(rect, vein, 2)
    hx, hy, hw, hh = faces(*SPIDER["head"])["front"]
    # 頭の正面を埋め尽くす巨大な眼球
    for yy in range(hy + 1, hy + 7):
        for xx in range(hx + 1, hx + 7):
            t.put(xx, yy, jitter(G_EYE_WHITE, t.rnd, 6))
    for yy in range(hy + 3, hy + 5):
        for xx in range(hx + 3, hx + 5):
            t.put(xx, yy, G_IRIS)
    t.put(hx + 3, hy + 3, hexc("#201008"))
    t.put(hx + 4, hy + 4, hexc("#201008"))
    t.drip((hx + 1, hy + 1, 6, 6), hexc("#d04040"), 3)
    # 胴体の背中に小さな目
    bx, by, bw, bh = faces(*SPIDER["body"])["top"]
    for i in range(4):
        big_eye(t, bx + 1 + (i % 2) * 5, by + 2 + (i // 2) * 5, 2)
    # 脚先の爪
    lx, ly, lw, lh = faces(*SPIDER["leg"])["front"]
    t.fill((lx + lw - 3, ly, 3, lh), [hexc("#e0d8c0")], 8)
    return t


def g_embryo():
    t = Tex(64, 32, 21)
    pal = [hexc("#c87a90"), hexc("#b86880"), hexc("#d890a0")]
    for name, b in SILVERFISH.items():
        fs = t.box(b, pal if name.startswith("seg") else G_FLESH, 12)
        t.splotch(fs["top"], [hexc("#6a2040"), hexc("#f0d8a0")], 2, (1, 1))
    hx, hy, _, _ = faces(*SILVERFISH["seg0"])["front"]
    t.put(hx, hy, G_IRIS)
    t.put(hx + 2, hy, G_IRIS)
    return t


# ---- 冬虫夏草 --------------------------------------------------------------

FUNGUS = [hexc("#b89a5a"), hexc("#a68848"), hexc("#c8aa6a"), hexc("#8a7038")]
FUNGUS_DARK = [hexc("#5a4a2a"), hexc("#4a3c20"), hexc("#6a5832")]
SPORE_ORANGE = [hexc("#d08a30"), hexc("#e0a040"), hexc("#b87020")]


def fungal_growth(t, rect, density):
    t.splotch(rect, FUNGUS + SPORE_ORANGE[:1], density, (1, 2))
    t.splotch(rect, FUNGUS_DARK, max(1, density // 3), (1, 1))


def cordyceps_runner():
    skin = [hexc("#9a8a6a"), hexc("#8e7e60"), hexc("#a49476")]
    shirt = [hexc("#5a5a4a"), hexc("#50503f"), hexc("#646452")]
    pants = [hexc("#3d4a3a"), hexc("#354131")]

    def extra(t, r):
        blood(t, r, 0.6, "#4a2a10")
        hx, hy, hw, hh = r["head"]["front"]
        fungal_growth(t, (hx, hy, 4, 4), 4)       # 顔の左上を覆う菌
        fungal_growth(t, r["head"]["right"], 5)
        fungal_growth(t, r["head"]["top"], 6)
        fungal_growth(t, r["body"]["top"], 3)     # 肩
        fungal_growth(t, r["arm"]["top"], 3)
        t.splotch(r["body"]["front"], SPORE_ORANGE, 3, (1, 1))
    return humanoid("cordyceps_runner", 30, skin, shirt, pants, (hexc("#e8e0c0"), hexc("#6a5020")), extra)


def cordyceps_clicker():
    skin = [hexc("#8a7a5a"), hexc("#7e6e50")]
    shirt = [hexc("#4a4a3a"), hexc("#424234")]
    pants = [hexc("#33402f"), hexc("#2c3829")]

    def extra(t, r):
        # 頭は完全に菌の板に覆われ、目はない。正面に縦の裂け目
        for k, rect in r["head"].items():
            t.fill(rect, FUNGUS, 16)
            t.splotch(rect, FUNGUS_DARK, 4, (1, 1))
        hx, hy, _, _ = r["head"]["front"]
        for y in range(hy + 1, hy + 7):
            t.put(hx + 3 + (y % 2), y, hexc("#2a1a0a"))
            t.put(hx + 4 - (y % 2), y, hexc("#401a10"))
        fungal_growth(t, r["body"]["front"], 6)
        fungal_growth(t, r["body"]["back"], 6)
        fungal_growth(t, r["arm"]["front"], 3)

    def plates(t, hat):
        # 帽子レイヤーで頭から突き出た菌の板 (まだらに透明)
        for k, rect in hat.items():
            if k == "bottom":
                continue
            x0, y0, w, h = rect
            for y in range(y0, y0 + h):
                for x in range(x0, x0 + w):
                    if t.rnd.random() < (0.55 if k == "top" else 0.3) and (k == "top" or y - y0 < 5):
                        t.put(x, y, jitter(t.rnd.choice(FUNGUS + FUNGUS_DARK), t.rnd, 14))
    return humanoid("cordyceps_clicker", 31, skin, shirt, pants, None, extra, plates)


def cordyceps_bloater():
    plate = FUNGUS_DARK + FUNGUS[:2]

    def extra(t, r):
        for part in ("head", "body", "arm", "leg"):
            for k, rect in r[part].items():
                t.fill(rect, plate, 18)
                t.splotch(rect, SPORE_ORANGE, 3 if part == "body" else 1, (1, 2))
                t.drip(rect, hexc("#2a2010"), 1)
        hx, hy, _, _ = r["head"]["front"]
        for x in range(hx + 1, hx + 7):  # 菌の裂け目からのぞく口
            t.put(x, hy + 5, hexc("#1a1008"))
    return humanoid("cordyceps_bloater", 32, plate, plate, plate, None, extra)


# ---- ゼノモーフ ------------------------------------------------------------

CHITIN = [hexc("#141418"), hexc("#1b1b22"), hexc("#101014")]
CHITIN_SHINE = hexc("#3a4a5a")
ACID = hexc("#a8e030")


def ribbed(t, rect, shine, every=2):
    t.stripes(rect, shine, every, vertical=False)


def xeno_drone():
    t = Tex(64, 32, 40)
    for part, b in SPIDER.items():
        fs = t.box(b, CHITIN, 6)
        if part == "body":
            ribbed(t, fs["top"], CHITIN_SHINE, 3)
            ribbed(t, fs["left"], CHITIN_SHINE, 3)
            ribbed(t, fs["right"], CHITIN_SHINE, 3)
        if part == "leg":
            for rect in fs.values():
                t.stripes(rect, hexc("#26262e"), 4, vertical=True)
    hs = faces(*SPIDER["head"])
    # 長い頭部ドームの光沢
    t.fill((hs["top"][0] + 2, hs["top"][1], 4, 8), [hexc("#2a3440"), hexc("#334050")], 6)
    hx, hy, _, _ = hs["front"]
    for x in range(hx + 1, hx + 7):  # 銀色の歯
        t.put(x, hy + 5, hexc("#c8ccd0") if x % 2 else hexc("#8a9098"))
        t.put(x, hy + 6, hexc("#c8ccd0") if x % 2 == 0 else hexc("#202024"))
    t.drip((hx + 2, hy + 7, 4, 1), ACID, 2)
    return t


def xeno_warrior():
    t = Tex(64, 32, 41)
    pal = [hexc("#1e1812"), hexc("#241c14"), hexc("#18130e")]
    for part, b in SPIDER.items():
        fs = t.box(b, pal, 6)
        if part in ("body", "neck"):
            for k in ("top", "left", "right"):
                ribbed(t, fs[k], hexc("#4a3a22"), 2)
    hs = faces(*SPIDER["head"])
    # 隆起した頭部の稜線
    t.fill((hs["top"][0] + 3, hs["top"][1], 2, 8), [hexc("#5a4628")], 6)
    hx, hy, _, _ = hs["front"]
    for x in range(hx + 1, hx + 7):
        t.put(x, hy + 5, hexc("#d8d0c0") if x % 2 else hexc("#906e48"))
        t.put(x, hy + 6, hexc("#d8d0c0") if x % 2 == 0 else hexc("#120e0a"))
    t.drip((hx + 1, hy + 7, 6, 1), ACID, 3)
    # 尾 (脚) の棘
    lx, ly, lw, lh = faces(*SPIDER["leg"])["front"]
    t.fill((lx + lw - 2, ly, 2, lh), [hexc("#8a7050")], 6)
    return t


def xeno_facehugger():
    t = Tex(64, 32, 42)
    pal = [hexc("#c2b280"), hexc("#b4a470"), hexc("#d0c090")]
    for name, b in SILVERFISH.items():
        fs = t.box(b, pal, 10)
        for rect in fs.values():
            t.stripes(rect, hexc("#9a8a5a"), 2, vertical=True)  # 指の関節
    return t


# ---- 寄生体 ----------------------------------------------------------------

PARASITE = [hexc("#8a4b1f"), hexc("#7a4018"), hexc("#9a5826")]
PARASITE_SPOT = [hexc("#e0b030"), hexc("#d09a20")]


def parasite_swarmer():
    t = Tex(64, 32, 50)
    for name, b in SILVERFISH.items():
        fs = t.box(b, PARASITE, 12)
        t.splotch(fs["top"], PARASITE_SPOT, 2, (1, 1))
    hx, hy, _, _ = faces(*SILVERFISH["seg0"])["front"]
    t.put(hx, hy, hexc("#40ff60"))
    t.put(hx + 2, hy, hexc("#40ff60"))
    return t


def parasite_crawler():
    t = Tex(64, 32, 51)
    pal = [hexc("#6a2a18"), hexc("#7a3220"), hexc("#5a2214")]
    for part, b in SPIDER.items():
        fs = t.box(b, pal, 10)
        if part == "body":
            t.stripes(fs["top"], hexc("#d07a20"), 3, vertical=False)
            t.stripes(fs["left"], hexc("#d07a20"), 3, vertical=False)
            t.stripes(fs["right"], hexc("#d07a20"), 3, vertical=False)
    hx, hy, _, _ = faces(*SPIDER["head"])["front"]
    for (ex, ey) in ((1, 2), (5, 2), (2, 4), (4, 4), (3, 1)):  # 複数の緑の眼点
        t.put(hx + ex, hy + ey, hexc("#40ff60"))
        t.put(hx + ex + 1, hy + ey, hexc("#20c040"))
    return t


def parasite_assimilated():
    skin = [hexc("#b09080"), hexc("#a08070")]
    shirt = [hexc("#4a3a30"), hexc("#3f3128")]
    pants = [hexc("#2e2a26"), hexc("#26231f")]

    def extra(t, r):
        # 寄生組織が肌と服を置き換え、触手の筋が這う
        for part in ("body", "arm", "head", "leg"):
            for k, rect in r[part].items():
                t.splotch(rect, PARASITE, 4 if part != "leg" else 2, (1, 2))
                t.drip(rect, hexc("#d08a30"), 1)
        bx, by, bw, bh = r["body"]["front"]
        for y in (by + 3, by + 5, by + 7):  # むき出しの肋骨
            for x in range(bx + 1, bx + bw - 1):
                if x != bx + 3 and x != bx + 4:
                    t.put(x, y, hexc("#e0d4b8"))
        t.fill((bx + 3, by + 2, 2, 7), [hexc("#5a1a10")], 6)
        t.splotch(r["head"]["front"], PARASITE_SPOT, 2, (1, 1))
    return humanoid("parasite_assimilated", 52, skin, shirt, pants, (hexc("#f0d040"), hexc("#ff8000")), extra)


# ---- リッカー --------------------------------------------------------------

def licker():
    t = Tex(64, 32, 4)
    muscle = [hexc("#a0282a"), hexc("#8a1e20"), hexc("#b43436"), hexc("#7a1a1c")]
    sinew = hexc("#e8b0a0")
    for part, b in SPIDER.items():
        fs = t.box(b, muscle, 14)
        for rect in fs.values():
            t.stripes(rect, hexc("#6a1012"), 3, vertical=part == "leg")
        if part == "body":
            t.drip(fs["top"], sinew, 4)
    hs = faces(*SPIDER["head"])
    # むき出しの脳 (頭の上面と後ろ上部)
    brain = [hexc("#e8a0a8"), hexc("#d88a94"), hexc("#f0b4bc")]
    t.fill(hs["top"], brain, 10)
    t.stripes(hs["top"], hexc("#b06070"), 2, vertical=True)
    for k in ("left", "right", "back", "front"):
        x, y, w, h = hs[k]
        t.fill((x, y, w, 3), brain, 10)
    # 目のない顔: 牙の並ぶ大きな口
    hx, hy, _, _ = hs["front"]
    for x in range(hx + 1, hx + 7):
        t.put(x, hy + 5, hexc("#f0ead0") if x % 2 else hexc("#2a0606"))
        t.put(x, hy + 6, hexc("#2a0606"))
        t.put(x, hy + 7, hexc("#f0ead0") if x % 2 == 0 else hexc("#2a0606"))
    # 鉤爪
    lx, ly, lw, lh = faces(*SPIDER["leg"])["front"]
    t.fill((lx + lw - 3, ly, 3, lh), [hexc("#e8e0c8")], 8)
    return t


# ---------------------------------------------------------------------------

ALL = {
    "t_zombie": t_zombie,
    "crimson_head": crimson_head,
    "licker": licker,
    "tyrant": tyrant,
    "g_birkin_1": lambda: g_birkin(1),
    "g_birkin_2": lambda: g_birkin(2),
    "g_birkin_3": lambda: g_birkin(3),
    "g_adult": g_adult,
    "g_embryo": g_embryo,
    "cordyceps_runner": cordyceps_runner,
    "cordyceps_clicker": cordyceps_clicker,
    "cordyceps_bloater": cordyceps_bloater,
    "xeno_facehugger": xeno_facehugger,
    "xeno_drone": xeno_drone,
    "xeno_warrior": xeno_warrior,
    "parasite_swarmer": parasite_swarmer,
    "parasite_crawler": parasite_crawler,
    "parasite_assimilated": parasite_assimilated,
}


def main():
    images = []
    for name, fn in ALL.items():
        tex = fn()
        print("wrote", os.path.relpath(tex.save(name), ROOT))
        images.append((name, tex.img))
    # 確認用の一覧 (6 倍拡大)
    scale, cols = 6, 3
    cell_w, cell_h = 64 * scale, 64 * scale + 14
    rows = (len(images) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * cell_w, rows * cell_h), (60, 60, 70, 255))
    draw = ImageDraw.Draw(sheet)
    for i, (name, img) in enumerate(images):
        x, y = (i % cols) * cell_w, (i // cols) * cell_h
        big = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
        sheet.alpha_composite(big, (x, y + 14))
        draw.text((x + 4, y + 1), name, fill=(255, 255, 255, 255))
    sheet.save(os.path.join(ROOT, "tools", "preview_factions.png"))


if __name__ == "__main__":
    main()
