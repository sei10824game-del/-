package jp.yakata.world;

import com.mojang.brigadier.CommandDispatcher;
import jp.yakata.YakataMod;
import net.fabricmc.fabric.api.command.v2.CommandRegistrationCallback;
import net.fabricmc.fabric.api.entity.event.v1.ServerPlayerEvents;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.commands.Commands;
import net.minecraft.core.BlockPos;
import net.minecraft.network.chat.Component;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.util.Mth;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.storage.LevelData;
import net.minecraft.world.phys.Vec3;

import java.util.Set;

/**
 * ワールド側の初期化: 新しいワールドの初回起動時にスポーン地点へ洋館を建て、スポーンをロビーへ移す。
 * 建設済みフラグは {@link MansionData} (world/data/yakata/mansion.dat) に保存されるので再建築しない。
 * <p>専用サーバーは server.properties で level-type=minecraft:flat を設定すること (クライアントは作成画面の既定がスーパーフラット)。
 */
public final class WorldInit {
	/** 初回参加でロビーへ案内したプレイヤーに付けるタグ */
	private static final String ARRIVED_TAG = "yakata.arrived";
	/** スポーン時の向き (北 = 大広間側) */
	private static final float SPAWN_YAW = 180f;

	private WorldInit() {}

	public static void init() {
		ServerLifecycleEvents.SERVER_STARTED.register(WorldInit::onServerStarted);
		ServerLifecycleEvents.SERVER_STOPPED.register(server -> MansionBuilder.reset());
		CommandRegistrationCallback.EVENT.register((dispatcher, registry, selection) -> registerCommands(dispatcher));
		// バニラのスポーン探索は高さマップ (=屋根の上) を使うので、ロビーへ移す
		ServerPlayerEvents.JOIN.register(player -> {
			if (player.addTag(ARRIVED_TAG)) {
				sendToLobby(player);
			}
		});
		ServerPlayerEvents.AFTER_RESPAWN.register((oldPlayer, newPlayer, alive) -> {
			if (!alive && newPlayer.getRespawnConfig() == null) {
				sendToLobby(newPlayer);
			}
		});
	}

	private static void onServerStarted(MinecraftServer server) {
		ServerLevel overworld = server.overworld();
		MansionData data = MansionData.get(server);
		if (data.isBuilt()) {
			MansionBuilder.publish(data.origin());
			YakataMod.LOGGER.info("洋館は建設済み: origin={} spawn={}", data.origin().toShortString(), MansionInfo.spawn.toShortString());
			return;
		}
		BlockPos spawn = overworld.getRespawnData().pos();
		build(server, overworld, spawn.getX(), spawn.getZ(), null);
	}

	/** 建てて、フラグ保存・MansionInfo 更新・ワールドスポーンをロビーへ */
	private static BlockPos build(MinecraftServer server, ServerLevel level, int x, int z, Integer groundTop) {
		BlockPos origin = MansionBuilder.build(level, x, z, groundTop);
		MansionData.get(server).markBuilt(origin);
		MansionBuilder.publish(origin);
		server.setRespawnData(LevelData.RespawnData.of(Level.OVERWORLD, MansionInfo.spawn, SPAWN_YAW, 0f));
		return origin;
	}

	private static boolean spawnIsLobby(MinecraftServer server) {
		LevelData.RespawnData r = server.getRespawnData();
		return MansionInfo.built && r.dimension() == Level.OVERWORLD && r.pos().equals(MansionInfo.spawn);
	}

	private static void sendToLobby(ServerPlayer player) {
		MinecraftServer server = player.level().getServer();
		if (server == null || !spawnIsLobby(server)) {
			return;
		}
		BlockPos s = MansionInfo.spawn;
		player.teleportTo(server.overworld(), s.getX() + 0.5, s.getY(), s.getZ() + 0.5, Set.of(), SPAWN_YAW, 0f, true);
	}

	// ------------------------------------------------------------------ commands

	private static void registerCommands(CommandDispatcher<CommandSourceStack> dispatcher) {
		dispatcher.register(Commands.literal("yakata")
			.then(Commands.literal("info").executes(ctx -> info(ctx.getSource())))
			.then(Commands.literal("build")
				.requires(Commands.hasPermission(Commands.LEVEL_GAMEMASTERS))
				.executes(ctx -> rebuild(ctx.getSource()))));
	}

	private static int info(CommandSourceStack source) {
		if (!MansionInfo.built) {
			source.sendSuccess(() -> Component.literal("洋館: 未建設"), false);
			return 0;
		}
		StringBuilder sb = new StringBuilder("洋館: origin=").append(MansionInfo.origin.toShortString())
			.append(" spawn=").append(MansionInfo.spawn.toShortString());
		for (int i = 0; i < MansionInfo.roomCenters.size(); i++) {
			sb.append("\n ").append(i).append(' ').append(MansionInfo.roomNames.get(i))
				.append(" @ ").append(MansionInfo.roomCenters.get(i).toShortString());
		}
		String text = sb.toString();
		source.sendSuccess(() -> Component.literal(text), false);
		return 1;
	}

	private static int rebuild(CommandSourceStack source) {
		Vec3 pos = source.getPosition();
		ServerLevel level = source.getLevel();
		if (level.dimension() != Level.OVERWORLD) {
			source.sendFailure(Component.literal("洋館はオーバーワールドにのみ建てられます"));
			return 0;
		}
		// 実行位置の足元のブロックを地表とみなす (床はその 1 段上)
		int groundTop = Mth.floor(pos.y) - 1;
		BlockPos origin = build(source.getServer(), level, Mth.floor(pos.x), Mth.floor(pos.z), groundTop);
		if (source.getEntity() instanceof ServerPlayer player) {
			BlockPos s = MansionInfo.spawn;
			player.teleportTo(level, s.getX() + 0.5, s.getY(), s.getZ() + 0.5, Set.of(), SPAWN_YAW, 0f, true);
		}
		source.sendSuccess(() -> Component.literal("洋館を建設しました: origin=" + origin.toShortString()
			+ " spawn=" + MansionInfo.spawn.toShortString()), true);
		return 1;
	}
}
