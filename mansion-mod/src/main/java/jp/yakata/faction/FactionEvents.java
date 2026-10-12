package jp.yakata.faction;

import jp.yakata.YakataMod;
import jp.yakata.faction.entity.FactionMonster;
import net.minecraft.core.BlockPos;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.monster.zombie.ZombieVillager;
import net.minecraft.world.entity.npc.villager.AbstractVillager;
import net.minecraft.world.entity.player.Player;

/**
 * 死亡イベント: 陣営間キルの集計と感染転化。
 * 陣営 Mob が村人/ゾンビ村人を殺すと、その場に殺した陣営の Mob が立ち上がる。
 * プレイヤーは普通に死ぬだけ (転化しない)。
 */
public final class FactionEvents {
	private static int loggedKills;

	private FactionEvents() {}

	public static void afterDeath(LivingEntity victim, DamageSource source) {
		if (!(victim.level() instanceof ServerLevel level)) {
			return;
		}
		Faction victimFaction = FactionMob.factionOf(victim);
		if (victimFaction != null) {
			FactionStats.recordDeath(victimFaction);
		}
		Entity killer = source.getEntity();
		if (!(killer instanceof FactionMob)) {
			// 吹き飛ばされて落下死した場合なども、最後に攻撃した陣営 Mob の手柄にする
			killer = victim.getKillCredit();
		}
		Faction killerFaction = FactionMob.factionOf(killer);
		if (killerFaction == null) {
			return;
		}
		if (victimFaction != null) {
			if (victimFaction != killerFaction) {
				FactionStats.recordFactionKill(killerFaction, victimFaction);
				long total = FactionStats.totalFactionKills();
				if (loggedKills < 10 || total % 25 == 0) {
					loggedKills++;
					YakataMod.LOGGER.info("[yakata] 陣営間キル #{}: {} ({}) が {} ({}) を倒した", total,
						killer.getType().toShortString(), killerFaction.enName, victim.getType().toShortString(), victimFaction.enName);
				}
			}
			return;
		}
		if (victim instanceof Player) {
			FactionStats.recordPlayerKill(killerFaction);
			return;
		}
		if (victim instanceof AbstractVillager || victim instanceof ZombieVillager) {
			FactionStats.recordSurvivorKill(killerFaction);
			convert(level, victim, killerFaction);
		}
	}

	/** 感染転化: 犠牲者のいた場所に殺した陣営の Mob を立ち上がらせる。 */
	private static void convert(ServerLevel level, LivingEntity victim, Faction faction) {
		EntityType<? extends FactionMonster> type = FactionEntities.conversionFor(faction);
		int count = faction == Faction.GVIRUS ? 2 : 1; // G 胚は体内で増殖する
		BlockPos at = victim.blockPosition();
		int spawned = 0;
		for (int i = 0; i < count; i++) {
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
			level.sendParticles(ParticleTypes.SQUID_INK, victim.getX(), victim.getY() + 0.8, victim.getZ(), 12, 0.3, 0.4, 0.3, 0.02);
			level.playSound(null, victim.getX(), victim.getY(), victim.getZ(), SoundEvents.ZOMBIE_INFECT, SoundSource.HOSTILE, 1.0F, 0.8F);
			YakataMod.LOGGER.info("[yakata] 感染転化: {} が {} により {} として蘇った ({})",
				victim.getType().toShortString(), faction.enName, type.toShortString(), at);
		}
	}
}
