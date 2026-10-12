package jp.yakata.faction;

import jp.yakata.YakataMod;
import jp.yakata.faction.entity.FactionMonster;
import jp.yakata.faction.entity.XenoMobs;
import jp.yakata.world.MansionInfo;
import net.minecraft.core.BlockPos;
import net.minecraft.core.particles.ParticleTypes;
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
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.npc.villager.Villager;
import net.minecraft.world.level.levelgen.Heightmap;
import org.jspecify.annotations.Nullable;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 陣営の配置と継続的な「ウェーブ」を管理する。
 * <ol>
 *   <li>洋館 (MansionInfo.built) ができたら、各陣営を別々の部屋に初期配置 (一度だけ。SavedData で記録)。
 *       洋館が 60 秒たってもできなければ、ワールドスポーン周辺の円周上に配置する。</li>
 *   <li>30 秒ごとに最も数の少ない陣営 (と 5 体未満に減った陣営) を本拠地に補充 (陣営ごとの上限 {@value #CAP_PER_FACTION})。</li>
 *   <li>20 秒ごとに生存者 (村人) をロビーへ補充 (上限 {@value #SURVIVOR_CAP})。</li>
 * </ol>
 * バニラの自然スポーンには一切触れない。
 */
public final class FactionDirector {
	public static final int CAP_PER_FACTION = 30;
	public static final int SURVIVOR_CAP = 8;
	public static final String SURVIVOR_TAG = "yakata_survivor";
	private static final int WAVE_INTERVAL = 600;
	private static final int SURVIVOR_INTERVAL = 400;
	private static final int FALLBACK_DELAY = 1200;
	private static final int HOST_INCUBATION = 200;
	/** これ未満の陣営はウェーブで必ず補充する */
	private static final int MIN_PRESENCE = 5;
	/** 陣営ごとの本拠地の部屋 (MansionInfo.roomNames の名前) */
	private static final Map<Faction, String> HOME_ROOMS = new EnumMap<>(Map.of(
		Faction.TVIRUS, "library",
		Faction.GVIRUS, "cellar",
		Faction.CORDYCEPS, "kitchen",
		Faction.XENO, "bedroom",
		Faction.PARASITE, "gallery"));
	private static final Map<Faction, Integer> HOME_FALLBACK_INDEX = new EnumMap<>(Map.of(
		Faction.TVIRUS, 0, Faction.GVIRUS, 8, Faction.CORDYCEPS, 6, Faction.XENO, 2, Faction.PARASITE, 7));

	public static boolean enabled = true;
	private static long ticks;
	private static @Nullable Anchors anchors;
	private static Census lastCensus = new Census();
	private static final Map<UUID, Long> HOSTS = new HashMap<>();

	/** 本拠地の座標一式 */
	public record Anchors(Map<Faction, BlockPos> homes, BlockPos lobby, boolean mansion) {
	}

	/** 1 秒ごとの頭数調査 */
	public static final class Census {
		public final int[] perFaction = new int[Faction.values().length];
		public final Map<EntityType<?>, Integer> perType = new HashMap<>();
		public int survivors;

		public int of(Faction f) {
			return this.perFaction[f.ordinal()];
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
		HOSTS.clear();
		FactionStats.reset();
	}

	public static void onServerTick(MinecraftServer server) {
		ticks++;
		if (ticks % 20 != 0) {
			return;
		}
		ServerLevel level = server.overworld();
		lastCensus = census(level);
		tickHosts(level);
		FactionSidebar.update(server, lastCensus);

		anchors = resolveAnchors(level);
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
		if (MansionInfo.built && MansionInfo.roomCenters.size() >= 9) {
			Map<Faction, BlockPos> homes = new EnumMap<>(Faction.class);
			for (Faction f : Faction.values()) {
				homes.put(f, room(HOME_ROOMS.get(f), HOME_FALLBACK_INDEX.get(f)));
			}
			return new Anchors(homes, room("lobby", 4), true);
		}
		if (ticks < FALLBACK_DELAY) {
			return null; // 洋館の建設を待つ
		}
		// 洋館が無い: ワールドスポーンを中心に半径 20 の円周上へ各陣営を配置
		BlockPos spawn = level.getRespawnData().pos();
		Map<Faction, BlockPos> homes = new EnumMap<>(Faction.class);
		Faction[] all = Faction.values();
		for (int i = 0; i < all.length; i++) {
			double a = Math.PI * 2 * i / all.length;
			int x = spawn.getX() + (int) Math.round(Math.cos(a) * 20);
			int z = spawn.getZ() + (int) Math.round(Math.sin(a) * 20);
			homes.put(all[i], new BlockPos(x, level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, x, z), z));
		}
		BlockPos lobby = new BlockPos(spawn.getX(), level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, spawn.getX(), spawn.getZ()), spawn.getZ());
		return new Anchors(homes, lobby, false);
	}

	private static BlockPos room(String name, int fallbackIndex) {
		int idx = MansionInfo.roomNames.indexOf(name);
		if (idx < 0 || idx >= MansionInfo.roomCenters.size()) {
			idx = fallbackIndex;
		}
		return MansionInfo.roomCenters.get(idx);
	}

	/** 獲物を探して徘徊する Mob の目的地: 敵陣営の本拠地かロビー (生存者がいる)。 */
	public static @Nullable BlockPos huntPoint(Faction self, RandomSource random) {
		Anchors a = anchors;
		if (a == null) {
			return null;
		}
		int pick = random.nextInt(Faction.values().length);
		Faction f = Faction.values()[pick];
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
		total += spawnList(level, a.homes().get(Faction.TVIRUS), rnd,
			FactionEntities.T_ZOMBIE, 5, FactionEntities.CRIMSON_HEAD, 2, FactionEntities.LICKER, 1, FactionEntities.TYRANT, 1);
		total += spawnList(level, a.homes().get(Faction.GVIRUS), rnd,
			FactionEntities.BIRKIN, 1, FactionEntities.G_ADULT, 2, FactionEntities.G_EMBRYO, 4);
		total += spawnList(level, a.homes().get(Faction.CORDYCEPS), rnd,
			FactionEntities.RUNNER, 5, FactionEntities.CLICKER, 2, FactionEntities.BLOATER, 1);
		total += spawnList(level, a.homes().get(Faction.XENO), rnd,
			FactionEntities.FACEHUGGER, 3, FactionEntities.DRONE, 3, FactionEntities.WARRIOR, 1);
		total += spawnList(level, a.homes().get(Faction.PARASITE), rnd,
			FactionEntities.SWARMER, 6, FactionEntities.CRAWLER, 2, FactionEntities.ASSIMILATED, 1);
		int survivors = spawnSurvivors(level, a.lobby(), 6);
		YakataMod.LOGGER.info("[yakata] 陣営を初期配置しました: 感染体 {} 体, 生存者 {} 人 ({})", total, survivors,
			a.mansion() ? "洋館の各部屋" : "ワールドスポーン周辺 (洋館なし)");
		return true;
	}

	private static int spawnList(ServerLevel level, BlockPos home, RandomSource rnd, Object... typeAndCount) {
		int n = 0;
		for (int i = 0; i < typeAndCount.length; i += 2) {
			@SuppressWarnings("unchecked")
			EntityType<? extends Mob> type = (EntityType<? extends Mob>) typeAndCount[i];
			int count = (Integer) typeAndCount[i + 1];
			for (int c = 0; c < count; c++) {
				if (spawnAround(level, type, home, rnd, EntitySpawnReason.EVENT) != null) {
					n++;
				}
			}
		}
		return n;
	}

	/** 最も弱い陣営 (と 5 体未満に減った陣営) を補充して戦いを続けさせる。 */
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
				targets.add(f); // 全滅寸前の陣営も補充して、5 陣営の乱戦が続くようにする
			}
		}
		for (Faction f : targets) {
			BlockPos home = a.homes().get(f);
			if (census.of(f) >= CAP_PER_FACTION || !level.isPositionEntityTicking(home)) {
				continue;
			}
			int size = Math.min(CAP_PER_FACTION - census.of(f), 4 + rnd.nextInt(3));
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
				if (e.maxAlive() == 0 || alive < e.maxAlive()) {
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

	// ---- 頭数調査・ゼノの宿主 --------------------------------------------------

	public static Census census(ServerLevel level) {
		Census c = new Census();
		for (Entity e : level.getAllEntities()) {
			if (!e.isAlive()) {
				continue;
			}
			if (e instanceof FactionMonster fm) {
				c.perFaction[fm.getFaction().ordinal()]++;
				c.perType.merge(e.getType(), 1, Integer::sum);
			} else if (e instanceof Villager && e.entityTags().contains(SURVIVOR_TAG)) {
				c.survivors++;
			}
		}
		return c;
	}

	/** フェイスハガーに寄生された宿主は 10 秒後に胸を食い破られ、ドローンが生まれる。 */
	private static void tickHosts(ServerLevel level) {
		long now = level.getGameTime();
		List<LivingEntity> burst = new ArrayList<>();
		for (Entity e : level.getAllEntities()) {
			if (e instanceof LivingEntity living && living.isAlive() && e.entityTags().contains(XenoMobs.HOST_TAG)) {
				long since = HOSTS.computeIfAbsent(e.getUUID(), u -> now);
				if (now - since >= HOST_INCUBATION) {
					burst.add(living);
				}
			}
		}
		for (LivingEntity host : burst) {
			HOSTS.remove(host.getUUID());
			host.removeTag(XenoMobs.HOST_TAG);
			level.sendParticles(ParticleTypes.DAMAGE_INDICATOR, host.getX(), host.getY() + 1.0, host.getZ(), 15, 0.3, 0.3, 0.3, 0.2);
			level.playSound(null, host.getX(), host.getY(), host.getZ(), SoundEvents.SLIME_SQUISH, SoundSource.HOSTILE, 1.5F, 0.5F);
			BlockPos at = host.blockPosition();
			host.kill(level);
			if (spawnAround(level, FactionEntities.DRONE, at, level.getRandom(), EntitySpawnReason.CONVERSION) != null) {
				FactionStats.recordConversion(Faction.XENO);
				YakataMod.LOGGER.info("[yakata] チェストバスター: 宿主からゼノモーフが誕生 ({})", at);
			}
		}
		HOSTS.keySet().removeIf(uuid -> level.getEntity(uuid) == null);
	}

	private static void logSummary(Census c) {
		StringBuilder sb = new StringBuilder("[yakata] 勢力: ");
		for (Faction f : Faction.values()) {
			sb.append(f.enName).append('=').append(c.of(f))
				.append("(k").append(FactionStats.killsBy(f)).append("/d").append(FactionStats.killedByOthers(f)).append(") ");
		}
		sb.append("survivors=").append(c.survivors)
			.append(" factionKills=").append(FactionStats.totalFactionKills())
			.append(" conversions=").append(FactionStats.totalConversions());
		YakataMod.LOGGER.info(sb.toString());
	}
}
