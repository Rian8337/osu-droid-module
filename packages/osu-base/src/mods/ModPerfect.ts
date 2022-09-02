import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Perfect mod.
 */
export class ModPerfect
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "PF";
    override readonly name: string = "Perfect";

    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = true;
    readonly droidScoreMultiplier: number = 1;
    readonly pcScoreMultiplier: number = 1;
    readonly bitwise: number = 1 << 14;
    readonly droidString: string = "f";
}
