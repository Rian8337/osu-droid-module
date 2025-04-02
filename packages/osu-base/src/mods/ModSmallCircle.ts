import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { IMigratableDroidMod } from "./IMigratableDroidMod";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";
import { ModDifficultyAdjust } from "./ModDifficultyAdjust";

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

    applyToDifficulty(mode: Modes, difficulty: BeatmapDifficulty): void {
        switch (mode) {
            case Modes.droid: {
                const scale = CircleSizeCalculator.droidCSToDroidScale(
                    difficulty.cs,
                );

                difficulty.cs = CircleSizeCalculator.droidScaleToDroidCS(
                    scale -
                        ((CircleSizeCalculator.assumedDroidHeight / 480) *
                            (4 * 4.48) *
                            2) /
                            128,
                );

                break;
            }
            case Modes.osu:
                difficulty.cs += 4;
        }
    }
}
