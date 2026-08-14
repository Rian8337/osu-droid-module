import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModAlternate } from "./ModAlternate";
import { ModAuto } from "./ModAuto";
import { ModRelax } from "./ModRelax";

/**
 * Represents the Single Tap mod.
 */
export class ModSingleTap extends Mod implements IModApplicableToOsu {
    override readonly acronym = "SG";
    override readonly name = "Single Tap";

    readonly osuRanked = true;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    constructor() {
        super();

        this.incompatibleMods.add(ModAuto).add(ModRelax).add(ModAlternate);
    }
}
