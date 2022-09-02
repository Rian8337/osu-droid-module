import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the DoubleTime mod.
 */
export class ModDoubleTime
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "DT";
    override readonly name: string = "DoubleTime";

    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly droidScoreMultiplier: number = 1.12;
    readonly pcScoreMultiplier: number = 1.12;
    readonly bitwise: number = 1 << 6;
    readonly droidString: string = "d";
}
