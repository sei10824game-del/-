package jp.yakata.faction.entity;

import jp.yakata.faction.FactionMob;
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
}
