import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModDoubleTime } from "./ModDoubleTime";
import { ModNightCore } from "./ModNightCore";
import { ModRateAdjust } from "./ModRateAdjust";

/**
 * Represents the HalfTime mod.
 */
export class ModHalfTime
    extends ModRateAdjust
    implements IModApplicableToDroid, IModApplicableToOsuStable {
    override readonly acronym = "HT";
    override readonly name = "HalfTime";

    readonly droidRanked = true;

    readonly osuRanked = true;
    readonly bitwise = 1 << 8;

    override readonly rate = 0.75;

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModDoubleTime, ModNightCore) &&
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
