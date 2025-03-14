import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";

/**
 * Represents the Autopilot mod.
 */
export class ModAutopilot
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    override readonly acronym = "AP";
    override readonly name = "Autopilot";

    readonly droidRanked = false;
    readonly droidScoreMultiplier = 0.001;
    readonly droidString = "p";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = false;
    readonly pcScoreMultiplier = 0;
    readonly bitwise = 1 << 13;
}
