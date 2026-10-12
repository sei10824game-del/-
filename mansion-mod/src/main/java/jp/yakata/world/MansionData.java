package jp.yakata.world;

import com.mojang.serialization.Codec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import net.minecraft.core.BlockPos;
import net.minecraft.resources.Identifier;
import net.minecraft.server.MinecraftServer;
import net.minecraft.util.datafix.DataFixTypes;
import net.minecraft.world.level.saveddata.SavedData;
import net.minecraft.world.level.saveddata.SavedDataType;

/**
 * 洋館の永続データ (world/data/yakata/mansion.dat)。
 * built=true になったら起動時に再建築しない。
 */
public final class MansionData extends SavedData {
	public static final Codec<MansionData> CODEC = RecordCodecBuilder.create(i -> i.group(
			Codec.BOOL.fieldOf("built").forGetter(d -> d.built),
			BlockPos.CODEC.fieldOf("origin").forGetter(d -> d.origin)
		).apply(i, MansionData::new));

	// DataFixTypes は null 不可のため、我々のフィールドに触れない既存の型を流用する
	public static final SavedDataType<MansionData> TYPE = new SavedDataType<>(
		Identifier.fromNamespaceAndPath("yakata", "mansion"), MansionData::new, CODEC, DataFixTypes.SAVED_DATA_RANDOM_SEQUENCES);

	private boolean built;
	private BlockPos origin;

	public MansionData() {
		this(false, BlockPos.ZERO);
	}

	private MansionData(boolean built, BlockPos origin) {
		this.built = built;
		this.origin = origin;
	}

	public static MansionData get(MinecraftServer server) {
		return server.overworld().getDataStorage().computeIfAbsent(TYPE);
	}

	public boolean isBuilt() {
		return built;
	}

	public BlockPos origin() {
		return origin;
	}

	public void markBuilt(BlockPos origin) {
		this.built = true;
		this.origin = origin.immutable();
		setDirty();
	}
}
