package jp.yakata.client;

import jp.yakata.YakataMod;
import net.minecraft.client.model.EntityModel;
import net.minecraft.client.model.geom.ModelLayerLocation;
import net.minecraft.client.model.geom.ModelPart;
import net.minecraft.client.model.geom.PartPose;
import net.minecraft.client.model.geom.builders.CubeListBuilder;
import net.minecraft.client.model.geom.builders.LayerDefinition;
import net.minecraft.client.model.geom.builders.MeshDefinition;
import net.minecraft.client.model.geom.builders.PartDefinition;
import net.minecraft.resources.Identifier;
import net.minecraft.util.Mth;

/**
 * サイレンヘッドの専用モデル (高さ約 125px = 7.8 ブロック)。
 * 骨と皮だけの細長い胴、地面近くまで垂れる長い腕、細い首の先に横木と 2 基のサイレン。
 * <p>座標はバニラと同じく y 下向き、y=24 が地面。テクスチャは 128x128 (tools/gen_faction_textures.py の siren_head)。
 * <ul>
 *   <li>脚 2x60x2 … UV (0,0)  8x62</li>
 *   <li>腕 2x68x2 … UV (8,0)  8x70</li>
 *   <li>胴 6x44x3 … UV (16,0) 18x47</li>
 *   <li>首 1x14x1 … UV (34,0) 4x15</li>
 *   <li>横木 16x2x2 … UV (40,0) 36x4</li>
 *   <li>サイレン 5x5x8 (2 基) … UV (40,8) 26x13 (正面 = -Z がラッパの口)</li>
 * </ul>
 */
public class SirenHeadModel extends EntityModel<FactionCreatureRenderState> {
	public static final ModelLayerLocation LAYER = new ModelLayerLocation(Identifier.fromNamespaceAndPath(YakataMod.MOD_ID, "siren_head"), "main");
	private static final float HIP = -36.0F;
	private static final float SHOULDER = -78.0F;
	private static final float NECK = -80.0F;
	private final ModelPart head;
	private final ModelPart body;
	private final ModelPart rightArm;
	private final ModelPart leftArm;
	private final ModelPart rightLeg;
	private final ModelPart leftLeg;

	public SirenHeadModel(ModelPart root) {
		super(root);
		this.head = root.getChild("head");
		this.body = root.getChild("body");
		this.rightArm = root.getChild("right_arm");
		this.leftArm = root.getChild("left_arm");
		this.rightLeg = root.getChild("right_leg");
		this.leftLeg = root.getChild("left_leg");
	}

	public static LayerDefinition createBodyLayer() {
		MeshDefinition mesh = new MeshDefinition();
		PartDefinition root = mesh.getRoot();
		root.addOrReplaceChild("right_leg", CubeListBuilder.create().texOffs(0, 0).addBox(-1.0F, 0.0F, -1.0F, 2.0F, 60.0F, 2.0F),
			PartPose.offset(-2.0F, HIP, 0.0F));
		root.addOrReplaceChild("left_leg", CubeListBuilder.create().texOffs(0, 0).mirror().addBox(-1.0F, 0.0F, -1.0F, 2.0F, 60.0F, 2.0F),
			PartPose.offset(2.0F, HIP, 0.0F));
		root.addOrReplaceChild("body", CubeListBuilder.create().texOffs(16, 0).addBox(-3.0F, 0.0F, -1.5F, 6.0F, 44.0F, 3.0F),
			PartPose.offset(0.0F, NECK, 0.0F));
		root.addOrReplaceChild("right_arm", CubeListBuilder.create().texOffs(8, 0).addBox(-1.0F, 0.0F, -1.0F, 2.0F, 68.0F, 2.0F),
			PartPose.offset(-4.5F, SHOULDER, 0.0F));
		root.addOrReplaceChild("left_arm", CubeListBuilder.create().texOffs(8, 0).mirror().addBox(-1.0F, 0.0F, -1.0F, 2.0F, 68.0F, 2.0F),
			PartPose.offset(4.5F, SHOULDER, 0.0F));
		root.addOrReplaceChild("head", CubeListBuilder.create()
				.texOffs(34, 0).addBox(-0.5F, -14.0F, -0.5F, 1.0F, 14.0F, 1.0F)          // 首 (電柱)
				.texOffs(40, 0).addBox(-8.0F, -16.0F, -1.0F, 16.0F, 2.0F, 2.0F)          // 横木
				.texOffs(40, 8).addBox(-9.5F, -21.0F, -6.0F, 5.0F, 5.0F, 8.0F)           // 左のサイレン
				.texOffs(40, 8).mirror().addBox(4.5F, -21.0F, -6.0F, 5.0F, 5.0F, 8.0F),  // 右のサイレン
			PartPose.offset(0.0F, NECK, 0.0F));
		return LayerDefinition.create(mesh, 128, 128);
	}

	@Override
	public void setupAnim(FactionCreatureRenderState state) {
		super.setupAnim(state);
		float pos = state.walkAnimationPos;
		float speed = Math.min(1.0F, state.walkAnimationSpeed);
		// 長い脚はゆっくり大きく、腕はだらりと揺れる
		this.rightLeg.xRot = Mth.cos(pos * 0.35F) * 0.55F * speed;
		this.leftLeg.xRot = Mth.cos(pos * 0.35F + (float) Math.PI) * 0.55F * speed;
		this.rightArm.xRot = Mth.cos(pos * 0.35F + (float) Math.PI) * 0.35F * speed;
		this.leftArm.xRot = Mth.cos(pos * 0.35F) * 0.35F * speed;
		this.rightArm.zRot = 0.05F + Mth.sin(state.ageInTicks * 0.05F) * 0.03F;
		this.leftArm.zRot = -0.05F - Mth.sin(state.ageInTicks * 0.05F) * 0.03F;
		this.body.xRot = 0.06F; // 少し前屈み
		this.head.yRot = state.yRot * Mth.DEG_TO_RAD;
		this.head.xRot = state.xRot * Mth.DEG_TO_RAD * 0.5F;
	}
}
