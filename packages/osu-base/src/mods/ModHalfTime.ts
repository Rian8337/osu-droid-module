import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { ModDoubleTime } from "./ModDoubleTime";
import { ModNightCore } from "./ModNightCore";
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

    readonly osuRanked = true;
    readonly pcScoreMultiplier = 0.3;
    readonly bitwise = 1 << 8;

    constructor() {
        super();

        this.incompatibleMods.add(ModDoubleTime).add(ModNightCore);
    }

    calculateDroidScoreMultiplier(): number {
        return this.droidScoreMultiplier;
    }
}
