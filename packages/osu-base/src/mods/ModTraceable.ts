import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModHidden } from "./ModHidden";

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

    constructor() {
        super();

        this.incompatibleMods.add(ModHidden);
    }
}
