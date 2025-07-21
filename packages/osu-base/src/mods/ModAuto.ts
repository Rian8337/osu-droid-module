import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModAutopilot } from "./ModAutopilot";
import { ModRelax } from "./ModRelax";

/**
 * Represents the Auto mod.
 */
export class ModAuto
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    override readonly acronym = "AT";
    override readonly name = "Autoplay";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;
    readonly droidScoreMultiplier = 1;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;
    readonly bitwise = 1 << 11;

    constructor() {
        super();

        this.incompatibleMods.add(ModAutopilot).add(ModRelax);
    }
}
