import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModAuto } from "./ModAuto";
import { ModAutopilot } from "./ModAutopilot";

/**
 * Represents the Relax mod.
 */
export class ModRelax
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    override readonly acronym = "RX";
    override readonly name = "Relax";

    readonly droidRanked = false;
    readonly droidScoreMultiplier = 0.001;
    readonly droidString = "x";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = false;
    readonly pcScoreMultiplier = 0;
    readonly bitwise = 1 << 7;

    constructor() {
        super();

        this.incompatibleMods.add(ModAuto).add(ModAutopilot);
    }
}
