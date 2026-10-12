package jp.yakata.faction;

import net.minecraft.ChatFormatting;
import net.minecraft.network.chat.Component;

import java.util.Locale;

/** 洋館に巣食う感染者の陣営。同じ陣営同士は決して争わない。 */
public enum Faction {
	TVIRUS("t-ウイルス", "T-Virus", ChatFormatting.RED),
	GVIRUS("G-ウイルス", "G-Virus", ChatFormatting.LIGHT_PURPLE),
	CORDYCEPS("冬虫夏草", "Cordyceps", ChatFormatting.GREEN),
	XENO("ゼノモーフ", "Xenomorph", ChatFormatting.DARK_GRAY),
	PARASITE("寄生体", "Parasite", ChatFormatting.GOLD);

	public final String jaName;
	public final String enName;
	public final ChatFormatting color;

	Faction(String jaName, String enName, ChatFormatting color) {
		this.jaName = jaName;
		this.enName = enName;
		this.color = color;
	}

	/** コマンドで使う小文字 id (tvirus, gvirus, ...) */
	public String id() {
		return this.name().toLowerCase(Locale.ROOT);
	}

	public Component displayName() {
		return Component.translatableWithFallback("faction.yakata." + this.id(), this.jaName).withStyle(this.color);
	}

	public static Faction byId(String id) {
		for (Faction f : values()) {
			if (f.id().equalsIgnoreCase(id)) {
				return f;
			}
		}
		return null;
	}
}
