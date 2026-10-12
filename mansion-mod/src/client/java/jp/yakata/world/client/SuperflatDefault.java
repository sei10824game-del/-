package jp.yakata.world.client;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.screen.v1.ScreenEvents;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.gui.screens.worldselection.CreateWorldScreen;
import net.minecraft.client.gui.screens.worldselection.WorldCreationUiState;
import net.minecraft.core.registries.Registries;
import net.minecraft.world.level.levelgen.presets.WorldPresets;

import java.util.Collections;
import java.util.Set;
import java.util.WeakHashMap;

/**
 * 「ワールドを新規作成」画面の既定ワールドタイプをスーパーフラットにする (ミックスイン不要, Fabric Screen API)。
 * 画面インスタンスごとに最初の init でだけ切り替えるので、プレイヤーが「標準」に戻した選択は保たれる。
 * 既存ワールドの再作成 (シード入力済み) は変更しない。
 */
public final class SuperflatDefault implements ClientModInitializer {
	private static final Set<Screen> HANDLED = Collections.newSetFromMap(new WeakHashMap<>());

	@Override
	public void onInitializeClient() {
		ScreenEvents.BEFORE_INIT.register((client, screen, width, height) -> {
			if (screen instanceof CreateWorldScreen create && HANDLED.add(screen)) {
				applyFlat(create.getUiState());
			}
		});
	}

	private static void applyFlat(WorldCreationUiState state) {
		boolean isNormal = state.getWorldType().preset() != null
			&& state.getWorldType().preset().is(WorldPresets.NORMAL);
		if (!isNormal || !state.getSeed().isEmpty()) {
			return;
		}
		state.getSettings().worldgenLoadContext().lookupOrThrow(Registries.WORLD_PRESET).get(WorldPresets.FLAT)
			.ifPresent(flat -> state.setWorldType(new WorldCreationUiState.WorldTypeEntry(flat)));
	}
}
