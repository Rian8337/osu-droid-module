import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModDifficultyAdjust } from "./ModDifficultyAdjust";
import { ModHardRock } from "./ModHardRock";
import { ModMap } from "./ModMap";
import { ModReplayV6 } from "./ModReplayV6";
import { IntegerModSetting } from "./settings/IntegerModSetting";

/**
 * Represents the Easy mod.
 */
export class ModEasy
    extends Mod
    implements
    IModApplicableToDroid,
    IModApplicableToOsuStable,
    IModApplicableToDifficulty {
    override readonly acronym = "EZ";
    override readonly name = "Easy";

    readonly droidRanked = true;
    readonly isDroidRelevant = true;

    readonly osuRanked = true;
    readonly isOsuRelevant = true;
    readonly bitwise = 1 << 1;

    /**
     * The amount of extra lives to give the player.
     */
    readonly retries = new IntegerModSetting(
        "Extra Lives",
        "retries",
        "Number of extra lives",
        2,
        0,
        10,
    );

    applyToDifficulty(
        mode: Modes,
        difficulty: BeatmapDifficulty,
        adjustmentMods: ModMap,
    ) {
        if (mode === Modes.Osu || !adjustmentMods.has(ModReplayV6)) {
            difficulty.cs /= 2;
        } else {
            const scale = CircleSizeCalculator.droidCSToOldDroidScale(
                difficulty.cs,
            );

            // The 0.125 scale that was added before replay version 7 was in screen pixels. We need it in osu! pixels.
            difficulty.cs = CircleSizeCalculator.oldDroidScaleToDroidCS(
                scale +
                CircleSizeCalculator.oldDroidScaleScreenPixelsToOsuPixels(
                    0.125,
                ),
            );
        }

        difficulty.ar /= 2;
        difficulty.od /= 2;
        difficulty.hp /= 2;
    }

    override isCompatibleWith(other: Mod): boolean {
        if (other instanceof ModDifficultyAdjust) {
            return (
                other.cs.value === null ||
                other.ar.value === null ||
                other.od.value === null ||
                other.hp.value === null
            );
        }

        return (
            !this.isInstanceOfAny(other, ModHardRock) &&
            super.isCompatibleWith(other)
        );
    }
}
