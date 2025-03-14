import { Beatmap } from "../beatmap/Beatmap";
import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";

/**
 * Represents the Hidden mod.
 */
export class ModHidden
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsuStable,
        IModApplicableToBeatmap
{
    static readonly fadeInDurationMultiplier = 0.4;
    static readonly fadeOutDurationMultiplier = 0.3;

    override readonly acronym = "HD";
    override readonly name = "Hidden";

    readonly droidRanked = true;
    readonly droidScoreMultiplier = 1.06;
    readonly droidString = "h";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1.06;
    readonly bitwise = 1 << 3;

    applyToBeatmap(beatmap: Beatmap): void {
        const applyFadeInAdjustment = (hitObject: HitObject) => {
            hitObject.timeFadeIn =
                hitObject.timePreempt * ModHidden.fadeInDurationMultiplier;

            if (hitObject instanceof Slider) {
                hitObject.nestedHitObjects.forEach(applyFadeInAdjustment);
            }
        };

        beatmap.hitObjects.objects.forEach(applyFadeInAdjustment);
    }
}
