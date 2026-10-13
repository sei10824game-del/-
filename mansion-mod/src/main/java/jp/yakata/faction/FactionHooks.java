package jp.yakata.faction;

import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.LivingEntity;

/**
 * 陣営固有の振る舞いの差し込み口。陣営定義 ({@link Faction.Builder#hooks}) で必要なものだけ実装する。
 * 呼び出し元: {@link FactionDirector} (毎秒) と {@link FactionEvents} (致命傷/死亡)。
 */
public interface FactionHooks {
	FactionHooks NONE = new FactionHooks() {
	};

	/** 1 秒ごと (ゼノの宿主の孵化、T-ベロニカの花粉感染の進行など) */
	default void tickSecond(ServerLevel level) {
	}

	/**
	 * この陣営の Mob が victim に致命傷を与えた瞬間 (死亡確定前)。true を返すと死亡を取り消す
	 * (マキマ: 視界内で倒された者は寝返る)。体力の再設定は実装側で行う。
	 */
	default boolean onLethalBlow(ServerLevel level, LivingEntity victim, Entity killer, DamageSource source) {
		return false;
	}

	/**
	 * この陣営の Mob が別陣営の Mob / 村人を倒した後。true を返すと共通の感染転化 (村人の転化・ウイルス蘇生) を行わない。
	 */
	default boolean onKill(ServerLevel level, LivingEntity victim, Entity killer, DamageSource source) {
		return false;
	}
}
