import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { IMigratableDroidMod } from "./IMigratableDroidMod";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";
import { ModDifficultyAdjust } from "./ModDifficultyAdjust";
import { ModMap } from "./ModMap";

/**
 * Represents the SmallCircle mod.
 *
 * This is a legacy osu!droid mod that may still be exist when parsing replays.
 */
export class ModSmallCircle
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToDifficulty,
        IMigratableDroidMod
{
    override readonly acronym = "SC";
    override readonly name = "SmallCircle";

    readonly droidRanked = false;

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 1.06;
    }

    migrateDroidMod(
        difficulty: BeatmapDifficulty,
    ): Mod & IModApplicableToDroid {
        return new ModDifficultyAdjust({ cs: difficulty.cs + 4 });
    }

    applyToDifficulty(
        mode: Modes,
        difficulty: BeatmapDifficulty,
        adjustmentMods: ModMap,
    ) {
        if (mode === Modes.osu || !adjustmentMods.has(ModDifficultyAdjust)) {
            difficulty.cs += 4;
        } else {
            const scale = CircleSizeCalculator.droidCSToOldDroidScale(
                difficulty.cs,
            );

            difficulty.cs = CircleSizeCalculator.oldDroidScaleToDroidCS(
                scale + CircleSizeCalculator.droidCSToOldDroidScale(4),
            );
        }
    }

    override isCompatibleWith(other: Mod): boolean {
        if (other instanceof ModDifficultyAdjust) {
            return other.cs.value === null;
        }

        return super.isCompatibleWith(other);
    }
}
