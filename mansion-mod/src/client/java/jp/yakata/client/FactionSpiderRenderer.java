package jp.yakata.client;

import jp.yakata.faction.FactionEntities;
import jp.yakata.faction.entity.FactionMonster;
import net.minecraft.client.model.geom.ModelLayers;
import net.minecraft.client.model.monster.spider.SpiderModel;
import net.minecraft.client.renderer.entity.EntityRendererProvider;
import net.minecraft.client.renderer.entity.MobRenderer;
import net.minecraft.resources.Identifier;

/** 多脚の感染体 (リッカー、G 成体、ゼノモーフ、寄生クローラー) 用。バニラのクモモデル (64x32) を流用。 */
public class FactionSpiderRenderer extends MobRenderer<FactionMonster, FactionCreatureRenderState, SpiderModel> {
	private final FactionTextures textures;

	public FactionSpiderRenderer(EntityRendererProvider.Context context, FactionEntities.Entry entry) {
		super(context, new SpiderModel(context.bakeLayer(ModelLayers.SPIDER)), 0.8F);
		this.textures = new FactionTextures(entry);
	}

	@Override
	protected float getFlipDegrees() {
		return 180.0F;
	}

	@Override
	public FactionCreatureRenderState createRenderState() {
		return new FactionCreatureRenderState();
	}

	@Override
	public void extractRenderState(FactionMonster entity, FactionCreatureRenderState state, float partialTicks) {
		super.extractRenderState(entity, state, partialTicks);
		state.variant = entity.getRenderVariant();
	}

	@Override
	public Identifier getTextureLocation(FactionCreatureRenderState state) {
		return this.textures.get(state.variant);
	}
}
