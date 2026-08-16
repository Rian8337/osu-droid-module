import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModPerfect } from "./ModPerfect";
import { ModSuddenDeath } from "./ModSuddenDeath";

/**
 * Represents the NoFail mod.
 */
export class ModNoFail
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable {
    override readonly acronym = "NF";
    override readonly name = "NoFail";

    readonly droidRanked = true;
    readonly isDroidRelevant = true;

    readonly osuRanked = true;
    readonly isOsuRelevant = true;
    readonly bitwise = 1 << 0;

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModPerfect, ModSuddenDeath) &&
            super.isCompatibleWith(other)
        );
    }
}
