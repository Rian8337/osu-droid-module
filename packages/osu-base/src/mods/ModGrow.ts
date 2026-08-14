import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { ModObjectScaleTween } from "./ModObjectScaleTween";
import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents the Grow mod.
 */
export class ModGrow
    extends ModObjectScaleTween
    implements IModApplicableToOsu {
    override readonly name = "Grow";
    override readonly acronym = "GR";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;

    override readonly startScale = new DecimalModSetting(
        "Start scale",
        "startScale",
        "The initial size multiplier applied to all hit objects.",
        0.5,
        0,
        0.99,
        0.01,
        2,
    );
}
