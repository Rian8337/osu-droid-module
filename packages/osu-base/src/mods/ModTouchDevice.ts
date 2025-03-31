import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";

/**
 * Represents the TouchDevice mod.
 */
export class ModTouchDevice extends Mod implements IModApplicableToOsuStable {
    override readonly acronym = "TD";
    override readonly name = "TouchDevice";

    readonly osuRanked = true;
    readonly pcScoreMultiplier = 1;
    readonly bitwise = 1 << 2;
}
