import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModClassic } from "./ModClassic";
import { ModTargetPractice } from "./ModTargetPractice";

/**
 * Represents the Strict Tracking mod.
 */
export class ModStrictTracking extends Mod implements IModApplicableToOsu {
    override readonly acronym = "ST";
    override readonly name = "Strict Tracking";

    readonly osuRanked = true;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModClassic, ModTargetPractice) &&
            super.isCompatibleWith(other)
        );
    }
}
