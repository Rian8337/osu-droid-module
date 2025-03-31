import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";

/**
 * Represents the SpunOut mod.
 */
export class ModSpunOut extends Mod implements IModApplicableToOsuStable {
    override readonly acronym = "SO";
    override readonly name = "SpunOut";

    readonly osuRanked = true;
    readonly pcScoreMultiplier = 0.9;
    readonly bitwise = 1 << 12;
}
