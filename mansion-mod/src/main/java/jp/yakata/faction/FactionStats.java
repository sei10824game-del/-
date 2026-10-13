package jp.yakata.faction;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

/** 陣営間の戦果カウンタ (サーバー起動ごとにリセット)。メインスレッド専用。陣営数はレジストリから決まる。 */
public final class FactionStats {
	private static int n;
	/** [殺した陣営][殺された陣営] */
	private static long[][] kills = new long[0][0];
	private static long[] deaths = new long[0];
	private static long[] survivorsKilled = new long[0];
	private static long[] playersKilled = new long[0];
	private static long[] conversions = new long[0];
	/** 特殊イベントのカウンタ (siren, makima_control, flood_takeover, ...)。検証・ログ用 */
	private static final Map<String, Long> EVENTS = new HashMap<>();

	private FactionStats() {}

	private static void ensure() {
		int count = Faction.count();
		if (count != n) {
			n = count;
			kills = new long[n][n];
			deaths = new long[n];
			survivorsKilled = new long[n];
			playersKilled = new long[n];
			conversions = new long[n];
		}
	}

	public static void reset() {
		ensure();
		for (long[] row : kills) {
			Arrays.fill(row, 0);
		}
		Arrays.fill(deaths, 0);
		Arrays.fill(survivorsKilled, 0);
		Arrays.fill(playersKilled, 0);
		Arrays.fill(conversions, 0);
		EVENTS.clear();
	}

	public static void recordFactionKill(Faction killer, Faction victim) {
		ensure();
		kills[killer.ordinal()][victim.ordinal()]++;
	}

	public static void recordDeath(Faction victim) {
		ensure();
		deaths[victim.ordinal()]++;
	}

	public static void recordSurvivorKill(Faction killer) {
		ensure();
		survivorsKilled[killer.ordinal()]++;
	}

	public static void recordPlayerKill(Faction killer) {
		ensure();
		playersKilled[killer.ordinal()]++;
	}

	public static void recordConversion(Faction faction) {
		ensure();
		conversions[faction.ordinal()]++;
	}

	/** 名前付きイベントを 1 回数える (返り値: 累計) */
	public static long event(String name) {
		return EVENTS.merge(name, 1L, Long::sum);
	}

	/** 名前付きイベントに amount を足す (返り値: 累計) */
	public static long event(String name, long amount) {
		return EVENTS.merge(name, amount, Long::sum);
	}

	public static long eventCount(String name) {
		return EVENTS.getOrDefault(name, 0L);
	}

	public static Map<String, Long> events() {
		return new TreeMap<>(EVENTS);
	}

	/** 陣営 f が他陣営を倒した数 */
	public static long killsBy(Faction f) {
		ensure();
		long sum = 0;
		for (int v = 0; v < n; v++) {
			sum += kills[f.ordinal()][v];
		}
		return sum;
	}

	/** 陣営 f が他陣営に倒された数 */
	public static long killedByOthers(Faction f) {
		ensure();
		long sum = 0;
		for (int k = 0; k < n; k++) {
			sum += kills[k][f.ordinal()];
		}
		return sum;
	}

	public static long kills(Faction killer, Faction victim) {
		ensure();
		return kills[killer.ordinal()][victim.ordinal()];
	}

	public static long totalFactionKills() {
		long sum = 0;
		for (Faction f : Faction.values()) {
			sum += killsBy(f);
		}
		return sum;
	}

	public static long deaths(Faction f) {
		ensure();
		return deaths[f.ordinal()];
	}

	public static long survivorsKilled(Faction f) {
		ensure();
		return survivorsKilled[f.ordinal()];
	}

	public static long playersKilled(Faction f) {
		ensure();
		return playersKilled[f.ordinal()];
	}

	public static long conversions(Faction f) {
		ensure();
		return conversions[f.ordinal()];
	}

	public static long totalConversions() {
		ensure();
		long sum = 0;
		for (long c : conversions) {
			sum += c;
		}
		return sum;
	}
}
