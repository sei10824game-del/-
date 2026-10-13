package jp.yakata.faction.entity;

import jp.yakata.YakataMod;
import jp.yakata.faction.Faction;
import jp.yakata.faction.FactionEntities;
import jp.yakata.faction.FactionEntities.Ability;
import jp.yakata.faction.FactionEntities.ModelKind;
import jp.yakata.faction.FactionMob;
import jp.yakata.faction.FactionStats;
import net.minecraft.ChatFormatting;
import net.minecraft.core.BlockPos;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.entity.ai.memory.MemoryModuleType;
import net.minecraft.world.entity.ai.memory.WalkTarget;
import net.minecraft.world.entity.npc.villager.AbstractVillager;
import net.minecraft.world.entity.npc.villager.Villager;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.Level;
import org.jspecify.annotations.Nullable;

/**
 * サイレンヘッド陣営 (Trevor Henderson の未確認生物): サイレンヘッド / ロングホース / カートゥーン・キャット。
 * <ul>
 *   <li>サイレンヘッドは高さ約 8 ブロックの細長い怪物。洋館に入れないので前庭 ("yard") に棲む。</li>
 *   <li>サイレン: 襲撃のホーン (event.raid.horn) を音量 10〜16 (= 160〜256 ブロック先まで届く) で鳴らし、
 *       ウォーデンの衝撃音とエルダーガーディアンの呪いの音を重ねる。14 ブロック以内の者は耳をやられ
 *       (ダメージ + 強い鈍化 + 吐き気)、80 ブロック以内の獲物のいない Mob と生存者は轟音に誘われて集まってくる。</li>
 *   <li>声真似: ラジオのような声で生存者をおびき寄せる (サイレンヘッドとカートゥーン・キャット)。</li>
 *   <li>ロングホースの一撃は「死の前兆」(衰弱 + 発光) を刻む。カートゥーン・キャットはゴムのような腕で獲物を引き寄せる。</li>
 * </ul>
 */
public final class SirenMobs {
	public static final Faction FACTION = Faction.builder("sirenhead").names("サイレンヘッド", "Siren Head").color(ChatFormatting.GRAY)
		.home("yard").cap(8).controlImmune()
		.seed(() -> SirenMobs.SIREN_HEAD, 1).seed(() -> SirenMobs.LONG_HORSE, 1).seed(() -> SirenMobs.CARTOON_CAT, 1)
		.register();

	public static final EntityType<SirenHead> SIREN_HEAD = FactionEntities.register("siren_head", FACTION, ModelKind.SIREN,
		EntityType.Builder.of(SirenHead::new, MobCategory.MONSTER).sized(1.0F, 7.8F).eyeHeight(7.2F),
		SirenHead::createAttributes, 1, 1, 1, true, Ability.NONE);
	public static final EntityType<LongHorse> LONG_HORSE = FactionEntities.register("siren_long_horse", FACTION, ModelKind.HORSE,
		EntityType.Builder.of(LongHorse::new, MobCategory.MONSTER).sized(1.3F, 1.6F).eyeHeight(1.5F),
		LongHorse::createAttributes, 1, 2, 1, true, Ability.NONE);
	public static final EntityType<CartoonCat> CARTOON_CAT = FactionEntities.register("siren_cartoon_cat", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(CartoonCat::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		CartoonCat::createAttributes, 1, 3, 2, false, Ability.PULL);

	/** サイレンが聞こえる/誘われる範囲 */
	public static final double LURE_RADIUS = 80.0;
	public static final double DEAFEN_RADIUS = 14.0;

	private SirenMobs() {}

	/** 声真似: 生存者 (と獲物のいない Mob の一部) を自分のもとへおびき寄せる。 */
	static int mimic(Mob src, ServerLevel level, double radius) {
		int lured = 0;
		BlockPos at = src.blockPosition();
		for (LivingEntity e : level.getEntitiesOfClass(LivingEntity.class, src.getBoundingBox().inflate(radius),
			e -> e.isAlive() && e != src && e.distanceToSqr(src) > 6 * 6)) {
			if (e instanceof Villager v) {
				v.getBrain().setMemory(MemoryModuleType.WALK_TARGET, new WalkTarget(at, 0.6F, 2));
				lured++;
			} else if (e instanceof FactionMonster fm && fm.getFaction() != FACTION && fm.getTarget() == null && src.getRandom().nextFloat() < 0.3F) {
				fm.lure(at, 300);
				lured++;
			}
		}
		level.playSound(null, src.getX(), src.getY(), src.getZ(), SoundEvents.ALLAY_AMBIENT_WITHOUT_ITEM, SoundSource.HOSTILE, 3.0F, 0.5F);
		FactionStats.event("siren_mimic");
		return lured;
	}

	/**
	 * サイレンヘッドは高さ約 8 ブロックの細長い怪物。頭の 2 基のサイレンを鳴らすたびに館中へ轟音が響き、
	 * 近くの者は耳をやられて動けなくなり、遠くの者は音に誘われて集まってくる。長い腕で上から叩き潰す。
	 */
	public static class SirenHead extends FactionMonster {
		private int sirenCooldown = 100;
		private int smashCooldown = 20;
		private int mimicCooldown = 300;

		public SirenHead(EntityType<? extends SirenHead> type, Level level) {
			super(type, level);
			this.xpReward = 60;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(300.0, 0.3, 14.0, 6.0, 64.0)
				.add(Attributes.KNOCKBACK_RESISTANCE, 1.0)
				.add(Attributes.STEP_HEIGHT, 2.0);
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			LivingEntity t = this.getTarget();
			if (--this.sirenCooldown <= 0) {
				this.sirenBlast(level);
				this.sirenCooldown = t != null ? 300 : 600;
			}
			if (--this.smashCooldown <= 0 && t != null && t.isAlive()) {
				double dx = t.getX() - this.getX();
				double dz = t.getZ() - this.getZ();
				if (dx * dx + dz * dz < 6.0 * 6.0 && Math.abs(t.getY() - this.getY()) < 8.0 && this.getSensing().hasLineOfSight(t)) {
					// 長い腕を振り下ろす
					this.smashCooldown = 30;
					this.swingForAttack(net.minecraft.world.InteractionHand.MAIN_HAND);
					if (t.hurtServer(level, this.damageSources().mobAttack(this), (float) this.getAttributeValue(Attributes.ATTACK_DAMAGE))) {
						MobUtil.knock(this, t, 1.4, 0.6);
					}
					this.playSound(SoundEvents.WARDEN_ATTACK_IMPACT, 1.5F, 0.5F);
				}
			}
			if (--this.mimicCooldown <= 0) {
				this.mimicCooldown = 500;
				mimic(this, level, 48.0);
			}
		}

		/** サイレン: 遠くまで届く大音量のホーン。近くの者は耳をやられ、遠くの者は誘われる。 */
		public int sirenBlast(ServerLevel level) {
			boolean big = this.getHealth() < this.getMaxHealth() * 0.5F || this.random.nextFloat() < 0.3F;
			float volume = big ? 16.0F : 10.0F;
			double x = this.getX();
			double y = this.getEyeY();
			double z = this.getZ();
			level.playSound(null, x, y, z, SoundEvents.RAID_HORN, SoundSource.HOSTILE, volume, big ? 0.5F : 0.62F);
			level.playSound(null, x, y, z, SoundEvents.ELDER_GUARDIAN_CURSE, SoundSource.HOSTILE, volume * 0.5F, 0.5F);
			level.playSound(null, x, y, z, SoundEvents.WARDEN_SONIC_BOOM, SoundSource.HOSTILE, 4.0F, 0.5F);
			for (int i = 0; i < 4; i++) {
				level.sendParticles(ParticleTypes.SONIC_BOOM, x, y - i * 0.8, z, 1, 0.0, 0.0, 0.0, 0.0);
			}
			level.sendParticles(ParticleTypes.SCULK_SOUL, x, y, z, 30, 2.0, 1.0, 2.0, 0.05);

			int deafened = 0;
			int luredMobs = 0;
			int luredSurvivors = 0;
			BlockPos at = this.blockPosition();
			for (LivingEntity e : level.getEntitiesOfClass(LivingEntity.class, this.getBoundingBox().inflate(LURE_RADIUS),
				e -> e.isAlive() && e != this && FactionMob.factionOf(e) != FACTION)) {
				double d = Math.sqrt(e.distanceToSqr(this));
				if (d > LURE_RADIUS) {
					continue;
				}
				if (d < DEAFEN_RADIUS) {
					// 鼓膜を破る衝撃: 近いほど強い
					double f = 1.0 - d / DEAFEN_RADIUS;
					if (FactionMob.isPrey(this, e)) {
						e.hurtServer(level, this.damageSources().sonicBoom(this), (float) (2.0 + 6.0 * f));
					}
					e.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, (int) (40 + 60 * f), 3), this);
					e.addEffect(new MobEffectInstance(MobEffects.NAUSEA, 160, 0), this);
					if (e instanceof Mob m && !(e instanceof Player)) {
						m.getNavigation().stop();
					}
					deafened++;
				} else if (e instanceof Villager v) {
					v.getBrain().setMemory(MemoryModuleType.WALK_TARGET, new WalkTarget(at, 0.6F, 3));
					luredSurvivors++;
				} else if (e instanceof FactionMonster fm && fm.getTarget() == null && luredMobs < 40) {
					fm.lure(at, 400);
					luredMobs++;
				}
			}
			long n = FactionStats.event("siren");
			FactionStats.event("siren_lured_mobs", luredMobs);
			FactionStats.event("siren_lured_survivors", luredSurvivors);
			YakataMod.LOGGER.info("[yakata] サイレン #{}{}: sound=event.raid.horn+entity.warden.sonic_boom vol={} (届く範囲 {} ブロック) "
					+ "耳をやられた={} 誘われた Mob={} 生存者={} ({})",
				n, big ? " (大)" : "", volume, (int) (16 * volume), deafened, luredMobs, luredSurvivors, at.toShortString());
			return luredMobs + luredSurvivors;
		}

		@Override
		public boolean doHurtTarget(ServerLevel level, net.minecraft.world.entity.Entity target) {
			boolean hit = super.doHurtTarget(level, target);
			if (hit && target instanceof LivingEntity living) {
				MobUtil.knock(this, living, 1.2, 0.5);
			}
			return hit;
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return null; // 静かに立っている (電柱に擬態)
		}

		@Override
		protected SoundEvent getHurtSound(DamageSource source) {
			return SoundEvents.IRON_GOLEM_HURT;
		}

		@Override
		protected SoundEvent getDeathSound() {
			return SoundEvents.IRON_GOLEM_DEATH;
		}

		@Override
		protected SoundEvent getStepSound() {
			return SoundEvents.IRON_GOLEM_STEP;
		}

		@Override
		public float getVoicePitch() {
			return 0.4F;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}

	/** ロングホース。長大な首と脚を持つ骨ばった馬。その一撃は「死の前兆」を刻む (衰弱 + 発光)。 */
	public static class LongHorse extends FactionMonster {
		public LongHorse(EntityType<? extends LongHorse> type, Level level) {
			super(type, level);
			this.xpReward = 30;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(90.0, 0.3, 9.0, 4.0, 48.0)
				.add(Attributes.SCALE, 1.7)
				.add(Attributes.KNOCKBACK_RESISTANCE, 0.8)
				.add(Attributes.STEP_HEIGHT, 1.5);
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			target.addEffect(new MobEffectInstance(MobEffects.WITHER, 80, 0), this);
			target.addEffect(new MobEffectInstance(MobEffects.GLOWING, 160, 0), this);
			target.addEffect(new MobEffectInstance(MobEffects.WEAKNESS, 120, 0), this);
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.SKELETON_HORSE_AMBIENT;
		}

		@Override
		protected SoundEvent getHurtSound(DamageSource source) {
			return SoundEvents.SKELETON_HORSE_HURT;
		}

		@Override
		protected SoundEvent getDeathSound() {
			return SoundEvents.SKELETON_HORSE_DEATH;
		}

		@Override
		protected SoundEvent getStepSound() {
			return SoundEvents.HORSE_STEP;
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

	/** カートゥーン・キャット。1930 年代のアニメのような白黒の猫。ゴムのように腕を伸ばして獲物を引き寄せ、声を真似る。 */
	public static class CartoonCat extends FactionMonster {
		private int stretchCooldown = 40;
		private int mimicCooldown = 200;

		public CartoonCat(EntityType<? extends CartoonCat> type, Level level) {
			super(type, level);
			this.xpReward = 20;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(50.0, 0.33, 6.0, 2.0, 40.0)
				.add(Attributes.SCALE, 1.3)
				.add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		protected double chaseSpeed() {
			return 1.25;
		}

		@Override
		protected void customServerAiStep(ServerLevel level) {
			super.customServerAiStep(level);
			LivingEntity t = this.getTarget();
			if (--this.stretchCooldown <= 0 && t != null && t.isAlive()) {
				double d = this.distanceTo(t);
				if (d > 3.0 && d < 9.0 && this.getSensing().hasLineOfSight(t)) {
					this.stretchCooldown = 80;
					MobUtil.pull(this, t, 1.4);
					t.hurtServer(level, this.damageSources().mobAttack(this), 3.0F);
					this.playSound(SoundEvents.FISHING_BOBBER_RETRIEVE, 1.5F, 0.5F);
					FactionStats.event("siren_cat_stretch");
				}
			}
			if (--this.mimicCooldown <= 0) {
				this.mimicCooldown = 400;
				mimic(this, level, 32.0);
			}
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.OCELOT_AMBIENT;
		}

		@Override
		protected SoundEvent getHurtSound(DamageSource source) {
			return SoundEvents.OCELOT_HURT;
		}

		@Override
		protected SoundEvent getDeathSound() {
			return SoundEvents.OCELOT_DEATH;
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
