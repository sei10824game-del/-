package jp.yakata.faction.entity;

import jp.yakata.faction.Faction;
import jp.yakata.faction.FactionEntities;
import jp.yakata.faction.FactionEntities.Ability;
import jp.yakata.faction.FactionEntities.ModelKind;
import jp.yakata.faction.FactionHooks;
import net.minecraft.ChatFormatting;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.network.syncher.EntityDataAccessor;
import net.minecraft.network.syncher.EntityDataSerializers;
import net.minecraft.network.syncher.SynchedEntityData;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.ConversionParams;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.storage.ValueInput;
import net.minecraft.world.level.storage.ValueOutput;
import org.jspecify.annotations.Nullable;

/** G-ウイルス陣営: バーキン型変異体 (成長段階あり) / G 成体 / G 胚。 */
public final class GVirusMobs {
	public static final Faction FACTION = Faction.builder("gvirus").names("G-ウイルス", "G-Virus").color(ChatFormatting.LIGHT_PURPLE)
		.home("cellar").cap(20).virus()
		.seed(() -> GVirusMobs.BIRKIN, 1).seed(() -> GVirusMobs.G_ADULT, 2).seed(() -> GVirusMobs.G_EMBRYO, 4)
		.conversion(() -> GVirusMobs.G_EMBRYO, 2) // G 胚は体内で増殖する
		.register();

	public static final EntityType<Birkin> BIRKIN = FactionEntities.register("g_birkin", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Birkin::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Birkin::createAttributes, 3, 1, 1, true, Ability.SLAM);
	public static final EntityType<GAdult> G_ADULT = FactionEntities.register("g_adult", FACTION, ModelKind.SPIDER,
		EntityType.Builder.of(GAdult::new, MobCategory.MONSTER).sized(1.3F, 0.9F).eyeHeight(0.65F),
		GAdult::createAttributes, 1, 4, 8, false, Ability.POUNCE);
	public static final EntityType<GEmbryo> G_EMBRYO = FactionEntities.register("g_embryo", FACTION, ModelKind.SILVERFISH,
		EntityType.Builder.of(GEmbryo::new, MobCategory.MONSTER).sized(0.5F, 0.35F).eyeHeight(0.15F),
		GEmbryo::createAttributes, 1, 8, 0);

	private GVirusMobs() {}

	/**
	 * バーキン型の G 変異体。殺した数と経過時間で第1→第2→第3形態へ変異し、
	 * 変異のたびに巨大化・全回復・攻撃力上昇。第3形態は周囲をなぎ払う。
	 */
	public static class Birkin extends FactionMonster {
		private static final EntityDataAccessor<Integer> DATA_STAGE = SynchedEntityData.defineId(Birkin.class, EntityDataSerializers.INT);
		/** 段階ごとの [最大HP, 攻撃力, 大きさ, 移動速度] */
		private static final double[][] STAGES = {
			{80.0, 8.0, 1.15, 0.24},
			{140.0, 12.0, 1.35, 0.27},
			{220.0, 16.0, 1.5, 0.30},
		};
		/** 次段階へ必要な累計キル数 / 生存 tick */
		private static final int[] KILLS_TO_GROW = {3, 7};
		private static final int[] TICKS_TO_GROW = {2400, 7200};
		private int kills;
		private int ageTicks;

		public Birkin(EntityType<? extends Birkin> type, Level level) {
			super(type, level);
			this.xpReward = 30;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(STAGES[0][0], STAGES[0][3], STAGES[0][1], 6.0, 40.0)
				.add(Attributes.SCALE, STAGES[0][2])
				.add(Attributes.KNOCKBACK_RESISTANCE, 0.6)
				.add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		protected void defineSynchedData(SynchedEntityData.Builder builder) {
			super.defineSynchedData(builder);
			builder.define(DATA_STAGE, 1);
		}

		public int getStage() {
			return this.entityData.get(DATA_STAGE);
		}

		@Override
		public int getRenderVariant() {
			return this.getStage() - 1;
		}

		private void setStage(int stage, boolean heal) {
			stage = Math.max(1, Math.min(3, stage));
			this.entityData.set(DATA_STAGE, stage);
			double[] s = STAGES[stage - 1];
			this.getAttribute(Attributes.MAX_HEALTH).setBaseValue(s[0]);
			this.getAttribute(Attributes.ATTACK_DAMAGE).setBaseValue(s[1]);
			this.getAttribute(Attributes.SCALE).setBaseValue(s[2]);
			this.getAttribute(Attributes.MOVEMENT_SPEED).setBaseValue(s[3]);
			if (heal) {
				this.setHealth(this.getMaxHealth());
			}
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			this.ageTicks++;
			int stage = this.getStage();
			if (stage < 3 && (this.kills >= KILLS_TO_GROW[stage - 1] || this.ageTicks >= TICKS_TO_GROW[stage - 1])) {
				this.mutate(level, stage + 1);
			}
		}

		private void mutate(ServerLevel level, int newStage) {
			this.setStage(newStage, true);
			this.playSound(SoundEvents.WARDEN_ROAR, 2.0F, 0.7F);
			MobUtil.particles(level, ParticleTypes.DAMAGE_INDICATOR, this, 20, 0.8, 0.2);
			jp.yakata.YakataMod.LOGGER.info("[yakata] G-ウイルス変異体が第{}形態へ変異 ({})", newStage, this.blockPosition());
		}

		@Override
		public boolean killedEntity(ServerLevel level, LivingEntity victim, DamageSource source) {
			this.kills++;
			return super.killedEntity(level, victim, source);
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			if (this.getStage() >= 3) {
				// 第3形態: 巨腕のなぎ払い。標的周囲の敵にも半分のダメージ
				float dmg = (float) this.getAttributeValue(Attributes.ATTACK_DAMAGE) * 0.5F;
				MobUtil.forEnemiesAround(this, 3.0, e -> {
					if (e != target) {
						e.hurtServer(level, this.damageSources().mobAttack(this), dmg);
					}
				});
				MobUtil.particles(level, ParticleTypes.SWEEP_ATTACK, this, 3, 1.0, 0.0);
			}
		}

		@Override
		protected void addAdditionalSaveData(ValueOutput output) {
			super.addAdditionalSaveData(output);
			output.putInt("GStage", this.getStage());
			output.putInt("GKills", this.kills);
			output.putInt("GAge", this.ageTicks);
		}

		@Override
		protected void readAdditionalSaveData(ValueInput input) {
			super.readAdditionalSaveData(input);
			this.kills = input.getIntOr("GKills", 0);
			this.ageTicks = input.getIntOr("GAge", 0);
			this.setStage(input.getIntOr("GStage", 1), false);
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.ZOMBIE_AMBIENT;
		}

		@Override
		public float getVoicePitch() {
			return 0.55F;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}

	/** G 成体。肥大した眼球を持つ多脚の怪物。壁を這い、攻撃した相手のそばに G 胚を産み付ける。 */
	public static class GAdult extends ClimbingFactionMonster {
		public GAdult(EntityType<? extends GAdult> type, Level level) {
			super(type, level);
			this.xpReward = 15;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(56.0, 0.29, 8.0, 4.0, 32.0).add(Attributes.SCALE, 1.2);
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			if (this.random.nextFloat() < 0.25F && MobUtil.countNear(this, G_EMBRYO, 16.0) < 6) {
				MobUtil.spawnNear(level, G_EMBRYO, target, 1.5);
				this.playSound(SoundEvents.SLIME_SQUISH, 1.0F, 0.6F);
			}
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

	/** G 胚。小さく素早い幼体。3 分生き延びると G 成体へ成長する。 */
	public static class GEmbryo extends FactionMonster {
		private static final int GROW_TICKS = 3600;
		private int ageTicks;

		public GEmbryo(EntityType<? extends GEmbryo> type, Level level) {
			super(type, level);
			this.xpReward = 2;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(10.0, 0.34, 2.5, 0.0, 24.0);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(2, new PounceGoal(this, 2.0, 6.0, 0.7, 0.35, 50));
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			if (++this.ageTicks >= GROW_TICKS) {
				this.ageTicks = 0;
				GAdult adult = this.convertTo(G_ADULT, ConversionParams.single(this, false, false), a -> {});
				if (adult != null) {
					adult.playSound(SoundEvents.ZOMBIE_VILLAGER_CONVERTED, 1.0F, 0.6F);
				}
			}
		}

		@Override
		protected void addAdditionalSaveData(ValueOutput output) {
			super.addAdditionalSaveData(output);
			output.putInt("GAge", this.ageTicks);
		}

		@Override
		protected void readAdditionalSaveData(ValueInput input) {
			super.readAdditionalSaveData(input);
			this.ageTicks = input.getIntOr("GAge", 0);
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
}
