import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModAlternate } from "./ModAlternate";
import { ModAuto } from "./ModAuto";
import { ModRelax } from "./ModRelax";

/**
 * Represents the Single Tap mod.
 */
export class ModSingleTap extends Mod implements IModApplicableToOsu {
    override readonly acronym = "SG";
    override readonly name = "Single Tap";

    readonly osuRanked = true;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModAuto, ModRelax, ModAlternate) &&
            super.isCompatibleWith(other)
        );
    }
}
