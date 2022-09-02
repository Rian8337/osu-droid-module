import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";

/**
 * Represents the Precise mod.
 */
export class ModPrecise extends Mod implements IModApplicableToDroid {
    override readonly acronym: string = "PR";
    override readonly name: string = "Precise";

    readonly droidRanked: boolean = true;
    readonly droidScoreMultiplier: number = 1.06;
    readonly droidString: string = "s";
}
