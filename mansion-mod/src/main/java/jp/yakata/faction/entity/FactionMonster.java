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
import net.minecraft.world.entity.Mob;
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
import net.minecraft.world.level.storage.ValueInput;
import net.minecraft.world.level.storage.ValueOutput;
import net.minecraft.core.BlockPos;
import org.jspecify.annotations.Nullable;

import java.util.List;
import java.util.UUID;

/**
 * 全陣営 Mob の基底クラス。
 * <ul>
 *   <li>別陣営・プレイヤー・村人・ゴーレムを最寄り順に狙う (同陣営は絶対に狙わない)</li>
 *   <li>より近い敵が現れたら標的を切り替える (乱戦が読みやすくなる)</li>
 *   <li>日光で燃えず、遠くても消滅しない</li>
 * </ul>
 */
public abstract class FactionMonster extends Monster implements FactionMob {
	/** 遅延蘇生で立ち上がった直後の調整 (大きさ・体力の引き継ぎなど) */
	@FunctionalInterface
	public interface RiseSetup {
		void apply(FactionMonster mob);
	}

	/** 跳びかかり中の残り tick (この間に標的へ接触すると一撃) */
	private int pounceTicks;
	private @Nullable LivingEntity pounceTarget;
	/** 陣営の上書き (マキマの支配など)。null なら本来の陣営 */
	private @Nullable Faction factionOverride;
	/** 従う相手 (マキマの支配下はマキマを守り、マキマの標的を狙う) */
	private @Nullable UUID leaderId;
	/** 誘引地点 (サイレンの轟音など)。獲物がいない間はここへ向かう */
	private @Nullable BlockPos lurePos;
	private long lureUntil;

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
			this.followLeader(level);
		}
	}

	// ---- 陣営の上書き・従属・誘引 ---------------------------------------------

	/** この Mob 種の本来の陣営 */
	protected abstract Faction baseFaction();

	/** 現在の陣営 (支配されていれば支配者の陣営) */
	@Override
	public final Faction getFaction() {
		return this.factionOverride != null ? this.factionOverride : this.baseFaction();
	}

	public Faction nativeFaction() {
		return this.baseFaction();
	}

	public boolean isControlled() {
		return this.factionOverride != null && this.factionOverride != this.baseFaction();
	}

	/** 陣営を書き換える (マキマの支配)。今の標的は忘れる。 */
	public void setFactionOverride(@Nullable Faction faction, @Nullable LivingEntity leader) {
		this.factionOverride = faction;
		this.leaderId = leader == null ? null : leader.getUUID();
		this.setTarget(null);
		this.setLastHurtByMob(null);
		this.getNavigation().stop();
	}

	public @Nullable UUID leaderId() {
		return this.leaderId;
	}

	/** 獲物がいなければ主に付き従い、主の標的を狙う。 */
	private void followLeader(ServerLevel level) {
		if (this.leaderId == null) {
			return;
		}
		if (!(level.getEntity(this.leaderId) instanceof LivingEntity leader) || !leader.isAlive()) {
			return;
		}
		LivingEntity current = this.getTarget();
		if ((current == null || !current.isAlive()) && leader instanceof Mob m && m.getTarget() != null
			&& m.getTarget().isAlive() && FactionMob.isPrey(this, m.getTarget())) {
			this.setTarget(m.getTarget());
		} else if (current == null && this.distanceToSqr(leader) > 10 * 10) {
			this.getNavigation().moveTo(leader, 1.0);
		}
	}

	/** pos へ ticks の間おびき寄せる (標的がいない間だけ HuntGoal が向かう)。 */
	public void lure(BlockPos pos, int ticks) {
		this.lurePos = pos.immutable();
		this.lureUntil = this.level().getGameTime() + ticks;
	}

	public @Nullable BlockPos activeLure() {
		if (this.lurePos != null && this.level().getGameTime() > this.lureUntil) {
			this.lurePos = null;
		}
		return this.lurePos;
	}

	/**
	 * 致命傷を受けたときに呼ばれる (死亡確定前)。true を返すと死なない (体力は実装側で戻す)。
	 * 形態変化 (デンジ→黒いチェンソーマン、アレクシア第2形態)、ネクロモーフの四肢切断などに使う。
	 */
	public boolean tryCheatDeath(ServerLevel level, DamageSource source) {
		return false;
	}

	@Override
	protected void addAdditionalSaveData(ValueOutput output) {
		super.addAdditionalSaveData(output);
		if (this.factionOverride != null) {
			output.putString("YakataFaction", this.factionOverride.id());
		}
		if (this.leaderId != null) {
			output.putString("YakataLeader", this.leaderId.toString());
		}
	}

	@Override
	protected void readAdditionalSaveData(ValueInput input) {
		super.readAdditionalSaveData(input);
		this.factionOverride = input.getString("YakataFaction").map(Faction::byId).orElse(null);
		this.leaderId = input.getString("YakataLeader").map(s -> {
			try {
				return UUID.fromString(s);
			} catch (IllegalArgumentException e) {
				return null;
			}
		}).orElse(null);
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

}
