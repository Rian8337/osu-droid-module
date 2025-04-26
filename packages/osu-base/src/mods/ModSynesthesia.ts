import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Synesthesia mod in osu! and osu!droid.
 */
export class ModSynesthesia
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly name = "Synesthesia";
    override readonly acronym = "SY";

    readonly droidRanked = false;
    readonly osuRanked = false;

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 0.8;
    }

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 0.8;
    }
}
