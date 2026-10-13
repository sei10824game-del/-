package jp.yakata.faction.entity;

import jp.yakata.YakataMod;
import jp.yakata.faction.Faction;
import jp.yakata.faction.FactionDirector;
import jp.yakata.faction.FactionEntities;
import jp.yakata.faction.FactionEntities.Ability;
import jp.yakata.faction.FactionEntities.ModelKind;
import jp.yakata.faction.FactionStats;
import net.minecraft.ChatFormatting;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.tags.DamageTypeTags;
import net.minecraft.util.RandomSource;
import net.minecraft.world.DifficultyInstance;
import net.minecraft.world.damagesource.DamageSource;
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
import org.jspecify.annotations.Nullable;

/**
 * プラーガ陣営 (バイオハザード 4): ガナード / ガラドール / プラーガ (寄生体)。
 * <ul>
 *   <li>ガナードは斧・ピッチフォーク・松明を持った村人の宿主。松明は燃やし、斧は重い。</li>
 *   <li>頭を潰されたガナードの首からはプラーガが飛び出す (頭部への命中で倒すと 70%、それ以外でも 30%。炎で倒すと出ない)。</li>
 *   <li>ガラドールは盲目の鎧の爪戦士。正面は鎧で 0.5 倍、背中のプラーガが弱点で 2.5 倍。</li>
 *   <li>プラーガの宿主は他陣営のウイルス・感染・乗っ取りを一切受けない (infectionImmune)。</li>
 * </ul>
 */
public final class PlagaMobs {
	public static final Faction FACTION = Faction.builder("plaga").names("プラーガ", "Las Plagas").color(ChatFormatting.DARK_GREEN)
		.home("study", "dining").cap(24).infectionImmune()
		.seed(() -> PlagaMobs.GANADO, 6).seed(() -> PlagaMobs.GARRADOR, 1).seed(() -> PlagaMobs.PLAGA, 1)
		.conversion(() -> PlagaMobs.GANADO, 1) // 村人にはプラーガが植え付けられる
		.register();

	public static final EntityType<Ganado> GANADO = FactionEntities.register("plaga_ganado", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Ganado::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Ganado::createAttributes, 1, 10, 0);
	public static final EntityType<Garrador> GARRADOR = FactionEntities.register("plaga_garrador", FACTION, ModelKind.ZOMBIE,
		EntityType.Builder.of(Garrador::new, MobCategory.MONSTER).sized(0.6F, 1.95F).eyeHeight(1.74F),
		Garrador::createAttributes, 1, 2, 2, false, Ability.LEECH);
	public static final EntityType<Plaga> PLAGA = FactionEntities.register("plaga_parasite", FACTION, ModelKind.SPIDER,
		EntityType.Builder.of(Plaga::new, MobCategory.MONSTER).sized(1.0F, 0.7F).eyeHeight(0.5F),
		Plaga::createAttributes, 1, 2, 6, false, Ability.POUNCE);

	private static int loggedBursts;

	private PlagaMobs() {}

	/** ガナード。斧・ピッチフォーク・松明を手にした村人の宿主。頭を潰されると首からプラーガが飛び出す。 */
	public static class Ganado extends FactionMonster {
		private boolean headHit;

		public Ganado(EntityType<? extends Ganado> type, Level level) {
			super(type, level);
			this.xpReward = 5;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(22.0, 0.25, 3.0, 2.0, 36.0).add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		public @Nullable SpawnGroupData finalizeSpawn(ServerLevelAccessor level, DifficultyInstance difficulty, EntitySpawnReason reason,
													   @Nullable SpawnGroupData data) {
			SpawnGroupData result = super.finalizeSpawn(level, difficulty, reason, data);
			RandomSource rnd = level.getRandom();
			ItemStack weapon = switch (rnd.nextInt(4)) {
				case 0 -> new ItemStack(Items.IRON_AXE);
				case 1 -> new ItemStack(Items.TRIDENT); // ピッチフォーク
				case 2 -> new ItemStack(Items.TORCH);
				default -> new ItemStack(Items.IRON_HOE); // 鎌
			};
			this.setItemSlot(EquipmentSlot.MAINHAND, weapon);
			this.setDropChance(EquipmentSlot.MAINHAND, 0.0F);
			return result;
		}

		@Override
		protected void onMeleeHit(ServerLevel level, LivingEntity target) {
			ItemStack held = this.getMainHandItem();
			if (held.is(Items.TORCH)) {
				target.igniteForSeconds(3.0F);
			} else if (held.is(Items.IRON_AXE)) {
				target.hurtServer(level, this.damageSources().mobAttack(this), 2.0F);
			}
		}

		@Override
		public boolean hurtServer(ServerLevel level, DamageSource source, float damage) {
			this.headHit = MobUtil.hitHeight(this, source) >= 0.8;
			return super.hurtServer(level, source, damage);
		}

		@Override
		protected void onDeathEffect(ServerLevel level, DamageSource source) {
			if (source.is(DamageTypeTags.IS_FIRE) || source.is(DamageTypeTags.BYPASSES_INVULNERABILITY)) {
				return; // プラーガは炎に弱い
			}
			float chance = this.headHit ? 0.7F : 0.3F;
			if (this.random.nextFloat() < chance && FactionDirector.hasRoom(level, FACTION)) {
				Plaga p = MobUtil.spawnNear(level, PLAGA, this, 0.5);
				if (p != null) {
					p.setPos(this.getX(), this.getEyeY() - 0.3, this.getZ());
					level.sendParticles(ParticleTypes.DAMAGE_INDICATOR, this.getX(), this.getEyeY(), this.getZ(), 10, 0.2, 0.2, 0.2, 0.1);
					this.playSound(SoundEvents.SLIME_SQUISH, 1.2F, 0.7F);
					long n = FactionStats.event("plaga_burst");
					if (loggedBursts++ < 6) {
						YakataMod.LOGGER.info("[yakata] プラーガ: ガナードの首からプラーガが飛び出した ({}, 累計 {})",
							this.headHit ? "頭部破壊" : "致命傷", n);
					}
				}
			}
		}

		@Override
		protected @Nullable SoundEvent getAmbientSound() {
			return SoundEvents.VILLAGER_NO;
		}

		@Override
		protected SoundEvent getHurtSound(DamageSource source) {
			return SoundEvents.VILLAGER_HURT;
		}

		@Override
		protected SoundEvent getDeathSound() {
			return SoundEvents.VILLAGER_DEATH;
		}

		@Override
		public float getVoicePitch() {
			return 0.7F + this.random.nextFloat() * 0.15F;
		}

		@Override
		protected Faction baseFaction() {
			return FACTION;
		}
	}

	/** ガラドール。盲目で、音を頼りに両手の鉤爪で襲う。鎧が攻撃を弾くが、背中のプラーガが弱点。 */
	public static class Garrador extends FactionMonster {
		public Garrador(EntityType<? extends Garrador> type, Level level) {
			super(type, level);
			this.xpReward = 20;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(60.0, 0.27, 9.0, 8.0, 24.0)
				.add(Attributes.SCALE, 1.2)
				.add(Attributes.KNOCKBACK_RESISTANCE, 0.5)
				.add(Attributes.STEP_HEIGHT, 1.0);
		}

		@Override
		protected boolean mustSeeTarget() {
			return false; // 盲目: 音で追う
		}

		@Override
		protected double chaseSpeed() {
			return 1.25;
		}

		@Override
		public boolean hurtServer(ServerLevel level, DamageSource source, float damage) {
			if (source.getEntity() != null && !source.is(DamageTypeTags.BYPASSES_INVULNERABILITY)) {
				boolean front = MobUtil.fromFront(this, source);
				damage *= front ? 0.5F : 2.5F;
				if (!front) {
					level.sendParticles(ParticleTypes.DAMAGE_INDICATOR, this.getX(), this.getY() + 1.6, this.getZ(), 6, 0.2, 0.2, 0.2, 0.1);
					FactionStats.event("plaga_garrador_backstab");
				}
			}
			return super.hurtServer(level, source, damage);
		}

		@Override
		protected SoundEvent getStepSound() {
			return SoundEvents.IRON_GOLEM_STEP;
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

	/** プラーガ (寄生体)。宿主の首から飛び出した多脚の寄生体。壁を這い、鎌のような脚で跳びかかる。 */
	public static class Plaga extends ClimbingFactionMonster {
		public Plaga(EntityType<? extends Plaga> type, Level level) {
			super(type, level);
			this.xpReward = 4;
		}

		public static AttributeSupplier.Builder createAttributes() {
			return MobUtil.attrs(14.0, 0.33, 4.0, 0.0, 28.0).add(Attributes.SCALE, 0.8);
		}

		@Override
		protected void addSpecialGoals() {
			this.goalSelector.addGoal(2, new PounceGoal(this, 2.0, 7.0, 1.0, 0.45, 40));
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
}
