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

    readonly droidRanked = true;

    readonly osuRanked = true;
    readonly osuScoreMultiplier = 0.3;
    readonly bitwise = 1 << 8;

    override readonly rate = 0.75;

    constructor() {
        super();

        this.incompatibleMods.add(ModDoubleTime).add(ModNightCore);
    }

    get isDroidRelevant(): boolean {
        return this.isRelevant;
    }

    override get droidScoreMultiplier(): number {
        return super.droidScoreMultiplier;
    }

    override get migrationDroidScoreMultiplier(): number {
        return super.migrationDroidScoreMultiplier;
    }

    get isOsuRelevant(): boolean {
        return this.isRelevant;
    }
}
