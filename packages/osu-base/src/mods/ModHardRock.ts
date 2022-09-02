import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the HardRock mod.
 */
export class ModHardRock
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "HR";
    override readonly name: string = "HardRock";

    readonly bitwise: number = 1 << 4;
    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly droidScoreMultiplier: number = 1.06;
    readonly pcScoreMultiplier: number = 1.06;
    readonly droidString: string = "r";
}
