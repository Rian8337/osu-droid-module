import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { ModDoubleTime } from "./ModDoubleTime";
import { ModHalfTime } from "./ModHalfTime";
import { ModNightCore } from "./ModNightCore";
import { ModRateAdjust } from "./ModRateAdjust";

/**
 * Represents the Daycore mod.
 */
export class ModDaycore extends ModRateAdjust implements IModApplicableToOsu {
    override readonly acronym = "DC";
    override readonly name = "Daycore";

    readonly osuRanked = true;
    readonly osuScoreMultiplier = 1;

    override readonly rate = 0.75;

    constructor() {
        super();

        this.incompatibleMods
            .add(ModDoubleTime)
            .add(ModHalfTime)
            .add(ModNightCore);
    }

    get isOsuRelevant(): boolean {
        return this.isRelevant;
    }
}
