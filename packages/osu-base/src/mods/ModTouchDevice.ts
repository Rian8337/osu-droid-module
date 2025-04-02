import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";

/**
 * Represents the TouchDevice mod.
 */
export class ModTouchDevice extends Mod implements IModApplicableToOsuStable {
    override readonly acronym = "TD";
    override readonly name = "TouchDevice";

    readonly osuRanked = true;
    readonly bitwise = 1 << 2;

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 1;
    }
}
