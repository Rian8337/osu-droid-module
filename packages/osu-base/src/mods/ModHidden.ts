import { Beatmap } from "../beatmap/Beatmap";
import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModTraceable } from "./ModTraceable";

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

    readonly osuRanked = true;
    readonly pcScoreMultiplier = 1.06;
    readonly bitwise = 1 << 3;

    constructor() {
        super();

        this.incompatibleMods.add(ModTraceable);
    }

    calculateDroidScoreMultiplier(): number {
        return 1.06;
    }

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
