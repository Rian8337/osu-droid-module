import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the TouchDevice mod.
 */
export class ModTouchDevice extends Mod implements IModApplicableToOsu {
    override readonly acronym: string = "TD";
    override readonly name: string = "TouchDevice";

    readonly pcRanked: boolean = true;
    readonly pcScoreMultiplier: number = 1;
    readonly bitwise: number = 1 << 2;
}
