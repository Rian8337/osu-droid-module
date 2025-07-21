import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { ModObjectScaleTween } from "./ModObjectScaleTween";
import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents the Grow mod.
 */
export class ModGrow
    extends ModObjectScaleTween
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly name = "Grow";
    override readonly acronym = "GR";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;
    readonly droidScoreMultiplier = 1;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    override readonly startScale = new DecimalModSetting(
        "Start scale",
        "The initial size multiplier applied to all hit objects.",
        0.5,
        0,
        0.99,
        0.01,
        2,
    );
}
