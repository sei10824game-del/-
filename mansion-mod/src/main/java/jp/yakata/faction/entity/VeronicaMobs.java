package jp.yakata.faction.entity;

import jp.yakata.YakataMod;
import jp.yakata.faction.Faction;
import jp.yakata.faction.FactionDirector;
import jp.yakata.faction.FactionEntities;
import jp.yakata.faction.FactionEntities.Ability;
import jp.yakata.faction.FactionEntities.ModelKind;
import jp.yakata.faction.FactionHooks;
import jp.yakata.faction.FactionMob;
import jp.yakata.faction.FactionStats;
import net.minecraft.ChatFormatting;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.network.syncher.EntityDataAccessor;
import net.minecraft.network.syncher.EntityDataSerializers;
import net.minecraft.network.syncher.SynchedEntityData;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.tags.DamageTypeTags;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.entity.npc.villager.AbstractVillager;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.storage.ValueInput;
import net.minecraft.world.level.storage.ValueOutput;
import net.minecraft.world.phys.Vec3;
import org.jspecify.annotations.Nullable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * T-ベロニカ陣営 (バイオハザード CODE:Veronica): アレクシア / ベロニカ蜂 / アルビノイド / ノスフェラトゥ / T-ベロニカ感染者。
 * <ul>
 *   <li>アレクシアの血は空気に触れると燃える: 近くで傷つけた者は発火し、彼女の攻撃もすべて燃え移る。
 *       倒されると巨大な植物体 (第2形態) へ変異し、花粉と蜂を撒き散らす。</li>
 *   <li>花粉: 浴びた村人は T-ベロニカに侵され、限界を超えると蔓が突き破って感染者になる。他陣営には毒。</li>
 *   <li>アルビノイドは放電で周囲を痺れさせ、ノスフェラトゥは毒ガスを吐く。</li>
 *   <li>ウイルス陣営: 倒した他陣営の化け物は 50% で T-ベロニカ感染者として蘇る。</li>
 * </ul>
 */
public final class VeronicaMobs {
	/** 村人ごとの T-ベロニカ感染の進行 (1.0 で発症) */
	private static final Map<UUID, Float> INFECTION = new HashMap<>();

	public static final Faction FACTION = Faction.builder("tveronica").names("T-ベロニカ", "T-Veronica").color(ChatFormatting.DARK_PURPLE)
		.home("dining", "hall").cap(24).virus()
		.seed(() -> VeronicaMobs.ALEXIA, 1).seed(() -> VeronicaMobs.BEE, 4).seed(() -> VeronicaMobs.ALBINOID, 1)
		.seed(() -> VeronicaMobs.NOSFERATU, 1).seed(() -> VeronicaMobs.TV_ZOMBIE, 2)
		.conversion(() -> VeronicaMobs.TV_ZOMBIE, 1)
		.hooks(new FactionHooks() {
			@Override
			public void tickSecond(ServerLevel level) {
				tickInfection(level);
			}
		})
		.register();

	public static final EntityType<Alexia> ALEXIA = FactionEntities.register("tv_alexia", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Alexia::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F).fireImmune(),
		Alexia::createAttributes, 2, 1, 1, true, Ability.FIRE);
	public static final EntityType<Bee> BEE = FactionEntities.register("tv_bee", FACTION, ModelKind.SILVERFISH,
		EntityType.Builder.of(Bee::new, MobCategory.MONSTER).sized(0.4F, 0.3F).eyeHeight(0.13F),
		Bee::createAttributes, 1, 8, 0, false, Ability.POISON);
	public static final EntityType<Albinoid> ALBINOID = FactionEntities.register("tv_albinoid", FACTION, ModelKind.SILVERFISH,
		EntityType.Builder.of(Albinoid::new, MobCategory.MONSTER).sized(0.8F, 0.5F).eyeHeight(0.25F),
		Albinoid::createAttributes, 1, 3, 3, false, Ability.SHOCK);
	public static final EntityType<Nosferatu> NOSFERATU = FactionEntities.register("tv_nosferatu", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Nosferatu::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Nosferatu::createAttributes, 1, 2, 1, false, Ability.POISON);
	public static final EntityType<TVZombie> TV_ZOMBIE = FactionEntities.register("tv_zombie", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(TVZombie::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		TVZombie::createAttributes, 1, 6, 0);

	private static int loggedPollen;

	private VeronicaMobs() {}

	// ---- 花粉と感染 -------------------------------------------------------------

	/** 花粉を撒く: 村人は感染が進み、他陣営の Mob は毒を受ける。 */
	static void pollen(ServerLevel level, FactionMonster src, double radius, float amount) {
		level.sendParticles(ParticleTypes.FALLING_NECTAR, src.getX(), src.getY() + src.getBbHeight() * 0.7, src.getZ(),
			(int) (radius * 12), radius * 0.5, 0.6, radius * 0.5, 0.02);
		level.sendParticles(ParticleTypes.SPORE_BLOSSOM_AIR, src.getX(), src.getY() + 1.0, src.getZ(), (int) (radius * 6), radius * 0.5, 0.6, radius * 0.5, 0.01);
		for (LivingEntity e : level.getEntitiesOfClass(LivingEntity.class, src.getBoundingBox().inflate(radius),
			e -> e.isAlive() && e.distanceToSqr(src) <= radius * radius)) {
			if (e instanceof AbstractVillager) {
				INFECTION.merge(e.getUUID(), amount, Float::sum);
			} else if (FactionMob.isPrey(src, e) && !(e instanceof net.minecraft.world.entity.player.Player)) {
				e.addEffect(new MobEffectInstance(MobEffects.POISON, 40, 0), src);
			}
		}
	}

	static void infect(LivingEntity target, float amount) {
		if (target instanceof AbstractVillager) {
			INFECTION.merge(target.getUUID(), amount, Float::sum);
		}
	}

	/** 感染が限界を超えた村人の体を蔓が突き破り、T-ベロニカ感染者になる。 */
	private static void tickInfection(ServerLevel level) {
		if (INFECTION.isEmpty()) {
			return;
		}
		List<AbstractVillager> turned = new ArrayList<>();
		INFECTION.entrySet().removeIf(en -> {
			Entity e = level.getEntity(en.getKey());
			if (!(e instanceof AbstractVillager v) || !v.isAlive()) {
				return true;
			}
			if (en.getValue() >= 1.0F) {
				turned.add(v);
				return true;
			}
			if (level.getRandom().nextInt(4) == 0) {
				level.sendParticles(ParticleTypes.FALLING_NECTAR, v.getX(), v.getY() + 1.2, v.getZ(), 2, 0.2, 0.3, 0.2, 0.0);
			}
			return false;
		});
		for (AbstractVillager v : turned) {
			if (!FactionDirector.hasRoom(level, FACTION)) {
				continue;
			}
			if (MobUtil.takeOver(level, v, TV_ZOMBIE, FACTION, "T-ベロニカの花粉感染") != null) {
				FactionStats.recordSurvivorKill(FACTION);
				long n = FactionStats.event("tv_pollen_conversion");
				YakataMod.LOGGER.info("[yakata] T-ベロニカ: 花粉を浴びた生存者の体から蔓が突き破った (花粉感染 累計 {})", n);
			}
		}
	}

	/** 血の炎: 攻撃した者を燃やす */
	static void bloodFire(ServerLevel level, LivingEntity victim, DamageSource source, float chance) {
		if (source.getEntity() instanceof LivingEntity attacker && attacker != victim && !FactionMob.sameFaction(victim, attacker)
			&& attacker.distanceToSqr(victim) < 4.0 * 4.0 && victim.getRandom().nextFloat() < chance) {
			attacker.igniteForSeconds(4.0F);
			level.sendParticles(ParticleTypes.FLAME, victim.getX(), victim.getY() + 1.0, victim.getZ(), 12, 0.3, 0.4, 0.3, 0.05);
			FactionStats.event("tv_blood_fire");
		}
	}

	// ---- Mob -------------------------------------------------------------------

	/**
	 * アレクシア。T-ベロニカに完全適合した女王。血が燃え、攻撃はすべて燃え移る。
	 * 第1形態で倒されると、巨大な植物体の第2形態 (動きは遅いが巨大で、蜂と花粉を撒く) として蘇る。
	 */
	public static class Alexia extends FactionMonster {
		private static final EntityDataAccessor<Integer> DATA_FORM = SynchedEntityData.defineId(Alexia.class, EntityDataSerializers.INT);
		private int flareCooldown = 60;
		private int pollenCooldown = 100;
		private int beeCooldown = 200;

		public Alexia(EntityType<? extends Alexia> type, Level level) {
			super(type, level);
			this.xpReward = 50;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(140.0, 0.27, 8.0, 6.0, 40.0)
				.add(Attributes.KNOCKBACK_RESISTANCE, 0.6)
				.add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		protected void defineSynchedData(SynchedEntityData.Builder builder) {
			super.defineSynchedData(builder);
			builder.define(DATA_FORM, 1);
		}

		public int getForm() {
			return this.entityData.get(DATA_FORM);
		}

		@Override
		public int getRenderVariant() {
			return this.getForm() - 1;
		}

		private void applyForm(int form) {
			this.entityData.set(DATA_FORM, form);
			if (form >= 2) {
				this.getAttribute(Attributes.MAX_HEALTH).setBaseValue(240.0);
				this.getAttribute(Attributes.ATTACK_DAMAGE).setBaseValue(12.0);
				this.getAttribute(Attributes.SCALE).setBaseValue(1.9);
				this.getAttribute(Attributes.MOVEMENT_SPEED).setBaseValue(0.16);
				this.getAttribute(Attributes.KNOCKBACK_RESISTANCE).setBaseValue(1.0);
			}
		}

		@Override
		public boolean tryCheatDeath(ServerLevel level, DamageSource source) {
			if (this.getForm() >= 2) {
				return false;
			}
			this.applyForm(2);
			this.setHealth(this.getMaxHealth());
			this.clearFire();
			level.sendParticles(ParticleTypes.FLAME, this.getX(), this.getY() + 1.0, this.getZ(), 60, 1.0, 1.2, 1.0, 0.08);
			this.playSound(SoundEvents.WARDEN_ROAR, 2.0F, 1.2F);
			pollen(level, this, 7.0, 0.35F);
			FactionStats.event("tv_alexia_phase2");
			YakataMod.LOGGER.info("[yakata] T-ベロニカ: アレクシアが巨大な植物体 (第2形態) へ変異した ({})", this.blockPosition().toShortString());
			return true;
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			boolean phase2 = this.getForm() >= 2;
			LivingEntity t = this.getTarget();
			if (--this.flareCooldown <= 0 && t != null && MobUtil.inReach(this, t, 12.0)) {
				// 血の炎: 標的の足元から火柱
				this.flareCooldown = phase2 ? 70 : 100;
				level.sendParticles(ParticleTypes.FLAME, t.getX(), t.getY() + 0.5, t.getZ(), 40, 0.5, 1.0, 0.5, 0.06);
				level.sendParticles(ParticleTypes.LAVA, t.getX(), t.getY() + 0.5, t.getZ(), 6, 0.4, 0.4, 0.4, 0.0);
				this.playSound(SoundEvents.BLAZE_SHOOT, 1.2F, 0.7F);
				t.hurtServer(level, this.damageSources().mobAttack(this), phase2 ? 7.0F : 5.0F);
				t.igniteForSeconds(4.0F);
			}
			if (--this.pollenCooldown <= 0) {
				this.pollenCooldown = phase2 ? 120 : 200;
				pollen(level, this, phase2 ? 7.0 : 4.0, 0.25F);
			}
			if (phase2 && --this.beeCooldown <= 0) {
				this.beeCooldown = 240;
				int n = 0;
				for (int i = 0; i < 3 && MobUtil.countNear(this, BEE, 16.0) < 10; i++) {
					if (MobUtil.spawnNear(level, BEE, this, 2.5) != null) {
						n++;
					}
				}
				if (n > 0) {
					FactionStats.event("tv_alexia_bees");
				}
			}
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			target.igniteForSeconds(3.0F);
		}

		@Override
		public boolean hurtServer(ServerLevel level, DamageSource source, float damage) {
			boolean hurt = super.hurtServer(level, source, damage);
			if (hurt) {
				bloodFire(level, this, source, 0.6F);
			}
			return hurt;
		}

		@Override
		protected void addAdditionalSaveData(ValueOutput output) {
			super.addAdditionalSaveData(output);
			output.putInt("TvForm", this.getForm());
		}

		@Override
		protected void readAdditionalSaveData(ValueInput input) {
			super.readAdditionalSaveData(input);
			int form = input.getIntOr("TvForm", 1);
			if (form >= 2) {
				this.applyForm(form);
			}
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return this.getForm() >= 2 ? SoundEvents.WARDEN_AMBIENT : SoundEvents.WITCH_CELEBRATE;
		}

		@Override
		public float getVoicePitch() {
			return this.getForm() >= 2 ? 0.5F : 1.2F;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}

	/** ベロニカ蜂。群れで飛び回る T-ベロニカの蜂/蟻。毒針を刺し、村人には花粉を運ぶ。 */
	public static class Bee extends FactionMonster {
		public Bee(EntityType<? extends Bee> type, Level level) {
			super(type, level);
			this.xpReward = 1;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(5.0, 0.38, 2.0, 0.0, 24.0);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(2, new PounceGoal(this, 1.5, 6.0, 0.8, 0.5, 30));
		}

		@Override
		protected double chaseSpeed() {
			return 1.2;
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			target.addEffect(new MobEffectInstance(MobEffects.POISON, 60, 0), this);
			infect(target, 0.2F);
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.BEE_LOOP_AGGRESSIVE;
		}

		@Override
		protected SoundEvent getHurtSound(DamageSource source) {
			return SoundEvents.BEE_HURT;
		}

		@Override
		protected SoundEvent getDeathSound() {
			return SoundEvents.BEE_DEATH;
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

	/** アルビノイド。白い水棲の変異体。放電で周囲を痺れさせる (水中ではさらに素早い)。 */
	public static class Albinoid extends FactionMonster {
		private int shockCooldown = 40;

		public Albinoid(EntityType<? extends Albinoid> type, Level level) {
			super(type, level);
			this.xpReward = 10;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(26.0, 0.28, 4.0, 2.0, 28.0).add(Attributes.SCALE, 1.6);
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			if (this.isInWater() && this.tickCount % 20 == 0) {
				this.addEffect(new MobEffectInstance(MobEffects.SPEED, 30, 1));
			}
			LivingEntity t = this.getTarget();
			if (--this.shockCooldown <= 0 && t != null && t.isAlive() && this.distanceToSqr(t) < 4.0 * 4.0) {
				this.shockCooldown = 80;
				shock(this, level, 4.0, 4.0F);
			}
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.GUARDIAN_AMBIENT_LAND;
		}

		@Override
		protected SoundEvent getHurtSound(DamageSource source) {
			return SoundEvents.GUARDIAN_HURT_LAND;
		}

		@Override
		protected SoundEvent getDeathSound() {
			return SoundEvents.GUARDIAN_DEATH_LAND;
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

	/** 放電: 周囲の敵にダメージと痺れ (強い鈍化) */
	static int shock(FactionMonster src, ServerLevel level, double radius, float damage) {
		level.sendParticles(ParticleTypes.ELECTRIC_SPARK, src.getX(), src.getY() + 0.5, src.getZ(), 50, radius * 0.5, 0.6, radius * 0.5, 0.2);
		level.playSound(null, src.getX(), src.getY(), src.getZ(), SoundEvents.TRIDENT_THUNDER, SoundSource.HOSTILE, 0.6F, 1.8F);
		int n = MobUtil.forEnemiesAround(src, radius, e -> {
			e.hurtServer(level, src.damageSources().lightningBolt(), damage);
			e.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, 30, 4), src);
		});
		FactionStats.event("tv_shock");
		return n;
	}

	/** ノスフェラトゥ。T-ベロニカに適合できず拘束されていた異形。前方へ毒ガスを吐きかける。 */
	public static class Nosferatu extends FactionMonster {
		private int gasCooldown = 60;

		public Nosferatu(EntityType<? extends Nosferatu> type, Level level) {
			super(type, level);
			this.xpReward = 25;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(70.0, 0.24, 7.0, 4.0, 32.0)
				.add(Attributes.SCALE, 1.3)
				.add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			LivingEntity t = this.getTarget();
			if (--this.gasCooldown <= 0 && t != null && MobUtil.inReach(this, t, 7.0)) {
				this.gasCooldown = 100;
				Vec3 look = new Vec3(t.getX() - this.getX(), 0.0, t.getZ() - this.getZ()).normalize();
				for (int i = 1; i <= 3; i++) {
					Vec3 p = this.position().add(look.scale(i * 2.0));
					level.sendParticles(ParticleTypes.SNEEZE, p.x, p.y + 1.4, p.z, 25, 0.7, 0.5, 0.7, 0.02);
				}
				this.playSound(SoundEvents.LLAMA_SPIT, 1.5F, 0.4F);
				int hit = MobUtil.forEnemiesAround(this, 7.0, e -> {
					Vec3 dir = new Vec3(e.getX() - this.getX(), 0.0, e.getZ() - this.getZ());
					if (dir.lengthSqr() > 1.0E-4 && dir.normalize().dot(look) > 0.5) {
						e.addEffect(new MobEffectInstance(MobEffects.POISON, 100, 1), this);
						e.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, 60, 1), this);
					}
				});
				FactionStats.event("tv_gas");
			}
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.ZOMBIE_VILLAGER_AMBIENT;
		}

		@Override
		public float getVoicePitch() {
			return 0.5F;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}

	/** T-ベロニカ感染者。体から蔓が伸びた人間。倒れると花粉を撒き散らす。 */
	public static class TVZombie extends FactionMonster {
		public TVZombie(EntityType<? extends TVZombie> type, Level level) {
			super(type, level);
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(24.0, 0.24, 4.0, 2.0, 32.0);
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			infect(target, 0.25F);
		}

		@Override
		protected void onDeathEffect(ServerLevel level, DamageSource source) {
			if (!source.is(DamageTypeTags.IS_FIRE)) {
				pollen(level, this, 3.0, 0.3F);
				if (loggedPollen++ < 3) {
					YakataMod.LOGGER.info("[yakata] T-ベロニカ: 倒れた感染者が花粉を撒き散らした ({})", this.blockPosition().toShortString());
				}
			}
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.DROWNED_AMBIENT;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}
}
