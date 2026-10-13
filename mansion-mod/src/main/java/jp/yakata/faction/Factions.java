package jp.yakata.faction;

import jp.yakata.faction.entity.ChainsawMobs;
import jp.yakata.faction.entity.CordycepsMobs;
import jp.yakata.faction.entity.FloodMobs;
import jp.yakata.faction.entity.GVirusMobs;
import jp.yakata.faction.entity.MakimaMobs;
import jp.yakata.faction.entity.NecroMobs;
import jp.yakata.faction.entity.ParasiteMobs;
import jp.yakata.faction.entity.PlagaMobs;
import jp.yakata.faction.entity.SirenMobs;
import jp.yakata.faction.entity.TVirusMobs;
import jp.yakata.faction.entity.VeronicaMobs;
import jp.yakata.faction.entity.XenoMobs;

import java.util.List;

/**
 * 陣営の一覧 (登録順 = 表示順)。新しい陣営は Mob ファイルに {@code FACTION} と EntityType を定義し、ここに 1 行足す。
 * 参照するだけで各クラスの静的初期化 (陣営と EntityType の登録) が走る。
 */
public final class Factions {
	private static List<Faction> loaded;

	private Factions() {}

	public static List<Faction> bootstrap() {
		if (loaded == null) {
			loaded = List.of(
				TVirusMobs.FACTION,
				GVirusMobs.FACTION,
				CordycepsMobs.FACTION,
				XenoMobs.FACTION,
				ParasiteMobs.FACTION,
				FloodMobs.FACTION,
				NecroMobs.FACTION,
				PlagaMobs.FACTION,
				VeronicaMobs.FACTION,
				SirenMobs.FACTION,
				MakimaMobs.FACTION,
				ChainsawMobs.FACTION);
			// 各クラスの EntityType 定数は FACTION の後に初期化される (クラス初期化は一括) ので、ここで全登録が完了している
		}
		return loaded;
	}
}
