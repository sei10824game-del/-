package jp.yakata.faction.entity;

import jp.yakata.YakataMod;
import jp.yakata.faction.Faction;
import jp.yakata.faction.FactionEntities;
import jp.yakata.faction.FactionEntities.Ability;
import jp.yakata.faction.FactionEntities.ModelKind;
import jp.yakata.faction.FactionMob;
import jp.yakata.faction.FactionStats;
import net.minecraft.ChatFormatting;
import net.minecraft.core.particles.DustParticleOptions;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.network.syncher.EntityDataAccessor;
import net.minecraft.network.syncher.EntityDataSerializers;
import net.minecraft.network.syncher.SynchedEntityData;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.world.DifficultyInstance;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.EquipmentSlot;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.entity.SpawnGroupData;
import net.minecraft.world.entity.ai.attributes.AttributeInstance;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.ServerLevelAccessor;
import net.minecraft.world.level.storage.ValueInput;
import net.minecraft.world.level.storage.ValueOutput;
import net.minecraft.world.phys.Vec3;
import org.jspecify.annotations.Nullable;

/**
 * チェンソーマン陣営: デンジ (チェンソーマン) / パワー (血の魔人) / 早川アキ。
 * <ul>
 *   <li>デンジ第1形態: 素早く、チェンソーの連撃 (1 撃 + 追撃 2 回) を浴びせ、斬るたびに血を啜って回復する。</li>
 *   <li>倒れるとポチタが目覚め、黒いチェンソーマン (第2形態: 大型・4 本腕) として起き上がる。</li>
 *   <li>黒いチェンソーマンは敵を倒すたびに恒久的に強くなる (体力・攻撃力・速さ・体格)。倒した相手より弱い敵が
 *       正面でそれを目撃していると、さらに伸びる (最大 3 段階/キル)。</li>
 *   <li>マキマの支配も他陣営の感染も受けない。マキマとは宿敵 (同じ部屋に住まない)。</li>
 * </ul>
 */
public final class ChainsawMobs {
	public static final Faction FACTION = Faction.builder("chainsaw").names("チェンソーマン", "Chainsaw Man").color(ChatFormatting.AQUA)
		.home("hall", "kitchen").rivals("makima").cap(8).infectionImmune().controlImmune()
		.seed(() -> ChainsawMobs.DENJI, 1).seed(() -> ChainsawMobs.POWER, 1).seed(() -> ChainsawMobs.AKI, 1)
		.register();

	public static final EntityType<Denji> DENJI = FactionEntities.register("chainsaw_denji", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Denji::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Denji::createAttributes, 2, 1, 1, true, Ability.LEECH);
	public static final EntityType<Power> POWER = FactionEntities.register("chainsaw_power", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Power::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Power::createAttributes, 1, 2, 2, true, Ability.NONE);
	public static final EntityType<Aki> AKI = FactionEntities.register("chainsaw_aki", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Aki::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Aki::createAttributes, 1, 2, 2, true, Ability.NONE);

	private static final DustParticleOptions BLOOD = new DustParticleOptions(0x9A1010, 1.2F);

	private ChainsawMobs() {}

	/** デンジ。チェンソーの悪魔。倒れると黒いチェンソーマンとして蘇り、倒すたびに強くなる。 */
	public static class Denji extends FactionMonster {
		private static final EntityDataAccessor<Integer> DATA_FORM = SynchedEntityData.defineId(Denji.class, EntityDataSerializers.INT);
		/** 第2形態の成長の上限 */
		private static final double MAX_HEALTH_CAP = 260.0;
		private static final double DAMAGE_CAP = 18.0;
		private static final double SPEED_CAP = 0.42;
		private static final double SCALE_CAP = 1.48; // 洋館の戸口 (高さ 3) をくぐれる大きさまで
		private int comboLeft;
		private int comboTimer;
		private @Nullable LivingEntity comboTarget;
		private int growth;

		public Denji(EntityType<? extends Denji> type, Level level) {
			super(type, level);
			this.xpReward = 60;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(70.0, 0.33, 6.0, 4.0, 40.0)
				.add(Attributes.KNOCKBACK_RESISTANCE, 0.3)
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

		public int getGrowth() {
			return this.growth;
		}

		@Override
		public int getRenderVariant() {
			return this.getForm() - 1;
		}

		@Override
		protected double chaseSpeed() {
			return 1.25;
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			this.leech((float) this.getAttributeValue(Attributes.ATTACK_DAMAGE));
			if (this.comboLeft <= 0) {
				this.comboLeft = this.getForm() >= 2 ? 3 : 2; // 4 本腕は手数が多い
				this.comboTimer = 4;
				this.comboTarget = target;
			}
			level.sendParticles(BLOOD, target.getX(), target.getY() + 1.0, target.getZ(), 8, 0.3, 0.3, 0.3, 0.0);
		}

		/** 血を啜って回復 */
		private void leech(float dealt) {
			this.heal(dealt * 0.35F);
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			if (this.comboLeft > 0 && --this.comboTimer <= 0) {
				LivingEntity t = this.comboTarget;
				this.comboLeft--;
				this.comboTimer = 4;
				if (t != null && t.isAlive() && this.distanceToSqr(t) < 3.5 * 3.5) {
					float dmg = (float) this.getAttributeValue(Attributes.ATTACK_DAMAGE) * 0.6F;
					this.swingForAttack(net.minecraft.world.InteractionHand.MAIN_HAND);
					if (t.hurtServer(level, this.damageSources().mobAttack(this), dmg)) {
						this.leech(dmg);
						this.setLastHurtMob(t);
						FactionStats.event("csm_combo_hit");
					}
					level.sendParticles(ParticleTypes.SWEEP_ATTACK, t.getX(), t.getY() + 1.0, t.getZ(), 1, 0.0, 0.0, 0.0, 0.0);
					this.playSound(SoundEvents.PLAYER_ATTACK_SWEEP, 1.0F, 0.6F);
				} else {
					this.comboLeft = 0;
				}
			}
		}

		/** 倒れたらポチタが目覚める: 黒いチェンソーマンへ */
		@Override
		public boolean tryCheatDeath(ServerLevel level, DamageSource source) {
			if (this.getForm() >= 2) {
				return false;
			}
			this.entityData.set(DATA_FORM, 2);
			this.getAttribute(Attributes.MAX_HEALTH).setBaseValue(130.0);
			this.getAttribute(Attributes.ATTACK_DAMAGE).setBaseValue(10.0);
			this.getAttribute(Attributes.SCALE).setBaseValue(1.4);
			this.getAttribute(Attributes.MOVEMENT_SPEED).setBaseValue(0.36);
			this.getAttribute(Attributes.ARMOR).setBaseValue(8.0);
			this.getAttribute(Attributes.KNOCKBACK_RESISTANCE).setBaseValue(0.8);
			this.setHealth(this.getMaxHealth());
			this.clearFire();
			this.removeAllEffects();
			level.sendParticles(ParticleTypes.LARGE_SMOKE, this.getX(), this.getY() + 1.0, this.getZ(), 40, 0.5, 1.0, 0.5, 0.05);
			level.sendParticles(BLOOD, this.getX(), this.getY() + 1.0, this.getZ(), 40, 0.6, 1.0, 0.6, 0.0);
			this.playSound(SoundEvents.WARDEN_ROAR, 2.0F, 1.3F);
			FactionStats.event("csm_form2");
			YakataMod.LOGGER.info("[yakata] チェンソーマン: デンジの心臓でポチタが目覚めた —— 黒いチェンソーマン (第2形態) ({})",
				this.blockPosition().toShortString());
			return true;
		}

		@Override
		public boolean killedEntity(ServerLevel level, LivingEntity victim, DamageSource source) {
			boolean result = super.killedEntity(level, victim, source);
			if (!(victim instanceof FactionMob || MobUtil.isSurvivor(victim)) || FactionMob.sameFaction(this, victim)) {
				return result;
			}
			if (this.getForm() < 2) {
				this.heal(this.getMaxHealth() * 0.06F); // 第1形態は倒すと少し回復
				return result;
			}
			this.grow(level, victim);
			return result;
		}

		/** 黒いチェンソーマンの成長: 1 + 正面で見ていた (倒された者より弱い) 敵の数 (最大 3) */
		private void grow(ServerLevel level, LivingEntity victim) {
			double victimPower = MobUtil.power(victim);
			Vec3 facing = Vec3.directionFromRotation(0.0F, this.yBodyRot);
			int witnesses = 0;
			for (LivingEntity w : level.getEntitiesOfClass(LivingEntity.class, this.getBoundingBox().inflate(16.0),
				e -> e != victim && e != this && e.isAlive() && FactionMob.isPrey(this, e))) {
				Vec3 dir = new Vec3(w.getX() - this.getX(), 0.0, w.getZ() - this.getZ());
				boolean inFront = dir.lengthSqr() < 1.0E-4 || facing.dot(dir.normalize()) > 0.2;
				if (inFront && MobUtil.power(w) < victimPower && w.hasLineOfSight(this)) {
					witnesses++;
				}
			}
			int gain = Math.min(3, 1 + witnesses);
			this.growth += gain;
			float hpFrac = this.getHealth() / this.getMaxHealth();
			scale(this.getAttribute(Attributes.MAX_HEALTH), Math.pow(1.02, gain), MAX_HEALTH_CAP);
			scale(this.getAttribute(Attributes.ATTACK_DAMAGE), Math.pow(1.015, gain), DAMAGE_CAP);
			scale(this.getAttribute(Attributes.MOVEMENT_SPEED), Math.pow(1.008, gain), SPEED_CAP);
			scale(this.getAttribute(Attributes.SCALE), Math.pow(1.004, gain), SCALE_CAP);
			this.setHealth(Math.min(this.getMaxHealth(), this.getMaxHealth() * (hpFrac + 0.08F)));
			FactionStats.event("csm_growth", gain);
			if (witnesses > 0) {
				FactionStats.event("csm_growth_witnessed");
			}
			YakataMod.LOGGER.info("[yakata] チェンソーマン: 黒いチェンソーマンが {} を倒して成長 +{} (目撃者 {}) → Lv {} 体力 {} 攻撃 {}",
				victim.getType().toShortString(), gain, witnesses, this.growth, (int) this.getMaxHealth(),
				String.format("%.1f", this.getAttributeValue(Attributes.ATTACK_DAMAGE)));
		}

		private static void scale(@Nullable AttributeInstance attr, double factor, double cap) {
			if (attr != null) {
				attr.setBaseValue(Math.min(cap, attr.getBaseValue() * factor));
			}
		}

		@Override
		protected void addAdditionalSaveData(ValueOutput output) {
			super.addAdditionalSaveData(output);
			output.putInt("CsForm", this.getForm());
			output.putInt("CsGrowth", this.growth);
		}

		@Override
		protected void readAdditionalSaveData(ValueInput input) {
			super.readAdditionalSaveData(input);
			this.entityData.set(DATA_FORM, input.getIntOr("CsForm", 1));
			this.growth = input.getIntOr("CsGrowth", 0);
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return this.getForm() >= 2 ? SoundEvents.RAVAGER_AMBIENT : null;
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
		public float getVoicePitch() {
			return this.getForm() >= 2 ? 0.6F : 1.0F;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}

	/** パワー (血の魔人)。血のハンマーで殴り飛ばし、血の槍を投げつける。 */
	public static class Power extends FactionMonster {
		private int spearCooldown = 40;

		public Power(EntityType<? extends Power> type, Level level) {
			super(type, level);
			this.xpReward = 20;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(40.0, 0.3, 6.0, 3.0, 36.0).add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			MobUtil.knock(this, target, 1.0, 0.4); // 血のハンマー
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			LivingEntity t = this.getTarget();
			if (--this.spearCooldown <= 0 && t != null && this.distanceToSqr(t) > 4.0 * 4.0 && MobUtil.inReach(this, t, 14.0)) {
				this.spearCooldown = 60;
				this.swingForAttack(net.minecraft.world.InteractionHand.MAIN_HAND);
				Vec3 from = this.getEyePosition();
				Vec3 to = t.getEyePosition();
				for (int i = 1; i <= 8; i++) {
					Vec3 p = from.lerp(to, i / 8.0);
					level.sendParticles(BLOOD, p.x, p.y, p.z, 2, 0.05, 0.05, 0.05, 0.0);
				}
				t.hurtServer(level, this.damageSources().mobAttack(this), 6.0F);
				this.playSound(SoundEvents.TRIDENT_THROW.value(), 1.0F, 0.8F);
				FactionStats.event("csm_blood_spear");
			}
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
		public float getVoicePitch() {
			return 1.3F;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}

	/** 早川アキ。刀と、狐の悪魔「コン」の噛みつき (標的の周囲をまとめて食いちぎる)。 */
	public static class Aki extends FactionMonster {
		private int konCooldown = 80;

		public Aki(EntityType<? extends Aki> type, Level level) {
			super(type, level);
			this.xpReward = 20;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(34.0, 0.29, 4.0, 3.0, 36.0).add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		public @Nullable SpawnGroupData finalizeSpawn(ServerLevelAccessor level, DifficultyInstance difficulty, EntitySpawnReason reason,
													   @Nullable SpawnGroupData data) {
			SpawnGroupData result = super.finalizeSpawn(level, difficulty, reason, data);
			this.setItemSlot(EquipmentSlot.MAINHAND, new ItemStack(Items.IRON_SWORD));
			this.setDropChance(EquipmentSlot.MAINHAND, 0.0F);
			return result;
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			LivingEntity t = this.getTarget();
			if (--this.konCooldown <= 0 && t != null && MobUtil.inReach(this, t, 8.0)) {
				this.konCooldown = 120;
				// コン: 巨大な狐の頭が標的の周囲を食いちぎる
				level.sendParticles(ParticleTypes.EXPLOSION, t.getX(), t.getY() + 1.0, t.getZ(), 1, 0.0, 0.0, 0.0, 0.0);
				level.sendParticles(BLOOD, t.getX(), t.getY() + 1.0, t.getZ(), 20, 0.8, 0.6, 0.8, 0.0);
				this.playSound(SoundEvents.FOX_BITE, 2.0F, 0.5F);
				for (LivingEntity e : level.getEntitiesOfClass(LivingEntity.class, t.getBoundingBox().inflate(2.5),
					e -> e.isAlive() && FactionMob.isPrey(this, e))) {
					e.hurtServer(level, this.damageSources().mobAttack(this), 9.0F);
				}
				FactionStats.event("csm_kon");
			}
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
