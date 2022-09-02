import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the ScoreV2 mod.
 */
export class ModScoreV2
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "V2";
    override readonly name: string = "ScoreV2";

    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = false;
    readonly droidScoreMultiplier: number = 1;
    readonly pcScoreMultiplier: number = 1;
    readonly bitwise: number = 1 << 29;
    readonly droidString: string = "v";
}
