import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Easy mod.
 */
export class ModEasy
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsu,
        IModApplicableToDifficulty
{
    override readonly acronym = "EZ";
    override readonly name = "Easy";

    readonly droidRanked = true;
    readonly droidScoreMultiplier = 0.5;
    readonly droidString = "e";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 0.5;
    readonly bitwise = 1 << 1;

    applyToDifficulty(mode: Modes, difficulty: BeatmapDifficulty): void {
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

        if (difficulty.ar !== undefined) {
            difficulty.ar /= 2;
        }

        difficulty.od /= 2;
        difficulty.hp /= 2;
    }
}
