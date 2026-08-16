import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModFreezeFrame } from "./ModFreezeFrame";
import { ModMagnetised } from "./ModMagnetised";
import { ModRepel } from "./ModRepel";

import { BooleanModSetting } from "./settings/BooleanModSetting";
import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents the Depth mod.
 */
export class ModDepth extends Mod implements IModApplicableToOsu {
    override readonly acronym = "DP";
    override readonly name = "Depth";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * How far away objects appear.
     */
    readonly maxDepth = new DecimalModSetting(
        "Maximum depth",
        "maxDepth",
        "How far away objects appear.",
        100,
        50,
        200,
        10,
        0,
    );

    /**
     * Whether approach circles should be visible.
     */
    readonly showApproachCircles = new BooleanModSetting(
        "Show Approach Circles",
        "showApproachCircles",
        "Whether approach circles should be visible.",
        true,
    );

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(
                other,
                ModMagnetised,
                ModRepel,
                ModFreezeFrame,
            ) && super.isCompatibleWith(other)
        );
    }
}
