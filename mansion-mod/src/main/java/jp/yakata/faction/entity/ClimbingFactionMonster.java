package jp.yakata.faction.entity;

import net.minecraft.network.syncher.EntityDataAccessor;
import net.minecraft.network.syncher.EntityDataSerializers;
import net.minecraft.network.syncher.SynchedEntityData;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.ai.navigation.PathNavigation;
import net.minecraft.world.entity.ai.navigation.WallClimberNavigation;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.Vec3;
import org.jspecify.annotations.Nullable;

/** 壁を這う四足/多脚の感染体 (リッカー、ゼノモーフ、G 成体、寄生クローラー)。クモと同じ壁登り。 */
public abstract class ClimbingFactionMonster extends FactionMonster {
	private static final EntityDataAccessor<Boolean> DATA_CLIMBING =
		SynchedEntityData.defineId(ClimbingFactionMonster.class, EntityDataSerializers.BOOLEAN);

	protected ClimbingFactionMonster(EntityType<? extends ClimbingFactionMonster> type, Level level) {
		super(type, level);
	}

	@Override
	protected PathNavigation createNavigation(Level level) {
		return new WallClimberNavigation(this, level);
	}

	@Override
	protected void defineSynchedData(SynchedEntityData.Builder builder) {
		super.defineSynchedData(builder);
		builder.define(DATA_CLIMBING, false);
	}

	@Override
	public void tick() {
		super.tick();
		if (!this.level().isClientSide()) {
			this.entityData.set(DATA_CLIMBING, this.horizontalCollision);
		}
	}

	@Override
	public boolean onClimbable() {
		return this.entityData.get(DATA_CLIMBING);
	}

	@Override
	public void makeStuckInBlock(BlockState state, Vec3 speedMultiplier) {
		if (!state.is(Blocks.COBWEB)) {
			super.makeStuckInBlock(state, speedMultiplier);
		}
	}

	@Override
	protected @Nullable SoundEvent getAmbientSound() {
		return SoundEvents.SPIDER_AMBIENT;
	}

	@Override
	protected SoundEvent getHurtSound(DamageSource source) {
		return SoundEvents.SPIDER_HURT;
	}

	@Override
	protected SoundEvent getDeathSound() {
		return SoundEvents.SPIDER_DEATH;
	}

	@Override
	protected SoundEvent getStepSound() {
		return SoundEvents.SPIDER_STEP;
	}
}
