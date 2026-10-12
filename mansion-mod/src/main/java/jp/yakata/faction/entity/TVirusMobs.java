package jp.yakata.faction.entity;

import jp.yakata.faction.Faction;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.level.Level;
import net.minecraft.world.phys.Vec3;
import org.jspecify.annotations.Nullable;

/** t-ウイルス陣営: ゾンビ / クリムゾンヘッド / リッカー / タイラント。 */
public final class TVirusMobs {
	private TVirusMobs() {}

	/** t-ウイルスゾンビ。遅いが掴みかかる (命中時に短い鈍化)。 */
	public static class TZombie extends FactionMonster {
		public TZombie(EntityType<? extends TZombie> type, Level level) {
			super(type, level);
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(24.0, 0.23, 4.0, 2.0, 32.0);
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			if (this.random.nextFloat() < 0.35F) {
				target.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, 40, 1), this);
			}
		}

		@Override
		public Faction getFaction() {
			return Faction.TVIRUS;
		}
	}

	/** クリムゾンヘッド。ゾンビの再活性体。俊敏で、距離を詰めると飛びかかる。 */
	public static class CrimsonHead extends FactionMonster {
		public CrimsonHead(EntityType<? extends CrimsonHead> type, Level level) {
			super(type, level);
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(32.0, 0.31, 6.0, 3.0, 40.0).add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(2, new PounceGoal(this, 3.0, 7.0, 0.9, 0.42, 50));
		}

		@Override
		protected double chaseSpeed() {
			return 1.2;
		}

		@Override
		protected SoundEvent pounceSound() {
			return SoundEvents.ZOMBIE_AMBIENT;
		}

		@Override
		public float getVoicePitch() {
			return 1.35F + this.random.nextFloat() * 0.2F;
		}

		@Override
		public Faction getFaction() {
			return Faction.TVIRUS;
		}
	}

	/** リッカー。視覚を失い音で獲物を探す四足獣。壁を這い、遠くから大跳躍で襲う。 */
	public static class Licker extends ClimbingFactionMonster {
		public Licker(EntityType<? extends Licker> type, Level level) {
			super(type, level);
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(34.0, 0.32, 7.0, 2.0, 32.0);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(1, new PounceGoal(this, 4.0, 12.0, 1.25, 0.55, 70));
		}

		@Override
		protected boolean mustSeeTarget() {
			return false;
		}

		@Override
		protected float pounceBonusDamage() {
			return 5.0F;
		}

		@Override
		protected SoundEvent pounceSound() {
			return SoundEvents.RAVAGER_ROAR;
		}

		@Override
		public float getVoicePitch() {
			return 1.6F;
		}

		@Override
		public Faction getFaction() {
			return Faction.TVIRUS;
		}
	}

	/** タイラント (Mr.X 型)。巨体・高耐久・ノックバック無効、殴った相手を大きく吹き飛ばす。 */
	public static class Tyrant extends FactionMonster {
		public Tyrant(EntityType<? extends Tyrant> type, Level level) {
			super(type, level);
			this.xpReward = 40;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(180.0, 0.25, 14.0, 10.0, 48.0)
				.add(Attributes.KNOCKBACK_RESISTANCE, 1.0)
				.add(Attributes.ATTACK_KNOCKBACK, 1.5)
				.add(Attributes.SCALE, 1.35)
				.add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			Vec3 dir = new Vec3(target.getX() - this.getX(), 0.0, target.getZ() - this.getZ());
			if (dir.lengthSqr() < 1.0E-4) {
				dir = this.getLookAngle();
			}
			dir = dir.normalize();
			double resist = 1.0 - target.getAttributeValue(Attributes.KNOCKBACK_RESISTANCE);
			target.push(dir.x * 1.6 * resist, 0.55 * resist, dir.z * 1.6 * resist);
			this.playSound(SoundEvents.IRON_GOLEM_ATTACK, 1.2F, 0.6F);
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return null; // 無言で迫る
		}

		@Override
		protected SoundEvent getStepSound() {
			return SoundEvents.IRON_GOLEM_STEP;
		}

		@Override
		public float getVoicePitch() {
			return 0.5F;
		}

		@Override
		public Faction getFaction() {
			return Faction.TVIRUS;
		}
	}
}
