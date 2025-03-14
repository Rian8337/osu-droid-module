import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";

/**
 * Represents the Flashlight mod.
 */
export class ModFlashlight
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    override readonly acronym = "FL";
    override readonly name = "Flashlight";

    readonly droidRanked = true;
    readonly droidScoreMultiplier = 1.12;
    readonly droidString = "i";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1.12;
    readonly bitwise = 1 << 10;
}
