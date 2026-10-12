package jp.yakata.world;

import jp.yakata.world.MansionBuilder.Canvas;
import net.minecraft.core.Direction;
import net.minecraft.world.item.DyeColor;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.LecternBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.SlabType;

import static jp.yakata.world.MansionBuilder.axis;
import static jp.yakata.world.MansionBuilder.candles;
import static jp.yakata.world.MansionBuilder.facing;
import static jp.yakata.world.MansionBuilder.hangingLantern;
import static jp.yakata.world.MansionBuilder.slab;
import static jp.yakata.world.MansionBuilder.stair;
import static jp.yakata.world.MansionBuilder.with;

/**
 * 1 部屋の内装。座標は部屋内ローカル: ix (西→東 0..10), iz (北→南 0..10), y (0=床, 1..6, 7=天井)。
 * 共有壁の扉口は各辺の中央 4..6、外壁の窓は 2,3 / 7,8。家具はそれらを塞がない位置に置く。
 */
final class RoomDecorator {
	private static final int N = MansionBuilder.ROOM - 1; // 10
	private final Canvas c;
	private final int index, bx, bz;

	RoomDecorator(Canvas c, int index, int bx, int bz) {
		this.c = c;
		this.index = index;
		this.bx = bx;
		this.bz = bz;
	}

	void decorate() {
		switch (MansionBuilder.ROOM_NAMES.get(index)) {
			case "library" -> library();
			case "hall" -> hall();
			case "bedroom" -> bedroom();
			case "dining" -> dining();
			case "lobby" -> lobby();
			case "study" -> study();
			case "kitchen" -> kitchen();
			case "gallery" -> gallery();
			case "cellar" -> cellar();
			default -> throw new IllegalStateException();
		}
	}

	// ------------------------------------------------------------------ helpers

	private void p(int x, int y, int z, BlockState s) {
		c.set(bx + x, y, bz + z, s);
	}

	private void p(int x, int y, int z, Block b) {
		p(x, y, z, b.defaultBlockState());
	}

	private void col(int x, int z, int y0, int y1, BlockState s) {
		for (int y = y0; y <= y1; y++) p(x, y, z, s);
	}

	private void floor(Block a, Block b) {
		for (int x = 0; x <= N; x++)
			for (int z = 0; z <= N; z++)
				p(x, 0, z, ((x + z) % 2 == 0 ? a : b).defaultBlockState());
	}

	private void floorRandom(Block base, Block alt, float chance) {
		for (int x = 0; x <= N; x++)
			for (int z = 0; z <= N; z++)
				p(x, 0, z, (c.rnd.nextFloat() < chance ? alt : base).defaultBlockState());
	}

	private void carpet(int x0, int z0, int x1, int z1, DyeColor color) {
		for (int x = x0; x <= x1; x++)
			for (int z = z0; z <= z1; z++)
				p(x, 1, z, Blocks.CARPET.pick(color).defaultBlockState());
	}

	/** 鎖で吊るしたシャンデリア。grand は十字の腕に吊りランタンと蝋燭 */
	private void chandelier(int x, int z, boolean grand, Block lantern) {
		p(x, 6, z, axis(Blocks.IRON_CHAIN, Direction.Axis.Y));
		if (!grand) {
			p(x, 5, z, hangingLantern(lantern));
			return;
		}
		p(x, 5, z, Blocks.DARK_OAK_FENCE);
		p(x, 4, z, hangingLantern(lantern));
		for (Direction d : Direction.Plane.HORIZONTAL) {
			int ax = x + d.getStepX(), az = z + d.getStepZ();
			p(ax, 5, az, Blocks.DARK_OAK_FENCE);
			p(ax, 4, az, hangingLantern(lantern));
			p(ax, 6, az, candles(Blocks.CANDLE, 3));
		}
	}

	private void chair(int x, int z, Direction back) {
		p(x, 1, z, stair(Blocks.DARK_OAK_STAIRS, back, false));
	}

	/** 倒れた椅子 (逆さ階段) */
	private void fallenChair(int x, int z, Direction d) {
		p(x, 1, z, stair(Blocks.DARK_OAK_STAIRS, d, true));
	}

	private void tableTop(int x0, int z0, int x1, int z1, Block slabBlock) {
		for (int x = x0; x <= x1; x++)
			for (int z = z0; z <= z1; z++)
				p(x, 1, z, slab(slabBlock, SlabType.TOP));
	}

	private void bookshelfWall(int x, int z, int height) {
		for (int y = 1; y <= height; y++) {
			p(x, y, z, y == height && c.rnd.nextFloat() < 0.3f ? Blocks.CHISELED_BOOKSHELF.defaultBlockState() : Blocks.BOOKSHELF.defaultBlockState());
		}
	}

	private void lectern(int x, int z, Direction f) {
		p(x, 1, z, facing(Blocks.LECTERN, f));
		int wx = bx + x, wz = bz + z;
		c.afterBlocks(() -> {
			var pos = c.pos(wx, 1, wz);
			LecternBlock.tryPlaceBook(null, c.level, pos, c.level.getBlockState(pos), new ItemStack(Items.WRITABLE_BOOK));
		});
	}

	private void painting(int x, int y, int z, Direction f) {
		c.painting(bx + x, y, bz + z, f);
	}

	private void frame(int x, int y, int z, Direction f, ItemStack item) {
		c.itemFrame(bx + x, y, bz + z, f, item);
	}

	// ------------------------------------------------------------------ rooms

	/** 図書室: 書架の列、壁一面の本棚、書見台、読書机 */
	private void library() {
		floor(Blocks.DARK_OAK_PLANKS, Blocks.DARK_OAK_PLANKS);
		for (int v : new int[] {0, 1, 4, 5, 6, 9, 10}) {
			bookshelfWall(v, 0, 4);         // 北の外壁 (窓の間)
			bookshelfWall(0, v, 4);         // 西の外壁
		}
		for (int z : new int[] {2, 8}) {
			for (int x : new int[] {2, 3, 7, 8}) bookshelfWall(x, z, 3);
			p(2, 4, z, candles(Blocks.CANDLE, 2));
			p(8, 4, z, candles(Blocks.CANDLE, 1));
		}
		carpet(5, 2, 5, N, DyeColor.RED);
		carpet(6, 5, N, 5, DyeColor.RED);
		lectern(5, 1, Direction.SOUTH);
		tableTop(1, 5, 3, 5, Blocks.DARK_OAK_SLAB);
		chair(2, 4, Direction.NORTH);
		chair(2, 6, Direction.SOUTH);
		p(1, 2, 5, candles(Blocks.CANDLE, 3));
		p(3, 2, 5, Blocks.LANTERN);
		// 倒れた書架
		p(4, 1, 9, Blocks.BOOKSHELF);
		p(9, 1, 7, Blocks.BOOKSHELF);
		chandelier(5, 5, true, Blocks.LANTERN);
		frame(1, 2, 1, Direction.SOUTH, new ItemStack(Items.BOOK)); // 本棚に掛ける
	}

	/** 大広間: 白黒の市松床、深層岩の列柱、暖炉、ピアノ、大シャンデリア */
	private void hall() {
		floor(Blocks.DEEPSLATE_TILES, Blocks.POLISHED_DIORITE);
		for (int x : new int[] {2, 8}) {
			for (int z : new int[] {2, 8}) {
				p(x, 1, z, Blocks.POLISHED_BLACKSTONE_BRICKS);
				col(x, z, 2, 5, Blocks.DEEPSLATE_TILE_WALL.defaultBlockState());
				p(x, 6, z, Blocks.CHISELED_POLISHED_BLACKSTONE);
			}
		}
		// 暖炉 (北の外壁中央)
		col(4, 0, 1, 3, Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState());
		col(6, 0, 1, 3, Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState());
		for (int x = 4; x <= 6; x++) {
			p(x, 4, 0, Blocks.CHISELED_POLISHED_BLACKSTONE);
			col(x, 0, 5, 6, Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState());
			p(x, 4, 1, stair(Blocks.POLISHED_BLACKSTONE_BRICK_STAIRS, Direction.NORTH, true)); // 炉棚
		}
		p(5, 1, 0, with(Blocks.CAMPFIRE.defaultBlockState(), BlockStateProperties.SIGNAL_FIRE, false));
		p(4, 5, 1, candles(Blocks.CANDLE, 2));
		painting(5, 6, 1, Direction.SOUTH);
		// 赤絨毯 (東西の扉と南の扉を結ぶ)
		carpet(0, 5, N, 5, DyeColor.RED);
		carpet(5, 6, 5, N, DyeColor.RED);
		carpet(3, 2, 7, 2, DyeColor.BLACK);
		// ピアノ
		p(8, 1, 0, Blocks.NOTE_BLOCK);
		p(9, 1, 0, Blocks.NOTE_BLOCK);
		p(8, 2, 0, slab(Blocks.POLISHED_BLACKSTONE_SLAB, SlabType.BOTTOM));
		p(9, 2, 0, slab(Blocks.POLISHED_BLACKSTONE_SLAB, SlabType.BOTTOM));
		chair(8, 1, Direction.SOUTH);
		// 壁際のベンチ
		for (int x : new int[] {1, 9}) {
			chair(x, 9, Direction.SOUTH);
		}
		fallenChair(3, 7, Direction.EAST);
		chandelier(5, 5, true, Blocks.LANTERN);
	}

	/** 寝室: 天蓋付きベッド、ナイトテーブル、箪笥、ラグ */
	private void bedroom() {
		floor(Blocks.SPRUCE_PLANKS, Blocks.SPRUCE_PLANKS);
		carpet(2, 3, 8, 7, DyeColor.BLACK);
		carpet(3, 4, 7, 6, DyeColor.RED);
		Block bed = Blocks.BED.pick(DyeColor.RED);
		c.bed(bx + 4, 1, bz + 2, bed, Direction.NORTH);
		c.bed(bx + 5, 1, bz + 2, bed, Direction.NORTH);
		for (int x : new int[] {3, 6}) {
			for (int z : new int[] {1, 3}) {
				col(x, z, 1, 2, Blocks.DARK_OAK_FENCE.defaultBlockState());
			}
		}
		for (int x = 3; x <= 6; x++)
			for (int z = 1; z <= 3; z++)
				p(x, 3, z, slab(Blocks.WOOL_SLAB.pick(DyeColor.RED), SlabType.BOTTOM));
		// ナイトテーブル
		p(2, 1, 1, facing(Blocks.BARREL, Direction.UP));
		p(2, 2, 1, candles(Blocks.CANDLE, 2));
		p(7, 1, 1, facing(Blocks.BARREL, Direction.UP));
		p(7, 2, 1, Blocks.LANTERN);
		// 箪笥 (東の外壁, 窓の間)
		for (int z = 4; z <= 6; z++) {
			col(N, z, 1, 2, facing(Blocks.BARREL, Direction.WEST));
			p(N, 3, z, slab(Blocks.DARK_OAK_SLAB, SlabType.TOP));
		}
		p(N, 4, 4, candles(Blocks.CANDLE, 1));
		p(N, 4, 5, Blocks.POTTED_DEAD_BUSH);
		// 鏡台と倒れた椅子
		p(9, 1, 9, Blocks.DARK_OAK_PLANKS);
		p(9, 2, 9, Blocks.TINTED_GLASS);
		fallenChair(7, 8, Direction.WEST);
		p(1, 1, 9, Blocks.CHEST);
		MansionBuilder.bloodStain(c, bx + 5, bz + 8);
		chandelier(5, 6, false, Blocks.LANTERN);
	}

	/** 食堂: 長テーブル (上付きハーフ)、階段の椅子、燭台、キャンドルケーキ、食器棚 */
	private void dining() {
		floor(Blocks.DARK_OAK_PLANKS, Blocks.DARK_OAK_PLANKS);
		tableTop(2, 4, 8, 6, Blocks.DARK_OAK_SLAB);
		for (int x = 2; x <= 8; x++) p(x, 2, 5, Blocks.CARPET.pick(DyeColor.RED).defaultBlockState());
		for (int x : new int[] {2, 6, 8}) chair(x, 3, Direction.NORTH);
		p(4, 1, 2, stair(Blocks.DARK_OAK_STAIRS, Direction.WEST, false)); // ずれた椅子
		for (int x : new int[] {2, 4, 8}) chair(x, 7, Direction.SOUTH);
		fallenChair(6, 8, Direction.SOUTH);                                  // 倒れた椅子
		chair(1, 5, Direction.WEST);                                         // 主人席
		p(3, 2, 4, candles(Blocks.CANDLE, 3));
		p(7, 2, 6, candles(Blocks.CANDLE, 3));
		p(5, 2, 4, with(Blocks.CANDLE_CAKE.defaultBlockState(), BlockStateProperties.LIT, true));
		p(5, 2, 6, Blocks.POTTED_DEAD_BUSH);
		p(3, 2, 6, Blocks.FLOWER_POT);
		// 食器棚 (西の外壁の窓の間)
		for (int z = 4; z <= 6; z += 2) {
			p(0, 1, z, facing(Blocks.BARREL, Direction.EAST));
			p(0, 2, z, Blocks.LANTERN);
		}
		p(0, 1, 0, facing(Blocks.BARREL, Direction.UP));
		p(0, 1, N, facing(Blocks.BARREL, Direction.UP));
		MansionBuilder.bloodStain(c, bx + 7, bz + 8);
		chandelier(5, 5, true, Blocks.LANTERN);
	}

	/** ロビー (スポーン地点): 黒石の列柱、十字の赤絨毯、中央のメダリオン、大シャンデリア */
	private void lobby() {
		for (int x = 0; x <= N; x++) {
			for (int z = 0; z <= N; z++) {
				boolean border = x == 0 || z == 0 || x == N || z == N;
				p(x, 0, z, (border ? Blocks.DEEPSLATE_TILES : Blocks.POLISHED_BLACKSTONE_BRICKS).defaultBlockState());
			}
		}
		p(5, 0, 5, Blocks.CHISELED_POLISHED_BLACKSTONE);
		for (int x : new int[] {2, 8}) {
			for (int z : new int[] {2, 8}) {
				p(x, 1, z, Blocks.CHISELED_POLISHED_BLACKSTONE);
				col(x, z, 2, 5, Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState());
				p(x, 6, z, Blocks.CHISELED_POLISHED_BLACKSTONE);
			}
		}
		carpet(5, 0, 5, N, DyeColor.RED);
		carpet(0, 5, N, 5, DyeColor.RED);
		carpet(4, 4, 6, 6, DyeColor.RED);
		for (int x : new int[] {0, N}) {
			for (int z : new int[] {0, N}) {
				p(x, 1, z, Blocks.POLISHED_BLACKSTONE_BRICKS);
				p(x, 2, z, Blocks.POTTED_DEAD_BUSH);
			}
		}
		// 柱際の蝋燭と長椅子
		for (int x : new int[] {1, 9}) {
			p(x, 1, 1, candles(Blocks.CANDLE, 4));
			chair(x, 3, x == 1 ? Direction.WEST : Direction.EAST);
			chair(x, 7, x == 1 ? Direction.WEST : Direction.EAST);
		}
		frame(1, 3, 0, Direction.SOUTH, new ItemStack(Items.CLOCK));
		chandelier(5, 5, true, Blocks.LANTERN);
	}

	/** 書斎: 書き物机、壁一面の本棚、書見台、醸造台 */
	private void study() {
		floor(Blocks.SPRUCE_PLANKS, Blocks.SPRUCE_PLANKS);
		carpet(3, 3, 7, 7, DyeColor.GRAY);
		for (int x : new int[] {0, 1, 2, 3, 7, 8, 9, 10}) {
			bookshelfWall(x, 0, 3);
			bookshelfWall(x, N, 3);
		}
		for (int z : new int[] {1, 4, 5, 6, 9}) bookshelfWall(N, z, 3);
		tableTop(4, 4, 6, 4, Blocks.DARK_OAK_SLAB);
		chair(5, 5, Direction.SOUTH);
		p(4, 2, 4, Blocks.LANTERN);
		p(6, 2, 4, candles(Blocks.CANDLE, 2));
		lectern(8, 7, Direction.WEST);
		p(2, 1, 7, Blocks.BREWING_STAND);
		p(1, 1, 7, Blocks.DECORATED_POT);
		frame(1, 2, 1, Direction.SOUTH, new ItemStack(Items.COMPASS));
		frame(9, 2, 1, Direction.SOUTH, new ItemStack(Items.WRITABLE_BOOK));
		fallenChair(2, 3, Direction.NORTH);
		chandelier(5, 5, false, Blocks.LANTERN);
	}

	/** 台所: 燻製器・かまど・溶鉱炉・水の大釜・樽、炉、肉吊りの鎖 */
	private void kitchen() {
		floorRandom(Blocks.STONE_BRICKS, Blocks.MOSSY_STONE_BRICKS, 0.25f);
		p(0, 1, 0, facing(Blocks.SMOKER, Direction.SOUTH));
		p(1, 1, 0, facing(Blocks.FURNACE, Direction.SOUTH));
		p(2, 1, 0, Blocks.WATER_CAULDRON.defaultBlockState().setValue(BlockStateProperties.LEVEL_CAULDRON, 3));
		p(3, 1, 0, facing(Blocks.BARREL, Direction.UP));
		p(3, 2, 0, Blocks.LANTERN);
		p(7, 1, 0, Blocks.CRAFTING_TABLE);
		p(8, 1, 0, facing(Blocks.BLAST_FURNACE, Direction.SOUTH));
		p(9, 1, 0, facing(Blocks.BARREL, Direction.SOUTH));
		p(N, 1, 0, facing(Blocks.BARREL, Direction.SOUTH));
		p(N, 2, 0, Blocks.CAULDRON);
		// 炉 (西の外壁の窓の間)
		col(0, 4, 1, 3, Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState());
		col(0, 6, 1, 3, Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState());
		for (int z = 4; z <= 6; z++) col(0, z, 4, 6, Blocks.POLISHED_BLACKSTONE_BRICKS.defaultBlockState());
		p(0, 1, 5, with(Blocks.CAMPFIRE.defaultBlockState(), BlockStateProperties.SIGNAL_FIRE, false));
		// 調理台 (島)
		for (int x = 4; x <= 6; x++) p(x, 1, 7, facing(Blocks.BARREL, Direction.UP));
		p(5, 2, 7, candles(Blocks.CANDLE, 3));
		p(4, 2, 7, Blocks.FLOWER_POT);
		// 肉吊りの鎖
		for (int x : new int[] {2, 8}) col(x, 8, 5, 6, axis(Blocks.IRON_CHAIN, Direction.Axis.Y));
		// 食料庫
		for (int x = 8; x <= N; x++) for (int z = 9; z <= N; z++) p(x, 1, z, facing(Blocks.BARREL, Direction.UP));
		p(N, 2, N, Blocks.HAY_BLOCK);
		p(9, 2, N, facing(Blocks.BARREL, Direction.UP));
		MansionBuilder.bloodStain(c, bx + 5, bz + 8);
		MansionBuilder.bloodStain(c, bx + 6, bz + 9);
		frame(7, 3, 0, Direction.SOUTH, new ItemStack(Items.ROTTEN_FLESH));
		chandelier(5, 4, false, Blocks.LANTERN);
	}

	/** 画廊 (玄関ホール): 絵画、台座の展示品 (頭蓋骨・剣)、入口からの赤絨毯 */
	private void gallery() {
		floor(Blocks.DARK_OAK_PLANKS, Blocks.DARK_OAK_PLANKS);
		carpet(5, 0, 5, N, DyeColor.RED);
		for (int z : new int[] {2, 8}) {
			painting(0, 3, z, Direction.EAST);
			painting(N, 3, z, Direction.WEST);
		}
		painting(2, 3, 0, Direction.SOUTH);
		painting(8, 3, 0, Direction.SOUTH);
		for (int x : new int[] {3, 7}) {
			for (int z : new int[] {3, 7}) {
				p(x, 1, z, Blocks.CHISELED_STONE_BRICKS);
			}
		}
		p(3, 2, 3, Blocks.SKELETON_SKULL.defaultBlockState().setValue(BlockStateProperties.ROTATION_16, 8));
		p(7, 2, 3, candles(Blocks.CANDLE, 4));
		p(3, 2, 7, Blocks.DECORATED_POT);
		frame(7, 2, 7, Direction.UP, new ItemStack(Items.IRON_SWORD));
		// 玄関脇の長椅子
		chair(1, 9, Direction.WEST);
		chair(9, 9, Direction.EAST);
		p(2, 1, N, candles(Blocks.CANDLE, 2));
		chandelier(5, 5, true, Blocks.LANTERN);
	}

	/** 地下倉庫: 樽の棚、骨、蜘蛛の巣、床の跳ね上げ戸、薄暗い魂のランタンと蝋燭 */
	private void cellar() {
		for (int x = 0; x <= N; x++)
			for (int z = 0; z <= N; z++) {
				float r = c.rnd.nextFloat();
				p(x, 0, z, (r < 0.3f ? Blocks.MOSSY_COBBLESTONE : r < 0.4f ? Blocks.GRAVEL : Blocks.COBBLESTONE).defaultBlockState());
			}
		for (int v : new int[] {0, 1, 4, 5, 6, 9, 10}) {
			col(N, v, 1, 2, facing(Blocks.BARREL, Direction.WEST));
			col(v, N, 1, 2, facing(Blocks.BARREL, Direction.NORTH));
		}
		p(N, 3, 0, candles(Blocks.CANDLE, 2));
		p(N, 3, N, candles(Blocks.CANDLE, 2));
		p(0, 3, N, candles(Blocks.CANDLE, 2));
		p(0, 1, 0, candles(Blocks.CANDLE, 1));
		p(2, 1, 2, facing(Blocks.BARREL, Direction.UP));
		p(2, 2, 2, facing(Blocks.BARREL, Direction.UP));
		p(3, 1, 2, facing(Blocks.BARREL, Direction.UP));
		p(8, 1, 2, Blocks.BONE_BLOCK);
		p(8, 2, 2, Blocks.SKELETON_SKULL.defaultBlockState().setValue(BlockStateProperties.ROTATION_16, 4));
		p(1, 1, 8, Blocks.CHEST);
		p(7, 0, 7, facing(Blocks.SPRUCE_TRAPDOOR, Direction.NORTH));
		p(6, 1, 8, Blocks.COBWEB);
		p(3, 1, 6, Blocks.COBWEB);
		MansionBuilder.bloodStain(c, bx + 5, bz + 6);
		chandelier(5, 5, false, Blocks.SOUL_LANTERN);
	}
}
