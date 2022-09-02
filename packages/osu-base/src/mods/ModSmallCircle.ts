import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";

/**
 * Represents the SmallCircle mod.
 */
export class ModSmallCircle extends Mod implements IModApplicableToDroid {
    override readonly acronym: string = "SC";
    override readonly name: string = "SmallCircle";

    readonly droidRanked: boolean = false;
    readonly droidScoreMultiplier: number = 1.06;
    readonly droidString: string = "m";
}
