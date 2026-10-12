package jp.yakata.world;

import net.minecraft.core.BlockPos;
import java.util.ArrayList;
import java.util.List;

/** 洋館の位置情報 (ワールド側が書き込み、陣営側が読む共有コントラクト)。メインスレッド専用。 */
public final class MansionInfo {
	/** 洋館が建設済みか */
	public static boolean built = false;
	/** 洋館の最小コーナー (北西角: x,z が最小)。y は床ブロックの高さ (歩く面は y+1) */
	public static BlockPos origin = BlockPos.ZERO;
	/** 9部屋の中心 (床面の1ブロック上)。順序は 左上(北西)→右下(南東) (3x3, 行優先) */
	public static final List<BlockPos> roomCenters = new ArrayList<>();
	/** 部屋名: library hall bedroom dining lobby study kitchen gallery cellar */
	public static final List<String> roomNames = new ArrayList<>();
	/** プレイヤーの初期スポーン位置 (ロビー内) */
	public static BlockPos spawn = BlockPos.ZERO;
	private MansionInfo() {}
}
