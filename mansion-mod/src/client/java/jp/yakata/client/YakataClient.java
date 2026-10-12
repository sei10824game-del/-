package jp.yakata.client;

import jp.yakata.YakataMod;
import jp.yakata.faction.FactionEntities;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.rendering.v1.EntityRendererRegistry;

/** クライアント初期化: 陣営 Mob のレンダラーを登録する (モデル層はバニラのものを流用するので追加登録不要)。 */
public class YakataClient implements ClientModInitializer {
	@Override
	public void onInitializeClient() {
		for (FactionEntities.Entry entry : FactionEntities.ALL) {
			switch (entry.model()) {
				case ZOMBIE -> EntityRendererRegistry.register(entry.type(), ctx -> new FactionZombieRenderer(ctx, entry));
				case SPIDER -> EntityRendererRegistry.register(entry.type(), ctx -> new FactionSpiderRenderer(ctx, entry));
				case SILVERFISH -> EntityRendererRegistry.register(entry.type(), ctx -> new FactionSilverfishRenderer(ctx, entry));
			}
		}
		YakataMod.LOGGER.info("[yakata] {} 種の陣営 Mob レンダラーを登録しました", FactionEntities.ALL.size());
	}
}
