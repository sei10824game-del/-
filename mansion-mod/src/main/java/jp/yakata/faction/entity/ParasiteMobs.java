package jp.yakata.faction.entity;

import jp.yakata.faction.Faction;
import jp.yakata.faction.FactionEntities;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.level.Level;
import org.jspecify.annotations.Nullable;

/** 寄生体陣営 (SRP 風): 虫の群れ / 寄生クローラー / 同化された人間。 */
public final class ParasiteMobs {
	private ParasiteMobs() {}

	/** 群体虫。弱いが数で押す小さな寄生虫。 */
	public static class Swarmer extends FactionMonster {
		public Swarmer(EntityType<? extends Swarmer> type, Level level) {
			super(type, level);
			this.xpReward = 1;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(6.0, 0.34, 2.0, 0.0, 24.0);
		}

		@Override
		protected double chaseSpeed() {
			return 1.15;
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.ENDERMITE_AMBIENT;
		}

		@Override
		protected SoundEvent getHurtSound(DamageSource source) {
			return SoundEvents.SILVERFISH_HURT;
		}

		@Override
		protected SoundEvent getDeathSound() {
			return SoundEvents.SILVERFISH_DEATH;
		}

		@Override
		protected SoundEvent getStepSound() {
			return SoundEvents.SILVERFISH_STEP;
		}

		@Override
		public Faction getFaction() {
			return Faction.PARASITE;
		}
	}

	/** 寄生クローラー。小型の多脚寄生体。壁を這い、跳びかかって神経毒を注ぐ (鈍化)。 */
	public static class Crawler extends ClimbingFactionMonster {
		public Crawler(EntityType<? extends Crawler> type, Level level) {
			super(type, level);
			this.xpReward = 5;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(18.0, 0.32, 4.0, 2.0, 32.0).add(Attributes.SCALE, 0.65);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(2, new PounceGoal(this, 2.0, 7.0, 0.9, 0.4, 50));
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			target.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, 30, 0), this);
		}

		@Override
		public float getVoicePitch() {
			return 1.4F;
		}

		@Override
		public Faction getFaction() {
			return Faction.PARASITE;
		}
	}

	/** 同化された人間。寄生体に乗っ取られた大柄な宿主。戦闘中に体内から群体虫を吐き出し、死ぬと破裂する。 */
	public static class Assimilated extends FactionMonster {
		private int broodCooldown = 100;

		public Assimilated(EntityType<? extends Assimilated> type, Level level) {
			super(type, level);
			this.xpReward = 12;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(45.0, 0.25, 7.0, 4.0, 36.0)
				.add(Attributes.SCALE, 1.15)
				.add(Attributes.KNOCKBACK_RESISTANCE, 0.3);
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			if (this.broodCooldown > 0) {
				this.broodCooldown--;
				return;
			}
			LivingEntity target = this.getTarget();
			if (target != null && target.isAlive() && MobUtil.countNear(this, FactionEntities.SWARMER, 16.0) < 8) {
				this.releaseBrood(level, 2);
				this.broodCooldown = 300;
			}
		}

		private void releaseBrood(ServerLevel level, int count) {
			for (int i = 0; i < count; i++) {
				MobUtil.spawnNear(level, FactionEntities.SWARMER, this, 1.5);
			}
			level.sendParticles(ParticleTypes.ITEM_SLIME, this.getX(), this.getY() + 1.2, this.getZ(), 15, 0.3, 0.3, 0.3, 0.1);
			this.playSound(SoundEvents.SLIME_SQUISH, 1.0F, 0.5F);
		}

		@Override
		protected void onDeathEffect(ServerLevel level, DamageSource source) {
			this.releaseBrood(level, 3);
		}

		@Override
		public float getVoicePitch() {
			return 0.75F;
		}

		@Override
		public Faction getFaction() {
			return Faction.PARASITE;
		}
	}
}
