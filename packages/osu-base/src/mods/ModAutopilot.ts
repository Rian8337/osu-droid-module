import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModAuto } from "./ModAuto";
import { ModRelax } from "./ModRelax";

/**
 * Represents the Autopilot mod.
 */
export class ModAutopilot
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable {
    override readonly acronym = "AP";
    override readonly name = "Autopilot";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly bitwise = 1 << 13;

    constructor() {
        super();

        this.incompatibleMods.add(ModRelax).add(ModAuto);
    }
}
