import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModDepth } from "./ModDepth";
import { ModMagnetised } from "./ModMagnetised";
import { ModRepel } from "./ModRepel";
import { ModTransform } from "./ModTransform";

import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents the Wiggle mod.
 */
export class ModWiggle extends Mod implements IModApplicableToOsu {
    override readonly acronym = "WG";
    override readonly name = "Wiggle";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * Multiplier applied to the wiggling strength.
     */
    readonly strength = new DecimalModSetting(
        "Strength",
        "strength",
        "Multiplier applied to the wiggling strength.",
        1,
        0.1,
        2,
        0.1,
        1,
    );

    constructor() {
        super();

        this.incompatibleMods
            .add(ModTransform)
            .add(ModMagnetised)
            .add(ModRepel)
            .add(ModDepth);
    }
}
