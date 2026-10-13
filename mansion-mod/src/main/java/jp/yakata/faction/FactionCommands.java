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
 * /yakata homes                 陣営ごとの本拠地 (部屋)
 * /yakata count &lt;faction&gt;     陣営の現在数 (戻り値)
 * /yakata event &lt;name&gt;        特殊イベントの回数 (戻り値。siren, makima_control, flood_takeover, ...)
 */
public final class FactionCommands {
	private FactionCommands() {}

	public static void register(CommandDispatcher<CommandSourceStack> dispatcher) {
		dispatcher.register(Commands.literal("yakata")
			.then(Commands.literal("factions").executes(FactionCommands::factions))
			.then(Commands.literal("kills").executes(c -> (int) FactionStats.totalFactionKills()))
			.then(Commands.literal("homes").executes(FactionCommands::homes))
			.then(Commands.literal("count")
				.then(Commands.argument("faction", StringArgumentType.word())
					.suggests((c, b) -> SharedSuggestionProvider.suggest(factionIds(), b))
					.executes(FactionCommands::count)))
			.then(Commands.literal("event")
				.then(Commands.argument("name", StringArgumentType.word())
					.executes(c -> (int) FactionStats.eventCount(StringArgumentType.getString(c, "name")))))
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

	private static List<String> factionIds() {
		List<String> ids = new ArrayList<>();
		for (Faction f : Faction.values()) {
			ids.add(f.id());
		}
		return ids;
	}

	/** /yakata count <faction>: その陣営の現在数 (戻り値) と戦果 */
	private static int count(CommandContext<CommandSourceStack> c) {
		String id = StringArgumentType.getString(c, "faction");
		Faction f = Faction.byId(id);
		if (f == null) {
			c.getSource().sendFailure(Component.literal("不明な陣営: " + id + " (候補: " + String.join(", ", factionIds()) + ")"));
			return 0;
		}
		int n = FactionDirector.census(c.getSource().getServer().overworld()).of(f);
		c.getSource().sendSuccess(() -> Component.empty().append(f.displayName()).append(String.format(": %d 体 / 撃破 %d / 被撃破 %d / 転化 %d",
			n, FactionStats.killsBy(f), FactionStats.killedByOthers(f), FactionStats.conversions(f))), false);
		return n;
	}

	/** /yakata homes: 陣営ごとの本拠地 (部屋と座標) */
	private static int homes(CommandContext<CommandSourceStack> c) {
		FactionDirector.Anchors a = FactionDirector.anchors();
		if (a == null) {
			c.getSource().sendFailure(Component.literal("本拠地はまだ決まっていません (洋館の建設待ち)"));
			return 0;
		}
		for (Faction f : Faction.values()) {
			BlockPos p = a.homes().get(f);
			String room = a.rooms().get(f);
			c.getSource().sendSuccess(() -> Component.empty().append(f.displayName())
				.append(Component.literal(" → " + room + " " + (p == null ? "-" : p.toShortString())).withStyle(ChatFormatting.WHITE)), false);
		}
		return Faction.count();
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
		src.sendSuccess(() -> Component.literal("キル表 (行=攻撃側, 0 は省略):").withStyle(ChatFormatting.GRAY), false);
		for (Faction k : Faction.values()) {
			StringBuilder row = new StringBuilder("  ").append(k.id()).append(" → ");
			int cells = 0;
			for (Faction v : Faction.values()) {
				long n = FactionStats.kills(k, v);
				if (v != k && n > 0) {
					row.append(v.id()).append(':').append(n).append(' ');
					cells++;
				}
			}
			if (cells > 0) {
				String r = row.toString().trim();
				src.sendSuccess(() -> Component.literal(r).withStyle(ChatFormatting.GRAY), false);
			}
		}
		String ev = FactionStats.events().toString();
		src.sendSuccess(() -> Component.literal("イベント: " + ev).withStyle(ChatFormatting.DARK_AQUA), false);
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
