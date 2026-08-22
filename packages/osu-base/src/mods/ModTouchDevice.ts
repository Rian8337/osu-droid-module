import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";

/**
 * Represents the TouchDevice mod.
 */
export class ModTouchDevice extends Mod implements IModApplicableToOsuStable {
    override readonly acronym = "TD";
    override readonly name = "Touch Device";

    readonly osuRanked = true;
    readonly bitwise = 1 << 2;

    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;
}
