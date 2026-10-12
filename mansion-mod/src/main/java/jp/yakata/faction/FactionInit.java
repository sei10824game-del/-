package jp.yakata.faction;

import net.fabricmc.fabric.api.command.v2.CommandRegistrationCallback;
import net.fabricmc.fabric.api.entity.event.v1.ServerLivingEntityEvents;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerTickEvents;

/** 陣営モジュールの初期化 (YakataMod#onInitialize から呼ぶ)。 */
public final class FactionInit {
	private FactionInit() {}

	public static void init() {
		FactionEntities.init();
		ServerLifecycleEvents.SERVER_STARTED.register(FactionDirector::onServerStarted);
		ServerTickEvents.END_SERVER_TICK.register(FactionDirector::onServerTick);
		ServerLivingEntityEvents.AFTER_DEATH.register(FactionEvents::afterDeath);
		CommandRegistrationCallback.EVENT.register((dispatcher, context, selection) -> FactionCommands.register(dispatcher));
	}
}
