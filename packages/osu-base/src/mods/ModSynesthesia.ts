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
    readonly isDroidRelevant = true;
    readonly droidScoreMultiplier = 0.8;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 0.8;
}
