package jp.yakata.faction;

import com.mojang.serialization.Codec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import net.minecraft.resources.Identifier;
import net.minecraft.server.MinecraftServer;
import net.minecraft.world.level.saveddata.SavedData;
import net.minecraft.world.level.saveddata.SavedDataType;

/** 初期配置 (シード) 済みかどうかだけを保存する。再起動時の二重配置を防ぐ。 */
public class FactionSavedData extends SavedData {
	public static final Codec<FactionSavedData> CODEC = RecordCodecBuilder.create(i -> i.group(
			Codec.BOOL.optionalFieldOf("seeded", false).forGetter(d -> d.seeded),
			Codec.LONG.optionalFieldOf("seeded_at", 0L).forGetter(d -> d.seededAt)
		).apply(i, FactionSavedData::new));
	// データフィクサーは不要 (Fabric API の SavedDataStorage mixin が null を許容する)
	public static final SavedDataType<FactionSavedData> TYPE = new SavedDataType<>(
		Identifier.fromNamespaceAndPath("yakata", "factions"), FactionSavedData::new, CODEC, null);

	private boolean seeded;
	private long seededAt;

	public FactionSavedData() {
		this(false, 0L);
	}

	public FactionSavedData(boolean seeded, long seededAt) {
		this.seeded = seeded;
		this.seededAt = seededAt;
	}

	public static FactionSavedData get(MinecraftServer server) {
		return server.getDataStorage().computeIfAbsent(TYPE);
	}

	public boolean isSeeded() {
		return this.seeded;
	}

	public void setSeeded(boolean seeded, long gameTime) {
		this.seeded = seeded;
		this.seededAt = gameTime;
		this.setDirty();
	}
}
