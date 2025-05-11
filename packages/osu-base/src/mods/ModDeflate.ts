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

    override readonly startScale = new DecimalModSetting(
        "Start scale",
        "The initial size multiplier applied to all hit objects.",
        2,
        1,
        25,
        0.1,
        1,
    );

    get droidRanked(): boolean {
        return false;
    }

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 1;
    }

    get osuRanked(): boolean {
        return false;
    }

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 1;
    }
}
