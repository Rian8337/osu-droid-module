import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";

/**
 * Represents the SuddenDeath mod.
 */
export class ModSuddenDeath
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    override readonly acronym = "SD";
    override readonly name = "Sudden Death";

    readonly droidRanked = true;
    readonly droidScoreMultiplier = 1;
    readonly droidString = "u";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1;
    readonly bitwise = 1 << 5;
}
