import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";

/**
 * Represents the ReallyEasy mod.
 */
export class ModReallyEasy extends Mod implements IModApplicableToDroid {
    override readonly acronym: string = "RE";
    override readonly name: string = "ReallyEasy";

    readonly droidRanked: boolean = false;
    readonly droidScoreMultiplier: number = 0.4;
    readonly droidString: string = "l";
}
