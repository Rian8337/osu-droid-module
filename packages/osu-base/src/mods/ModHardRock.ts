import { HitObject } from "../beatmap/hitobjects/HitObject";
import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { HitObjectGenerationUtils } from "../utils/HitObjectGenerationUtils";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObject } from "./IModApplicableToHitObject";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModDifficultyAdjust } from "./ModDifficultyAdjust";
import { ModEasy } from "./ModEasy";
import { ModMap } from "./ModMap";
import { ModMirror } from "./ModMirror";
import { ModReplayV6 } from "./ModReplayV6";

/**
 * Represents the HardRock mod.
 */
export class ModHardRock
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsuStable,
        IModApplicableToDifficulty,
        IModApplicableToHitObject
{
    override readonly acronym = "HR";
    override readonly name = "HardRock";

    readonly droidRanked = true;

    readonly osuRanked = true;
    readonly bitwise = 1 << 4;

    constructor() {
        super();

        this.incompatibleMods.add(ModEasy);
        this.incompatibleMods.add(ModMirror);
    }

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 1.06;
    }

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 1.06;
    }

    applyToDifficulty(
        mode: Modes,
        difficulty: BeatmapDifficulty,
        adjustmentMods: ModMap,
    ) {
        if (mode === Modes.osu || !adjustmentMods.has(ModReplayV6)) {
            difficulty.cs = this.applySetting(difficulty.cs, 1.3);
        } else {
            const scale = CircleSizeCalculator.droidCSToOldDroidScale(
                difficulty.cs,
            );

            // The 0.125 scale that was added before replay version 7 was in screen pixels. We need it in osu! pixels.
            difficulty.cs = CircleSizeCalculator.oldDroidScaleToDroidCS(
                scale -
                    CircleSizeCalculator.oldDroidScaleScreenPixelsToOsuPixels(
                        0.125,
                    ),
            );
        }

        difficulty.ar = this.applySetting(difficulty.ar);
        difficulty.od = this.applySetting(difficulty.od);
        difficulty.hp = this.applySetting(difficulty.hp);
    }

    applyToHitObject(_: Modes, hitObject: HitObject): void {
        HitObjectGenerationUtils.reflectVerticallyAlongPlayfield(hitObject);
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

        return super.isCompatibleWith(other);
    }

    private applySetting(value: number, ratio = 1.4): number {
        return Math.min(value * ratio, 10);
    }
}
