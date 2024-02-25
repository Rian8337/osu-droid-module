import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { IModApplicableToDifficultyWithSettings } from "./IModApplicableToDifficultyWithSettings";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";
import { ModDifficultyAdjust } from "./ModDifficultyAdjust";
import { ModHardRock } from "./ModHardRock";

/**
 * Represents the ReallyEasy mod.
 */
export class ModReallyEasy
    extends Mod
    implements IModApplicableToDroid, IModApplicableToDifficultyWithSettings
{
    override readonly acronym = "RE";
    override readonly name = "ReallyEasy";

    readonly droidRanked = false;
    readonly droidScoreMultiplier = 0.4;
    readonly droidString = "l";
    readonly isDroidLegacyMod = false;

    applyToDifficultyWithSettings(
        mode: Modes,
        difficulty: BeatmapDifficulty,
        mods: Mod[],
        customSpeedMultiplier: number,
    ): void {
        const difficultyAdjustMod = mods.find(
            (m) => m instanceof ModDifficultyAdjust,
        ) as ModDifficultyAdjust | undefined;

        if (
            difficultyAdjustMod?.ar !== undefined &&
            difficulty.ar !== undefined
        ) {
            if (mods.some((m) => m instanceof ModHardRock)) {
                difficulty.ar *= 2;
                difficulty.ar -= 0.5;
            }

            difficulty.ar -= 0.5;
            difficulty.ar -= customSpeedMultiplier - 1;
        }

        if (difficultyAdjustMod?.cs !== undefined) {
            switch (mode) {
                case Modes.droid: {
                    const scale = CircleSizeCalculator.droidCSToDroidScale(
                        difficulty.cs,
                    );

                    difficulty.cs = CircleSizeCalculator.droidScaleToDroidCS(
                        scale + 0.125,
                    );

                    break;
                }
                case Modes.osu:
                    difficulty.cs /= 2;
            }
        }

        if (difficultyAdjustMod?.od !== undefined) {
            difficulty.od /= 2;
        }

        if (difficultyAdjustMod?.hp !== undefined) {
            difficulty.hp /= 2;
        }
    }
}
