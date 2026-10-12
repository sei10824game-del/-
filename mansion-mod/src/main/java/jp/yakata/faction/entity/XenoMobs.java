package jp.yakata.faction.entity;

import jp.yakata.faction.Faction;
import jp.yakata.faction.FactionMob;
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
import net.minecraft.world.entity.monster.zombie.ZombieVillager;
import net.minecraft.world.entity.npc.villager.AbstractVillager;
import net.minecraft.world.level.Level;
import org.jspecify.annotations.Nullable;

/**
 * ゼノモーフ陣営: フェイスハガー / ドローン / ウォーリアー。
 * 体液は強酸: 斬りつけた相手に酸が飛び散り、倒されると周囲を酸で焼く。
 */
public final class XenoMobs {
	/** フェイスハガーに寄生された宿主に付くタグ。一定時間後にドローンが胸を食い破る (FactionDirector)。 */
	public static final String HOST_TAG = "yakata_xeno_host";

	private XenoMobs() {}

	/** 倒れたゼノの酸の血: 周囲の非ゼノにダメージ。 */
	static void acidBurst(FactionMonster xeno, ServerLevel level, double radius, float damage) {
		level.sendParticles(ParticleTypes.ITEM_SLIME, xeno.getX(), xeno.getY() + 0.4, xeno.getZ(), 30, radius * 0.4, 0.3, radius * 0.4, 0.1);
		level.sendParticles(ParticleTypes.SMOKE, xeno.getX(), xeno.getY() + 0.4, xeno.getZ(), 20, radius * 0.4, 0.2, radius * 0.4, 0.02);
		xeno.playSound(SoundEvents.FIRE_EXTINGUISH, 1.0F, 1.4F);
		MobUtil.forEnemiesAround(xeno, radius, e -> e.hurtServer(level, xeno.damageSources().mobAttack(xeno), damage));
	}

	/** 近接で傷つけてきた相手に酸がかかる。 */
	static void acidSplash(FactionMonster xeno, ServerLevel level, DamageSource source) {
		if (source.getDirectEntity() instanceof LivingEntity attacker && attacker == source.getEntity()
			&& !FactionMob.sameFaction(xeno, attacker) && attacker.distanceToSqr(xeno) < 4.0 * 4.0
			&& xeno.getRandom().nextFloat() < 0.35F) {
			attacker.hurtServer(level, xeno.damageSources().mobAttack(xeno), 2.0F);
			level.sendParticles(ParticleTypes.ITEM_SLIME, attacker.getX(), attacker.getY() + 1.0, attacker.getZ(), 6, 0.2, 0.3, 0.2, 0.05);
		}
	}

	/** フェイスハガー。素早く跳びかかり、生存者の顔に張り付いて寄生する。 */
	public static class Facehugger extends FactionMonster {
		public Facehugger(EntityType<? extends Facehugger> type, Level level) {
			super(type, level);
			this.xpReward = 3;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(8.0, 0.36, 3.0, 0.0, 24.0);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(1, new PounceGoal(this, 2.0, 8.0, 1.0, 0.45, 40));
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			if ((target instanceof AbstractVillager || target instanceof ZombieVillager) && target.isAlive()
				&& !target.entityTags().contains(HOST_TAG)) {
				// 寄生成功: 宿主は気絶したように動けなくなり、フェイスハガーは役目を終えて死ぬ
				target.addTag(HOST_TAG);
				target.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, 200, 4), this);
				target.addEffect(new MobEffectInstance(MobEffects.NAUSEA, 200, 0), this);
				level.sendParticles(ParticleTypes.ITEM_SLIME, target.getX(), target.getEyeY(), target.getZ(), 12, 0.2, 0.2, 0.2, 0.05);
				this.playSound(SoundEvents.SLIME_SQUISH, 1.0F, 1.5F);
				this.discard();
			} else {
				target.addEffect(new MobEffectInstance(MobEffects.NAUSEA, 100, 0), this);
			}
		}

		@Override
		protected void onDeathEffect(ServerLevel level, DamageSource source) {
			acidBurst(this, level, 1.5, 3.0F);
		}

		@Override
		public boolean hurtServer(ServerLevel level, DamageSource source, float damage) {
			boolean hurt = super.hurtServer(level, source, damage);
			if (hurt) {
				acidSplash(this, level, source);
			}
			return hurt;
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.SILVERFISH_AMBIENT;
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
			return Faction.XENO;
		}
	}

	/** ドローン。漆黒の外骨格。壁や天井を這い回り、素早く襲いかかる。 */
	public static class Drone extends ClimbingFactionMonster {
		public Drone(EntityType<? extends Drone> type, Level level) {
			super(type, level);
			this.xpReward = 10;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(36.0, 0.33, 6.0, 4.0, 40.0);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(2, new PounceGoal(this, 3.0, 8.0, 1.0, 0.45, 70));
		}

		@Override
		protected double chaseSpeed() {
			return 1.1;
		}

		@Override
		protected void onDeathEffect(ServerLevel level, DamageSource source) {
			acidBurst(this, level, 2.5, 5.0F);
		}

		@Override
		public boolean hurtServer(ServerLevel level, DamageSource source, float damage) {
			boolean hurt = super.hurtServer(level, source, damage);
			if (hurt) {
				acidSplash(this, level, source);
			}
			return hurt;
		}

		@Override
		public float getVoicePitch() {
			return 0.7F;
		}

		@Override
		public Faction getFaction() {
			return Faction.XENO;
		}
	}

	/** ウォーリアー。大型の兵隊個体。尾の一撃で毒を注ぐ。 */
	public static class Warrior extends ClimbingFactionMonster {
		public Warrior(EntityType<? extends Warrior> type, Level level) {
			super(type, level);
			this.xpReward = 20;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(64.0, 0.31, 10.0, 7.0, 40.0)
				.add(Attributes.SCALE, 1.3)
				.add(Attributes.KNOCKBACK_RESISTANCE, 0.4);
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			target.addEffect(new MobEffectInstance(MobEffects.POISON, 60, 0), this);
		}

		@Override
		protected void onDeathEffect(ServerLevel level, DamageSource source) {
			acidBurst(this, level, 3.0, 7.0F);
		}

		@Override
		public boolean hurtServer(ServerLevel level, DamageSource source, float damage) {
			boolean hurt = super.hurtServer(level, source, damage);
			if (hurt) {
				acidSplash(this, level, source);
			}
			return hurt;
		}

		@Override
		public float getVoicePitch() {
			return 0.5F;
		}

		@Override
		public Faction getFaction() {
			return Faction.XENO;
		}
	}
}
