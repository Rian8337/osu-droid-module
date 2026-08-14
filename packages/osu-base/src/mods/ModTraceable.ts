import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModHidden } from "./ModHidden";

/**
 * Represents the Traceable mod.
 */
export class ModTraceable
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu {
    override readonly acronym = "TC";
    override readonly name = "Traceable";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;

    readonly osuRanked = true;
    readonly isOsuRelevant = true;

    constructor() {
        super();

        this.incompatibleMods.add(ModHidden);
    }
}
