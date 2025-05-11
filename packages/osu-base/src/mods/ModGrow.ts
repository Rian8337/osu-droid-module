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

    override readonly startScale = new DecimalModSetting(
        "Start scale",
        "The initial size multiplier applied to all hit objects.",
        0.5,
        0,
        0.99,
        0.01,
        2,
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
