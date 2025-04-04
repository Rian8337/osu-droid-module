import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { IModApplicableToDifficultyWithSettings } from "./IModApplicableToDifficultyWithSettings";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";
import { ModCustomSpeed } from "./ModCustomSpeed";
import { ModDifficultyAdjust } from "./ModDifficultyAdjust";
import { ModEasy } from "./ModEasy";
import { ModMap } from "./ModMap";

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

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 0.4;
    }

    applyToDifficultyWithSettings(
        mode: Modes,
        difficulty: BeatmapDifficulty,
        mods: ModMap,
    ): void {
        if (mode !== Modes.droid) {
            return;
        }

        const difficultyAdjustMod = mods.get(ModDifficultyAdjust);

        if (difficultyAdjustMod?.ar === undefined) {
            if (mods.has(ModEasy)) {
                difficulty.ar *= 2;
                difficulty.ar -= 0.5;
            }

            const customSpeed = mods.get(ModCustomSpeed);

            difficulty.ar -= 0.5;
            difficulty.ar -= (customSpeed?.trackRateMultiplier ?? 1) - 1;
        }

        if (difficultyAdjustMod?.cs === undefined) {
            const scale = CircleSizeCalculator.droidCSToDroidScale(
                difficulty.cs,
            );

            difficulty.cs = CircleSizeCalculator.droidScaleToDroidCS(
                scale + 0.125,
            );
        }

        if (difficultyAdjustMod?.od === undefined) {
            difficulty.od /= 2;
        }

        if (difficultyAdjustMod?.hp === undefined) {
            difficulty.hp /= 2;
        }
    }
}
