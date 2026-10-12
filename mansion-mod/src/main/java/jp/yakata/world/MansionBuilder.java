package jp.yakata.world;

import jp.yakata.YakataMod;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.RandomSource;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.decoration.HangingEntity;
import net.minecraft.world.entity.decoration.ItemFrame;
import net.minecraft.world.entity.decoration.painting.Painting;
import net.minecraft.world.entity.item.ItemEntity;
import net.minecraft.world.item.DyeColor;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.CrossCollisionBlock;
import net.minecraft.world.level.block.StairBlock;
import net.minecraft.world.level.block.VineBlock;
import net.minecraft.world.level.block.WallBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BedPart;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.DoorHingeSide;
import net.minecraft.world.level.block.state.properties.DoubleBlockHalf;
import net.minecraft.world.level.block.state.properties.Half;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.SlabType;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.Vec3;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 3x3 部屋の洋館を建てる。
 * <p>ローカル座標: x=東, z=南, y=0 が床ブロック。部屋の内寸は 11x11, 高さ 6 (y1..6), 天井 y7,
 * 壁は 1 ブロック厚で隣室と共有 (x,z が 12 の倍数の線)。外形 37x37 + 南側ポーチ + 屋根。
 */
public final class MansionBuilder {
	public static final int ROOM = 11;
	public static final int CELL = ROOM + 1;
	public static final int SIZE = 3 * CELL + 1; // 37
	public static final int CEILING = 7;
	public static final List<String> ROOM_NAMES = List.of(
		"library", "hall", "bedroom", "dining", "lobby", "study", "kitchen", "gallery", "cellar");

	/** 整地範囲 (ローカル)。ポーチ・前庭の小道を含む */
	static final int SITE_MIN = -4, SITE_MAX_X = SIZE + 3, SITE_MAX_Z = SIZE + 12;
	static final int CLEAR_HEIGHT = 34;
	/** 入口 (ギャラリー南壁) の x */
	static final int ENTRANCE_X = CELL + 1 + 5;

	private MansionBuilder() {}

	/** ロビー中心の柱 (x,z) と地表 y から原点 (北西下端, y=床) を求める */
	public static BlockPos originForLobby(int x, int groundTop, int z) {
		return new BlockPos(x - (CELL + 6), groundTop + 1, z - (CELL + 6));
	}

	/** MansionInfo を原点から埋める */
	public static void publish(BlockPos origin) {
		MansionInfo.built = true;
		MansionInfo.origin = origin.immutable();
		MansionInfo.roomCenters.clear();
		MansionInfo.roomNames.clear();
		for (int i = 0; i < 9; i++) {
			MansionInfo.roomCenters.add(origin.offset(roomMinX(i) + 5, 1, roomMinZ(i) + 5));
			MansionInfo.roomNames.add(ROOM_NAMES.get(i));
		}
		MansionInfo.spawn = MansionInfo.roomCenters.get(4);
	}

	public static void reset() {
		MansionInfo.built = false;
		MansionInfo.origin = BlockPos.ZERO;
		MansionInfo.roomCenters.clear();
		MansionInfo.roomNames.clear();
		MansionInfo.spawn = BlockPos.ZERO;
	}

	static int roomMinX(int index) {
		return 1 + CELL * (index % 3);
	}

	static int roomMinZ(int index) {
		return 1 + CELL * (index / 3);
	}

	/**
	 * (x,z) をロビー中心として建てる。groundTop が null なら地表 (高さマップの中央値) を使う。
	 * 範囲内のチャンクは建築中だけ強制ロードし、終了後に解放する。
	 * @return 原点
	 */
	public static BlockPos build(ServerLevel level, int x, int z, Integer groundTop) {
		long start = System.currentTimeMillis();
		BlockPos rough = originForLobby(x, 0, z);
		List<ChunkPos> forced = forceLoad(level, rough.getX(), rough.getZ());
		try {
			int ground = groundTop != null ? groundTop : surfaceMedian(level, rough.getX(), rough.getZ());
			ground = Math.max(level.getMinY() + 3, Math.min(ground, level.getMaxY() - 48));
			BlockPos origin = originForLobby(x, ground, z);
			Canvas c = new Canvas(level, origin, RandomSource.create(origin.asLong() ^ 0x5EED_7A7AL));
			c.clearEntities();
			prepareSite(c);
			buildShell(c);
			buildDoorways(c);
			buildWindows(c);
			buildEntrance(c);
			buildRoof(c);
			buildPorch(c);
			for (int i = 0; i < 9; i++) {
				new RoomDecorator(c, i, roomMinX(i), roomMinZ(i)).decorate();
			}
			addDecay(c);
			c.finish();
			YakataMod.LOGGER.info("洋館を建設しました: origin={} blocks={} skipped={} ({} ms)",
				origin.toShortString(), c.placed, c.skipped, System.currentTimeMillis() - start);
			return origin;
		} finally {
			for (ChunkPos cp : forced) {
				level.setChunkForced(cp.x(), cp.z(), false);
			}
		}
	}

	/** 範囲内の未強制チャンクを強制ロードし、自分が強制したものを返す (setChunkForced は同期ロードする) */
	private static List<ChunkPos> forceLoad(ServerLevel level, int ox, int oz) {
		List<ChunkPos> forced = new ArrayList<>();
		int cx0 = (ox + SITE_MIN) >> 4, cx1 = (ox + SITE_MAX_X) >> 4;
		int cz0 = (oz + SITE_MIN) >> 4, cz1 = (oz + SITE_MAX_Z) >> 4;
		for (int cx = cx0; cx <= cx1; cx++) {
			for (int cz = cz0; cz <= cz1; cz++) {
				if (level.setChunkForced(cx, cz, true)) {
					forced.add(new ChunkPos(cx, cz));
				}
				level.getChunk(cx, cz);
			}
		}
		return forced;
	}

	/** 建物範囲の地表 (最上部の固体ブロック y) の中央値 */
	private static int surfaceMedian(ServerLevel level, int ox, int oz) {
		int[] ys = new int[25];
		int n = 0;
		for (int i = 0; i < 5; i++) {
			for (int j = 0; j < 5; j++) {
				ys[n++] = level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, ox + i * 9, oz + j * 9) - 1;
			}
		}
		Arrays.sort(ys);
		return ys[12];
	}

	// ------------------------------------------------------------------ 整地

	private static boolean underBuilding(int x, int z) {
		boolean house = x >= 0 && x < SIZE && z >= 0 && z < SIZE;
		boolean porch = x >= 11 && x <= 25 && z >= SIZE && z <= SIZE + 6;
		return house || porch;
	}

	private static void prepareSite(Canvas c) {
		for (int x = SITE_MIN; x <= SITE_MAX_X; x++) {
			for (int z = SITE_MIN; z <= SITE_MAX_Z; z++) {
				for (int y = 0; y <= CLEAR_HEIGHT; y++) {
					c.setIfNotAir(x, y, z, Blocks.AIR.defaultBlockState());
				}
				boolean building = underBuilding(x, z);
				if (building) {
					for (int y = -1; y >= -3; y--) {
						c.set(x, y, z, c.rnd.nextFloat() < 0.2f ? Blocks.MOSSY_COBBLESTONE.defaultBlockState() : Blocks.STONE_BRICKS.defaultBlockState());
					}
				} else {
					boolean path = x >= ENTRANCE_X - 1 && x <= ENTRANCE_X + 1 && z > SIZE + 6;
					BlockState top = path ? (c.rnd.nextFloat() < 0.25f ? Blocks.GRAVEL : Blocks.DIRT_PATH).defaultBlockState()
						: c.rnd.nextFloat() < 0.15f ? Blocks.COARSE_DIRT.defaultBlockState() : Blocks.GRASS_BLOCK.defaultBlockState();
					c.set(x, -1, z, top);
					c.set(x, -2, z, Blocks.DIRT.defaultBlockState());
					c.set(x, -3, z, Blocks.DIRT.defaultBlockState());
				}
				// 非平坦地形: 宙に浮かないよう下を埋める
				BlockState fillState = building ? Blocks.STONE_BRICKS.defaultBlockState() : Blocks.DIRT.defaultBlockState();
				for (int y = -4; y >= -24; y--) {
					BlockState s = c.get(x, y, z);
					if (!s.isAir() && s.getFluidState().isEmpty() && !s.canBeReplaced()) {
						break;
					}
					c.set(x, y, z, fillState);
				}
			}
		}
	}

	// ------------------------------------------------------------------ 外殻

	private static boolean isWallLine(int v) {
		return v % CELL == 0;
	}

	private static boolean isExterior(int x, int z) {
		return x == 0 || z == 0 || x == SIZE - 1 || z == SIZE - 1;
	}

	private static void buildShell(Canvas c) {
		for (int x = 0; x < SIZE; x++) {
			for (int z = 0; z < SIZE; z++) {
				boolean wx = isWallLine(x), wz = isWallLine(z);
				boolean wall = wx || wz;
				boolean ext = isExterior(x, z);
				c.set(x, 0, z, (wall ? Blocks.POLISHED_BLACKSTONE_BRICKS : Blocks.DARK_OAK_PLANKS).defaultBlockState());
				if (ext) {
					c.set(x, CEILING, z, Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState());
				} else if (!wall && (z % CELL) % 3 == 0) {
					c.set(x, CEILING, z, axis(Blocks.STRIPPED_DARK_OAK_LOG, Direction.Axis.X)); // 天井の梁
				} else {
					c.set(x, CEILING, z, Blocks.DARK_OAK_PLANKS.defaultBlockState());
				}
				if (!wall) {
					continue;
				}
				for (int y = 1; y < CEILING; y++) {
					c.set(x, y, z, wallBlock(c, x, y, z, wx && wz, ext));
				}
			}
		}
		// 基壇の縁 (外周に石レンガの階段)
		for (int i = -1; i <= SIZE; i++) {
			plinth(c, i, -1, Direction.SOUTH);
			plinth(c, -1, i, Direction.EAST);
			plinth(c, SIZE, i, Direction.WEST);
			if (i < 11 || i > 25) {
				plinth(c, i, SIZE, Direction.NORTH);
			}
		}
	}

	private static void plinth(Canvas c, int x, int z, Direction toward) {
		c.set(x, 0, z, stair(Blocks.STONE_BRICK_STAIRS, toward, false));
	}

	private static BlockState wallBlock(Canvas c, int x, int y, int z, boolean junction, boolean ext) {
		if (ext) {
			if (junction) {
				return (y == CEILING - 1 ? Blocks.CHISELED_DEEPSLATE : Blocks.DEEPSLATE_TILES).defaultBlockState();
			}
			if (y == 1) {
				return Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState();
			}
			return weatheredStone(c);
		}
		if (junction) {
			return axis(Blocks.STRIPPED_DARK_OAK_LOG, Direction.Axis.Y);
		}
		if (y == 1) {
			return Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState();
		}
		if (y == CEILING - 1) {
			return axis(Blocks.STRIPPED_DARK_OAK_LOG, isWallLine(x) ? Direction.Axis.Z : Direction.Axis.X);
		}
		return Blocks.DARK_OAK_PLANKS.defaultBlockState();
	}

	static BlockState weatheredStone(Canvas c) {
		float r = c.rnd.nextFloat();
		if (r < 0.18f) return Blocks.CRACKED_STONE_BRICKS.defaultBlockState();
		if (r < 0.32f) return Blocks.MOSSY_STONE_BRICKS.defaultBlockState();
		return Blocks.STONE_BRICKS.defaultBlockState();
	}

	/** 隣接する部屋の間に幅3・高さ3のアーチ開口 */
	private static void buildDoorways(Canvas c) {
		for (int wall = 1; wall <= 2; wall++) {
			int line = wall * CELL;
			for (int k = 0; k < 3; k++) {
				int mid = k * CELL + 6;
				for (int y = 1; y <= 3; y++) {
					for (int d = -1; d <= 1; d++) {
						c.set(line, y, mid + d, Blocks.AIR.defaultBlockState());   // 東西の仕切り
						c.set(mid + d, y, line, Blocks.AIR.defaultBlockState());   // 南北の仕切り
					}
				}
				BlockState trim = Blocks.POLISHED_BLACKSTONE_BRICK_STAIRS.defaultBlockState();
				c.setRaw(line, 3, mid - 1, stair(trim.getBlock(), Direction.NORTH, true));
				c.setRaw(line, 3, mid + 1, stair(trim.getBlock(), Direction.SOUTH, true));
				c.setRaw(mid - 1, 3, line, stair(trim.getBlock(), Direction.WEST, true));
				c.setRaw(mid + 1, 3, line, stair(trim.getBlock(), Direction.EAST, true));
			}
		}
	}

	/** 外壁の窓 (各部屋の外側の面に 2x 幅2・高さ3)。地下倉庫は鉄格子 */
	private static void buildWindows(Canvas c) {
		for (int i = 0; i < 9; i++) {
			int col = i % 3, row = i / 3;
			int bx = roomMinX(i), bz = roomMinZ(i);
			boolean cellar = ROOM_NAMES.get(i).equals("cellar");
			for (int off : new int[] {2, 3, 7, 8}) {
				if (row == 0) window(c, bx + off, 0, cellar);
				if (row == 2) window(c, bx + off, SIZE - 1, cellar);
				if (col == 0) window(c, 0, bz + off, cellar);
				if (col == 2) window(c, SIZE - 1, bz + off, cellar);
			}
		}
	}

	private static void window(Canvas c, int x, int z, boolean bars) {
		for (int y = 2; y <= 4; y++) {
			BlockState s;
			if (bars) {
				s = Blocks.IRON_BARS.defaultBlockState();
			} else if (c.rnd.nextFloat() < 0.12f) {
				s = c.rnd.nextBoolean() ? Blocks.COBWEB.defaultBlockState() : Blocks.AIR.defaultBlockState(); // 割れた窓
			} else {
				s = Blocks.GLASS_PANE.defaultBlockState();
			}
			c.set(x, y, z, s);
		}
		c.set(x, 5, z, Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState()); // まぐさ
	}

	private static void buildEntrance(Canvas c) {
		int z = SIZE - 1, x = ENTRANCE_X;
		for (int y = 1; y <= 4; y++) {
			c.set(x - 1, y, z, Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState());
			c.set(x + 1, y, z, Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState());
		}
		c.door(x, 1, z, Blocks.DARK_OAK_DOOR, Direction.NORTH, DoorHingeSide.LEFT);
		c.set(x, 3, z, Blocks.GLASS_PANE.defaultBlockState());
		c.set(x, 4, z, Blocks.CHISELED_POLISHED_BLACKSTONE.defaultBlockState());
		c.set(x - 1, 5, z, Blocks.CHISELED_STONE_BRICKS.defaultBlockState());
		c.set(x + 1, 5, z, Blocks.CHISELED_STONE_BRICKS.defaultBlockState());
		c.set(x, 5, z, Blocks.CHISELED_POLISHED_BLACKSTONE.defaultBlockState());
	}

	// ------------------------------------------------------------------ 屋根

	/** 寄棟屋根 (深層岩タイルの階段)。1 ブロックの軒の出、頂部に尖塔、煙突 2 本 */
	private static void buildRoof(Canvas c) {
		Block roof = Blocks.DEEPSLATE_TILE_STAIRS;
		int layer = 0;
		for (; ; layer++) {
			int min = -1 + layer, max = SIZE - layer;
			int y = CEILING + 1 + layer;
			if (min > max) break;
			if (min == max) {
				c.set(min, y, min, Blocks.DEEPSLATE_TILE_SLAB.defaultBlockState());
				break;
			}
			for (int v = min; v <= max; v++) {
				c.set(v, y, min, stair(roof, Direction.SOUTH, false));
				c.set(v, y, max, stair(roof, Direction.NORTH, false));
				if (v != min && v != max) {
					c.set(min, y, v, stair(roof, Direction.EAST, false));
					c.set(max, y, v, stair(roof, Direction.WEST, false));
				}
			}
			if (layer == 0) {
				// 軒下 (逆さ階段)
				for (int v = min; v <= max; v++) {
					c.set(v, y - 1, min, stair(Blocks.DARK_OAK_STAIRS, Direction.SOUTH, true));
					c.set(v, y - 1, max, stair(Blocks.DARK_OAK_STAIRS, Direction.NORTH, true));
					c.set(min, y - 1, v, stair(Blocks.DARK_OAK_STAIRS, Direction.EAST, true));
					c.set(max, y - 1, v, stair(Blocks.DARK_OAK_STAIRS, Direction.WEST, true));
				}
			}
		}
		int top = CEILING + 1 + layer;
		int mid = SIZE / 2;
		c.set(mid, top + 1, mid, Blocks.POLISHED_BLACKSTONE_WALL.defaultBlockState());
		c.set(mid, top + 2, mid, Blocks.POLISHED_BLACKSTONE_WALL.defaultBlockState());
		c.set(mid, top + 3, mid, Blocks.IRON_BARS.defaultBlockState());
		chimney(c, 5, 6, 30, 31);                   // 台所
		chimney(c, ENTRANCE_X - 1, ENTRANCE_X, 1, 2);      // 大広間の暖炉 (同じ x 列)
	}

	private static void chimney(Canvas c, int x0, int x1, int z0, int z1) {
		int d = Math.min(Math.min(x0, z0), Math.min(SIZE - 1 - x1, SIZE - 1 - z1));
		int top = CEILING + 2 + d + 3;
		for (int x = x0; x <= x1; x++) {
			for (int z = z0; z <= z1; z++) {
				for (int y = CEILING + 1; y <= top; y++) {
					c.set(x, y, z, (y == top ? Blocks.CHISELED_POLISHED_BLACKSTONE : Blocks.POLISHED_BLACKSTONE_BRICKS).defaultBlockState());
				}
			}
		}
		c.set(x0, top + 1, z0, with(Blocks.CAMPFIRE.defaultBlockState(), BlockStateProperties.SIGNAL_FIRE, false));
	}

	// ------------------------------------------------------------------ ポーチ

	private static void buildPorch(Canvas c) {
		int z0 = SIZE, z1 = SIZE + 4, x0 = 12, x1 = 24;
		for (int x = x0 - 1; x <= x1 + 1; x++) {
			for (int z = z0; z <= z1 + 1; z++) {
				boolean edge = x < x0 || x > x1 || z > z1;
				if (!edge) {
					c.set(x, 0, z, ((x + z) % 2 == 0 ? Blocks.POLISHED_BLACKSTONE_BRICKS : Blocks.DEEPSLATE_TILES).defaultBlockState());
				}
				// 屋根
				if (z == z1 + 1) {
					c.set(x, 5, z, stair(Blocks.DEEPSLATE_TILE_STAIRS, Direction.NORTH, false));
				} else if (x == x0 - 1) {
					c.set(x, 5, z, stair(Blocks.DEEPSLATE_TILE_STAIRS, Direction.EAST, false));
				} else if (x == x1 + 1) {
					c.set(x, 5, z, stair(Blocks.DEEPSLATE_TILE_STAIRS, Direction.WEST, false));
				} else {
					c.set(x, 5, z, Blocks.DEEPSLATE_TILE_SLAB.defaultBlockState());
				}
			}
		}
		// 柱 (石レンガの塀 + 彫刻石レンガの柱頭) と梁
		for (int x : new int[] {x0, 15, 21, x1}) {
			for (int z : new int[] {z1}) {
				for (int y = 1; y <= 3; y++) c.set(x, y, z, Blocks.STONE_BRICK_WALL.defaultBlockState());
				c.set(x, 4, z, Blocks.CHISELED_STONE_BRICKS.defaultBlockState());
			}
		}
		for (int y = 1; y <= 3; y++) {
			c.set(x0, y, z0, Blocks.STONE_BRICK_WALL.defaultBlockState());
			c.set(x1, y, z0, Blocks.STONE_BRICK_WALL.defaultBlockState());
		}
		c.set(x0, 4, z0, Blocks.CHISELED_STONE_BRICKS.defaultBlockState());
		c.set(x1, 4, z0, Blocks.CHISELED_STONE_BRICKS.defaultBlockState());
		for (int x = x0 + 1; x < x1; x++) {
			if (x != 15 && x != 21) c.set(x, 4, z1, axis(Blocks.DARK_OAK_LOG, Direction.Axis.X));
		}
		for (int z = z0 + 1; z < z1; z++) {
			c.set(x0, 4, z, axis(Blocks.DARK_OAK_LOG, Direction.Axis.Z));
			c.set(x1, 4, z, axis(Blocks.DARK_OAK_LOG, Direction.Axis.Z));
			c.set(x0, 1, z, Blocks.DARK_OAK_FENCE.defaultBlockState());
			c.set(x1, 1, z, Blocks.DARK_OAK_FENCE.defaultBlockState());
		}
		for (int x : new int[] {13, 14, 22, 23}) {
			c.set(x, 1, z1, Blocks.DARK_OAK_FENCE.defaultBlockState());
		}
		c.set(14, 4, z0 + 2, hangingLantern(Blocks.LANTERN));
		c.set(22, 4, z0 + 2, hangingLantern(Blocks.LANTERN));
		// 正面階段
		for (int x = 16; x <= 20; x++) {
			c.set(x, 0, z1 + 1, stair(Blocks.STONE_BRICK_STAIRS, Direction.NORTH, false));
		}
		// 小道の街灯
		for (int x : new int[] {ENTRANCE_X - 3, ENTRANCE_X + 3}) {
			int z = z1 + 5;
			c.set(x, 0, z, Blocks.POLISHED_BLACKSTONE_WALL.defaultBlockState());
			c.set(x, 1, z, Blocks.POLISHED_BLACKSTONE_WALL.defaultBlockState());
			c.set(x, 2, z, Blocks.LANTERN.defaultBlockState());
		}
		// 外の枯れ木の名残
		c.set(5, 0, z1 + 4, Blocks.DEAD_BUSH.defaultBlockState());
		c.set(31, 0, z1 + 3, Blocks.DEAD_BUSH.defaultBlockState());
	}

	// ------------------------------------------------------------------ 荒廃

	/** 蜘蛛の巣・血痕・外壁の蔦 */
	private static void addDecay(Canvas c) {
		for (int i = 0; i < 9; i++) {
			int bx = roomMinX(i), bz = roomMinZ(i);
			int webs = ROOM_NAMES.get(i).equals("cellar") ? 14 : 4;
			for (int n = 0; n < webs; n++) {
				int x = bx + (c.rnd.nextBoolean() ? c.rnd.nextInt(2) : ROOM - 1 - c.rnd.nextInt(2));
				int z = bz + c.rnd.nextInt(ROOM);
				if (c.rnd.nextBoolean()) { int t = x - bx; x = bx + (z - bz); z = bz + t; }
				int y = CEILING - 1 - c.rnd.nextInt(2);
				c.setIfAir(x, y, z, Blocks.COBWEB.defaultBlockState());
			}
			int stains = 1 + c.rnd.nextInt(3);
			for (int n = 0; n < stains; n++) {
				bloodStain(c, bx + 1 + c.rnd.nextInt(ROOM - 2), bz + 1 + c.rnd.nextInt(ROOM - 2));
			}
		}
		// 外壁の蔦
		for (int v = 1; v < SIZE - 1; v++) {
			vine(c, v, -1, Direction.SOUTH);
			vine(c, v, SIZE, Direction.NORTH);
			vine(c, -1, v, Direction.EAST);
			vine(c, SIZE, v, Direction.WEST);
		}
	}

	/** 床を赤いコンクリートパウダーに置き換え、周囲に赤絨毯の飛沫 */
	static void bloodStain(Canvas c, int x, int z) {
		if (!c.isAir(x, 1, z) || c.get(x, 0, z).getBlock() == Blocks.AIR) return;
		BlockState powder = Blocks.CONCRETE_POWDER.pick(DyeColor.RED).defaultBlockState();
		c.set(x, 0, z, powder);
		for (Direction d : Direction.Plane.HORIZONTAL) {
			int nx = x + d.getStepX(), nz = z + d.getStepZ();
			if (c.rnd.nextFloat() < 0.45f && c.isAir(nx, 1, nz) && c.get(nx, 0, nz).isSolid()) {
				c.set(nx, 1, nz, Blocks.CARPET.pick(DyeColor.RED).defaultBlockState());
			}
		}
	}

	private static void vine(Canvas c, int x, int z, Direction toWall) {
		if (c.rnd.nextFloat() > 0.10f) return;
		int wx = x + toWall.getStepX(), wz = z + toWall.getStepZ();
		int len = 2 + c.rnd.nextInt(5);
		for (int y = CEILING - 1; y > CEILING - 1 - len && y >= 1; y--) {
			if (!c.get(wx, y, wz).isSolid() || !c.isAir(x, y, z)) break;
			c.set(x, y, z, Blocks.VINE.defaultBlockState().setValue(VineBlock.getPropertyForFace(toWall), true));
		}
	}

	// ------------------------------------------------------------------ BlockState helpers

	static <T extends Comparable<T>> BlockState with(BlockState s, Property<T> p, T v) {
		return s.hasProperty(p) ? s.setValue(p, v) : s;
	}

	static BlockState facing(Block b, Direction d) {
		BlockState s = b.defaultBlockState();
		if (s.hasProperty(BlockStateProperties.HORIZONTAL_FACING) && d.getAxis().isHorizontal()) {
			return s.setValue(BlockStateProperties.HORIZONTAL_FACING, d);
		}
		return with(s, BlockStateProperties.FACING, d);
	}

	static BlockState stair(Block b, Direction d, boolean upsideDown) {
		return facing(b, d).setValue(StairBlock.HALF, upsideDown ? Half.TOP : Half.BOTTOM);
	}

	static BlockState slab(Block b, SlabType type) {
		return b.defaultBlockState().setValue(BlockStateProperties.SLAB_TYPE, type);
	}

	static BlockState axis(Block b, Direction.Axis a) {
		return with(b.defaultBlockState(), BlockStateProperties.AXIS, a);
	}

	static BlockState hangingLantern(Block lantern) {
		return lantern.defaultBlockState().setValue(BlockStateProperties.HANGING, true);
	}

	static BlockState candles(Block candle, int count) {
		return candle.defaultBlockState().setValue(BlockStateProperties.CANDLES, count).setValue(BlockStateProperties.LIT, true);
	}

	// ------------------------------------------------------------------ Canvas

	/** ローカル座標でブロックを置く小さなラッパー。近傍更新を抑制し、最後に形状 (板ガラス・柵・階段) を確定する */
	static final class Canvas {
		private static final int FLAGS = Block.UPDATE_CLIENTS | Block.UPDATE_KNOWN_SHAPE;
		final ServerLevel level;
		final BlockPos origin;
		final RandomSource rnd;
		private final List<BlockPos> reshape = new ArrayList<>();
		private final List<Runnable> entities = new ArrayList<>();
		int placed, skipped;

		Canvas(ServerLevel level, BlockPos origin, RandomSource rnd) {
			this.level = level;
			this.origin = origin;
			this.rnd = rnd;
		}

		BlockPos pos(int x, int y, int z) {
			return origin.offset(x, y, z);
		}

		BlockState get(int x, int y, int z) {
			return level.getBlockState(pos(x, y, z));
		}

		boolean isAir(int x, int y, int z) {
			return get(x, y, z).isAir();
		}

		/** 形状の再計算対象に登録して置く */
		void set(int x, int y, int z, BlockState s) {
			BlockPos p = pos(x, y, z);
			if (place(p, s)) {
				Block b = s.getBlock();
				if (b instanceof CrossCollisionBlock || b instanceof WallBlock || b instanceof StairBlock) {
					reshape.add(p);
				}
			}
		}

		/** 形状を再計算しない (アーチの階段など、向きを固定したいもの) */
		void setRaw(int x, int y, int z, BlockState s) {
			place(pos(x, y, z), s);
		}

		void setIfAir(int x, int y, int z, BlockState s) {
			if (isAir(x, y, z)) set(x, y, z, s);
		}

		void setIfNotAir(int x, int y, int z, BlockState s) {
			if (!isAir(x, y, z)) set(x, y, z, s);
		}

		void fill(int x0, int y0, int z0, int x1, int y1, int z1, BlockState s) {
			for (int x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
				for (int y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
					for (int z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
						set(x, y, z, s);
		}

		private boolean place(BlockPos p, BlockState s) {
			if (!level.isInWorldBounds(p) || !level.hasChunkAt(p)) {
				skipped++;
				return false;
			}
			level.setBlock(p, s, FLAGS);
			placed++;
			return true;
		}

		void door(int x, int y, int z, Block door, Direction facing, DoorHingeSide hinge) {
			BlockState s = facing(door, facing).setValue(BlockStateProperties.DOOR_HINGE, hinge);
			setRaw(x, y, z, s.setValue(BlockStateProperties.DOUBLE_BLOCK_HALF, DoubleBlockHalf.LOWER));
			setRaw(x, y + 1, z, s.setValue(BlockStateProperties.DOUBLE_BLOCK_HALF, DoubleBlockHalf.UPPER));
		}

		/** (x,z) を足側として head 方向に 2 ブロックのベッド */
		void bed(int x, int y, int z, Block bed, Direction head) {
			BlockState s = facing(bed, head);
			setRaw(x, y, z, s.setValue(BlockStateProperties.BED_PART, BedPart.FOOT));
			setRaw(x + head.getStepX(), y, z + head.getStepZ(), s.setValue(BlockStateProperties.BED_PART, BedPart.HEAD));
		}

		/** (x,y,z) の空気ブロックに、背後の壁から facing 向きの絵画 (入る最大サイズをランダム) */
		void painting(int x, int y, int z, Direction facing) {
			BlockPos p = pos(x, y, z);
			entities.add(() -> Painting.create(level, p, facing).ifPresent(level::addFreshEntity));
		}

		void itemFrame(int x, int y, int z, Direction facing, ItemStack item) {
			BlockPos p = pos(x, y, z);
			entities.add(() -> {
				ItemFrame frame = new ItemFrame(level, p, facing);
				frame.setItem(item, false);
				if (frame.survives()) level.addFreshEntity(frame);
			});
		}

		void afterBlocks(Runnable r) {
			entities.add(r);
		}

		/** 以前の建築の額縁・絵画・落ちたアイテムを除去 */
		void clearEntities() {
			AABB box = new AABB(corner(SITE_MIN, -2, SITE_MIN), corner(SITE_MAX_X + 1, CLEAR_HEIGHT + 1, SITE_MAX_Z + 1));
			for (Entity e : level.getEntitiesOfClass(Entity.class, box, e -> e instanceof HangingEntity || e instanceof ItemEntity)) {
				e.discard();
			}
		}

		private Vec3 corner(int x, int y, int z) {
			return Vec3.atLowerCornerOf(pos(x, y, z));
		}

		void finish() {
			for (BlockPos p : reshape) {
				BlockState s = level.getBlockState(p);
				BlockState shaped = Block.updateFromNeighbourShapes(s, level, p);
				if (shaped != s && !shaped.isAir()) {
					level.setBlock(p, shaped, FLAGS);
				}
			}
			entities.forEach(Runnable::run);
		}
	}
}
