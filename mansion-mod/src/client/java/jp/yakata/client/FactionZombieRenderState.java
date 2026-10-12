package jp.yakata.client;

import net.minecraft.client.renderer.entity.state.ZombieRenderState;

/** 人型 (ゾンビモデル) の陣営 Mob の描画状態。variant でテクスチャを切り替える。 */
public class FactionZombieRenderState extends ZombieRenderState {
	public int variant;
}
