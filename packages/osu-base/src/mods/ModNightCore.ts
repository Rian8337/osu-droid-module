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

    readonly droidRanked = true;

    readonly osuRanked = true;
    readonly osuScoreMultiplier = 1.12;
    readonly bitwise = 1 << 9;

    constructor() {
        super(1.5);

        this.incompatibleMods.add(ModDoubleTime).add(ModHalfTime);
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
