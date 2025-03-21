import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";

/**
 * Represents the ScoreV2 mod.
 */
export class ModScoreV2
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    override readonly acronym = "V2";
    override readonly name = "ScoreV2";

    readonly droidRanked = false;
    readonly droidScoreMultiplier = 1;
    readonly droidString = "v";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = false;
    readonly pcScoreMultiplier = 1;
    readonly bitwise = 1 << 29;
}
