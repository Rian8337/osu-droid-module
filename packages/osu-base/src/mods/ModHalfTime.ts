import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { Mod } from "./Mod";

/**
 * Represents the HalfTime mod.
 */
export class ModHalfTime
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsuStable,
        IModApplicableToTrackRate
{
    override readonly acronym = "HT";
    override readonly name = "HalfTime";

    readonly droidRanked = true;
    readonly droidScoreMultiplier = 0.3;
    readonly droidString = "t";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 0.3;
    readonly bitwise = 1 << 8;

    applyToRate(rate: number): number {
        return rate * 0.75;
    }
}
