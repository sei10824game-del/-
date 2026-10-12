package jp.yakata.client;

import jp.yakata.faction.FactionEntities;
import jp.yakata.faction.entity.FactionMonster;
import net.minecraft.client.model.geom.ModelLayers;
import net.minecraft.client.model.monster.zombie.ZombieModel;
import net.minecraft.client.renderer.entity.EntityRendererProvider;
import net.minecraft.client.renderer.entity.HumanoidMobRenderer;
import net.minecraft.resources.Identifier;

/**
 * 人型の感染体 (t-ゾンビ、タイラント、バーキン、冬虫夏草、同化人間) 用。
 * バニラのゾンビモデル (64x64 レイアウト) に陣営テクスチャを貼る。大きさは SCALE 属性 (state.scale) で反映される。
 */
public class FactionZombieRenderer extends HumanoidMobRenderer<FactionMonster, FactionZombieRenderState, ZombieModel<FactionZombieRenderState>> {
	private final FactionTextures textures;

	public FactionZombieRenderer(EntityRendererProvider.Context context, FactionEntities.Entry entry) {
		super(context, new ZombieModel<>(context.bakeLayer(ModelLayers.ZOMBIE)), 0.5F);
		this.textures = new FactionTextures(entry);
	}

	@Override
	public FactionZombieRenderState createRenderState() {
		return new FactionZombieRenderState();
	}

	@Override
	public void extractRenderState(FactionMonster entity, FactionZombieRenderState state, float partialTicks) {
		super.extractRenderState(entity, state, partialTicks);
		state.isAggressive = entity.isAggressive(); // 腕を前に突き出すゾンビの構え
		state.variant = entity.getRenderVariant();
	}

	@Override
	public Identifier getTextureLocation(FactionZombieRenderState state) {
		return this.textures.get(state.variant);
	}
}
