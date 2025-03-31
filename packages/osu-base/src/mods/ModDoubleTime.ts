import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { ModHalfTime } from "./ModHalfTime";
import { ModNightCore } from "./ModNightCore";
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

    override readonly trackRateMultiplier = 1.5;

    readonly droidRanked = true;
    readonly droidString = "d";

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1.12;
    readonly bitwise = 1 << 6;

    constructor() {
        super();

        this.incompatibleMods.add(ModHalfTime).add(ModNightCore);
    }

    calculateDroidScoreMultiplier(): number {
        return this.droidScoreMultiplier;
    }
}
