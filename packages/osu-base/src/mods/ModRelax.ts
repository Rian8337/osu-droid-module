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
    implements IModApplicableToDroid, IModApplicableToOsuStable {
    override readonly acronym = "RX";
    override readonly name = "Relax";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly bitwise = 1 << 7;

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModAuto, ModAutopilot) &&
            super.isCompatibleWith(other)
        );
    }
}
