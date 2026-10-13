package jp.yakata.faction.entity;

import jp.yakata.faction.Faction;
import jp.yakata.faction.FactionMob;
import jp.yakata.faction.FactionStats;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.monster.zombie.ZombieVillager;
import net.minecraft.world.entity.npc.villager.AbstractVillager;
import net.minecraft.world.phys.Vec3;
import org.jspecify.annotations.Nullable;
import net.minecraft.core.particles.ParticleOptions;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.entity.monster.Monster;
import net.minecraft.world.phys.AABB;

import java.util.List;
import java.util.function.Consumer;

/** 陣営 Mob 共通の小道具 (属性・範囲効果・子供の放出)。 */
public final class MobUtil {
	private MobUtil() {}

	public static AttributeSupplier.Builder attrs(double health, double speed, double damage, double armor, double follow) {
		return Monster.createMonsterAttributes()
			.add(Attributes.MAX_HEALTH, health)
			.add(Attributes.MOVEMENT_SPEED, speed)
			.add(Attributes.ATTACK_DAMAGE, damage)
			.add(Attributes.ARMOR, armor)
			.add(Attributes.FOLLOW_RANGE, follow);
	}

	/** source の周囲 radius 内にいる「敵」(別陣営・プレイヤー・村人等) すべてに action を適用する。 */
	public static int forEnemiesAround(FactionMonster source, double radius, Consumer<LivingEntity> action) {
		AABB box = source.getBoundingBox().inflate(radius);
		List<LivingEntity> list = source.level().getEntitiesOfClass(LivingEntity.class, box,
			e -> e != source && e.isAlive() && !FactionMob.sameFaction(source, e) && e.distanceToSqr(source) <= radius * radius
				&& FactionMob.isPrey(source, e));
		list.forEach(action);
		return list.size();
	}

	public static void effect(LivingEntity target, MobEffectInstance effect, LivingEntity source) {
		target.addEffect(effect, source);
	}

	public static void particles(ServerLevel level, ParticleOptions particle, LivingEntity at, int count, double spread, double speed) {
		level.sendParticles(particle, at.getX(), at.getY() + at.getBbHeight() * 0.5, at.getZ(), count, spread, spread * 0.6, spread, speed);
	}

	/** 範囲ダメージ (酸の血など)。殺した場合は source の手柄になり、感染/キル集計にも反映される。 */
	public static void hurt(ServerLevel level, LivingEntity target, DamageSource source, float amount) {
		target.hurtServer(level, source, amount);
	}

	/** 親の近くに同陣営の子 Mob を産み出す。 */
	public static <T extends Mob> T spawnNear(ServerLevel level, EntityType<T> type, LivingEntity parent, double spread) {
		T mob = type.create(level, EntitySpawnReason.MOB_SUMMONED);
		if (mob == null) {
			return null;
		}
		double x = parent.getX() + (level.getRandom().nextDouble() - 0.5) * spread;
		double z = parent.getZ() + (level.getRandom().nextDouble() - 0.5) * spread;
		mob.snapTo(x, parent.getY(), z, level.getRandom().nextFloat() * 360.0F, 0.0F);
		if (!level.noCollision(mob)) {
			mob.snapTo(parent.getX(), parent.getY(), parent.getZ(), parent.getYRot(), 0.0F);
		}
		mob.finalizeSpawn(level, level.getCurrentDifficultyAt(mob.blockPosition()), EntitySpawnReason.MOB_SUMMONED, null);
		level.addFreshEntity(mob);
		return mob;
	}

	public static int countNear(LivingEntity center, EntityType<?> type, double radius) {
		return center.level().getEntities(type, center.getBoundingBox().inflate(radius), e -> e.isAlive()).size();
	}

	/** 戦力の目安 (マキマの支配判定・黒いチェンソーマンの成長判定) */
	public static double power(LivingEntity e) {
		double dmg = e.getAttributes().hasAttribute(Attributes.ATTACK_DAMAGE) ? e.getAttributeValue(Attributes.ATTACK_DAMAGE) : 1.0;
		return e.getMaxHealth() + dmg * 10.0 + e.getArmorValue() * 2.0;
	}

	/**
	 * 攻撃が victim の正面から来たか (cosine > 0.3 ≒ 前方 ±72°)。攻撃者/弾の位置で判定する。
	 */
	public static boolean fromFront(LivingEntity victim, DamageSource source) {
		Vec3 from = source.getSourcePosition();
		if (from == null) {
			return true;
		}
		Vec3 facing = Vec3.directionFromRotation(0.0F, victim.yBodyRot);
		Vec3 dir = new Vec3(from.x - victim.getX(), 0.0, from.z - victim.getZ());
		if (dir.lengthSqr() < 1.0E-4) {
			return true;
		}
		return facing.dot(dir.normalize()) > 0.3;
	}

	/**
	 * 命中した高さ (0=足元, 1=頭頂)。弾なら弾の位置、近接なら攻撃者の目の高さから推定。不明なら -1。
	 */
	public static double hitHeight(LivingEntity victim, DamageSource source) {
		Entity direct = source.getDirectEntity();
		if (direct == null) {
			return -1.0;
		}
		double y = direct instanceof LivingEntity living ? Math.min(living.getEyeY() - 0.2, victim.getY() + victim.getBbHeight())
			: direct.getY() + direct.getBbHeight() * 0.5;
		return Math.max(0.0, Math.min(1.0, (y - victim.getY()) / Math.max(0.1, victim.getBbHeight())));
	}

	/** target を puller の方へ引き寄せる (伸びる腕・鎖・舌) */
	public static void pull(LivingEntity puller, LivingEntity target, double strength) {
		Vec3 dir = new Vec3(puller.getX() - target.getX(), 0.0, puller.getZ() - target.getZ());
		if (dir.lengthSqr() < 1.0E-4) {
			return;
		}
		double resist = 1.0 - target.getAttributeValue(Attributes.KNOCKBACK_RESISTANCE);
		dir = dir.normalize().scale(strength * resist);
		target.push(dir.x, 0.25 * resist, dir.z);
	}

	/** source から target を吹き飛ばす */
	public static void knock(LivingEntity source, LivingEntity target, double strength, double up) {
		Vec3 dir = new Vec3(target.getX() - source.getX(), 0.0, target.getZ() - source.getZ());
		if (dir.lengthSqr() < 1.0E-4) {
			dir = source.getLookAngle();
		}
		dir = dir.normalize();
		double resist = 1.0 - target.getAttributeValue(Attributes.KNOCKBACK_RESISTANCE);
		target.push(dir.x * strength * resist, up * resist, dir.z * strength * resist);
	}

	/** 視線が通る距離 range 以内の敵か */
	public static boolean inReach(Mob self, LivingEntity target, double range) {
		return target.isAlive() && self.distanceToSqr(target) <= range * range && self.getSensing().hasLineOfSight(target);
	}

	/**
	 * 乗っ取り: victim をその場から消し (死体は残さない)、type を立ち上がらせる。
	 * 殺した扱いでキル/転化の集計にも数える。
	 */
	public static <T extends FactionMonster> @Nullable T takeOver(ServerLevel level, LivingEntity victim, EntityType<T> type, Faction faction, String reason) {
		T mob = type.create(level, EntitySpawnReason.CONVERSION);
		if (mob == null) {
			return null;
		}
		mob.snapTo(victim.getX(), victim.getY(), victim.getZ(), victim.getYRot(), 0.0F);
		mob.finalizeSpawn(level, level.getCurrentDifficultyAt(victim.blockPosition()), EntitySpawnReason.CONVERSION, null);
		mob.setPersistenceRequired();
		if (victim.hasCustomName()) {
			mob.setCustomName(victim.getCustomName());
		}
		Faction victimFaction = FactionMob.factionOf(victim);
		level.sendParticles(ParticleTypes.SQUID_INK, victim.getX(), victim.getY() + 0.8, victim.getZ(), 16, 0.3, 0.4, 0.3, 0.02);
		level.playSound(null, victim.getX(), victim.getY(), victim.getZ(), SoundEvents.ZOMBIE_INFECT, SoundSource.HOSTILE, 1.0F, 0.6F);
		victim.discard();
		if (!level.addFreshEntity(mob)) {
			return null;
		}
		if (victimFaction != null && victimFaction != faction) {
			FactionStats.recordDeath(victimFaction);
			FactionStats.recordFactionKill(faction, victimFaction);
		}
		FactionStats.recordConversion(faction);
		jp.yakata.YakataMod.LOGGER.info("[yakata] 乗っ取り ({}): {} → {} ({})", reason, victim.getType().toShortString(),
			type.toShortString(), victim.blockPosition().toShortString());
		return mob;
	}

	/** 村人 (生存者) か */
	public static boolean isSurvivor(LivingEntity e) {
		return e instanceof AbstractVillager || e instanceof ZombieVillager;
	}
}
