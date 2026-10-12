package jp.yakata;

import net.fabricmc.api.ModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class YakataMod implements ModInitializer {
	public static final String MOD_ID = "yakata";
	public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

	@Override
	public void onInitialize() {
		LOGGER.info("洋館の黙示録 loaded");
		// 各モジュールの初期化 (実装後に有効化): jp.yakata.world.WorldInit.init(); jp.yakata.faction.FactionInit.init();
	}
}
