package jp.yakata.faction;

import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.animal.golem.IronGolem;
import net.minecraft.world.entity.monster.zombie.ZombieVillager;
import net.minecraft.world.entity.npc.villager.AbstractVillager;
import net.minecraft.world.entity.player.Player;

/** 陣営に属する Mob。陣営 id で敵味方を判定する。 */
public interface FactionMob {
	Faction getFaction();

	/** 同じ陣営か (どちらかが陣営 Mob でなければ false)。 */
	static boolean sameFaction(Entity a, Entity b) {
		return a instanceof FactionMob fa && b instanceof FactionMob fb && fa.getFaction() == fb.getFaction();
	}

	/** 陣営 Mob なら陣営を、そうでなければ null を返す。 */
	static Faction factionOf(Entity e) {
		return e instanceof FactionMob fm ? fm.getFaction() : null;
	}

	/**
	 * self が target を「獲物」として自発的に狙うか。
	 * 別陣営の感染体・プレイヤー・村人 (生存者)・ゾンビ村人・アイアンゴーレムが対象。同じ陣営は決して狙わない。
	 */
	static boolean isPrey(FactionMob self, LivingEntity target) {
		if (target == self || !target.isAlive()) {
			return false;
		}
		if (target instanceof FactionMob other) {
			return other.getFaction() != self.getFaction();
		}
		return target instanceof Player
			|| target instanceof AbstractVillager
			|| target instanceof ZombieVillager
			|| target instanceof IronGolem;
	}
}
