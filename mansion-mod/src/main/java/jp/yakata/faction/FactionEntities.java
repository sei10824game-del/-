package jp.yakata.faction;

import jp.yakata.YakataMod;
import jp.yakata.faction.entity.FactionMonster;
import net.fabricmc.fabric.api.object.builder.v1.entity.FabricDefaultAttributeRegistry;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.Identifier;
import net.minecraft.resources.ResourceKey;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import org.jspecify.annotations.Nullable;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.Supplier;

/**
 * 全陣営 Mob の EntityType 登録 (各陣営ファイルの静的初期化から呼ばれる)。
 * クライアント側はこの一覧からレンダラーを登録し、ディレクターはここの重み/上限をウェーブの出現表に使う。
 */
public final class FactionEntities {
	/** クライアントで流用するモデルの種類 (SIREN だけは専用の細長いモデル層) */
	public enum ModelKind { ZOMBIE, SPIDER, SILVERFISH, HORSE, SIREN }

	/** マキマが支配下の Mob 種から借りる攻撃 (MakimaMobs が使う) */
	public enum Ability { NONE, POUNCE, ACID, SPORES, POISON, FIRE, SHOCK, SLAM, PULL, LEECH }

	/**
	 * @param name     登録名 (= テクスチャ名 textures/entity/&lt;name&gt;.png)
	 * @param variants テクスチャの段階数 (1 なら単一。2 以上なら &lt;name&gt;_&lt;n&gt;.png, n=1..)
	 * @param weight   ウェーブ/コマンドでの出現重み (0 = ウェーブでは出さない)
	 * @param maxAlive 同時に存在できる上限 (ボス級の抑制。0 = 制限なし)
	 * @param boss     ボス級 (ウイルス蘇生・支配・乗っ取りの対象外)
	 * @param ability  マキマが支配したときに借りる攻撃
	 */
	public record Entry(String name, Faction faction, ModelKind model, EntityType<? extends FactionMonster> type,
						int variants, int weight, int maxAlive, boolean boss, Ability ability) {
	}

	private static final List<Entry> ENTRIES = new ArrayList<>();
	public static final List<Entry> ALL = Collections.unmodifiableList(ENTRIES);

	private FactionEntities() {}

	public static <T extends FactionMonster> EntityType<T> register(String name, Faction faction, ModelKind model,
			EntityType.Builder<T> builder, Supplier<AttributeSupplier.Builder> attributes, int variants, int weight, int maxAlive) {
		return register(name, faction, model, builder, attributes, variants, weight, maxAlive, false, Ability.NONE);
	}

	public static <T extends FactionMonster> EntityType<T> register(String name, Faction faction, ModelKind model,
			EntityType.Builder<T> builder, Supplier<AttributeSupplier.Builder> attributes, int variants, int weight, int maxAlive,
			boolean boss, Ability ability) {
		ResourceKey<EntityType<?>> key = ResourceKey.create(Registries.ENTITY_TYPE, Identifier.fromNamespaceAndPath(YakataMod.MOD_ID, name));
		EntityType<T> type = Registry.register(BuiltInRegistries.ENTITY_TYPE, key,
			builder.clientTrackingRange(model == ModelKind.SIREN ? 16 : 8).notInPeaceful().build(key));
		FabricDefaultAttributeRegistry.register(type, attributes.get());
		ENTRIES.add(new Entry(name, faction, model, type, variants, weight, maxAlive, boss, ability));
		return type;
	}

	public static @Nullable Entry entry(EntityType<?> type) {
		for (Entry e : ENTRIES) {
			if (e.type() == type) {
				return e;
			}
		}
		return null;
	}

	public static @Nullable Entry byName(String name) {
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

	public static boolean isBoss(EntityType<?> type) {
		Entry e = entry(type);
		return e != null && e.boss();
	}

	public static void init() {
		// /yakata spawn <faction|mob> で曖昧にならないよう、Mob 名と陣営 id の衝突を禁止する
		for (Entry e : ENTRIES) {
			if (Faction.byId(e.name()) != null) {
				throw new IllegalStateException("Mob 名が陣営 id と衝突しています: " + e.name());
			}
		}
		YakataMod.LOGGER.info("[yakata] {} 陣営 / {} 種の陣営 Mob を登録しました", Faction.count(), ENTRIES.size());
	}
}
