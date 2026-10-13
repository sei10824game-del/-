package jp.yakata.faction.entity;

import jp.yakata.faction.FactionDirector;
import net.minecraft.core.BlockPos;
import net.minecraft.world.entity.ai.goal.Goal;

import java.util.EnumSet;

/**
 * 獲物がいない間、ときどき敵陣営の本拠地 (またはロビー) へ向かって徘徊する。
 * 部屋に閉じこもらず、陣営同士が洋館の中で出会って戦うようにするための行動。
 */
public class HuntGoal extends Goal {
	private final FactionMonster mob;
	private final double speed;
	private BlockPos destination;
	private int timeout;

	public HuntGoal(FactionMonster mob, double speed) {
		this.mob = mob;
		this.speed = speed;
		this.setFlags(EnumSet.of(Goal.Flag.MOVE));
	}

	@Override
	public boolean canUse() {
		if (this.mob.getTarget() != null) {
			return false;
		}
		BlockPos lure = this.mob.activeLure();
		if (lure != null && lure.distSqr(this.mob.blockPosition()) > 4 * 4) {
			// サイレンの轟音などに誘われて向かう
			this.destination = lure.offset(this.mob.getRandom().nextInt(7) - 3, 0, this.mob.getRandom().nextInt(7) - 3);
			return true;
		}
		if (this.mob.getRandom().nextInt(reducedTickDelay(160)) != 0) {
			return false;
		}
		BlockPos p = FactionDirector.huntPoint(this.mob.getFaction(), this.mob.getRandom());
		if (p == null || p.distSqr(this.mob.blockPosition()) < 6 * 6 || p.distSqr(this.mob.blockPosition()) > 96 * 96) {
			return false;
		}
		this.destination = p.offset(this.mob.getRandom().nextInt(5) - 2, 0, this.mob.getRandom().nextInt(5) - 2);
		return true;
	}

	@Override
	public void start() {
		this.timeout = 600;
		this.mob.getNavigation().moveTo(this.destination.getX() + 0.5, this.destination.getY(), this.destination.getZ() + 0.5, this.speed);
	}

	@Override
	public boolean canContinueToUse() {
		return this.mob.getTarget() == null && --this.timeout > 0 && !this.mob.getNavigation().isDone();
	}

	@Override
	public void stop() {
		this.mob.getNavigation().stop();
	}
}
