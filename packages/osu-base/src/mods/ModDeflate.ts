import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { ModObjectScaleTween } from "./ModObjectScaleTween";
import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents the Deflate mod.
 */
export class ModDeflate
    extends ModObjectScaleTween
    implements IModApplicableToOsu {
    override readonly name = "Deflate";
    override readonly acronym = "DF";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;

    override readonly startScale = new DecimalModSetting(
        "Start scale",
        "startScale",
        "The initial size multiplier applied to all hit objects.",
        2,
        1,
        25,
        0.1,
        1,
    );
}
