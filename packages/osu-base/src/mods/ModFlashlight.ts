import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Flashlight mod.
 */
export class ModFlashlight
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym: string = "FL";
    override readonly name: string = "Flashlight";

    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = true;
    readonly droidScoreMultiplier: number = 1.12;
    readonly pcScoreMultiplier: number = 1.12;
    readonly bitwise: number = 1 << 10;
    readonly droidString: string = "i";
}
