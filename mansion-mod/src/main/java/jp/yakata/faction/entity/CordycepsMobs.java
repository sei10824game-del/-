package jp.yakata.faction.entity;

import jp.yakata.faction.Faction;
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

/** 冬虫夏草 (菌類感染) 陣営: ランナー / クリッカー / ブローター。胞子で他陣営を鈍らせる。 */
public final class CordycepsMobs {
	private CordycepsMobs() {}

	/** 胞子を浴びた敵を鈍化 (+弱体化) させる。同陣営には効かない。 */
	static int sporeBurst(FactionMonster source, ServerLevel level, double radius, int duration, int slowAmp, boolean poison) {
		level.sendParticles(ParticleTypes.SPORE_BLOSSOM_AIR, source.getX(), source.getY() + 1.0, source.getZ(), 60, radius * 0.5, 0.8, radius * 0.5, 0.02);
		level.sendParticles(ParticleTypes.WARPED_SPORE, source.getX(), source.getY() + 1.0, source.getZ(), 40, radius * 0.5, 0.8, radius * 0.5, 0.02);
		source.playSound(SoundEvents.PUFFER_FISH_BLOW_UP, 1.2F, 0.5F);
		return MobUtil.forEnemiesAround(source, radius, e -> {
			e.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, duration, slowAmp), source);
			e.addEffect(new MobEffectInstance(MobEffects.WEAKNESS, duration, 0), source);
			if (poison) {
				e.addEffect(new MobEffectInstance(MobEffects.POISON, 80, 0), source);
			}
		});
	}

	public abstract static class Fungal extends FactionMonster {
		protected Fungal(EntityType<? extends Fungal> type, Level level) {
			super(type, level);
		}

		@Override
		protected void onDeathEffect(ServerLevel level, DamageSource source) {
			// 倒れた菌類感染者は小さな胞子の雲を残す
			sporeBurst(this, level, 2.5, 60, 0, false);
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.HUSK_AMBIENT;
		}

		@Override
		protected SoundEvent getHurtSound(DamageSource source) {
			return SoundEvents.HUSK_HURT;
		}

		@Override
		protected SoundEvent getDeathSound() {
			return SoundEvents.HUSK_DEATH;
		}

		@Override
		public Faction getFaction() {
			return Faction.CORDYCEPS;
		}
	}

	/** ランナー。感染初期段階。走って襲い、噛みつきで胞子を植え付ける (鈍化)。 */
	public static class Runner extends Fungal {
		public Runner(EntityType<? extends Runner> type, Level level) {
			super(type, level);
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(20.0, 0.30, 4.0, 1.0, 32.0);
		}

		@Override
		protected double chaseSpeed() {
			return 1.25;
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			target.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, 60, 0), this);
		}
	}

	/** クリッカー。頭部が菌で裂けた盲目の感染者。反響音で獲物を探し、噛みつきは致命的。 */
	public static class Clicker extends Fungal {
		public Clicker(EntityType<? extends Clicker> type, Level level) {
			super(type, level);
			this.xpReward = 8;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(32.0, 0.26, 9.0, 5.0, 20.0);
		}

		@Override
		protected boolean mustSeeTarget() {
			return false;
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			target.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, 40, 1), this);
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.SKELETON_AMBIENT;
		}

		@Override
		public float getVoicePitch() {
			return 1.8F; // カチカチという反響音
		}
	}

	/** ブローター。菌の装甲に覆われた巨体。周期的に胞子をまき散らし、他陣営をまとめて鈍らせる。 */
	public static class Bloater extends Fungal {
		private int sporeCooldown = 60;

		public Bloater(EntityType<? extends Bloater> type, Level level) {
			super(type, level);
			this.xpReward = 20;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(90.0, 0.2, 8.0, 8.0, 32.0)
				.add(Attributes.SCALE, 1.3)
				.add(Attributes.KNOCKBACK_RESISTANCE, 0.7);
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			if (this.sporeCooldown > 0) {
				this.sporeCooldown--;
				return;
			}
			LivingEntity target = this.getTarget();
			if (target != null && target.isAlive() && this.distanceToSqr(target) < 8.0 * 8.0) {
				sporeBurst(this, level, 6.0, 100, 1, false);
				this.sporeCooldown = 100;
			}
		}

		@Override
		protected void onDeathEffect(ServerLevel level, DamageSource source) {
			// 破裂して有毒な胞子を大量に放出
			sporeBurst(this, level, 5.0, 120, 1, true);
		}

		@Override
		public float getVoicePitch() {
			return 0.6F;
		}
	}
}
