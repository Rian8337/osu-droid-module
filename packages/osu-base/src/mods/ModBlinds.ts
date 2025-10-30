import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModFlashlight } from "./ModFlashlight";

/**
 * Represents the Blinds mod.
 */
export class ModBlinds extends Mod implements IModApplicableToOsu {
    override readonly acronym = "BL";
    override readonly name = "Blinds";

    readonly osuRanked = true;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1.12;

    constructor() {
        super();

        this.incompatibleMods.add(ModFlashlight);
    }
}
