package jp.yakata.faction;

import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.phys.Vec3;
import org.jspecify.annotations.Nullable;

import java.util.ArrayList;
import java.util.List;

/**
 * 倒れた者の「死体」の記録 (エンティティとしては残らないので位置と素性だけを覚える)。
 * フラッドの感染体やネクロモーフのインフェクターが近くの死体を見つけて乗っ取り、新しい個体として立ち上がらせる。
 * 死体は 60 秒で朽ちる。メインスレッド専用。
 */
public final class Corpses {
	private static final int TTL = 20 * 60;
	private static final int MAX = 64;
	private static final List<Corpse> LIST = new ArrayList<>();

	/**
	 * @param faction   生前の陣営 (村人などは null)
	 * @param maxHealth 生前の最大体力 (大柄な死体からは大型の個体が生まれる)
	 */
	public record Corpse(Vec3 pos, long time, EntityType<?> type, @Nullable Faction faction, float maxHealth, float scale, boolean villager) {
	}

	private Corpses() {}

	public static void clear() {
		LIST.clear();
	}

	public static void record(LivingEntity victim, long now, boolean villager) {
		Faction f = FactionMob.factionOf(victim);
		LIST.add(new Corpse(victim.position(), now, victim.getType(), f, victim.getMaxHealth(), victim.getScale(), villager));
		if (LIST.size() > MAX) {
			LIST.remove(0);
		}
	}

	public static void expire(long now) {
		LIST.removeIf(c -> now - c.time() > TTL || now < c.time());
	}

	/** pos から radius 以内で、self の陣営が乗っ取れる (別陣営の) 最も近い死体 */
	public static @Nullable Corpse nearest(Vec3 pos, double radius, Faction self) {
		Corpse best = null;
		double bestD = radius * radius;
		for (Corpse c : LIST) {
			if (c.faction() == self) {
				continue;
			}
			double d = c.pos().distanceToSqr(pos);
			if (d < bestD) {
				bestD = d;
				best = c;
			}
		}
		return best;
	}

	/** 死体を取り除く (乗っ取られた)。既に朽ちていれば false */
	public static boolean consume(Corpse c) {
		return LIST.remove(c);
	}

	public static int size() {
		return LIST.size();
	}
}
