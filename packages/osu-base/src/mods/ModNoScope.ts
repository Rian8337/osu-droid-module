import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModBloom } from "./ModBloom";

import { IntegerModSetting } from "./settings/IntegerModSetting";

/**
 * Represents the No Scope mod.
 */
export class ModNoScope extends Mod implements IModApplicableToOsu {
    override readonly acronym = "NS";
    override readonly name = "No Scope";

    readonly osuRanked = true;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * The combo count at which the cursor becomes completely hidden.
     */
    readonly hiddenComboCount = new IntegerModSetting(
        "Hidden at combo",
        "hiddenComboCount",
        "The combo count at which the cursor becomes completely hidden",
        10,
        0,
        50,
    );

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModBloom) &&
            super.isCompatibleWith(other)
        );
    }
}
