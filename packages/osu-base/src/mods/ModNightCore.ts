import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { ModDoubleTime } from "./ModDoubleTime";
import { ModHalfTime } from "./ModHalfTime";
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

    override readonly trackRateMultiplier: number = 1.5;

    readonly droidRanked = true;
    readonly droidString = "c";

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1.12;
    readonly bitwise = 1 << 9;

    constructor() {
        super();

        this.incompatibleMods.add(ModDoubleTime).add(ModHalfTime);
    }

    calculateDroidScoreMultiplier(): number {
        return this.droidScoreMultiplier;
    }
}
