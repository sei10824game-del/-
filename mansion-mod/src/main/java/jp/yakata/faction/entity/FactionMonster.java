package jp.yakata.faction.entity;

import jp.yakata.faction.Faction;
import jp.yakata.faction.FactionMob;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.entity.ai.goal.FloatGoal;
import net.minecraft.world.entity.ai.goal.LookAtPlayerGoal;
import net.minecraft.world.entity.ai.goal.MeleeAttackGoal;
import net.minecraft.world.entity.ai.goal.OpenDoorGoal;
import net.minecraft.world.entity.ai.goal.RandomLookAroundGoal;
import net.minecraft.world.entity.ai.goal.WaterAvoidingRandomStrollGoal;
import net.minecraft.world.entity.ai.goal.target.HurtByTargetGoal;
import net.minecraft.world.entity.ai.goal.target.NearestAttackableTargetGoal;
import net.minecraft.world.entity.ai.util.GoalUtils;
import net.minecraft.world.entity.monster.Monster;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.core.BlockPos;
import org.jspecify.annotations.Nullable;

import java.util.List;

/**
 * 全陣営 Mob の基底クラス。
 * <ul>
 *   <li>別陣営・プレイヤー・村人・ゴーレムを最寄り順に狙う (同陣営は絶対に狙わない)</li>
 *   <li>より近い敵が現れたら標的を切り替える (乱戦が読みやすくなる)</li>
 *   <li>日光で燃えず、遠くても消滅しない</li>
 * </ul>
 */
public abstract class FactionMonster extends Monster implements FactionMob {
	/** 跳びかかり中の残り tick (この間に標的へ接触すると一撃) */
	private int pounceTicks;
	private @Nullable LivingEntity pounceTarget;

	protected FactionMonster(EntityType<? extends FactionMonster> type, Level level) {
		super(type, level);
		this.xpReward = 5;
		if (GoalUtils.hasGroundPathNavigation(this)) {
			this.getNavigation().setCanOpenDoors(true);
		}
	}

	// ---- AI ---------------------------------------------------------------

	@Override
	protected void registerGoals() {
		this.goalSelector.addGoal(0, new FloatGoal(this));
		this.addSpecialGoals();
		this.goalSelector.addGoal(3, new MeleeAttackGoal(this, this.chaseSpeed(), true));
		if (GoalUtils.hasGroundPathNavigation(this)) {
			this.goalSelector.addGoal(4, new OpenDoorGoal(this, false));
		}
		this.goalSelector.addGoal(5, new HuntGoal(this, 0.9));
		this.goalSelector.addGoal(6, new WaterAvoidingRandomStrollGoal(this, 0.8));
		this.goalSelector.addGoal(7, new LookAtPlayerGoal(this, Player.class, 8.0F));
		this.goalSelector.addGoal(8, new RandomLookAroundGoal(this));

		this.targetSelector.addGoal(1, new HurtByTargetGoal(this));
		this.targetSelector.addGoal(2, new NearestAttackableTargetGoal<>(
			this, LivingEntity.class, 5, this.mustSeeTarget(), false, (target, level) -> FactionMob.isPrey(this, target)));
	}

	/** 跳びかかりなど、近接攻撃より優先する特殊行動 (優先度 1〜2 で登録)。 */
	protected void addSpecialGoals() {
	}

	/** 追跡時の移動速度倍率 */
	protected double chaseSpeed() {
		return 1.0;
	}

	/** 視認が必要か (盲目のクリッカー・リッカーは音で追うので false) */
	protected boolean mustSeeTarget() {
		return true;
	}

	@Override
	public void setTarget(@Nullable LivingEntity target) {
		// 同陣営への敵対 (流れ弾・範囲攻撃への反撃など) は一切受け付けない
		if (target != null && FactionMob.sameFaction(this, target)) {
			return;
		}
		super.setTarget(target);
	}

	@Override
	public boolean canAttack(LivingEntity target) {
		return !FactionMob.sameFaction(this, target) && super.canAttack(target);
	}

	@Override
	protected void customServerAiStep(ServerLevel level) {
		super.customServerAiStep(level);
		this.tickPounce(level);
		if ((this.tickCount + this.getId()) % 20 == 0) {
			this.retargetCloser();
		}
	}

	/** 今の標的より明らかに近い敵がいれば乗り換える。 */
	private void retargetCloser() {
		LivingEntity current = this.getTarget();
		if (current == null || !current.isAlive()) {
			return;
		}
		double currentDist = this.distanceTo(current);
		if (currentDist < 5.0) {
			return;
		}
		double radius = Math.min(currentDist - 2.5, this.getAttributeValue(Attributes.FOLLOW_RANGE));
		List<LivingEntity> near = this.level().getEntitiesOfClass(LivingEntity.class, this.getBoundingBox().inflate(radius, 4.0, radius),
			e -> e != current && FactionMob.isPrey(this, e) && e.canBeSeenAsEnemy());
		LivingEntity best = null;
		double bestDist = radius * radius;
		for (LivingEntity e : near) {
			double d = this.distanceToSqr(e);
			if (d < bestDist && (!this.mustSeeTarget() || this.getSensing().hasLineOfSight(e))) {
				best = e;
				bestDist = d;
			}
		}
		if (best != null) {
			this.setTarget(best);
		}
	}

	// ---- 跳びかかり --------------------------------------------------------

	void startPounce(LivingEntity target) {
		this.pounceTicks = 20;
		this.pounceTarget = target;
		this.playSound(this.pounceSound(), 1.0F, 0.8F + this.random.nextFloat() * 0.4F);
	}

	protected SoundEvent pounceSound() {
		return SoundEvents.SPIDER_AMBIENT;
	}

	/** 跳びかかり中の接触判定。命中すると通常攻撃 + 追加ダメージ。 */
	private void tickPounce(ServerLevel level) {
		if (this.pounceTicks <= 0) {
			return;
		}
		this.pounceTicks--;
		LivingEntity t = this.pounceTarget;
		if (t == null || !t.isAlive()) {
			this.pounceTicks = 0;
			return;
		}
		if (this.getBoundingBox().inflate(0.4).intersects(t.getBoundingBox())) {
			this.pounceTicks = 0;
			this.swingForAttack(net.minecraft.world.InteractionHand.MAIN_HAND);
			// 跳びかかりの一撃 = 通常攻撃力 + ボーナス (1 回のダメージにまとめて無敵時間に潰されないようにする)
			float dmg = (float) this.getAttributeValue(Attributes.ATTACK_DAMAGE) + this.pounceBonusDamage();
			if (t.hurtServer(level, this.damageSources().mobAttack(this), dmg)) {
				this.setLastHurtMob(t);
				this.onMeleeHit(level, t);
			}
		}
	}

	protected float pounceBonusDamage() {
		return 2.0F;
	}

	// ---- 戦闘 ---------------------------------------------------------------

	@Override
	public boolean doHurtTarget(ServerLevel level, Entity target) {
		boolean hit = super.doHurtTarget(level, target);
		if (hit && target instanceof LivingEntity living) {
			this.onMeleeHit(level, living);
		}
		return hit;
	}

	/** 近接攻撃が当たった後の特殊効果 (タイラントの吹き飛ばし、胞子の鈍化など)。 */
	protected void onMeleeHit(ServerLevel level, LivingEntity target) {
	}

	@Override
	public void die(DamageSource source) {
		boolean first = !this.dead && !this.isRemoved();
		super.die(source);
		if (first && this.level() instanceof ServerLevel serverLevel) {
			this.onDeathEffect(serverLevel, source);
		}
	}

	/** 死亡時の特殊効果 (ゼノの酸の血、ブローターの胞子爆発、寄生体の放出など)。 */
	protected void onDeathEffect(ServerLevel level, DamageSource source) {
	}

	// ---- 生存・環境 ----------------------------------------------------------

	@Override
	public boolean removeWhenFarAway(double distSqr) {
		return false; // 洋館の住人は遠くても消えない
	}

	// ---- サウンド (サブクラスで上書き) --------------------------------------

	@Override
	protected @Nullable SoundEvent getAmbientSound() {
		return SoundEvents.ZOMBIE_AMBIENT;
	}

	@Override
	protected SoundEvent getHurtSound(DamageSource source) {
		return SoundEvents.ZOMBIE_HURT;
	}

	@Override
	protected SoundEvent getDeathSound() {
		return SoundEvents.ZOMBIE_DEATH;
	}

	protected SoundEvent getStepSound() {
		return SoundEvents.ZOMBIE_STEP;
	}

	@Override
	protected void playStepSound(BlockPos pos, BlockState state) {
		this.playSound(this.getStepSound(), 0.15F, 1.0F);
	}

	/** クライアントのテクスチャ切り替え用 (G 生物の成長段階など)。 */
	public int getRenderVariant() {
		return 0;
	}

	@Override
	public abstract Faction getFaction();
}
