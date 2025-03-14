import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Traceable mod.
 */
export class ModTraceable
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym = "TC";
    override readonly name = "Traceable";

    readonly droidRanked = false;
    readonly droidScoreMultiplier = 1.06;
    readonly droidString = "b";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = false;
    readonly pcScoreMultiplier = 1;
}
