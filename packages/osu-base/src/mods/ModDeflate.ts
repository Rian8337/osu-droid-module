import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { ModObjectScaleTween } from "./ModObjectScaleTween";
import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents the Deflate mod.
 */
export class ModDeflate
    extends ModObjectScaleTween
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly name = "Deflate";
    override readonly acronym = "DF";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;
    readonly droidScoreMultiplier = 1;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    override readonly startScale = new DecimalModSetting(
        "Start scale",
        "The initial size multiplier applied to all hit objects.",
        2,
        1,
        25,
        0.1,
        1,
    );
}
