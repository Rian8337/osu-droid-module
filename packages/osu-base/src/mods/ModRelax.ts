import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Relax mod.
 */
export class ModRelax
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "RX";
    override readonly name: string = "Relax";

    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = false;
    readonly droidScoreMultiplier: number = 0.001;
    readonly pcScoreMultiplier: number = 0;
    readonly bitwise: number = 1 << 7;
    readonly droidString: string = "x";
}
