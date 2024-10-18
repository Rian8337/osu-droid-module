import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { Mod } from "./Mod";

/**
 * Represents the SpeedUp mod.
 */
export class ModSpeedUp
    extends Mod
    implements IModApplicableToDroid, IModApplicableToTrackRate
{
    override readonly acronym = "SU";
    override readonly name = "Speed Up";

    readonly droidRanked = false;
    readonly droidScoreMultiplier = 1.06;
    readonly droidString = "b";
    readonly isDroidLegacyMod = true;

    readonly trackRateMultiplier = 1.25;

    applyToRate(rate: number): number {
        return rate * 1.25;
    }
}
