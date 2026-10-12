package jp.yakata.faction;

import net.minecraft.network.chat.Component;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.ServerScoreboard;
import net.minecraft.world.scores.DisplaySlot;
import net.minecraft.world.scores.Objective;
import net.minecraft.world.scores.ScoreAccess;
import net.minecraft.world.scores.ScoreHolder;
import net.minecraft.world.scores.criteria.ObjectiveCriteria;

/** スコアボードのサイドバーに陣営ごとの生存数を表示する (/yakata sidebar で切替)。 */
public final class FactionSidebar {
	public static final String OBJECTIVE = "yakata_factions";
	private static final String SURVIVORS = "生存者";
	private static final String KILLS = "陣営間キル";

	private FactionSidebar() {}

	private static Objective objective(ServerScoreboard board) {
		Objective obj = board.getObjective(OBJECTIVE);
		if (obj == null) {
			obj = board.addObjective(OBJECTIVE, ObjectiveCriteria.DUMMY,
				Component.literal("洋館の黙示録"), ObjectiveCriteria.RenderType.INTEGER, true, null);
			board.setDisplayObjective(DisplaySlot.SIDEBAR, obj);
		}
		return obj;
	}

	public static void update(MinecraftServer server, FactionDirector.Census census) {
		ServerScoreboard board = server.getScoreboard();
		Objective obj = objective(board);
		for (Faction f : Faction.values()) {
			ScoreAccess s = board.getOrCreatePlayerScore(ScoreHolder.forNameOnly(f.jaName), obj);
			if (s.get() != census.of(f)) {
				s.set(census.of(f));
			}
			if (s.display() == null) {
				s.display(f.displayName());
			}
		}
		set(board, obj, SURVIVORS, census.survivors);
		set(board, obj, KILLS, (int) Math.min(Integer.MAX_VALUE, FactionStats.totalFactionKills()));
	}

	private static void set(ServerScoreboard board, Objective obj, String name, int value) {
		ScoreAccess s = board.getOrCreatePlayerScore(ScoreHolder.forNameOnly(name), obj);
		if (s.get() != value) {
			s.set(value);
		}
	}

	/** サイドバー表示の切替。表示中なら隠し、隠れていれば表示する。戻り値は切替後に表示されているか。 */
	public static boolean toggle(MinecraftServer server) {
		ServerScoreboard board = server.getScoreboard();
		Objective obj = objective(board);
		if (board.getDisplayObjective(DisplaySlot.SIDEBAR) == obj) {
			board.setDisplayObjective(DisplaySlot.SIDEBAR, null);
			return false;
		}
		board.setDisplayObjective(DisplaySlot.SIDEBAR, obj);
		return true;
	}
}
