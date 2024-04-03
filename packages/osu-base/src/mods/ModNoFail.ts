import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the NoFail mod.
 */
export class ModNoFail
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym = "NF";
    override readonly name = "NoFail";

    readonly droidRanked = true;
    readonly droidScoreMultiplier = 0.5;
    readonly droidString = "n";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 0.5;
    readonly bitwise = 1 << 0;
}
