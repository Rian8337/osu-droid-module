import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { ModRateAdjust } from "./ModRateAdjust";

/**
 * Represents the NightCore mod.
 */
export class ModNightCore
    extends ModRateAdjust
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    override readonly acronym = "NC";
    override readonly name = "NightCore";

    readonly droidRanked = true;
    readonly droidString = "c";
    readonly isDroidLegacyMod = false;
    readonly droidScoreMultiplier = 1.12;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1.12;
    readonly bitwise = 1 << 9;

    override applyToRate(rate: number, oldStatistics?: boolean): number {
        return rate * (oldStatistics ? 1.39 : 1.5);
    }
}
