import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the HardRock mod.
 */
export class ModHardRock
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsu,
        IModApplicableToDifficulty
{
    override readonly acronym = "HR";
    override readonly name = "HardRock";

    readonly droidRanked = true;
    readonly droidScoreMultiplier = 1.06;
    readonly droidString = "r";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1.06;
    readonly bitwise = 1 << 4;

    applyToDifficulty(mode: Modes, difficulty: BeatmapDifficulty): void {
        switch (mode) {
            case Modes.droid: {
                const scale = CircleSizeCalculator.droidCSToDroidScale(
                    difficulty.cs,
                );

                difficulty.cs = CircleSizeCalculator.droidScaleToDroidCS(
                    scale - 0.125,
                );

                break;
            }
            case Modes.osu:
                // CS uses a custom 1.3 ratio.
                difficulty.cs = this.applySetting(difficulty.cs, 1.3);
                break;
        }

        difficulty.ar = this.applySetting(difficulty.ar);
        difficulty.od = this.applySetting(difficulty.od);
        difficulty.hp = this.applySetting(difficulty.hp);
    }

    private applySetting(value: number, ratio = 1.4): number {
        return Math.min(value * ratio, 10);
    }
}
