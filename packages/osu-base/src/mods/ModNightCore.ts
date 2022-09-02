import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the NightCore mod.
 */
export class ModNightCore
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "NC";
    override readonly name: string = "NightCore";

    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly droidScoreMultiplier: number = 1.12;
    readonly pcScoreMultiplier: number = 1.12;
    readonly bitwise: number = 1 << 9;
    readonly droidString: string = "c";
}
