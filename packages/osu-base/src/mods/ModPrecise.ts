import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";

/**
 * Represents the Precise mod.
 */
export class ModPrecise extends Mod implements IModApplicableToDroid {
    override readonly acronym = "PR";
    override readonly name = "Precise";

    readonly droidRanked = true;
    readonly droidScoreMultiplier = 1.06;
    readonly droidString = "s";
    readonly isDroidLegacyMod = false;
}
