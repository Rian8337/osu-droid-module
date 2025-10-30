import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents the Magnetised mod.
 */
export class ModMagnetised extends Mod implements IModApplicableToOsu {
    override readonly acronym = "MG";
    override readonly name = "Magnetised";

    readonly osuScoreMultiplier = 0.5;
    readonly osuRanked = false;
    readonly isOsuRelevant = true;

    /**
     * How strong the pull is.
     */
    readonly attractionStrength = new DecimalModSetting(
        "Attraction Strength",
        "How strong the pull is.",
        0.5,
        0.05,
        1,
        0.05,
        2,
    );
}
