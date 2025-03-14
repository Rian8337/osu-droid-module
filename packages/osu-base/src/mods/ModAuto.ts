import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";

/**
 * Represents the Auto mod.
 */
export class ModAuto
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    override readonly acronym = "AT";
    override readonly name = "Autoplay";

    readonly droidRanked = false;
    readonly droidScoreMultiplier = 1;
    readonly droidString = "a";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = false;
    readonly pcScoreMultiplier = 1;
    readonly bitwise = 1 << 11;
}
