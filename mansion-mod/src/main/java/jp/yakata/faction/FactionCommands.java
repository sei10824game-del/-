package jp.yakata.faction;

import com.mojang.brigadier.CommandDispatcher;
import com.mojang.brigadier.arguments.BoolArgumentType;
import com.mojang.brigadier.arguments.IntegerArgumentType;
import com.mojang.brigadier.arguments.StringArgumentType;
import com.mojang.brigadier.context.CommandContext;
import jp.yakata.faction.entity.FactionMonster;
import net.minecraft.ChatFormatting;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.commands.Commands;
import net.minecraft.commands.SharedSuggestionProvider;
import net.minecraft.core.BlockPos;
import net.minecraft.network.chat.Component;
import net.minecraft.network.chat.MutableComponent;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.npc.villager.Villager;

import java.util.ArrayList;
import java.util.List;

/**
 * /yakata factions              陣営ごとの頭数・戦果 (戻り値: 陣営間キル総数)
 * /yakata spawn &lt;faction|mob&gt; [count]  実行者の位置に出現
 * /yakata clear                 全陣営 Mob と生存者を消去
 * /yakata sidebar               サイドバー表示の切替
 * /yakata director &lt;on|off&gt;    ウェーブ管理の有効/無効
 * /yakata seed                  初期配置をやり直す
 */
public final class FactionCommands {
	private FactionCommands() {}

	public static void register(CommandDispatcher<CommandSourceStack> dispatcher) {
		dispatcher.register(Commands.literal("yakata")
			.then(Commands.literal("factions").executes(FactionCommands::factions))
			.then(Commands.literal("kills").executes(c -> (int) FactionStats.totalFactionKills()))
			.then(Commands.literal("spawn")
				.requires(Commands.hasPermission(Commands.LEVEL_GAMEMASTERS))
				.then(Commands.argument("faction", StringArgumentType.word())
					.suggests((c, b) -> SharedSuggestionProvider.suggest(spawnNames(), b))
					.executes(c -> spawn(c, 5))
					.then(Commands.argument("count", IntegerArgumentType.integer(1, 64))
						.executes(c -> spawn(c, IntegerArgumentType.getInteger(c, "count"))))))
			.then(Commands.literal("clear")
				.requires(Commands.hasPermission(Commands.LEVEL_GAMEMASTERS))
				.executes(FactionCommands::clear))
			.then(Commands.literal("sidebar")
				.requires(Commands.hasPermission(Commands.LEVEL_GAMEMASTERS))
				.executes(c -> {
					boolean shown = FactionSidebar.toggle(c.getSource().getServer());
					c.getSource().sendSuccess(() -> Component.literal("サイドバー: " + (shown ? "表示" : "非表示")), false);
					return shown ? 1 : 0;
				}))
			.then(Commands.literal("director")
				.requires(Commands.hasPermission(Commands.LEVEL_GAMEMASTERS))
				.then(Commands.argument("enabled", BoolArgumentType.bool()).executes(c -> {
					FactionDirector.enabled = BoolArgumentType.getBool(c, "enabled");
					c.getSource().sendSuccess(() -> Component.literal("陣営ディレクター: " + (FactionDirector.enabled ? "有効" : "無効")), true);
					return FactionDirector.enabled ? 1 : 0;
				})))
			.then(Commands.literal("seed")
				.requires(Commands.hasPermission(Commands.LEVEL_GAMEMASTERS))
				.executes(c -> {
					FactionSavedData.get(c.getSource().getServer()).setSeeded(false, 0L);
					c.getSource().sendSuccess(() -> Component.literal("次の tick で陣営を再配置します"), true);
					return 1;
				})));
	}

	private static List<String> spawnNames() {
		List<String> names = new ArrayList<>();
		for (Faction f : Faction.values()) {
			names.add(f.id());
		}
		for (FactionEntities.Entry e : FactionEntities.ALL) {
			names.add(e.name());
		}
		return names;
	}

	private static int factions(CommandContext<CommandSourceStack> c) {
		CommandSourceStack src = c.getSource();
		FactionDirector.Census census = FactionDirector.census(src.getServer().overworld());
		src.sendSuccess(() -> Component.literal("=== 洋館の勢力 ===").withStyle(ChatFormatting.GOLD), false);
		for (Faction f : Faction.values()) {
			MutableComponent line = Component.empty()
				.append(f.displayName())
				.append(Component.literal(String.format(": %d 体  撃破 %d / 被撃破 %d  生存者殺害 %d  感染転化 %d",
					census.of(f), FactionStats.killsBy(f), FactionStats.killedByOthers(f),
					FactionStats.survivorsKilled(f), FactionStats.conversions(f))).withStyle(ChatFormatting.WHITE));
			src.sendSuccess(() -> line, false);
		}
		StringBuilder matrix = new StringBuilder("キル表 (行=攻撃側): ");
		for (Faction k : Faction.values()) {
			matrix.append(k.enName).append('[');
			for (Faction v : Faction.values()) {
				if (v != k) {
					matrix.append(v.enName.charAt(0)).append(FactionStats.kills(k, v)).append(' ');
				}
			}
			matrix.setLength(matrix.length() - 1);
			matrix.append("] ");
		}
		String m = matrix.toString();
		src.sendSuccess(() -> Component.literal(m).withStyle(ChatFormatting.GRAY), false);
		long total = FactionStats.totalFactionKills();
		src.sendSuccess(() -> Component.literal(String.format("合計 %d 体 / 生存者 %d 人 / 陣営間キル %d / 感染転化 %d",
			census.total(), census.survivors, total, FactionStats.totalConversions())).withStyle(ChatFormatting.YELLOW), false);
		return (int) Math.min(Integer.MAX_VALUE, total);
	}

	private static int spawn(CommandContext<CommandSourceStack> c, int count) {
		CommandSourceStack src = c.getSource();
		String name = StringArgumentType.getString(c, "faction");
		ServerLevel level = src.getLevel();
		BlockPos pos = BlockPos.containing(src.getPosition());
		Faction faction = Faction.byId(name);
		int spawned = 0;
		if (faction != null) {
			// ボス級の同時数制限を無視しないよう、現在の頭数を渡す
			spawned = FactionDirector.spawnFaction(level, faction, pos, count, FactionDirector.census(level), EntitySpawnReason.COMMAND);
		} else {
			FactionEntities.Entry entry = FactionEntities.byName(name);
			if (entry == null) {
				src.sendFailure(Component.literal("不明な陣営/Mob: " + name + " (候補: " + String.join(", ", spawnNames()) + ")"));
				return 0;
			}
			for (int i = 0; i < count; i++) {
				if (FactionDirector.spawnAround(level, entry.type(), pos, level.getRandom(), EntitySpawnReason.COMMAND) != null) {
					spawned++;
				}
			}
		}
		int n = spawned;
		src.sendSuccess(() -> Component.literal(name + " を " + n + " 体出現させました"), true);
		return n;
	}

	private static int clear(CommandContext<CommandSourceStack> c) {
		int removed = 0;
		for (ServerLevel level : c.getSource().getServer().getAllLevels()) {
			List<Entity> toRemove = new ArrayList<>();
			for (Entity e : level.getAllEntities()) {
				if (e instanceof FactionMonster || e instanceof Villager && e.entityTags().contains(FactionDirector.SURVIVOR_TAG)) {
					toRemove.add(e);
				}
			}
			for (Entity e : toRemove) {
				e.discard();
			}
			removed += toRemove.size();
		}
		int n = removed;
		c.getSource().sendSuccess(() -> Component.literal("陣営 Mob と生存者を " + n + " 体消去しました"), true);
		return n;
	}
}
