import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModAuto } from "./ModAuto";
import { ModRelax } from "./ModRelax";
import { ModSingleTap } from "./ModSingleTap";

/**
 * Represents the Alternate mod.
 */
export class ModAlternate extends Mod implements IModApplicableToOsu {
    override readonly acronym = "AL";
    override readonly name = "Alternate";

    readonly osuRanked = true;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModAuto, ModRelax, ModSingleTap) &&
            super.isCompatibleWith(other)
        );
    }
}
