import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModNoFail } from "./ModNoFail";
import { ModSuddenDeath } from "./ModSuddenDeath";

/**
 * Represents the Perfect mod.
 */
export class ModPerfect
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    override readonly acronym = "PF";
    override readonly name = "Perfect";

    readonly droidRanked = true;
    readonly droidString = "f";

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1;
    readonly bitwise = 1 << 14;

    constructor() {
        super();

        this.incompatibleMods.add(ModNoFail).add(ModSuddenDeath);
    }

    calculateDroidScoreMultiplier(): number {
        return 1;
    }
}
