import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModHalfTime } from "./ModHalfTime";
import { ModNightCore } from "./ModNightCore";
import { ModRateAdjust } from "./ModRateAdjust";

/**
 * Represents the DoubleTime mod.
 */
export class ModDoubleTime
    extends ModRateAdjust
    implements IModApplicableToDroid, IModApplicableToOsuStable {
    override readonly acronym = "DT";
    override readonly name = "Double Time";

    readonly droidRanked = true;

    readonly osuRanked = true;
    readonly bitwise = 1 << 6;

    override readonly rate = 1.5;

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModHalfTime, ModNightCore) &&
            super.isCompatibleWith(other)
        );
    }

    get isDroidRelevant(): boolean {
        return this.isRelevant;
    }

    get isOsuRelevant(): boolean {
        return this.isRelevant;
    }
}
