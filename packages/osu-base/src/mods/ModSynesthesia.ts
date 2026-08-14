import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Synesthesia mod in osu! and osu!droid.
 */
export class ModSynesthesia
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu {
    override readonly name = "Synesthesia";
    override readonly acronym = "SY";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
}
