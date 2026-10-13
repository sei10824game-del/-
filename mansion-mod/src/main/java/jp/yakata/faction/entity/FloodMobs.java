package jp.yakata.faction.entity;

import jp.yakata.YakataMod;
import jp.yakata.faction.Corpses;
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
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.level.Level;
import org.jspecify.annotations.Nullable;

/**
 * フラッド陣営 (Halo): 感染体 / 戦闘体 / キャリアー / 純粋形態 / ジャガーノート。
 * <ul>
 *   <li>感染体は弱った (体力 35% 以下の) 村人・他陣営の Mob に取り付いて乗っ取り、その場で戦闘体に変える。
 *       倒れた者の死体 ({@link Corpses}) にも這い寄って取り込む。</li>
 *   <li>フラッドに倒された者は 45% で戦闘体として起き上がる (大柄な死体からは大型の戦闘体)。</li>
 *   <li>キャリアーは獲物の近くや倒されたときに破裂し、感染体をばら撒く。傷ついた戦闘体は 20% でキャリアーへ変わる。</li>
 * </ul>
 */
public final class FloodMobs {
	public static final Faction FACTION = Faction.builder("flood").names("フラッド", "Flood").color(ChatFormatting.YELLOW)
		.home("hall", "dining").cap(24)
		.seed(() -> FloodMobs.INFECTOR, 5).seed(() -> FloodMobs.COMBAT, 3).seed(() -> FloodMobs.CARRIER, 1)
		.seed(() -> FloodMobs.PURE, 1).seed(() -> FloodMobs.JUGGERNAUT, 1)
		.conversion(() -> FloodMobs.COMBAT, 1)
		.hooks(new FactionHooks() {
			@Override
			public boolean onKill(ServerLevel level, LivingEntity victim, Entity killer, DamageSource source) {
				// フラッドに倒された宿主は戦闘体として起き上がる
				if (!FactionEvents.isInfectable(victim) || victim.getRandom().nextFloat() >= 0.45F || !FactionDirector.hasRoom(level, FACTION)) {
					return false;
				}
				float hp = victim.getMaxHealth();
				FactionStats.event("flood_rise");
				FactionDirector.scheduleRise(level, victim.position(), COMBAT, FACTION, 40 + victim.getRandom().nextInt(30),
					"フラッド: " + victim.getType().toShortString() + " の死体が戦闘体化", victim.getCustomName(), mob -> sizeLike(mob, hp));
				return true;
			}
		})
		.register();

	public static final EntityType<Infector> INFECTOR = FactionEntities.register("flood_infector", FACTION, ModelKind.SILVERFISH,
		EntityType.Builder.of(Infector::new, MobCategory.MONSTER).sized(0.45F, 0.3F).eyeHeight(0.15F),
		Infector::createAttributes, 1, 6, 0);
	public static final EntityType<CombatForm> COMBAT = FactionEntities.register("flood_combat", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(CombatForm::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		CombatForm::createAttributes, 1, 6, 0, false, Ability.PULL);
	public static final EntityType<Carrier> CARRIER = FactionEntities.register("flood_carrier", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Carrier::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.6F),
		Carrier::createAttributes, 1, 3, 3);
	public static final EntityType<PureForm> PURE = FactionEntities.register("flood_pure", FACTION, ModelKind.SPIDER,
		EntityType.Builder.of(PureForm::new, MobCategory.MONSTER).sized(1.2F, 0.85F).eyeHeight(0.6F),
		PureForm::createAttributes, 1, 3, 4, false, Ability.POUNCE);
	public static final EntityType<Juggernaut> JUGGERNAUT = FactionEntities.register("flood_juggernaut", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Juggernaut::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Juggernaut::createAttributes, 1, 1, 1, true, Ability.SLAM);

	private static int loggedTakeovers;

	private FloodMobs() {}

	/** 取り込んだ宿主の体格を引き継ぐ (大柄な宿主ほど大きくタフな戦闘体になる)。 */
	static void sizeLike(FactionMonster mob, float hostMaxHealth) {
		if (hostMaxHealth >= 60.0F) {
			mob.getAttribute(Attributes.SCALE).setBaseValue(1.3);
			mob.getAttribute(Attributes.MAX_HEALTH).setBaseValue(55.0);
			mob.getAttribute(Attributes.ATTACK_DAMAGE).setBaseValue(8.0);
			mob.setHealth(mob.getMaxHealth());
		}
	}

	/** 感染体が倒れた/弱った宿主を乗っ取る */
	static boolean takeOver(ServerLevel level, LivingEntity host, String how) {
		if (!FactionEvents.isInfectable(host) || !FactionDirector.hasRoom(level, FACTION)) {
			return false;
		}
		float hp = host.getMaxHealth();
		CombatForm form = MobUtil.takeOver(level, host, COMBAT, FACTION, how);
		if (form == null) {
			return false;
		}
		sizeLike(form, hp);
		long n = FactionStats.event("flood_takeover");
		if (loggedTakeovers++ < 10 || n % 10 == 0) {
			YakataMod.LOGGER.info("[yakata] フラッド: 感染体が {} を乗っ取り戦闘体に変えた (累計 {})", host.getType().toShortString(), n);
		}
		return true;
	}

	/** キャリアーの破裂: 周囲を傷つけ、感染体をばら撒く */
	static void burst(FactionMonster carrier, ServerLevel level, int infectors) {
		level.sendParticles(ParticleTypes.EXPLOSION, carrier.getX(), carrier.getY() + 1.0, carrier.getZ(), 2, 0.3, 0.3, 0.3, 0.0);
		level.sendParticles(ParticleTypes.ITEM_SLIME, carrier.getX(), carrier.getY() + 1.0, carrier.getZ(), 30, 0.8, 0.6, 0.8, 0.1);
		carrier.playSound(SoundEvents.GENERIC_EXPLODE.value(), 1.2F, 1.3F);
		MobUtil.forEnemiesAround(carrier, 3.0, e -> {
			e.hurtServer(level, carrier.damageSources().mobAttack(carrier), 7.0F);
			e.addEffect(new MobEffectInstance(MobEffects.NAUSEA, 100, 0), carrier);
		});
		int released = 0;
		for (int i = 0; i < infectors && MobUtil.countNear(carrier, INFECTOR, 12.0) < 12; i++) {
			if (MobUtil.spawnNear(level, INFECTOR, carrier, 2.0) != null) {
				released++;
			}
		}
		FactionStats.event("flood_carrier_burst");
		YakataMod.LOGGER.info("[yakata] フラッド: キャリアーが破裂し感染体 {} 体を放出 ({})", released, carrier.blockPosition().toShortString());
	}

	/** 感染体。小さく素早い。弱った獲物に取り付いて乗っ取り、死体にも這い寄って取り込む。 */
	public static class Infector extends FactionMonster {
		public Infector(EntityType<? extends Infector> type, Level level) {
			super(type, level);
			this.xpReward = 1;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(5.0, 0.36, 1.5, 0.0, 24.0);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(1, new CorpseHuntGoal(this, 12.0, 1.3, (level, corpse) -> {
				if (!FactionDirector.hasRoom(level, FACTION)) {
					return;
				}
				FactionStats.event("flood_corpse");
				FactionDirector.scheduleRise(level, corpse.pos(), COMBAT, FACTION, 20,
					"フラッド: 感染体が " + corpse.type().toShortString() + " の死体を取り込んだ", null, mob -> sizeLike(mob, corpse.maxHealth()));
				this.discard();
			}));
			this.goalSelector.addGoal(2, new PounceGoal(this, 1.5, 5.0, 0.7, 0.35, 30));
		}

		@Override
		protected double chaseSpeed() {
			return 1.25;
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			// 体力 35% 以下 (または 6 以下) の宿主に取り付いて乗っ取る
			if (target.isAlive() && (target instanceof FactionMonster || MobUtil.isSurvivor(target))
				&& target.getHealth() <= Math.max(6.0F, target.getMaxHealth() * 0.35F)
				&& takeOver(level, target, "フラッド感染体の取り付き")) {
				this.discard();
			}
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
			return SoundEvents.SLIME_DEATH_SMALL;
		}

		@Override
		protected SoundEvent getStepSound() {
			return SoundEvents.SILVERFISH_STEP;
		}

		@Override
		public float getVoicePitch() {
			return 1.5F;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}

	/** 戦闘体。宿主の死体を動かす兵隊。触手の腕で殴り飛ばす。傷ついて倒れると 20% でキャリアーへ変わる。 */
	public static class CombatForm extends FactionMonster {
		public CombatForm(EntityType<? extends CombatForm> type, Level level) {
			super(type, level);
			this.xpReward = 6;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(30.0, 0.29, 5.0, 2.0, 36.0).add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		protected double chaseSpeed() {
			return 1.15;
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			if (this.random.nextFloat() < 0.3F) {
				MobUtil.knock(this, target, 0.8, 0.3); // 触手の鞭
			}
		}

		@Override
		protected void onDeathEffect(ServerLevel level, DamageSource source) {
			if (this.random.nextFloat() < 0.2F && FactionDirector.hasRoom(level, FACTION)) {
				FactionDirector.scheduleRise(level, this.position(), CARRIER, FACTION, 60, "フラッド: 傷ついた戦闘体がキャリアーへ", null, null);
			}
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

	/** キャリアー。膨れ上がった肉袋。獲物に近づくと破裂して感染体をばら撒く。 */
	public static class Carrier extends FactionMonster {
		private boolean burst;

		public Carrier(EntityType<? extends Carrier> type, Level level) {
			super(type, level);
			this.xpReward = 4;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(16.0, 0.17, 1.0, 0.0, 24.0).add(Attributes.SCALE, 1.2);
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			LivingEntity t = this.getTarget();
			if (!this.burst && t != null && t.isAlive() && this.distanceToSqr(t) < 2.4 * 2.4) {
				this.burst = true;
				burst(this, level, 3);
				this.kill(level);
			}
		}

		@Override
		protected void onDeathEffect(ServerLevel level, DamageSource source) {
			if (!this.burst) {
				this.burst = true;
				burst(this, level, 3);
			}
		}

		@Override
		protected SoundEvent getAmbientSound() {
			return SoundEvents.SLIME_SQUISH;
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

	/** 純粋形態 (ストーカー)。宿主を持たないフラッド本来の姿。壁を這い、跳びかかる。 */
	public static class PureForm extends ClimbingFactionMonster {
		public PureForm(EntityType<? extends PureForm> type, Level level) {
			super(type, level);
			this.xpReward = 10;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(30.0, 0.33, 6.0, 3.0, 40.0);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(2, new PounceGoal(this, 3.0, 9.0, 1.1, 0.5, 60));
		}

		@Override
		protected float pounceBonusDamage() {
			return 4.0F;
		}

		@Override
		public float getVoicePitch() {
			return 0.7F;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}

	/** ジャガーノート。巨大な純粋形態の怪物。硬い外皮と、周囲をまとめて叩き潰す一撃。 */
	public static class Juggernaut extends FactionMonster {
		private int slamCooldown = 60;

		public Juggernaut(EntityType<? extends Juggernaut> type, Level level) {
			super(type, level);
			this.xpReward = 40;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(200.0, 0.24, 13.0, 12.0, 40.0)
				.add(Attributes.SCALE, 1.45)
				.add(Attributes.KNOCKBACK_RESISTANCE, 1.0)
				.add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			if (this.slamCooldown > 0) {
				this.slamCooldown--;
				return;
			}
			LivingEntity t = this.getTarget();
			if (t != null && t.isAlive() && this.distanceToSqr(t) < 3.5 * 3.5) {
				this.slamCooldown = 80;
				level.sendParticles(ParticleTypes.EXPLOSION, this.getX(), this.getY() + 0.2, this.getZ(), 3, 1.2, 0.1, 1.2, 0.0);
				this.playSound(SoundEvents.WARDEN_ATTACK_IMPACT, 1.5F, 0.6F);
				int hit = MobUtil.forEnemiesAround(this, 3.5, e -> {
					e.hurtServer(level, this.damageSources().mobAttack(this), 9.0F);
					MobUtil.knock(this, e, 1.2, 0.5);
				});
				FactionStats.event("flood_juggernaut_slam");
				if (hit > 0 && FactionStats.eventCount("flood_juggernaut_slam") <= 3) {
					YakataMod.LOGGER.info("[yakata] フラッド: ジャガーノートの叩きつけ ({} 体に命中)", hit);
				}
			}
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
			return 0.6F;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}
}
