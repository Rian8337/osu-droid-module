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
    implements IModApplicableToDroid, IModApplicableToOsuStable {
    override readonly acronym = "AT";
    override readonly name = "Autoplay";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly bitwise = 1 << 11;

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModAutopilot, ModRelax) &&
            super.isCompatibleWith(other)
        );
    }
}
