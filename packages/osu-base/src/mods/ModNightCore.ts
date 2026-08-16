import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModDoubleTime } from "./ModDoubleTime";
import { ModHalfTime } from "./ModHalfTime";
import { ModRateAdjust } from "./ModRateAdjust";

/**
 * Represents the NightCore mod.
 */
export class ModNightCore
    extends ModRateAdjust
    implements IModApplicableToDroid, IModApplicableToOsuStable {
    override readonly acronym = "NC";
    override readonly name = "NightCore";

    readonly droidRanked = true;

    readonly osuRanked = true;
    readonly bitwise = 1 << 9;

    override readonly rate: number = 1.5;

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModDoubleTime, ModHalfTime) &&
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
