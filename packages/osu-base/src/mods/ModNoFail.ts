import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModPerfect } from "./ModPerfect";
import { ModSuddenDeath } from "./ModSuddenDeath";

/**
 * Represents the NoFail mod.
 */
export class ModNoFail
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    override readonly acronym = "NF";
    override readonly name = "NoFail";

    readonly droidRanked = true;

    readonly osuRanked = true;
    readonly bitwise = 1 << 0;

    constructor() {
        super();

        this.incompatibleMods.add(ModPerfect).add(ModSuddenDeath);
    }

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 0.5;
    }

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 0.5;
    }
}
