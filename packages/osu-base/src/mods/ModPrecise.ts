import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { Spinner } from "../beatmap/hitobjects/Spinner";
import { Modes } from "../constants/Modes";
import { PreciseDroidHitWindow } from "../utils/PreciseDroidHitWindow";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObject } from "./IModApplicableToHitObject";
import { Mod } from "./Mod";

/**
 * Represents the Precise mod.
 */
export class ModPrecise
    extends Mod
    implements IModApplicableToDroid, IModApplicableToHitObject
{
    override readonly acronym = "PR";
    override readonly name = "Precise";

    readonly droidRanked = true;

    calculateDroidScoreMultiplier(): number {
        return 1.06;
    }

    applyToHitObject(mode: Modes, hitObject: HitObject): void {
        if (mode !== Modes.droid || hitObject instanceof Spinner) {
            return;
        }

        if (hitObject instanceof Slider) {
            // For sliders, the hit window is enforced in the head - everything else is an instant hit or miss.
            hitObject.head.hitWindow = new PreciseDroidHitWindow(
                hitObject.head.hitWindow?.overallDifficulty,
            );
        } else {
            hitObject.hitWindow = new PreciseDroidHitWindow(
                hitObject.hitWindow?.overallDifficulty,
            );
        }
    }
}
