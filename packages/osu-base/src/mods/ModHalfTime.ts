import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the HalfTime mod.
 */
export class ModHalfTime
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "HT";
    override readonly name: string = "HalfTime";

    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly droidScoreMultiplier: number = 0.3;
    readonly pcScoreMultiplier: number = 0.3;
    readonly bitwise: number = 1 << 8;
    readonly droidString: string = "t";
}
