import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { ModRateAdjust } from "./ModRateAdjust";

/**
 * Represents the DoubleTime mod.
 */
export class ModDoubleTime
    extends ModRateAdjust
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    override readonly acronym = "DT";
    override readonly name = "DoubleTime";

    readonly droidRanked = true;
    readonly droidString = "d";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1.12;
    readonly bitwise = 1 << 6;

    calculateDroidScoreMultiplier(): number {
        return 1.12;
    }

    override applyToRate(rate: number): number {
        return rate * 1.5;
    }
}
