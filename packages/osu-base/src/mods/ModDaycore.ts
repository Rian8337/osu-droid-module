import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
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

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(
                other,
                ModDoubleTime,
                ModHalfTime,
                ModNightCore,
            ) && super.isCompatibleWith(other)
        );
    }

    get isOsuRelevant(): boolean {
        return this.isRelevant;
    }
}
