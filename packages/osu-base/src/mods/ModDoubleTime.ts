import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { Mod } from "./Mod";

/**
 * Represents the DoubleTime mod.
 */
export class ModDoubleTime
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsuStable,
        IModApplicableToTrackRate
{
    override readonly acronym = "DT";
    override readonly name = "DoubleTime";

    readonly droidRanked = true;
    readonly droidScoreMultiplier = 1.12;
    readonly droidString = "d";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1.12;
    readonly bitwise = 1 << 6;

    applyToRate(rate: number): number {
        return rate * 1.5;
    }
}
