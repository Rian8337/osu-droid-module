import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModAuto } from "./ModAuto";
import { ModAutopilot } from "./ModAutopilot";
import { ModBubbles } from "./ModBubbles";
import { ModDepth } from "./ModDepth";
import { ModMagnetised } from "./ModMagnetised";
import { ModTransform } from "./ModTransform";
import { ModWiggle } from "./ModWiggle";

import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents the Repel mod.
 */
export class ModRepel extends Mod implements IModApplicableToOsu {
    override readonly acronym = "RP";
    override readonly name = "Repel";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * How strong the repulsion is.
     */
    readonly repulsionStrength = new DecimalModSetting(
        "Repulsion strength",
        "repulsionStrength",
        "How strong the repulsion is.",
        0.5,
        0.05,
        1,
        0.05,
        2,
    );

    constructor() {
        super();

        this.incompatibleMods
            .add(ModAutopilot)
            .add(ModWiggle)
            .add(ModTransform)
            .add(ModAuto)
            .add(ModMagnetised)
            .add(ModBubbles)
            .add(ModDepth);
    }
}
