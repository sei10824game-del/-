package jp.yakata.client;

import jp.yakata.YakataMod;
import jp.yakata.faction.FactionEntities;
import net.minecraft.resources.Identifier;

/** 陣営 Mob のテクスチャ: assets/yakata/textures/entity/&lt;name&gt;.png (段階付きは &lt;name&gt;_&lt;n&gt;.png)。 */
final class FactionTextures {
	private final Identifier[] textures;

	FactionTextures(FactionEntities.Entry entry) {
		int n = Math.max(1, entry.variants());
		this.textures = new Identifier[n];
		for (int i = 0; i < n; i++) {
			String file = n == 1 ? entry.name() : entry.name() + "_" + (i + 1);
			this.textures[i] = Identifier.fromNamespaceAndPath(YakataMod.MOD_ID, "textures/entity/" + file + ".png");
		}
	}

	Identifier get(int variant) {
		return this.textures[Math.max(0, Math.min(this.textures.length - 1, variant))];
	}
}
