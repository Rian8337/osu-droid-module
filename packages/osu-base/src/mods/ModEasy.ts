import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Easy mod.
 */
export class ModEasy
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "EZ";
    override readonly name: string = "Easy";

    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly droidScoreMultiplier: number = 0.5;
    readonly pcScoreMultiplier: number = 0.5;
    readonly bitwise: number = 1 << 1;
    readonly droidString: string = "e";
}
