import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModAuto } from "./ModAuto";
import { ModRelax } from "./ModRelax";
import { ModSingleTap } from "./ModSingleTap";

/**
 * Represents the Alternate mod.
 */
export class ModAlternate extends Mod implements IModApplicableToOsu {
    override readonly acronym = "AL";
    override readonly name = "Alternate";

    readonly osuRanked = true;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    constructor() {
        super();

        this.incompatibleMods.add(ModAuto).add(ModRelax).add(ModSingleTap);
    }
}
