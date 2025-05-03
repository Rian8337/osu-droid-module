import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModHardRock } from "./ModHardRock";
import { ModMap } from "./ModMap";
import { ModReplayV6 } from "./ModReplayV6";

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

    applyToDifficulty(
        mode: Modes,
        difficulty: BeatmapDifficulty,
        adjustmentMods: ModMap,
    ) {
        if (mode === Modes.osu || !adjustmentMods.has(ModReplayV6)) {
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
