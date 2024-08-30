import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { Vector2 } from "../math/Vector2";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { Playfield } from "../utils/Playfield";
import { SliderPath } from "../utils/SliderPath";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObject } from "./IModApplicableToHitObject";
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
        IModApplicableToDifficulty,
        IModApplicableToHitObject
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

    applyToHitObject(_: Modes, hitObject: HitObject): void {
        // Reflect the position of the hit object.
        hitObject.position = this.reflectVector(hitObject.position);

        if (!(hitObject instanceof Slider)) {
            return;
        }

        // Reflect the control points of the slider. This will reflect the positions of head and tail circles.
        hitObject.path = new SliderPath({
            pathType: hitObject.path.pathType,
            controlPoints: hitObject.path.controlPoints.map((v) =>
                this.reflectControlPoint(v),
            ),
            expectedDistance: hitObject.path.expectedDistance,
        });

        // Reflect the position of slider ticks and repeats.
        hitObject.nestedHitObjects.forEach((obj) => {
            obj.position = this.reflectVector(obj.position);
        });
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
