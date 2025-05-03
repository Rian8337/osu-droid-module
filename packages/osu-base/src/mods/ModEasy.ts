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

    readonly osuRanked = true;
    readonly bitwise = 1 << 1;

    constructor() {
        super();

        this.incompatibleMods.add(ModHardRock);
    }

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 0.5;
    }

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 0.5;
    }

    applyToDifficulty(mode: Modes, difficulty: BeatmapDifficulty): void {
        switch (mode) {
            case Modes.droid: {
                const scale = CircleSizeCalculator.droidCSToOldDroidScale(
                    difficulty.cs,
                );

                difficulty.cs = CircleSizeCalculator.oldDroidScaleToDroidCS(
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
