package jp.yakata.faction;

import jp.yakata.YakataMod;
import jp.yakata.faction.entity.FactionMonster;
import net.minecraft.core.BlockPos;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.tags.DamageTypeTags;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.monster.zombie.ZombieVillager;
import net.minecraft.world.entity.npc.villager.AbstractVillager;
import net.minecraft.world.entity.player.Player;
import org.jspecify.annotations.Nullable;

/**
 * 死亡イベント: 陣営間キルの集計と感染転化 (すべて陣営データ/フックから駆動)。
 * <ul>
 *   <li>致命傷 (ALLOW_DEATH): Mob 自身の形態変化・四肢切断 ({@link FactionMonster#tryCheatDeath}) と、
 *       倒した側の陣営フック ({@link FactionHooks#onLethalBlow}: マキマの寝返り) で死を取り消せる。</li>
 *   <li>死亡後 (AFTER_DEATH): キル集計 → 倒した陣営のフック ({@link FactionHooks#onKill}) →
 *       共通の転化 (村人は陣営の conversion 種として蘇る / ウイルス陣営に倒された化け物は 50% で感染体として蘇る)。</li>
 *   <li>倒れた者は「死体」として記録され ({@link Corpses})、フラッド/ネクロモーフの感染体が乗っ取れる。</li>
 * </ul>
 * プレイヤーは普通に死ぬだけ (転化しない)。
 */
public final class FactionEvents {
	/** ウイルスで倒れた化け物が蘇る確率 */
	public static final float VIRUS_RISE_CHANCE = 0.5F;
	private static int loggedKills;

	private FactionEvents() {}

	/** 吹き飛ばされて落下死した場合なども、最後に攻撃した陣営 Mob の手柄にする */
	public static @Nullable Entity killerOf(LivingEntity victim, DamageSource source) {
		Entity killer = source.getEntity();
		if (!(killer instanceof FactionMob)) {
			killer = victim.getKillCredit();
		}
		return killer;
	}

	public static boolean allowDeath(LivingEntity victim, DamageSource source, float amount) {
		if (!(victim.level() instanceof ServerLevel level) || source.is(DamageTypeTags.BYPASSES_INVULNERABILITY)) {
			return true; // /kill や奈落は取り消さない
		}
		try {
			if (victim instanceof FactionMonster fm && fm.tryCheatDeath(level, source)) {
				return false;
			}
			Entity killer = killerOf(victim, source);
			Faction killerFaction = FactionMob.factionOf(killer);
			if (killerFaction != null && killerFaction != FactionMob.factionOf(victim)
				&& killerFaction.hooks.onLethalBlow(level, victim, killer, source)) {
				return false;
			}
		} catch (RuntimeException e) {
			YakataMod.LOGGER.warn("[yakata] 致命傷の処理に失敗しました ({})", victim.getType().toShortString(), e);
		}
		return true;
	}

	public static void afterDeath(LivingEntity victim, DamageSource source) {
		if (!(victim.level() instanceof ServerLevel level)) {
			return;
		}
		Faction victimFaction = FactionMob.factionOf(victim);
		if (victimFaction != null) {
			FactionStats.recordDeath(victimFaction);
		}
		boolean villager = victim instanceof AbstractVillager || victim instanceof ZombieVillager;
		if (isInfectable(victim) && (villager || victimFaction != null)) {
			Corpses.record(victim, level.getGameTime(), villager);
		}
		Entity killer = killerOf(victim, source);
		Faction killerFaction = FactionMob.factionOf(killer);
		if (killerFaction == null || killerFaction == victimFaction) {
			return;
		}
		if (victimFaction != null) {
			FactionStats.recordFactionKill(killerFaction, victimFaction);
			long total = FactionStats.totalFactionKills();
			if (loggedKills < 12 || total % 25 == 0) {
				loggedKills++;
				YakataMod.LOGGER.info("[yakata] 陣営間キル #{}: {} ({}) が {} ({}) を倒した", total,
					killer.getType().toShortString(), killerFaction.enName, victim.getType().toShortString(), victimFaction.enName);
			}
		} else if (victim instanceof Player) {
			FactionStats.recordPlayerKill(killerFaction);
			return;
		} else if (villager) {
			FactionStats.recordSurvivorKill(killerFaction);
		} else {
			return;
		}
		try {
			if (killerFaction.hooks.onKill(level, victim, killer, source)) {
				return;
			}
			if (villager) {
				convertVillager(level, victim, killerFaction);
			} else if (killerFaction.virus) {
				virusRise(level, victim, killerFaction);
			}
		} catch (RuntimeException e) {
			YakataMod.LOGGER.warn("[yakata] 感染転化に失敗しました ({})", victim.getType().toShortString(), e);
		}
	}

	/** 感染・転化の対象になれるか (ボス級と、感染無効の陣営は除く) */
	public static boolean isInfectable(LivingEntity e) {
		if (e instanceof Player) {
			return false;
		}
		if (FactionEntities.isBoss(e.getType())) {
			return false;
		}
		Faction f = FactionMob.factionOf(e);
		if (f != null && f.infectionImmune) {
			return false;
		}
		return !(e instanceof FactionMonster fm && fm.nativeFaction().infectionImmune);
	}

	/** ウイルス陣営に倒された別陣営の化け物は、確率で殺した陣営の感染体として蘇る (陣営の上限まで)。 */
	private static void virusRise(ServerLevel level, LivingEntity victim, Faction virus) {
		EntityType<? extends FactionMonster> type = virus.conversionType();
		if (type == null || !isInfectable(victim) || victim.getRandom().nextFloat() >= VIRUS_RISE_CHANCE
			|| !FactionDirector.hasRoom(level, virus)) {
			return;
		}
		FactionStats.event("virus_rise_" + virus.id());
		FactionDirector.scheduleRise(level, victim.position(), type, virus, 60 + victim.getRandom().nextInt(60),
			virus.enName + " ウイルス蘇生: " + victim.getType().toShortString(), victim.getCustomName(), null);
	}

	/** 感染転化: 犠牲者のいた場所に殺した陣営の Mob を立ち上がらせる。 */
	public static int convertVillager(ServerLevel level, LivingEntity victim, Faction faction) {
		EntityType<? extends FactionMonster> type = faction.conversionType();
		if (type == null) {
			return 0;
		}
		BlockPos at = victim.blockPosition();
		int spawned = 0;
		for (int i = 0; i < faction.conversionCount; i++) {
			FactionMonster mob = type.create(level, EntitySpawnReason.CONVERSION);
			if (mob == null) {
				continue;
			}
			mob.snapTo(victim.getX(), victim.getY(), victim.getZ(), victim.getYRot(), 0.0F);
			mob.finalizeSpawn(level, level.getCurrentDifficultyAt(at), EntitySpawnReason.CONVERSION, null);
			mob.setPersistenceRequired();
			if (victim.hasCustomName()) {
				mob.setCustomName(victim.getCustomName());
			}
			if (level.addFreshEntity(mob)) {
				spawned++;
			}
		}
		if (spawned > 0) {
			FactionStats.recordConversion(faction);
			FactionStats.event("villager_conversion_" + faction.id());
			level.sendParticles(ParticleTypes.SQUID_INK, victim.getX(), victim.getY() + 0.8, victim.getZ(), 12, 0.3, 0.4, 0.3, 0.02);
			level.playSound(null, victim.getX(), victim.getY(), victim.getZ(), SoundEvents.ZOMBIE_INFECT, SoundSource.HOSTILE, 1.0F, 0.8F);
			YakataMod.LOGGER.info("[yakata] 感染転化: {} が {} により {} として蘇った ({})",
				victim.getType().toShortString(), faction.enName, type.toShortString(), at);
		}
		return spawned;
	}
}
