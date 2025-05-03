import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { IModApplicableToDifficultyWithMods } from "./IModApplicableToDifficultyWithMods";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";
import { ModCustomSpeed } from "./ModCustomSpeed";
import { ModDifficultyAdjust } from "./ModDifficultyAdjust";
import { ModEasy } from "./ModEasy";
import { ModMap } from "./ModMap";
import { ModReplayV6 } from "./ModReplayV6";

/**
 * Represents the ReallyEasy mod.
 */
export class ModReallyEasy
    extends Mod
    implements IModApplicableToDroid, IModApplicableToDifficultyWithMods
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

    applyToDifficultyWithMods(
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
            if (!mods.has(ModReplayV6)) {
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
        }

        if (difficultyAdjustMod?.od === undefined) {
            difficulty.od /= 2;
        }

        if (difficultyAdjustMod?.hp === undefined) {
            difficulty.hp /= 2;
        }
    }
}
