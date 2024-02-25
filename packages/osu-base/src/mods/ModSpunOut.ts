import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the SpunOut mod.
 */
export class ModSpunOut extends Mod implements IModApplicableToOsu {
    override readonly acronym = "SO";
    override readonly name = "SpunOut";

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 0.9;
    readonly bitwise = 1 << 12;
}
