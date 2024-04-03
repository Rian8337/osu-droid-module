import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";

/**
 * Represents the SpeedUp mod.
 */
export class ModSpeedUp extends Mod implements IModApplicableToDroid {
    override readonly acronym = "SU";
    override readonly name = "Speed Up";

    readonly droidRanked = false;
    readonly droidScoreMultiplier = 1.06;
    readonly droidString = "b";
    readonly isDroidLegacyMod = true;
}
