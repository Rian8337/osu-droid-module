import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Auto mod.
 */
export class ModAuto
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "AT";
    override readonly name: string = "Autoplay";

    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = false;
    readonly droidScoreMultiplier: number = 1;
    readonly pcScoreMultiplier: number = 1;
    readonly bitwise: number = 1 << 11;
    readonly droidString: string = "a";
}
