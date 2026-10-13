package jp.yakata.client;

import jp.yakata.faction.FactionEntities;
import jp.yakata.faction.entity.FactionMonster;
import net.minecraft.client.renderer.entity.EntityRendererProvider;
import net.minecraft.client.renderer.entity.MobRenderer;
import net.minecraft.resources.Identifier;

/** サイレンヘッド用。専用の細長いモデル層 {@link SirenHeadModel#LAYER} を使う。 */
public class SirenHeadRenderer extends MobRenderer<FactionMonster, FactionCreatureRenderState, SirenHeadModel> {
	private final FactionTextures textures;

	public SirenHeadRenderer(EntityRendererProvider.Context context, FactionEntities.Entry entry) {
		super(context, new SirenHeadModel(context.bakeLayer(SirenHeadModel.LAYER)), 0.9F);
		this.textures = new FactionTextures(entry);
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
