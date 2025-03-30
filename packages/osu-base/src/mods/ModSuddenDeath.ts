import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModNoFail } from "./ModNoFail";
import { ModPerfect } from "./ModPerfect";

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
    readonly droidString = "u";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1;
    readonly bitwise = 1 << 5;

    constructor() {
        super();

        this.incompatibleMods.add(ModNoFail).add(ModPerfect);
    }

    calculateDroidScoreMultiplier(): number {
        return 1;
    }
}
