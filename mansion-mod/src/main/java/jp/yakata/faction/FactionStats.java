package jp.yakata.faction;

/** 陣営間の戦果カウンタ (サーバー起動ごとにリセット)。メインスレッド専用。 */
public final class FactionStats {
	private static final int N = Faction.values().length;
	/** [殺した陣営][殺された陣営] */
	private static final long[][] KILLS = new long[N][N];
	private static final long[] DEATHS = new long[N];
	private static final long[] SURVIVORS_KILLED = new long[N];
	private static final long[] PLAYERS_KILLED = new long[N];
	private static final long[] CONVERSIONS = new long[N];

	private FactionStats() {}

	public static void reset() {
		for (int i = 0; i < N; i++) {
			java.util.Arrays.fill(KILLS[i], 0);
		}
		java.util.Arrays.fill(DEATHS, 0);
		java.util.Arrays.fill(SURVIVORS_KILLED, 0);
		java.util.Arrays.fill(PLAYERS_KILLED, 0);
		java.util.Arrays.fill(CONVERSIONS, 0);
	}

	public static void recordFactionKill(Faction killer, Faction victim) {
		KILLS[killer.ordinal()][victim.ordinal()]++;
	}

	public static void recordDeath(Faction victim) {
		DEATHS[victim.ordinal()]++;
	}

	public static void recordSurvivorKill(Faction killer) {
		SURVIVORS_KILLED[killer.ordinal()]++;
	}

	public static void recordPlayerKill(Faction killer) {
		PLAYERS_KILLED[killer.ordinal()]++;
	}

	public static void recordConversion(Faction faction) {
		CONVERSIONS[faction.ordinal()]++;
	}

	/** 陣営 f が他陣営を倒した数 */
	public static long killsBy(Faction f) {
		long sum = 0;
		for (int v = 0; v < N; v++) {
			sum += KILLS[f.ordinal()][v];
		}
		return sum;
	}

	/** 陣営 f が他陣営に倒された数 */
	public static long killedByOthers(Faction f) {
		long sum = 0;
		for (int k = 0; k < N; k++) {
			sum += KILLS[k][f.ordinal()];
		}
		return sum;
	}

	public static long kills(Faction killer, Faction victim) {
		return KILLS[killer.ordinal()][victim.ordinal()];
	}

	public static long totalFactionKills() {
		long sum = 0;
		for (Faction f : Faction.values()) {
			sum += killsBy(f);
		}
		return sum;
	}

	public static long deaths(Faction f) {
		return DEATHS[f.ordinal()];
	}

	public static long survivorsKilled(Faction f) {
		return SURVIVORS_KILLED[f.ordinal()];
	}

	public static long playersKilled(Faction f) {
		return PLAYERS_KILLED[f.ordinal()];
	}

	public static long conversions(Faction f) {
		return CONVERSIONS[f.ordinal()];
	}

	public static long totalConversions() {
		long sum = 0;
		for (long c : CONVERSIONS) {
			sum += c;
		}
		return sum;
	}
}
