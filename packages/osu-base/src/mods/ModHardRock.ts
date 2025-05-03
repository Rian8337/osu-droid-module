import { HitObject } from "../beatmap/hitobjects/HitObject";
import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { Vector2 } from "../math/Vector2";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { HitObjectGenerationUtils } from "../utils/HitObjectGenerationUtils";
import { Playfield } from "../utils/Playfield";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObject } from "./IModApplicableToHitObject";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModEasy } from "./ModEasy";
import { ModMirror } from "./ModMirror";

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

    applyToDifficulty(mode: Modes, difficulty: BeatmapDifficulty): void {
        switch (mode) {
            case Modes.droid: {
                const scale = CircleSizeCalculator.droidCSToOldDroidScale(
                    difficulty.cs,
                );

                difficulty.cs = CircleSizeCalculator.oldDroidScaleToDroidCS(
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

    applyToHitObject(_: Modes, hitObject: HitObject): void {
        HitObjectGenerationUtils.reflectVerticallyAlongPlayfield(hitObject);
    }

    private reflectVector(vector: Vector2): Vector2 {
        return new Vector2(vector.x, Playfield.baseSize.y - vector.y);
    }

    private reflectControlPoint(vector: Vector2): Vector2 {
        return new Vector2(vector.x, -vector.y);
    }

    private applySetting(value: number, ratio = 1.4): number {
        return Math.min(value * ratio, 10);
    }
}
