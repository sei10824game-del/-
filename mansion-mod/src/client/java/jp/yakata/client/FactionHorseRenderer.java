package jp.yakata.client;

import jp.yakata.faction.FactionEntities;
import jp.yakata.faction.entity.FactionMonster;
import net.minecraft.client.model.animal.equine.HorseModel;
import net.minecraft.client.model.geom.ModelLayers;
import net.minecraft.client.renderer.entity.EntityRendererProvider;
import net.minecraft.client.renderer.entity.MobRenderer;
import net.minecraft.client.renderer.entity.state.EquineRenderState;
import net.minecraft.resources.Identifier;

/** 馬型 (ロングホース) 用。バニラの骨の馬のモデル層 (64x64) を流用し、SCALE 属性で大きくする。 */
public class FactionHorseRenderer extends MobRenderer<FactionMonster, EquineRenderState, HorseModel> {
	private final FactionTextures textures;

	public FactionHorseRenderer(EntityRendererProvider.Context context, FactionEntities.Entry entry) {
		super(context, new HorseModel(context.bakeLayer(ModelLayers.SKELETON_HORSE)), 0.9F);
		this.textures = new FactionTextures(entry);
	}

	@Override
	public EquineRenderState createRenderState() {
		return new EquineRenderState();
	}

	@Override
	public void extractRenderState(FactionMonster entity, EquineRenderState state, float partialTicks) {
		super.extractRenderState(entity, state, partialTicks);
		state.animateTail = entity.isAggressive();
	}

	@Override
	public Identifier getTextureLocation(EquineRenderState state) {
		return this.textures.get(0);
	}
}
