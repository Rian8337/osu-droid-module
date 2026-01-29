import { Beatmap } from "../beatmap/Beatmap";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { ModApproachDifferent } from "./ModApproachDifferent";
import { ModHidden } from "./ModHidden";

/**
 * Represents the Freeze Frame mod.
 */
export class ModFreezeFrame
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsu,
        IModApplicableToBeatmap
{
    override readonly name = "Freeze Frame";
    override readonly acronym = "FR";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;
    readonly droidScoreMultiplier = 1;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    constructor() {
        super();

        this.incompatibleMods.add(ModApproachDifferent).add(ModHidden);
    }

    private lastNewComboTime = 0;

    applyToBeatmap(beatmap: Beatmap) {
        this.lastNewComboTime = 0;

        for (const hitObject of beatmap.hitObjects) {
            if (hitObject.isNewCombo) {
                this.lastNewComboTime = hitObject.startTime;
            }

            this.applyFadeInAdjustment(hitObject);
        }
    }

    private applyFadeInAdjustment(hitObject: HitObject) {
        hitObject.timePreempt += hitObject.startTime - this.lastNewComboTime;

        if (hitObject instanceof Slider) {
            // Freezing slider ticks doesn't play well with snaking sliders, and slider repeats will not
            // layer correctly if its preempt is changed.
            this.applyFadeInAdjustment(hitObject.head);
            this.applyFadeInAdjustment(hitObject.tail);
        }
    }
}
