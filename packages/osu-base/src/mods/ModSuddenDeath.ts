import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModNoFail } from "./ModNoFail";
import { ModPerfect } from "./ModPerfect";
import { BooleanModSetting } from "./settings/BooleanModSetting";

/**
 * Represents the SuddenDeath mod.
 */
export class ModSuddenDeath
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable {
    override readonly acronym = "SD";
    override readonly name = "Sudden Death";

    readonly droidRanked = true;
    readonly isDroidRelevant = true;

    readonly osuRanked = true;
    readonly isOsuRelevant = true;
    readonly bitwise = 1 << 5;

    /**
     * Whether a miss on a slider's tail should also trigger a fail.
     */
    readonly failOnSliderTail = new BooleanModSetting(
        "Also fail when missing a slider tail",
        "failOnSliderTail",
        "Whether a miss on a slider's tail should also trigger a fail.",
        false,
    );

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModNoFail, ModPerfect) &&
            super.isCompatibleWith(other)
        );
    }
}
