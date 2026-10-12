package jp.yakata.client;

import jp.yakata.faction.FactionEntities;
import jp.yakata.faction.entity.FactionMonster;
import net.minecraft.client.model.geom.ModelLayers;
import net.minecraft.client.model.monster.silverfish.SilverfishModel;
import net.minecraft.client.renderer.entity.EntityRendererProvider;
import net.minecraft.client.renderer.entity.MobRenderer;
import net.minecraft.resources.Identifier;

/** 小型の寄生体 (G 胚、フェイスハガー、群体虫) 用。バニラのシルバーフィッシュモデル (64x32) を流用。 */
public class FactionSilverfishRenderer extends MobRenderer<FactionMonster, FactionCreatureRenderState, SilverfishModel> {
	private final FactionTextures textures;

	public FactionSilverfishRenderer(EntityRendererProvider.Context context, FactionEntities.Entry entry) {
		super(context, new SilverfishModel(context.bakeLayer(ModelLayers.SILVERFISH)), 0.3F);
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
