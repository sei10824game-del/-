package jp.yakata.faction;

import jp.yakata.YakataMod;
import jp.yakata.faction.entity.FactionMonster;
import jp.yakata.world.MansionInfo;
import net.minecraft.core.BlockPos;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.network.chat.Component;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.util.RandomSource;
import net.minecraft.world.Difficulty;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.EntityTypes;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.npc.villager.Villager;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.phys.Vec3;
import org.jspecify.annotations.Nullable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 陣営の配置と継続的な「ウェーブ」を管理する (陣営ごとの差はすべて {@link Faction} のデータから決まる)。
 * <ol>
 *   <li>洋館 (MansionInfo.built) ができたら、各陣営を本拠地の部屋に初期配置 (一度だけ。SavedData で記録)。
 *       部屋より陣営が多いので、宿敵同士を避けつつ部屋を共有させる (共有時は部屋の対角に分ける)。
 *       "yard" を希望する陣営 (サイレンヘッド等の巨体) は洋館の前庭に配置。
 *       洋館が 60 秒たってもできなければ、ワールドスポーン周辺の円周上に配置する。</li>
 *   <li>30 秒ごとに最も数の少ない陣営 (と {@value #MIN_PRESENCE} 体未満に減った陣営) を本拠地に補充 (上限は陣営ごとの cap)。</li>
 *   <li>20 秒ごとに生存者 (村人) をロビーへ補充 (上限 {@value #SURVIVOR_CAP})。</li>
 *   <li>遅延付きの感染蘇生 (ネクロモーフの再起動、ウイルスで倒れた化け物の蘇生など) を処理する。</li>
 * </ol>
 * バニラの自然スポーンには一切触れない。
 */
public final class FactionDirector {
	public static final int SURVIVOR_CAP = 8;
	public static final String SURVIVOR_TAG = "yakata_survivor";
	public static final String YARD = "yard";
	private static final int WAVE_INTERVAL = 600;
	private static final int SURVIVOR_INTERVAL = 400;
	private static final int FALLBACK_DELAY = 1200;
	/** これ未満の陣営はウェーブで必ず補充する */
	private static final int MIN_PRESENCE = 4;
	private static final int[][] SHARE_OFFSETS = {{-3, -3}, {3, 3}, {-3, 3}, {3, -3}};

	public static boolean enabled = true;
	private static long ticks;
	private static @Nullable Anchors anchors;
	private static Census lastCensus = new Census();
	private static final List<PendingRise> RISES = new ArrayList<>();

	/** 本拠地の座標一式。rooms は陣営 → 部屋名 */
	public record Anchors(Map<Faction, BlockPos> homes, Map<Faction, String> rooms, BlockPos lobby, boolean mansion) {
	}

	/** 遅延蘇生の予約 */
	private record PendingRise(long due, Vec3 pos, EntityType<? extends FactionMonster> type, Faction faction, String reason,
							   @Nullable Component name, FactionMonster.@Nullable RiseSetup setup) {
	}

	/** 1 秒ごとの頭数調査 */
	public static final class Census {
		public final int[] perFaction = new int[Faction.count()];
		public final Map<EntityType<?>, Integer> perType = new HashMap<>();
		public int survivors;

		public int of(Faction f) {
			return f.ordinal() < this.perFaction.length ? this.perFaction[f.ordinal()] : 0;
		}

		public int total() {
			int sum = 0;
			for (int c : this.perFaction) {
				sum += c;
			}
			return sum;
		}
	}

	private FactionDirector() {}

	public static void onServerStarted(MinecraftServer server) {
		ticks = 0;
		anchors = null;
		RISES.clear();
		Corpses.clear();
		FactionStats.reset();
	}

	public static void onServerTick(MinecraftServer server) {
		ticks++;
		if (ticks % 20 != 0) {
			return;
		}
		ServerLevel level = server.overworld();
		lastCensus = census(level);
		tickRises(level);
		Corpses.expire(level.getGameTime());
		for (Faction f : Faction.values()) {
			f.hooks.tickSecond(level);
		}
		FactionSidebar.update(server, lastCensus);

		Anchors resolved = resolveAnchors(level);
		if (resolved != null && (anchors == null || !anchors.homes().equals(resolved.homes()))) {
			logAnchors(resolved);
		}
		anchors = resolved;
		if (!enabled || anchors == null || level.getDifficulty() == Difficulty.PEACEFUL) {
			return;
		}
		FactionSavedData data = FactionSavedData.get(server);
		if (!data.isSeeded()) {
			if (seedAll(level, anchors)) {
				data.setSeeded(true, level.getGameTime());
			}
			return;
		}
		if (ticks % WAVE_INTERVAL == 0) {
			wave(level, anchors, lastCensus);
		}
		if (ticks % SURVIVOR_INTERVAL == 0 && lastCensus.survivors < SURVIVOR_CAP) {
			spawnSurvivors(level, anchors.lobby(), 1);
		}
		if (ticks % 1200 == 0) {
			logSummary(census(level));
		}
	}

	public static Census lastCensus() {
		return lastCensus;
	}

	public static @Nullable Anchors anchors() {
		return anchors;
	}

	// ---- 本拠地 ---------------------------------------------------------------

	private static @Nullable Anchors resolveAnchors(ServerLevel level) {
		List<Faction> all = Faction.values();
		if (MansionInfo.built && MansionInfo.roomCenters.size() >= 9) {
			Map<Faction, String> rooms = new LinkedHashMap<>();
			Map<Faction, BlockPos> homes = assignHomes(level, all, rooms);
			return new Anchors(Map.copyOf(homes), Map.copyOf(rooms), room("lobby", 4), true);
		}
		if (ticks < FALLBACK_DELAY) {
			return null; // 洋館の建設を待つ
		}
		// 洋館が無い: ワールドスポーンを中心に半径 20 の円周上へ各陣営を配置
		BlockPos spawn = level.getRespawnData().pos();
		Map<Faction, BlockPos> homes = new LinkedHashMap<>();
		Map<Faction, String> rooms = new LinkedHashMap<>();
		for (int i = 0; i < all.size(); i++) {
			double a = Math.PI * 2 * i / all.size();
			int x = spawn.getX() + (int) Math.round(Math.cos(a) * 20);
			int z = spawn.getZ() + (int) Math.round(Math.sin(a) * 20);
			homes.put(all.get(i), new BlockPos(x, level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, x, z), z));
			rooms.put(all.get(i), "circle" + i);
		}
		BlockPos lobby = new BlockPos(spawn.getX(), level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, spawn.getX(), spawn.getZ()), spawn.getZ());
		return new Anchors(homes, rooms, lobby, false);
	}

	/**
	 * 部屋の割り当て: 希望順に、空いている部屋 → 宿敵のいない最も空いた部屋、の順で選ぶ。
	 * 同じ部屋に入った陣営は部屋の対角 (±3) に本拠地をずらす。
	 */
	static Map<Faction, BlockPos> assignHomes(ServerLevel level, List<Faction> factions, Map<Faction, String> out) {
		List<String> indoor = new ArrayList<>();
		for (String name : MansionInfo.roomNames) {
			if (!name.equals("lobby")) {
				indoor.add(name);
			}
		}
		Map<String, List<Faction>> occupants = new LinkedHashMap<>();
		for (Faction f : factions) {
			if (f.homeRooms.contains(YARD)) {
				occupants.computeIfAbsent(YARD, k -> new ArrayList<>()).add(f);
				out.put(f, YARD);
				continue;
			}
			String best = null;
			int bestScore = Integer.MAX_VALUE;
			for (String r : indoor) {
				List<Faction> occ = occupants.getOrDefault(r, List.of());
				boolean rival = false;
				for (Faction o : occ) {
					rival |= o.isRival(f);
				}
				int pref = f.homeRooms.indexOf(r);
				int score = occ.size() * 10 + (rival ? 1000 : 0) + (pref >= 0 ? pref : 5);
				if (score < bestScore) {
					bestScore = score;
					best = r;
				}
			}
			occupants.computeIfAbsent(best, k -> new ArrayList<>()).add(f);
			out.put(f, best);
		}
		Map<Faction, BlockPos> homes = new LinkedHashMap<>();
		for (Map.Entry<String, List<Faction>> e : occupants.entrySet()) {
			List<Faction> occ = e.getValue();
			BlockPos center = e.getKey().equals(YARD) ? yard(level) : room(e.getKey(), 0);
			for (int i = 0; i < occ.size(); i++) {
				BlockPos p = center;
				if (occ.size() > 1) {
					int[] off = SHARE_OFFSETS[i % SHARE_OFFSETS.length];
					int spread = e.getKey().equals(YARD) ? 3 : 1;
					p = center.offset(off[0] * spread, 0, off[1] * spread);
				}
				homes.put(occ.get(i), p);
			}
		}
		return homes;
	}

	/** 洋館の前庭 (正面玄関の南、屋外)。天井に頭がつかえる巨体の陣営用 */
	private static BlockPos yard(ServerLevel level) {
		BlockPos lobby = room("lobby", 4);
		int x = lobby.getX();
		int z = MansionInfo.origin.getZ() + 37 + 10;
		return new BlockPos(x, level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, x, z), z);
	}

	private static BlockPos room(String name, int fallbackIndex) {
		int idx = MansionInfo.roomNames.indexOf(name);
		if (idx < 0 || idx >= MansionInfo.roomCenters.size()) {
			idx = fallbackIndex;
		}
		return MansionInfo.roomCenters.get(idx);
	}

	private static void logAnchors(Anchors a) {
		StringBuilder sb = new StringBuilder("[yakata] 本拠地の割り当て: ");
		for (Faction f : Faction.values()) {
			sb.append(f.id()).append('@').append(a.rooms().get(f)).append(' ');
		}
		YakataMod.LOGGER.info(sb.toString().trim());
	}

	/** 獲物を探して徘徊する Mob の目的地: 敵陣営の本拠地かロビー (生存者がいる)。 */
	public static @Nullable BlockPos huntPoint(Faction self, RandomSource random) {
		Anchors a = anchors;
		if (a == null) {
			return null;
		}
		List<Faction> all = Faction.values();
		Faction f = all.get(random.nextInt(all.size()));
		if (f == self) {
			return a.lobby();
		}
		return a.homes().get(f);
	}

	// ---- 初期配置とウェーブ ----------------------------------------------------

	private static boolean seedAll(ServerLevel level, Anchors a) {
		for (BlockPos p : a.homes().values()) {
			if (!level.isPositionEntityTicking(p)) {
				return false; // チャンクが読み込まれるまで待つ
			}
		}
		if (!level.isPositionEntityTicking(a.lobby())) {
			return false;
		}
		RandomSource rnd = level.getRandom();
		int total = 0;
		StringBuilder per = new StringBuilder();
		for (Faction f : Faction.values()) {
			BlockPos home = a.homes().get(f);
			int n = 0;
			for (Faction.Seed seed : f.seeds) {
				for (int c = 0; c < seed.count(); c++) {
					if (spawnAround(level, seed.type().get(), home, rnd, EntitySpawnReason.EVENT) != null) {
						n++;
					}
				}
			}
			total += n;
			per.append(f.id()).append('=').append(n).append(' ');
		}
		int survivors = spawnSurvivors(level, a.lobby(), 6);
		YakataMod.LOGGER.info("[yakata] 陣営を初期配置しました: {} 陣営 / 感染体 {} 体, 生存者 {} 人 ({}) [{}]", Faction.count(), total, survivors,
			a.mansion() ? "洋館の各部屋" : "ワールドスポーン周辺 (洋館なし)", per.toString().trim());
		return true;
	}

	/** 最も弱い陣営 (と全滅寸前の陣営) を補充して戦いを続けさせる。 */
	private static void wave(ServerLevel level, Anchors a, Census census) {
		RandomSource rnd = level.getRandom();
		Faction weakest = null;
		for (Faction f : Faction.values()) {
			if (weakest == null || census.of(f) < census.of(weakest)
				|| census.of(f) == census.of(weakest) && rnd.nextBoolean()) {
				weakest = f;
			}
		}
		List<Faction> targets = new ArrayList<>();
		targets.add(weakest);
		for (Faction f : Faction.values()) {
			if (census.of(f) < MIN_PRESENCE && f != weakest) {
				targets.add(f); // 全滅寸前の陣営も補充して、乱戦が続くようにする
			}
		}
		for (Faction f : targets) {
			BlockPos home = a.homes().get(f);
			if (home == null || census.of(f) >= f.cap || !level.isPositionEntityTicking(home)) {
				continue;
			}
			int size = Math.min(f.cap - census.of(f), 3 + rnd.nextInt(3));
			int spawned = spawnFaction(level, f, home, size, census, EntitySpawnReason.EVENT);
			YakataMod.LOGGER.info("[yakata] ウェーブ: {} を {} 体補充 (現在 {} 体)", f.enName, spawned, census.of(f) + spawned);
		}
	}

	/** 陣営から重み付きで Mob を選んで pos の周りに出す (ボス級は同時数の上限を守る)。 */
	public static int spawnFaction(ServerLevel level, Faction f, BlockPos pos, int count, Census census, EntitySpawnReason reason) {
		RandomSource rnd = level.getRandom();
		List<FactionEntities.Entry> entries = FactionEntities.of(f);
		Map<EntityType<?>, Integer> extra = new HashMap<>();
		int n = 0;
		for (int i = 0; i < count; i++) {
			List<FactionEntities.Entry> allowed = new ArrayList<>();
			int totalWeight = 0;
			for (FactionEntities.Entry e : entries) {
				int alive = census.perType.getOrDefault(e.type(), 0) + extra.getOrDefault(e.type(), 0);
				if (e.weight() > 0 && (e.maxAlive() == 0 || alive < e.maxAlive())) {
					allowed.add(e);
					totalWeight += e.weight();
				}
			}
			if (allowed.isEmpty()) {
				break;
			}
			int r = rnd.nextInt(totalWeight);
			FactionEntities.Entry pick = allowed.get(0);
			for (FactionEntities.Entry e : allowed) {
				r -= e.weight();
				if (r < 0) {
					pick = e;
					break;
				}
			}
			if (spawnAround(level, pick.type(), pos, rnd, reason) != null) {
				extra.merge(pick.type(), 1, Integer::sum);
				n++;
			}
		}
		return n;
	}

	/** pos の周囲 (±3) の空いた場所に Mob を出す。 */
	public static <T extends Mob> @Nullable T spawnAround(ServerLevel level, EntityType<T> type, BlockPos pos, RandomSource rnd, EntitySpawnReason reason) {
		T mob = type.create(level, reason);
		if (mob == null) {
			return null;
		}
		boolean placed = false;
		for (int attempt = 0; attempt < 8 && !placed; attempt++) {
			double x = pos.getX() + 0.5 + (attempt == 7 ? 0 : rnd.nextInt(7) - 3);
			double z = pos.getZ() + 0.5 + (attempt == 7 ? 0 : rnd.nextInt(7) - 3);
			mob.snapTo(x, pos.getY(), z, rnd.nextFloat() * 360.0F, 0.0F);
			placed = level.noCollision(mob) && !level.getBlockState(mob.blockPosition().below()).isAir();
		}
		if (!placed) {
			mob.snapTo(pos.getX() + 0.5, pos.getY(), pos.getZ() + 0.5, 0.0F, 0.0F);
		}
		mob.finalizeSpawn(level, level.getCurrentDifficultyAt(mob.blockPosition()), reason, null);
		mob.setPersistenceRequired();
		if (!level.addFreshEntity(mob)) {
			return null;
		}
		return mob;
	}

	private static int spawnSurvivors(ServerLevel level, BlockPos lobby, int count) {
		int n = 0;
		for (int i = 0; i < count; i++) {
			Villager v = spawnAround(level, EntityTypes.VILLAGER, lobby, level.getRandom(), EntitySpawnReason.EVENT);
			if (v != null) {
				v.addTag(SURVIVOR_TAG);
				n++;
			}
		}
		return n;
	}

	// ---- 遅延蘇生 --------------------------------------------------------------

	/** 予約済みで未出現の蘇生数 (陣営の上限判定に含める) */
	public static int pendingRises(Faction f) {
		int n = 0;
		for (PendingRise r : RISES) {
			if (r.faction() == f) {
				n++;
			}
		}
		return n;
	}

	/** 陣営がまだ増えられるか (現在数 + 蘇生予約 < cap) */
	public static boolean hasRoom(ServerLevel level, Faction f) {
		return lastCensus.of(f) + pendingRises(f) < f.cap;
	}

	/** delayTicks 後に pos で type を蘇らせる (死体から這い出す演出)。 */
	public static void scheduleRise(ServerLevel level, Vec3 pos, EntityType<? extends FactionMonster> type, Faction faction, int delayTicks,
									String reason, @Nullable Component name, FactionMonster.@Nullable RiseSetup setup) {
		RISES.add(new PendingRise(level.getGameTime() + delayTicks, pos, type, faction, reason, name, setup));
		level.sendParticles(ParticleTypes.SQUID_INK, pos.x, pos.y + 0.3, pos.z, 8, 0.3, 0.1, 0.3, 0.01);
	}

	private static void tickRises(ServerLevel level) {
		long now = level.getGameTime();
		Iterator<PendingRise> it = RISES.iterator();
		List<PendingRise> due = new ArrayList<>();
		while (it.hasNext()) {
			PendingRise r = it.next();
			if (r.due() <= now || r.due() - now > 20 * 60) {
				due.add(r);
				it.remove();
			}
		}
		for (PendingRise r : due) {
			BlockPos at = BlockPos.containing(r.pos());
			if (!level.isPositionEntityTicking(at)) {
				continue;
			}
			FactionMonster mob = r.type().create(level, EntitySpawnReason.CONVERSION);
			if (mob == null) {
				continue;
			}
			mob.snapTo(r.pos().x, r.pos().y, r.pos().z, level.getRandom().nextFloat() * 360.0F, 0.0F);
			if (!level.noCollision(mob)) {
				mob.snapTo(at.getX() + 0.5, at.getY() + 1, at.getZ() + 0.5, mob.getYRot(), 0.0F);
			}
			mob.finalizeSpawn(level, level.getCurrentDifficultyAt(at), EntitySpawnReason.CONVERSION, null);
			mob.setPersistenceRequired();
			if (r.name() != null) {
				mob.setCustomName(r.name());
			}
			if (r.setup() != null) {
				r.setup().apply(mob);
			}
			if (level.addFreshEntity(mob)) {
				FactionStats.recordConversion(r.faction());
				FactionStats.event("rise_" + r.faction().id());
				level.sendParticles(ParticleTypes.SQUID_INK, r.pos().x, r.pos().y + 0.8, r.pos().z, 12, 0.3, 0.4, 0.3, 0.02);
				level.playSound(null, r.pos().x, r.pos().y, r.pos().z, SoundEvents.ZOMBIE_INFECT, SoundSource.HOSTILE, 1.0F, 0.7F);
				YakataMod.LOGGER.info("[yakata] 蘇生 ({}): {} が {} として立ち上がった ({})", r.reason(), r.faction().enName,
					r.type().toShortString(), at.toShortString());
			}
		}
	}

	// ---- 頭数調査 --------------------------------------------------------------

	public static Census census(ServerLevel level) {
		Census c = new Census();
		for (Entity e : level.getAllEntities()) {
			if (!e.isAlive()) {
				continue;
			}
			if (e instanceof FactionMonster fm) {
				int idx = fm.getFaction().ordinal();
				if (idx < c.perFaction.length) {
					c.perFaction[idx]++;
				}
				c.perType.merge(e.getType(), 1, Integer::sum);
			} else if (e instanceof Villager && e.entityTags().contains(SURVIVOR_TAG)) {
				c.survivors++;
			}
		}
		return c;
	}

	private static void logSummary(Census c) {
		StringBuilder sb = new StringBuilder("[yakata] 勢力: ");
		for (Faction f : Faction.values()) {
			sb.append(f.id()).append('=').append(c.of(f))
				.append("(k").append(FactionStats.killsBy(f)).append("/d").append(FactionStats.killedByOthers(f))
				.append("/c").append(FactionStats.conversions(f)).append(") ");
		}
		sb.append("survivors=").append(c.survivors)
			.append(" factionKills=").append(FactionStats.totalFactionKills())
			.append(" conversions=").append(FactionStats.totalConversions())
			.append(" events=").append(FactionStats.events());
		YakataMod.LOGGER.info(sb.toString());
	}
}
