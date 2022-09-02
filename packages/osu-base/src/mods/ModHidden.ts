import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Hidden mod.
 */
export class ModHidden
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    static readonly fadeInDurationMultiplier: number = 0.4;
    static readonly fadeOutDurationMultiplier: number = 0.3;

    override readonly acronym: string = "HD";
    override readonly name: string = "Hidden";

    readonly bitwise: number = 1 << 3;
    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly droidScoreMultiplier: number = 1.06;
    readonly pcScoreMultiplier: number = 1.06;
    readonly droidString: string = "h";
}
