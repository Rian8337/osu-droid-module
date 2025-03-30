import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModHardRock } from "./ModHardRock";

/**
 * Represents the Easy mod.
 */
export class ModEasy
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsuStable,
        IModApplicableToDifficulty
{
    override readonly acronym = "EZ";
    override readonly name = "Easy";

    readonly droidRanked = true;
    readonly droidString = "e";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 0.5;
    readonly bitwise = 1 << 1;

    constructor() {
        super();

        this.incompatibleMods.add(ModHardRock);
    }

    calculateDroidScoreMultiplier(): number {
        return 0.5;
    }

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

        difficulty.ar /= 2;
        difficulty.od /= 2;
        difficulty.hp /= 2;
    }
}
