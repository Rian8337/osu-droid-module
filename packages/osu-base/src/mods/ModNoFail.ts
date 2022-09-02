import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the NoFail mod.
 */
export class ModNoFail
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "NF";
    override readonly name: string = "NoFail";

    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly droidScoreMultiplier: number = 0.5;
    readonly pcScoreMultiplier: number = 0.5;
    readonly bitwise: number = 1 << 0;
    readonly droidString: string = "n";
}
