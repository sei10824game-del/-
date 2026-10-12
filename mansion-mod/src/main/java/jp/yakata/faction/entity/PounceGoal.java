package jp.yakata.faction.entity;

import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.ai.goal.Goal;
import net.minecraft.world.phys.Vec3;

import java.util.EnumSet;

/**
 * 跳びかかり (リッカーの跳躍、クリムゾンヘッドの飛びつき、フェイスハガーの跳躍など)。
 * 一定距離にいる標的へ向かって大きく跳び、空中で接触したら追加の一撃を加える (FactionMonster#tickPounce)。
 */
public class PounceGoal extends Goal {
	private final FactionMonster mob;
	private final double minDist;
	private final double maxDist;
	private final double horizontal;
	private final double vertical;
	private final int cooldownTicks;
	private int cooldown;
	private LivingEntity target;

	public PounceGoal(FactionMonster mob, double minDist, double maxDist, double horizontal, double vertical, int cooldownTicks) {
		this.mob = mob;
		this.minDist = minDist;
		this.maxDist = maxDist;
		this.horizontal = horizontal;
		this.vertical = vertical;
		this.cooldownTicks = cooldownTicks;
		this.setFlags(EnumSet.of(Goal.Flag.JUMP, Goal.Flag.MOVE));
	}

	@Override
	public boolean canUse() {
		if (this.cooldown > 0) {
			this.cooldown--;
			return false;
		}
		this.target = this.mob.getTarget();
		if (this.target == null || !this.target.isAlive() || !this.mob.onGround() || this.mob.isInWater()) {
			return false;
		}
		double d = this.mob.distanceTo(this.target);
		return d >= this.minDist && d <= this.maxDist
			&& this.mob.getSensing().hasLineOfSight(this.target)
			&& this.mob.getRandom().nextInt(4) == 0;
	}

	@Override
	public boolean canContinueToUse() {
		return !this.mob.onGround();
	}

	@Override
	public void start() {
		Vec3 delta = new Vec3(this.target.getX() - this.mob.getX(), 0.0, this.target.getZ() - this.mob.getZ());
		double dist = delta.length();
		if (dist > 1.0E-4) {
			// 距離に応じて水平速度を少し伸ばす (遠い標的ほど強く跳ぶ)
			double h = this.horizontal * Math.min(1.6, 0.6 + dist / this.maxDist);
			delta = delta.normalize().scale(h);
		}
		this.mob.setDeltaMovement(delta.x, this.vertical, delta.z);
		this.mob.getLookControl().setLookAt(this.target, 30.0F, 30.0F);
		this.mob.startPounce(this.target);
		this.cooldown = this.cooldownTicks;
	}
}
