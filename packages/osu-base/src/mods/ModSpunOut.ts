import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";

/**
 * Represents the SpunOut mod.
 */
export class ModSpunOut extends Mod implements IModApplicableToOsuStable {
    override readonly acronym = "SO";
    override readonly name = "SpunOut";

    readonly osuRanked = true;
    readonly bitwise = 1 << 12;

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 0.9;
    }
}
