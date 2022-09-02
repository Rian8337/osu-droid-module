import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the SuddenDeath mod.
 */
export class ModSuddenDeath
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "SD";
    override readonly name: string = "Sudden Death";

    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = true;
    readonly droidScoreMultiplier: number = 1;
    readonly pcScoreMultiplier: number = 1;
    readonly bitwise: number = 1 << 5;
    readonly droidString: string = "u";
}
