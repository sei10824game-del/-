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
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.world.DifficultyInstance;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.EquipmentSlot;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.entity.SpawnGroupData;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.ServerLevelAccessor;
import net.minecraft.world.phys.Vec3;
import org.jspecify.annotations.Nullable;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * マキマ陣営 (チェンソーマン): マキマ / 公安のデビルハンター。
 * <ul>
 *   <li>支配: マキマは視界 (20 ブロック) に入った「明らかに弱い」(戦力が自分の半分未満の) 他陣営の Mob を、
 *       見ただけでマキマ陣営に変える (3 秒に 1 体)。支配された者はマキマに付き従い、マキマの標的を狙う。</li>
 *   <li>寝返り: マキマの視界内でマキマ陣営に倒された者 (自分より強い者も含む) は、死なずに半分の体力でマキマのものになる。</li>
 *   <li>借り物の攻撃: 支配下の Mob 種に応じた攻撃 (跳躍・酸・胞子・毒・炎・放電・叩きつけ・引き寄せ・吸血) を
 *       クールダウン制で使う。手持ちは指鉄砲の「ばん」。</li>
 *   <li>身代わり: 致命傷を受けると、支配下で最も体力の多い者を犠牲にして全回復で立ち上がる (支配下がいる限り何度でも)。</li>
 *   <li>マキマ陣営は他陣営の感染・支配を受けない。</li>
 * </ul>
 */
public final class MakimaMobs {
	public static final Faction FACTION = Faction.builder("makima").names("マキマ", "Makima").color(ChatFormatting.DARK_AQUA)
		.home("study", "library").rivals("chainsaw").cap(26).infectionImmune().controlImmune()
		.seed(() -> MakimaMobs.MAKIMA, 1).seed(() -> MakimaMobs.AGENT, 3)
		.hooks(new FactionHooks() {
			@Override
			public boolean onLethalBlow(ServerLevel level, LivingEntity victim, Entity killer, DamageSource source) {
				return viewConversion(level, victim);
			}
		})
		.register();

	public static final EntityType<Makima> MAKIMA = FactionEntities.register("makima_devil", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Makima::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Makima::createAttributes, 1, 1, 1, true, Ability.NONE);
	public static final EntityType<Agent> AGENT = FactionEntities.register("makima_agent", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Agent::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Agent::createAttributes, 1, 6, 0);

	/** 支配の視界 */
	public static final double SIGHT = 20.0;
	/** これ未満の戦力比の相手は見ただけで支配する */
	public static final double CONTROL_RATIO = 0.5;
	private static int loggedControls;

	private MakimaMobs() {}

	/** 支配できる相手か (支配無効の陣営とボス級は不可) */
	public static boolean controllable(LivingEntity e) {
		// 致命傷の瞬間 (体力 0) にも呼ばれるので isAlive ではなく isRemoved で判定する
		if (!(e instanceof FactionMonster fm) || fm.isRemoved()) {
			return false;
		}
		return fm.getFaction() != FACTION && !fm.getFaction().controlImmune && !fm.nativeFaction().controlImmune
			&& !FactionEntities.isBoss(fm.getType());
	}

	static int factionCount(ServerLevel level) {
		return FactionDirector.lastCensus().of(FACTION);
	}

	/** victim を見ている最寄りのマキマ */
	static @Nullable Makima watcher(ServerLevel level, LivingEntity victim) {
		Makima best = null;
		double bestD = SIGHT * SIGHT;
		for (Makima m : level.getEntitiesOfClass(Makima.class, victim.getBoundingBox().inflate(SIGHT), LivingEntity::isAlive)) {
			double d = m.distanceToSqr(victim);
			if (d < bestD && m.hasLineOfSight(victim)) {
				best = m;
				bestD = d;
			}
		}
		return best;
	}

	/** 支配: 陣営をマキマに書き換え、マキマに従わせる */
	static void control(ServerLevel level, FactionMonster target, Makima makima, String why) {
		Faction before = target.getFaction();
		target.setFactionOverride(FACTION, makima);
		target.clearFire();
		level.sendParticles(ParticleTypes.ENCHANT, target.getX(), target.getY() + 1.0, target.getZ(), 30, 0.4, 0.6, 0.4, 0.5);
		level.sendParticles(ParticleTypes.DUST_PLUME, target.getX(), target.getY() + 1.0, target.getZ(), 8, 0.3, 0.3, 0.3, 0.02);
		target.playSound(SoundEvents.CHAIN_PLACE, 1.2F, 0.6F);
		FactionStats.recordConversion(FACTION);
		long n = FactionStats.event(why.startsWith("視界") ? "makima_view_conversion" : "makima_control");
		if (loggedControls++ < 12 || n % 10 == 0) {
			YakataMod.LOGGER.info("[yakata] マキマ: {} ({}) を支配した — {} (累計 {})", target.getType().toShortString(), before.enName, why, n);
		}
	}

	/** 視界内でマキマ陣営に倒された者は死なずに寝返る */
	static boolean viewConversion(ServerLevel level, LivingEntity victim) {
		if (!controllable(victim) || factionCount(level) >= FACTION.cap) {
			return false;
		}
		Makima m = watcher(level, victim);
		if (m == null) {
			return false;
		}
		FactionMonster fm = (FactionMonster) victim;
		fm.setHealth(fm.getMaxHealth() * 0.5F);
		control(level, fm, m, "視界内で倒されて寝返った");
		return true;
	}

	/** マキマ。支配の悪魔。見ただけで弱者を従え、支配下の力を借り、支配下を身代わりにして蘇る。 */
	public static class Makima extends FactionMonster {
		private int controlCooldown = 40;
		private int abilityCooldown = 60;

		public Makima(EntityType<? extends Makima> type, Level level) {
			super(type, level);
			this.xpReward = 60;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(120.0, 0.27, 7.0, 6.0, 32.0)
				.add(Attributes.KNOCKBACK_RESISTANCE, 0.5);
		}

		/** 支配下の Mob (この Makima に従う者) */
		List<FactionMonster> pawns(ServerLevel level) {
			return level.getEntitiesOfClass(FactionMonster.class, this.getBoundingBox().inflate(64.0),
				e -> e.isAlive() && e != this && e.isControlled() && e.getFaction() == FACTION);
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			if (--this.controlCooldown <= 0 && this.tickCount % 10 == 0) {
				this.tryControl(level);
			}
			LivingEntity t = this.getTarget();
			if (--this.abilityCooldown <= 0 && t != null && MobUtil.inReach(this, t, 14.0)) {
				this.useAbility(level, t);
			}
		}

		/** 視界の中で最も強い「明らかに弱い」相手を支配する */
		private void tryControl(ServerLevel level) {
			double myPower = MobUtil.power(this);
			FactionMonster best = null;
			double bestPower = 0.0;
			for (FactionMonster e : level.getEntitiesOfClass(FactionMonster.class, this.getBoundingBox().inflate(SIGHT),
				e -> e.isAlive() && controllable(e) && e.distanceToSqr(this) <= SIGHT * SIGHT)) {
				double p = MobUtil.power(e);
				if (p < myPower * CONTROL_RATIO && p > bestPower && this.getSensing().hasLineOfSight(e)) {
					best = e;
					bestPower = p;
				}
			}
			if (best != null && factionCount(level) < FACTION.cap) {
				control(level, best, this, String.format("見ただけで支配 (戦力 %.0f < %.0f)", bestPower, myPower * CONTROL_RATIO));
				this.controlCooldown = 60;
			} else {
				this.controlCooldown = 20;
			}
		}

		/** 支配下の Mob 種から借りた攻撃 (と指鉄砲) から 1 つ選んで使う */
		private void useAbility(ServerLevel level, LivingEntity t) {
			Set<Ability> borrowed = EnumSet.noneOf(Ability.class);
			for (FactionMonster p : this.pawns(level)) {
				FactionEntities.Entry e = FactionEntities.entry(p.getType());
				if (e != null && e.ability() != Ability.NONE) {
					borrowed.add(e.ability());
				}
			}
			List<Ability> options = new ArrayList<>(borrowed);
			options.add(Ability.NONE); // 「ばん」
			Ability a = options.get(this.random.nextInt(options.size()));
			this.abilityCooldown = 50 + this.random.nextInt(30);
			this.swingForAttack(net.minecraft.world.InteractionHand.MAIN_HAND);
			switch (a) {
				case POUNCE -> {
					Vec3 d = new Vec3(t.getX() - this.getX(), 0.0, t.getZ() - this.getZ());
					if (d.lengthSqr() > 1.0E-4) {
						d = d.normalize().scale(1.1);
						this.setDeltaMovement(d.x, 0.45, d.z);
					}
					this.startPounce(t);
				}
				case ACID -> {
					t.hurtServer(level, this.damageSources().mobAttack(this), 5.0F);
					level.sendParticles(ParticleTypes.ITEM_SLIME, t.getX(), t.getY() + 1.0, t.getZ(), 15, 0.3, 0.4, 0.3, 0.05);
				}
				case SPORES -> {
					for (LivingEntity e : level.getEntitiesOfClass(LivingEntity.class, t.getBoundingBox().inflate(3.0), e -> FactionMob.isPrey(this, e))) {
						e.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, 80, 1), this);
						e.addEffect(new MobEffectInstance(MobEffects.WEAKNESS, 80, 0), this);
					}
					level.sendParticles(ParticleTypes.SPORE_BLOSSOM_AIR, t.getX(), t.getY() + 1.0, t.getZ(), 40, 1.5, 0.6, 1.5, 0.02);
				}
				case POISON -> {
					t.hurtServer(level, this.damageSources().mobAttack(this), 3.0F);
					t.addEffect(new MobEffectInstance(MobEffects.POISON, 80, 1), this);
				}
				case FIRE -> {
					t.hurtServer(level, this.damageSources().mobAttack(this), 4.0F);
					t.igniteForSeconds(4.0F);
					level.sendParticles(ParticleTypes.FLAME, t.getX(), t.getY() + 0.5, t.getZ(), 25, 0.4, 0.8, 0.4, 0.05);
				}
				case SHOCK -> {
					t.hurtServer(level, this.damageSources().lightningBolt(), 5.0F);
					t.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, 30, 4), this);
					level.sendParticles(ParticleTypes.ELECTRIC_SPARK, t.getX(), t.getY() + 1.0, t.getZ(), 30, 0.4, 0.6, 0.4, 0.2);
				}
				case SLAM -> {
					MobUtil.forEnemiesAround(this, 3.5, e -> {
						e.hurtServer(level, this.damageSources().mobAttack(this), 8.0F);
						MobUtil.knock(this, e, 1.0, 0.4);
					});
					level.sendParticles(ParticleTypes.EXPLOSION, this.getX(), this.getY() + 0.2, this.getZ(), 2, 1.0, 0.1, 1.0, 0.0);
				}
				case PULL -> {
					MobUtil.pull(this, t, 1.3);
					t.hurtServer(level, this.damageSources().mobAttack(this), 3.0F);
				}
				case LEECH -> {
					if (t.hurtServer(level, this.damageSources().mobAttack(this), 6.0F)) {
						this.heal(6.0F);
					}
				}
				case NONE -> {
					// 「ばん」: 指鉄砲。見えない圧が標的を撃ち抜く
					t.hurtServer(level, this.damageSources().mobAttack(this), 9.0F);
					level.sendParticles(ParticleTypes.CRIT, t.getX(), t.getY() + 1.0, t.getZ(), 20, 0.3, 0.4, 0.3, 0.3);
					this.playSound(SoundEvents.GENERIC_EXPLODE.value(), 0.6F, 1.8F);
				}
			}
			long n = FactionStats.event("makima_ability_" + a.name().toLowerCase(java.util.Locale.ROOT));
			if (n == 1) {
				YakataMod.LOGGER.info("[yakata] マキマ: 支配下から借りた攻撃 {} を初めて使った (借りられる攻撃: {})",
					a == Ability.NONE ? "ばん" : a, borrowed);
			}
		}

		/** 致命傷: 支配下で最も体力の多い者を身代わりにして全回復する */
		@Override
		public boolean tryCheatDeath(ServerLevel level, DamageSource source) {
			FactionMonster victim = this.pawns(level).stream().max(Comparator.comparingDouble(LivingEntity::getMaxHealth)).orElse(null);
			if (victim == null) {
				return false;
			}
			level.sendParticles(ParticleTypes.DAMAGE_INDICATOR, victim.getX(), victim.getY() + 1.0, victim.getZ(), 20, 0.3, 0.5, 0.3, 0.2);
			String name = victim.getType().toShortString();
			victim.discard();
			this.setHealth(this.getMaxHealth());
			this.clearFire();
			this.removeAllEffects();
			level.sendParticles(ParticleTypes.ENCHANT, this.getX(), this.getY() + 1.0, this.getZ(), 60, 0.5, 1.0, 0.5, 0.8);
			this.playSound(SoundEvents.TOTEM_USE, 1.0F, 0.7F);
			long n = FactionStats.event("makima_revive");
			YakataMod.LOGGER.info("[yakata] マキマ: 致命傷を {} が肩代わりした — マキマは全回復で立ち上がる (身代わり 累計 {})", name, n);
			return true;
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return null;
		}

		@Override
		protected SoundEvent getHurtSound(DamageSource source) {
			return SoundEvents.PLAYER_HURT;
		}

		@Override
		protected SoundEvent getDeathSound() {
			return SoundEvents.PLAYER_DEATH;
		}

		@Override
		protected SoundEvent getStepSound() {
			return SoundEvents.ARMOR_EQUIP_LEATHER.value();
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}

	/** 公安のデビルハンター。マキマ直属の部下。刀を振るう。 */
	public static class Agent extends FactionMonster {
		public Agent(EntityType<? extends Agent> type, Level level) {
			super(type, level);
			this.xpReward = 6;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(26.0, 0.28, 4.0, 3.0, 36.0).add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		public @Nullable SpawnGroupData finalizeSpawn(ServerLevelAccessor level, DifficultyInstance difficulty, EntitySpawnReason reason,
													   @Nullable SpawnGroupData data) {
			SpawnGroupData result = super.finalizeSpawn(level, difficulty, reason, data);
			this.setItemSlot(EquipmentSlot.MAINHAND, new ItemStack(Items.IRON_SWORD));
			this.setDropChance(EquipmentSlot.MAINHAND, 0.0F);
			// マキマがいれば従う
			if (level instanceof ServerLevel sl) {
				Makima m = sl.getEntitiesOfClass(Makima.class, this.getBoundingBox().inflate(48.0), LivingEntity::isAlive).stream().findFirst().orElse(null);
				if (m != null) {
					this.setFactionOverride(null, m);
				}
			}
			return result;
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return null;
		}

		@Override
		protected SoundEvent getHurtSound(DamageSource source) {
			return SoundEvents.PLAYER_HURT;
		}

		@Override
		protected SoundEvent getDeathSound() {
			return SoundEvents.PLAYER_DEATH;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}
}
