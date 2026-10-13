package jp.yakata.faction.entity;

import jp.yakata.YakataMod;
import jp.yakata.faction.Faction;
import jp.yakata.faction.FactionDirector;
import jp.yakata.faction.FactionEntities;
import jp.yakata.faction.FactionEntities.Ability;
import jp.yakata.faction.FactionEntities.ModelKind;
import jp.yakata.faction.FactionEvents;
import jp.yakata.faction.FactionHooks;
import jp.yakata.faction.FactionStats;
import net.minecraft.ChatFormatting;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.tags.DamageTypeTags;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.storage.ValueInput;
import net.minecraft.world.level.storage.ValueOutput;
import org.jspecify.annotations.Nullable;

/**
 * ネクロモーフ陣営 (Dead Space): スラッシャー / リーパー / エクスプローダー / インフェクター / ブルート。
 * <ul>
 *   <li>四肢切断: 頭への命中は半減 (頭を潰しても止まらない)。腕・脚への命中は 1.3 倍で、切断されると腕なら攻撃力、
 *       脚なら移動速度が落ちる。致命傷を受けても四肢が残っていれば 1 本失って立ち上がる (炎・爆発は除く)。</li>
 *   <li>ネクロモーフに倒された者は 40% で、インフェクターが取り付いた死体は確実に、数秒後ネクロモーフとして再起動する。</li>
 *   <li>ブルートは正面の装甲で攻撃を弾き (0.35 倍)、背後が弱点 (1.5 倍)。</li>
 * </ul>
 */
public final class NecroMobs {
	public static final Faction FACTION = Faction.builder("necromorph").names("ネクロモーフ", "Necromorph").color(ChatFormatting.DARK_RED)
		.home("dining", "study").cap(24)
		.seed(() -> NecroMobs.SLASHER, 4).seed(() -> NecroMobs.LEAPER, 2).seed(() -> NecroMobs.EXPLODER, 1)
		.seed(() -> NecroMobs.INFECTOR, 2).seed(() -> NecroMobs.BRUTE, 1)
		.conversion(() -> NecroMobs.SLASHER, 1)
		.hooks(new FactionHooks() {
			@Override
			public boolean onKill(ServerLevel level, LivingEntity victim, Entity killer, DamageSource source) {
				if (MobUtil.isSurvivor(victim) || !FactionEvents.isInfectable(victim) || victim.getRandom().nextFloat() >= 0.4F
					|| !FactionDirector.hasRoom(level, FACTION)) {
					return false; // 村人は共通の転化 (スラッシャー) に任せる
				}
				reanimate(level, victim.position(), victim.getType(), victim.getMaxHealth(), "ネクロモーフに倒された");
				return true;
			}
		})
		.register();

	public static final EntityType<Slasher> SLASHER = FactionEntities.register("necro_slasher", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Slasher::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Slasher::createAttributes, 1, 8, 0);
	public static final EntityType<Leaper> LEAPER = FactionEntities.register("necro_leaper", FACTION, ModelKind.SPIDER,
		EntityType.Builder.of(Leaper::new, MobCategory.MONSTER).sized(1.2F, 0.85F).eyeHeight(0.6F),
		Leaper::createAttributes, 1, 4, 6, false, Ability.POUNCE);
	public static final EntityType<Exploder> EXPLODER = FactionEntities.register("necro_exploder", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Exploder::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Exploder::createAttributes, 1, 3, 3);
	public static final EntityType<Infector> INFECTOR = FactionEntities.register("necro_infector", FACTION, ModelKind.SILVERFISH,
		EntityType.Builder.of(Infector::new, MobCategory.MONSTER).sized(0.6F, 0.4F).eyeHeight(0.2F),
		Infector::createAttributes, 1, 3, 4);
	public static final EntityType<Brute> BRUTE = FactionEntities.register("necro_brute", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Brute::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Brute::createAttributes, 1, 1, 1, true, Ability.SLAM);

	private static int loggedCuts;

	private NecroMobs() {}

	/** 死体をネクロモーフとして再起動させる (5〜8 秒後)。大柄な死体からは大型のスラッシャー、2 割はエクスプローダー。 */
	static void reanimate(ServerLevel level, net.minecraft.world.phys.Vec3 pos, EntityType<?> from, float hostMaxHealth, String why) {
		EntityType<? extends FactionMonster> type = level.getRandom().nextFloat() < 0.2F ? EXPLODER : SLASHER;
		FactionStats.event("necro_reanimate");
		FactionDirector.scheduleRise(level, pos, type, FACTION, 100 + level.getRandom().nextInt(60),
			"ネクロモーフ再起動 (" + why + "): " + from.toShortString(), null, mob -> {
				if (hostMaxHealth >= 60.0F) {
					mob.getAttribute(Attributes.SCALE).setBaseValue(1.25);
					mob.getAttribute(Attributes.MAX_HEALTH).setBaseValue(45.0);
					mob.setHealth(mob.getMaxHealth());
				}
			});
	}

	/** 四肢の状態。部位で被ダメージを変え、切断で弱体化し、致命傷を四肢で肩代わりする。 */
	static final class Limbs {
		private final FactionMonster mob;
		private int left;
		private int arms;
		private int legs;

		Limbs(FactionMonster mob, int limbs) {
			this.mob = mob;
			this.left = limbs;
		}

		float modify(ServerLevel level, DamageSource source, float damage) {
			double h = MobUtil.hitHeight(this.mob, source);
			if (h >= 0.78) {
				return damage * 0.5F; // 頭は弱点にならない
			}
			boolean legHit = h >= 0.0 && h < 0.45;
			boolean armHit = !legHit && this.mob.getRandom().nextFloat() < 0.4F;
			if (legHit || armHit) {
				damage *= 1.3F;
				if (this.left > 0 && (damage >= this.mob.getMaxHealth() * 0.2F || this.mob.getRandom().nextFloat() < 0.3F)) {
					this.cut(level, legHit);
				}
			}
			return damage;
		}

		boolean cheatDeath(ServerLevel level, DamageSource source) {
			if (this.left <= 0 || source.is(DamageTypeTags.IS_FIRE) || source.is(DamageTypeTags.IS_EXPLOSION)) {
				return false;
			}
			this.cut(level, this.mob.getRandom().nextBoolean());
			this.mob.setHealth(this.mob.getMaxHealth() * 0.38F);
			FactionStats.event("necro_limb_survive");
			return true;
		}

		void cut(ServerLevel level, boolean leg) {
			this.left--;
			if (leg) {
				this.legs++;
				var speed = this.mob.getAttribute(Attributes.MOVEMENT_SPEED);
				speed.setBaseValue(speed.getBaseValue() * 0.6);
			} else {
				this.arms++;
				var dmg = this.mob.getAttribute(Attributes.ATTACK_DAMAGE);
				dmg.setBaseValue(dmg.getBaseValue() * 0.7);
			}
			level.sendParticles(ParticleTypes.DAMAGE_INDICATOR, this.mob.getX(), this.mob.getY() + (leg ? 0.4 : 1.2), this.mob.getZ(),
				8, 0.2, 0.2, 0.2, 0.1);
			this.mob.playSound(SoundEvents.SLIME_SQUISH, 1.0F, 0.6F);
			long n = FactionStats.event("necro_limb_cut");
			if (loggedCuts++ < 6 || n % 20 == 0) {
				YakataMod.LOGGER.info("[yakata] ネクロモーフ: {} の{}を切断 (残り四肢 {}, 累計 {})", this.mob.getType().toShortString(),
					leg ? "脚" : "腕", this.left, n);
			}
		}

		void save(ValueOutput out) {
			out.putInt("NecroLimbs", this.left);
			out.putInt("NecroArms", this.arms);
			out.putInt("NecroLegs", this.legs);
		}

		void load(ValueInput in, int def) {
			this.left = in.getIntOr("NecroLimbs", def);
			this.arms = in.getIntOr("NecroArms", 0);
			this.legs = in.getIntOr("NecroLegs", 0);
		}
	}

	/** 四肢切断を持つ人型ネクロモーフの共通部分 */
	public abstract static class Necromorph extends FactionMonster {
		protected final Limbs limbs;
		private final int limbCount;

		protected Necromorph(EntityType<? extends Necromorph> type, Level level, int limbCount) {
			super(type, level);
			this.limbCount = limbCount;
			this.limbs = new Limbs(this, limbCount);
		}

		@Override
		public boolean hurtServer(ServerLevel level, DamageSource source, float damage) {
			if (!source.is(DamageTypeTags.BYPASSES_INVULNERABILITY)) {
				damage = this.limbs.modify(level, source, damage);
			}
			return super.hurtServer(level, source, damage);
		}

		@Override
		public boolean tryCheatDeath(ServerLevel level, DamageSource source) {
			return this.limbs.cheatDeath(level, source);
		}

		@Override
		protected void addAdditionalSaveData(ValueOutput output) {
			super.addAdditionalSaveData(output);
			this.limbs.save(output);
		}

		@Override
		protected void readAdditionalSaveData(ValueInput input) {
			super.readAdditionalSaveData(input);
			this.limbs.load(input, this.limbCount);
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.ZOMBIE_VILLAGER_AMBIENT;
		}

		@Override
		public float getVoicePitch() {
			return 0.6F + this.random.nextFloat() * 0.2F;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}

	/** スラッシャー。肩から生えた骨の刃で斬りかかる代表的なネクロモーフ。 */
	public static class Slasher extends Necromorph {
		public Slasher(EntityType<? extends Slasher> type, Level level) {
			super(type, level, 2);
			this.xpReward = 7;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(26.0, 0.27, 6.0, 2.0, 36.0).add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		protected double chaseSpeed() {
			return 1.15;
		}
	}

	/** エクスプローダー。腕の爆発嚢を抱えて突進し、獲物のそばで自爆する。倒されても 6 割で嚢が破裂する。 */
	public static class Exploder extends Necromorph {
		private boolean exploded;

		public Exploder(EntityType<? extends Exploder> type, Level level) {
			super(type, level, 1);
			this.xpReward = 5;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(14.0, 0.26, 2.0, 0.0, 32.0);
		}

		@Override
		protected double chaseSpeed() {
			return 1.2;
		}

		private void explode(ServerLevel level) {
			if (this.exploded) {
				return;
			}
			this.exploded = true;
			level.sendParticles(ParticleTypes.EXPLOSION_EMITTER, this.getX(), this.getY() + 0.8, this.getZ(), 1, 0.0, 0.0, 0.0, 0.0);
			level.sendParticles(ParticleTypes.FLAME, this.getX(), this.getY() + 0.8, this.getZ(), 20, 0.8, 0.5, 0.8, 0.05);
			this.playSound(SoundEvents.GENERIC_EXPLODE.value(), 1.5F, 1.0F);
			MobUtil.forEnemiesAround(this, 3.5, e -> {
				e.hurtServer(level, this.damageSources().mobAttack(this), 10.0F);
				MobUtil.knock(this, e, 0.8, 0.4);
			});
			FactionStats.event("necro_explode");
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			LivingEntity t = this.getTarget();
			if (!this.exploded && t != null && t.isAlive() && this.distanceToSqr(t) < 2.0 * 2.0) {
				this.explode(level);
				this.kill(level);
			}
		}

		@Override
		protected void onDeathEffect(ServerLevel level, DamageSource source) {
			if (!this.exploded && this.random.nextFloat() < 0.6F) {
				this.explode(level);
			}
		}
	}

	/** ブルート。前面を装甲で覆った巨体。突進し、正面からの攻撃はほとんど通らない。背中が弱点。 */
	public static class Brute extends Necromorph {
		public Brute(EntityType<? extends Brute> type, Level level) {
			super(type, level, 2);
			this.xpReward = 40;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(160.0, 0.25, 12.0, 6.0, 40.0)
				.add(Attributes.SCALE, 1.4)
				.add(Attributes.KNOCKBACK_RESISTANCE, 1.0)
				.add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(2, new PounceGoal(this, 3.0, 10.0, 1.4, 0.25, 90)); // 突進
		}

		@Override
		protected float pounceBonusDamage() {
			return 6.0F;
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			MobUtil.knock(this, target, 1.3, 0.45);
		}

		@Override
		public boolean hurtServer(ServerLevel level, DamageSource source, float damage) {
			if (source.getEntity() != null && !source.is(DamageTypeTags.BYPASSES_INVULNERABILITY)) {
				damage *= MobUtil.fromFront(this, source) ? 0.35F : 1.5F;
			}
			return super.hurtServer(level, source, damage);
		}

		@Override
		protected SoundEvent getStepSound() {
			return SoundEvents.RAVAGER_STEP;
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.RAVAGER_AMBIENT;
		}

		@Override
		public float getVoicePitch() {
			return 0.5F;
		}
	}

	/** リーパー。下半身が尾になった変異体。壁を這い、長い跳躍から鎌で斬りつける。 */
	public static class Leaper extends ClimbingFactionMonster {
		private final Limbs limbs = new Limbs(this, 1);

		public Leaper(EntityType<? extends Leaper> type, Level level) {
			super(type, level);
			this.xpReward = 8;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(22.0, 0.31, 5.0, 1.0, 36.0);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(1, new PounceGoal(this, 3.0, 11.0, 1.25, 0.5, 60));
		}

		@Override
		protected float pounceBonusDamage() {
			return 4.0F;
		}

		@Override
		public boolean hurtServer(ServerLevel level, DamageSource source, float damage) {
			if (!source.is(DamageTypeTags.BYPASSES_INVULNERABILITY)) {
				damage = this.limbs.modify(level, source, damage);
			}
			return super.hurtServer(level, source, damage);
		}

		@Override
		public boolean tryCheatDeath(ServerLevel level, DamageSource source) {
			return this.limbs.cheatDeath(level, source);
		}

		@Override
		protected void addAdditionalSaveData(ValueOutput output) {
			super.addAdditionalSaveData(output);
			this.limbs.save(output);
		}

		@Override
		protected void readAdditionalSaveData(ValueInput input) {
			super.readAdditionalSaveData(input);
			this.limbs.load(input, 1);
		}

		@Override
		public float getVoicePitch() {
			return 0.8F;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}

	/** インフェクター。死体の頭に吻針を刺してネクロモーフとして再起動させる。弱った獲物にも刺す。 */
	public static class Infector extends FactionMonster {
		private int stingCooldown;

		public Infector(EntityType<? extends Infector> type, Level level) {
			super(type, level);
			this.xpReward = 6;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(12.0, 0.3, 2.5, 0.0, 32.0);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(1, new CorpseHuntGoal(this, 20.0, 1.2, (level, corpse) -> {
				if (FactionDirector.hasRoom(level, FACTION)) {
					level.sendParticles(ParticleTypes.DAMAGE_INDICATOR, corpse.pos().x, corpse.pos().y + 0.3, corpse.pos().z, 6, 0.2, 0.1, 0.2, 0.05);
					this.playSound(SoundEvents.BEE_STING, 1.0F, 0.5F);
					reanimate(level, corpse.pos(), corpse.type(), corpse.maxHealth(), "インフェクターが死体に吻針を刺した");
				}
			}));
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			if (this.stingCooldown > 0) {
				this.stingCooldown--;
			}
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			// 弱った獲物 (体力 30% 以下) に吻針を刺して、その場でネクロモーフに変える
			if (this.stingCooldown <= 0 && target.isAlive() && (target instanceof FactionMonster || MobUtil.isSurvivor(target))
				&& target.getHealth() <= target.getMaxHealth() * 0.3F && FactionEvents.isInfectable(target)
				&& FactionDirector.hasRoom(level, FACTION)) {
				if (MobUtil.takeOver(level, target, SLASHER, FACTION, "ネクロモーフのインフェクター") != null) {
					FactionStats.event("necro_infector_sting");
					this.stingCooldown = 200;
				}
			}
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.PHANTOM_AMBIENT;
		}

		@Override
		protected SoundEvent getHurtSound(DamageSource source) {
			return SoundEvents.PHANTOM_HURT;
		}

		@Override
		protected SoundEvent getDeathSound() {
			return SoundEvents.PHANTOM_DEATH;
		}

		@Override
		protected SoundEvent getStepSound() {
			return SoundEvents.SILVERFISH_STEP;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}
}
