package jp.yakata.faction;

import jp.yakata.YakataMod;
import jp.yakata.faction.entity.CordycepsMobs;
import jp.yakata.faction.entity.FactionMonster;
import jp.yakata.faction.entity.GVirusMobs;
import jp.yakata.faction.entity.ParasiteMobs;
import jp.yakata.faction.entity.TVirusMobs;
import jp.yakata.faction.entity.XenoMobs;
import net.fabricmc.fabric.api.object.builder.v1.entity.FabricDefaultAttributeRegistry;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.Identifier;
import net.minecraft.resources.ResourceKey;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.Supplier;

/** 全陣営 Mob の EntityType 登録。クライアント側はこの一覧からレンダラーを登録する。 */
public final class FactionEntities {
	/** クライアントで流用するバニラモデルの種類 */
	public enum ModelKind { ZOMBIE, SPIDER, SILVERFISH }

	/**
	 * @param name     登録名 (= テクスチャ名 textures/entity/&lt;name&gt;.png)
	 * @param variants テクスチャの段階数 (1 なら単一。2 以上なら &lt;name&gt;_&lt;n&gt;.png, n=1..)
	 * @param weight   ウェーブ/コマンドでの出現重み
	 * @param maxAlive 同時に存在できる上限 (ボス級の抑制。0 = 制限なし)
	 */
	public record Entry(String name, Faction faction, ModelKind model, EntityType<? extends FactionMonster> type,
						int variants, int weight, int maxAlive) {
	}

	private static final List<Entry> ENTRIES = new ArrayList<>();
	public static final List<Entry> ALL = Collections.unmodifiableList(ENTRIES);

	// ---- t-ウイルス -----------------------------------------------------------
	public static final EntityType<TVirusMobs.TZombie> T_ZOMBIE = register("t_zombie", Faction.TVIRUS, ModelKind.ZOMBIE,
		EntityType.Builder.of(TVirusMobs.TZombie::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		TVirusMobs.TZombie::createAttributes, 1, 10, 0);
	public static final EntityType<TVirusMobs.CrimsonHead> CRIMSON_HEAD = register("crimson_head", Faction.TVIRUS, ModelKind.ZOMBIE,
		EntityType.Builder.of(TVirusMobs.CrimsonHead::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		TVirusMobs.CrimsonHead::createAttributes, 1, 5, 0);
	public static final EntityType<TVirusMobs.Licker> LICKER = register("licker", Faction.TVIRUS, ModelKind.SPIDER,
		EntityType.Builder.of(TVirusMobs.Licker::new, MobCategory.MONSTER).sized(1.2F, 0.85F).eyeHeight(0.6F),
		TVirusMobs.Licker::createAttributes, 1, 3, 6);
	public static final EntityType<TVirusMobs.Tyrant> TYRANT = register("tyrant", Faction.TVIRUS, ModelKind.ZOMBIE,
		EntityType.Builder.of(TVirusMobs.Tyrant::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		TVirusMobs.Tyrant::createAttributes, 1, 1, 1);

	// ---- G-ウイルス -----------------------------------------------------------
	public static final EntityType<GVirusMobs.Birkin> BIRKIN = register("g_birkin", Faction.GVIRUS, ModelKind.ZOMBIE,
		EntityType.Builder.of(GVirusMobs.Birkin::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		GVirusMobs.Birkin::createAttributes, 3, 1, 1);
	public static final EntityType<GVirusMobs.GAdult> G_ADULT = register("g_adult", Faction.GVIRUS, ModelKind.SPIDER,
		EntityType.Builder.of(GVirusMobs.GAdult::new, MobCategory.MONSTER).sized(1.3F, 0.9F).eyeHeight(0.65F),
		GVirusMobs.GAdult::createAttributes, 1, 4, 8);
	public static final EntityType<GVirusMobs.GEmbryo> G_EMBRYO = register("g_embryo", Faction.GVIRUS, ModelKind.SILVERFISH,
		EntityType.Builder.of(GVirusMobs.GEmbryo::new, MobCategory.MONSTER).sized(0.5F, 0.35F).eyeHeight(0.15F),
		GVirusMobs.GEmbryo::createAttributes, 1, 8, 0);

	// ---- 冬虫夏草 -------------------------------------------------------------
	public static final EntityType<CordycepsMobs.Runner> RUNNER = register("cordyceps_runner", Faction.CORDYCEPS, ModelKind.ZOMBIE,
		EntityType.Builder.of(CordycepsMobs.Runner::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		CordycepsMobs.Runner::createAttributes, 1, 10, 0);
	public static final EntityType<CordycepsMobs.Clicker> CLICKER = register("cordyceps_clicker", Faction.CORDYCEPS, ModelKind.ZOMBIE,
		EntityType.Builder.of(CordycepsMobs.Clicker::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		CordycepsMobs.Clicker::createAttributes, 1, 5, 0);
	public static final EntityType<CordycepsMobs.Bloater> BLOATER = register("cordyceps_bloater", Faction.CORDYCEPS, ModelKind.ZOMBIE,
		EntityType.Builder.of(CordycepsMobs.Bloater::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		CordycepsMobs.Bloater::createAttributes, 1, 2, 2);

	// ---- ゼノモーフ -----------------------------------------------------------
	public static final EntityType<XenoMobs.Facehugger> FACEHUGGER = register("xeno_facehugger", Faction.XENO, ModelKind.SILVERFISH,
		EntityType.Builder.of(XenoMobs.Facehugger::new, MobCategory.MONSTER).sized(0.5F, 0.35F).eyeHeight(0.15F),
		XenoMobs.Facehugger::createAttributes, 1, 5, 0);
	public static final EntityType<XenoMobs.Drone> DRONE = register("xeno_drone", Faction.XENO, ModelKind.SPIDER,
		EntityType.Builder.of(XenoMobs.Drone::new, MobCategory.MONSTER).sized(1.2F, 0.85F).eyeHeight(0.6F),
		XenoMobs.Drone::createAttributes, 1, 8, 0);
	public static final EntityType<XenoMobs.Warrior> WARRIOR = register("xeno_warrior", Faction.XENO, ModelKind.SPIDER,
		EntityType.Builder.of(XenoMobs.Warrior::new, MobCategory.MONSTER).sized(1.2F, 0.85F).eyeHeight(0.6F),
		XenoMobs.Warrior::createAttributes, 1, 3, 3);

	// ---- 寄生体 ---------------------------------------------------------------
	public static final EntityType<ParasiteMobs.Swarmer> SWARMER = register("parasite_swarmer", Faction.PARASITE, ModelKind.SILVERFISH,
		EntityType.Builder.of(ParasiteMobs.Swarmer::new, MobCategory.MONSTER).sized(0.4F, 0.3F).eyeHeight(0.13F),
		ParasiteMobs.Swarmer::createAttributes, 1, 10, 0);
	public static final EntityType<ParasiteMobs.Crawler> CRAWLER = register("parasite_crawler", Faction.PARASITE, ModelKind.SPIDER,
		EntityType.Builder.of(ParasiteMobs.Crawler::new, MobCategory.MONSTER).sized(1.4F, 0.9F).eyeHeight(0.65F),
		ParasiteMobs.Crawler::createAttributes, 1, 5, 0);
	public static final EntityType<ParasiteMobs.Assimilated> ASSIMILATED = register("parasite_assimilated", Faction.PARASITE, ModelKind.ZOMBIE,
		EntityType.Builder.of(ParasiteMobs.Assimilated::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		ParasiteMobs.Assimilated::createAttributes, 1, 3, 4);

	private FactionEntities() {}

	private static <T extends FactionMonster> EntityType<T> register(String name, Faction faction, ModelKind model,
			EntityType.Builder<T> builder, Supplier<AttributeSupplier.Builder> attributes, int variants, int weight, int maxAlive) {
		ResourceKey<EntityType<?>> key = ResourceKey.create(Registries.ENTITY_TYPE, Identifier.fromNamespaceAndPath(YakataMod.MOD_ID, name));
		EntityType<T> type = Registry.register(BuiltInRegistries.ENTITY_TYPE, key,
			builder.clientTrackingRange(8).notInPeaceful().build(key));
		FabricDefaultAttributeRegistry.register(type, attributes.get());
		ENTRIES.add(new Entry(name, faction, model, type, variants, weight, maxAlive));
		return type;
	}

	public static Entry entry(EntityType<?> type) {
		for (Entry e : ENTRIES) {
			if (e.type() == type) {
				return e;
			}
		}
		return null;
	}

	public static Entry byName(String name) {
		for (Entry e : ENTRIES) {
			if (e.name().equals(name)) {
				return e;
			}
		}
		return null;
	}

	public static List<Entry> of(Faction faction) {
		List<Entry> list = new ArrayList<>();
		for (Entry e : ENTRIES) {
			if (e.faction() == faction) {
				list.add(e);
			}
		}
		return list;
	}

	/** 感染転化: その陣営に殺された村人/ゾンビ村人から立ち上がる Mob。 */
	public static EntityType<? extends FactionMonster> conversionFor(Faction faction) {
		return switch (faction) {
			case TVIRUS -> T_ZOMBIE;
			case GVIRUS -> G_EMBRYO;
			case CORDYCEPS -> RUNNER;
			case XENO -> DRONE;
			case PARASITE -> ASSIMILATED;
		};
	}

	/** クラスロードで静的登録を走らせる */
	public static void init() {
		YakataMod.LOGGER.info("[yakata] {} 種の陣営 Mob を登録しました", ENTRIES.size());
	}
}
