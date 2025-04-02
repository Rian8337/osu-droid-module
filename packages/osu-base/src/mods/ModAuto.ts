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

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 1;
    }

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 1;
    }
}
