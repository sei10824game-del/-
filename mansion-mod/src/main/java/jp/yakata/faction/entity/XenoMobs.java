package jp.yakata.faction.entity;

import jp.yakata.YakataMod;
import jp.yakata.faction.Faction;
import jp.yakata.faction.FactionDirector;
import jp.yakata.faction.FactionStats;
import net.minecraft.core.BlockPos;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntitySpawnReason;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import jp.yakata.faction.FactionEntities;
import jp.yakata.faction.FactionEntities.Ability;
import jp.yakata.faction.FactionEntities.ModelKind;
import jp.yakata.faction.FactionHooks;
import net.minecraft.ChatFormatting;
import net.minecraft.world.entity.MobCategory;
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
	public static final Faction FACTION = Faction.builder("xeno").names("ゼノモーフ", "Xenomorph").color(ChatFormatting.DARK_GRAY)
		.home("bedroom").cap(20)
		.seed(() -> XenoMobs.FACEHUGGER, 3).seed(() -> XenoMobs.DRONE, 3).seed(() -> XenoMobs.WARRIOR, 1)
		.conversion(() -> XenoMobs.DRONE, 1)
		.hooks(new FactionHooks() {
			@Override
			public void tickSecond(ServerLevel level) {
				tickHosts(level);
			}
		})
		.register();

	public static final EntityType<Facehugger> FACEHUGGER = FactionEntities.register("xeno_facehugger", FACTION, ModelKind.SILVERFISH,
		EntityType.Builder.of(Facehugger::new, MobCategory.MONSTER).sized(0.5F, 0.35F).eyeHeight(0.15F),
		Facehugger::createAttributes, 1, 5, 0);
	public static final EntityType<Drone> DRONE = FactionEntities.register("xeno_drone", FACTION, ModelKind.SPIDER,
		EntityType.Builder.of(Drone::new, MobCategory.MONSTER).sized(1.2F, 0.85F).eyeHeight(0.6F),
		Drone::createAttributes, 1, 8, 0, false, Ability.ACID);
	public static final EntityType<Warrior> WARRIOR = FactionEntities.register("xeno_warrior", FACTION, ModelKind.SPIDER,
		EntityType.Builder.of(Warrior::new, MobCategory.MONSTER).sized(1.2F, 0.85F).eyeHeight(0.6F),
		Warrior::createAttributes, 1, 3, 3, false, Ability.POISON);

	/** フェイスハガーに寄生された宿主に付くタグ。一定時間後にドローンが胸を食い破る (FactionDirector)。 */
	public static final String HOST_TAG = "yakata_xeno_host";

	private static final int HOST_INCUBATION = 200;
	private static final Map<UUID, Long> HOSTS = new HashMap<>();

	private XenoMobs() {}

	/** フェイスハガーに寄生された宿主は 10 秒後に胸を食い破られ、ドローンが生まれる。 */
	static void tickHosts(ServerLevel level) {
		long now = level.getGameTime();
		List<LivingEntity> burst = new ArrayList<>();
		for (Entity e : level.getAllEntities()) {
			if (e instanceof LivingEntity living && living.isAlive() && e.entityTags().contains(HOST_TAG)) {
				long since = HOSTS.computeIfAbsent(e.getUUID(), u -> now);
				if (now - since >= HOST_INCUBATION || now < since) {
					burst.add(living);
				}
			}
		}
		for (LivingEntity host : burst) {
			HOSTS.remove(host.getUUID());
			host.removeTag(HOST_TAG);
			level.sendParticles(ParticleTypes.DAMAGE_INDICATOR, host.getX(), host.getY() + 1.0, host.getZ(), 15, 0.3, 0.3, 0.3, 0.2);
			level.playSound(null, host.getX(), host.getY(), host.getZ(), SoundEvents.SLIME_SQUISH, SoundSource.HOSTILE, 1.5F, 0.5F);
			BlockPos at = host.blockPosition();
			host.kill(level);
			if (FactionDirector.spawnAround(level, DRONE, at, level.getRandom(), EntitySpawnReason.CONVERSION) != null) {
				FactionStats.recordConversion(FACTION);
				YakataMod.LOGGER.info("[yakata] チェストバスター: 宿主からゼノモーフが誕生 ({})", at);
			}
		}
		HOSTS.keySet().removeIf(uuid -> level.getEntity(uuid) == null);
	}

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
		protected Faction baseFaction() {
			return FACTION;
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
		protected Faction baseFaction() {
			return FACTION;
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
		protected Faction baseFaction() {
			return FACTION;
		}
	}
}
