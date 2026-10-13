package jp.yakata.faction;

import jp.yakata.faction.entity.FactionMonster;
import net.minecraft.ChatFormatting;
import net.minecraft.network.chat.Component;
import net.minecraft.world.entity.EntityType;
import org.jspecify.annotations.Nullable;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.function.Supplier;

/**
 * 洋館に巣食う陣営 (データ駆動のレジストリ)。同じ陣営同士は決して争わない。
 * <p>陣営は各 Mob ファイル (例: {@code FloodMobs.FACTION}) で {@link #builder(String)} から定義し、
 * {@link Factions#bootstrap()} の一覧に 1 行足すだけで、ディレクター (初期配置・ウェーブ・本拠地)、コマンド、
 * サイドバー、戦果集計、感染転化のすべてに自動で組み込まれる。
 */
public final class Faction {
	private static final List<Faction> REGISTRY = new ArrayList<>();
	private static final List<Faction> VIEW = Collections.unmodifiableList(REGISTRY);

	/** 初期配置 1 件: Mob 種と数 */
	public record Seed(Supplier<? extends EntityType<? extends FactionMonster>> type, int count) {
	}

	private final String id;
	private final int index;
	public final String jaName;
	public final String enName;
	public final ChatFormatting color;
	/** 本拠地にしたい部屋 (MansionInfo.roomNames。先頭ほど優先)。"yard" は洋館の前庭 (屋外) */
	public final List<String> homeRooms;
	/** 同じ部屋を本拠地として共有しない陣営 id */
	public final Set<String> rivals;
	/** 陣営ごとの同時存在数の上限 (ウェーブ補充・感染転化で守る) */
	public final int cap;
	public final List<Seed> seeds;
	private final @Nullable Supplier<? extends EntityType<? extends FactionMonster>> conversion;
	/** 村人 1 人の転化で生まれる数 */
	public final int conversionCount;
	/** t/G/T-ベロニカのようなウイルス: 倒した他陣営の化け物を感染体として蘇らせる */
	public final boolean virus;
	/** 他陣営の感染・転化 (ウイルス蘇生、フラッド/ネクロモーフの乗っ取り) を受けない */
	public final boolean infectionImmune;
	/** マキマの支配を受けない */
	public final boolean controlImmune;
	public final FactionHooks hooks;

	private Faction(Builder b) {
		this.id = b.id;
		this.index = REGISTRY.size();
		this.jaName = b.jaName;
		this.enName = b.enName;
		this.color = b.color;
		this.homeRooms = List.copyOf(b.homeRooms);
		this.rivals = Set.copyOf(b.rivals);
		this.cap = b.cap;
		this.seeds = List.copyOf(b.seeds);
		this.conversion = b.conversion;
		this.conversionCount = b.conversionCount;
		this.virus = b.virus;
		this.infectionImmune = b.infectionImmune;
		this.controlImmune = b.controlImmune;
		this.hooks = b.hooks;
	}

	// ---- レジストリ ------------------------------------------------------------

	/** 登録順の全陣営 */
	public static List<Faction> values() {
		return VIEW;
	}

	public static int count() {
		return REGISTRY.size();
	}

	public static @Nullable Faction byId(String id) {
		for (Faction f : REGISTRY) {
			if (f.id.equalsIgnoreCase(id)) {
				return f;
			}
		}
		return null;
	}

	public static Builder builder(String id) {
		return new Builder(id);
	}

	// ---- 属性 ------------------------------------------------------------------

	/** コマンドで使う小文字 id (tvirus, flood, ...) */
	public String id() {
		return this.id;
	}

	/** 0 から始まる登録番号 (集計配列の添字) */
	public int ordinal() {
		return this.index;
	}

	/** 村人を殺したときに立ち上がる Mob (無ければ null = 転化しない) */
	public @Nullable EntityType<? extends FactionMonster> conversionType() {
		return this.conversion == null ? null : this.conversion.get();
	}

	public boolean isRival(Faction other) {
		return this.rivals.contains(other.id) || other.rivals.contains(this.id);
	}

	public Component displayName() {
		return Component.translatableWithFallback("faction.yakata." + this.id, this.jaName).withStyle(this.color);
	}

	@Override
	public String toString() {
		return this.enName;
	}

	public static final class Builder {
		private final String id;
		private String jaName;
		private String enName;
		private ChatFormatting color = ChatFormatting.WHITE;
		private final List<String> homeRooms = new ArrayList<>();
		private final Set<String> rivals = new LinkedHashSet<>();
		private int cap = 20;
		private final List<Seed> seeds = new ArrayList<>();
		private @Nullable Supplier<? extends EntityType<? extends FactionMonster>> conversion;
		private int conversionCount = 1;
		private boolean virus;
		private boolean infectionImmune;
		private boolean controlImmune;
		private FactionHooks hooks = FactionHooks.NONE;

		private Builder(String id) {
			this.id = id.toLowerCase(Locale.ROOT);
			this.jaName = id;
			this.enName = id;
		}

		public Builder names(String ja, String en) {
			this.jaName = ja;
			this.enName = en;
			return this;
		}

		public Builder color(ChatFormatting color) {
			this.color = color;
			return this;
		}

		public Builder home(String... rooms) {
			this.homeRooms.addAll(List.of(rooms));
			return this;
		}

		public Builder rivals(String... ids) {
			this.rivals.addAll(List.of(ids));
			return this;
		}

		public Builder cap(int cap) {
			this.cap = cap;
			return this;
		}

		public Builder seed(Supplier<? extends EntityType<? extends FactionMonster>> type, int count) {
			this.seeds.add(new Seed(type, count));
			return this;
		}

		public Builder conversion(Supplier<? extends EntityType<? extends FactionMonster>> type, int count) {
			this.conversion = type;
			this.conversionCount = count;
			return this;
		}

		public Builder virus() {
			this.virus = true;
			return this;
		}

		public Builder infectionImmune() {
			this.infectionImmune = true;
			return this;
		}

		public Builder controlImmune() {
			this.controlImmune = true;
			return this;
		}

		public Builder hooks(FactionHooks hooks) {
			this.hooks = hooks;
			return this;
		}

		/** 陣営をレジストリへ登録する (登録順 = 表示順) */
		public Faction register() {
			for (Faction f : REGISTRY) {
				if (f.id.equals(this.id)) {
					throw new IllegalStateException("陣営 id が重複しています: " + this.id);
				}
			}
			Faction f = new Faction(this);
			REGISTRY.add(f);
			return f;
		}
	}
}
