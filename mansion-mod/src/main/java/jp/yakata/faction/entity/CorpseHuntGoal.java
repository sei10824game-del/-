package jp.yakata.faction.entity;

import jp.yakata.faction.Corpses;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.entity.ai.goal.Goal;

import java.util.EnumSet;
import java.util.function.BiConsumer;

/**
 * 近くの死体 ({@link Corpses}) を探して這い寄り、たどり着いたら onReach で乗っ取る
 * (フラッドの感染体、ネクロモーフのインフェクター)。戦闘中でも近い死体を優先する。
 */
public class CorpseHuntGoal extends Goal {
	private final FactionMonster mob;
	private final double radius;
	private final double speed;
	private final BiConsumer<ServerLevel, Corpses.Corpse> onReach;
	private Corpses.Corpse corpse;
	private int timeout;

	public CorpseHuntGoal(FactionMonster mob, double radius, double speed, BiConsumer<ServerLevel, Corpses.Corpse> onReach) {
		this.mob = mob;
		this.radius = radius;
		this.speed = speed;
		this.onReach = onReach;
		this.setFlags(EnumSet.of(Goal.Flag.MOVE, Goal.Flag.LOOK));
	}

	@Override
	public boolean canUse() {
		if ((this.mob.tickCount + this.mob.getId()) % 10 != 0) {
			return false;
		}
		this.corpse = Corpses.nearest(this.mob.position(), this.radius, this.mob.getFaction());
		return this.corpse != null;
	}

	@Override
	public void start() {
		this.timeout = 300;
		this.mob.getNavigation().moveTo(this.corpse.pos().x, this.corpse.pos().y, this.corpse.pos().z, this.speed);
	}

	@Override
	public boolean canContinueToUse() {
		return this.corpse != null && --this.timeout > 0 && this.mob.isAlive();
	}

	@Override
	public void tick() {
		if (this.corpse == null) {
			return;
		}
		if (this.mob.position().distanceToSqr(this.corpse.pos()) < 1.6 * 1.6) {
			Corpses.Corpse c = this.corpse;
			this.corpse = null;
			if (Corpses.consume(c) && this.mob.level() instanceof ServerLevel level) {
				this.onReach.accept(level, c);
			}
		} else if (this.mob.getNavigation().isDone()) {
			this.mob.getNavigation().moveTo(this.corpse.pos().x, this.corpse.pos().y, this.corpse.pos().z, this.speed);
		}
	}

	@Override
	public void stop() {
		this.corpse = null;
		this.mob.getNavigation().stop();
	}
}
