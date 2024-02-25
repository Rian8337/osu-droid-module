import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Perfect mod.
 */
export class ModPerfect
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym = "PF";
    override readonly name = "Perfect";

    readonly droidRanked = true;
    readonly droidScoreMultiplier = 1;
    readonly droidString = "f";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1;
    readonly bitwise = 1 << 14;
}
