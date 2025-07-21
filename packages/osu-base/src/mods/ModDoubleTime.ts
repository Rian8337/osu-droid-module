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

    readonly droidRanked = true;

    readonly osuRanked = true;
    readonly osuScoreMultiplier = 1.12;
    readonly bitwise = 1 << 6;

    constructor() {
        super(1.5);

        this.incompatibleMods.add(ModHalfTime).add(ModNightCore);
    }

    get isDroidRelevant(): boolean {
        return this.isRelevant;
    }

    override get droidScoreMultiplier(): number {
        return super.droidScoreMultiplier;
    }

    get isOsuRelevant(): boolean {
        return this.isRelevant;
    }
}
