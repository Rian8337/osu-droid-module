import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { ModRateAdjust } from "./ModRateAdjust";

/**
 * Represents the HalfTime mod.
 */
export class ModHalfTime
    extends ModRateAdjust
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    override readonly acronym = "HT";
    override readonly name = "HalfTime";

    override readonly trackRateMultiplier = 0.75;

    readonly droidRanked = true;
    readonly droidString = "t";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 0.3;
    readonly bitwise = 1 << 8;

    calculateDroidScoreMultiplier(): number {
        return this.droidScoreMultiplier;
    }
}
