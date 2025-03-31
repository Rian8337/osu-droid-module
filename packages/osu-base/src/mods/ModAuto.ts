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

    readonly osuRanked = false;
    readonly bitwise = 1 << 11;

    constructor() {
        super();

        this.incompatibleMods.add(ModAutopilot).add(ModRelax);
    }

    calculateDroidScoreMultiplier(): number {
        return 1;
    }

    get osuScoreMultiplier(): number {
        return 1;
    }
}
