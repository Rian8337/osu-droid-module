import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Autopilot mod.
 */
export class ModAutopilot
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "AP";
    override readonly name: string = "Autopilot";

    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = false;
    readonly droidScoreMultiplier: number = 0.001;
    readonly pcScoreMultiplier: number = 0;
    readonly bitwise: number = 1 << 13;
    readonly droidString: string = "p";
}
