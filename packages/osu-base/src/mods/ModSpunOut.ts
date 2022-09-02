import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the SpunOut mod.
 */
export class ModSpunOut extends Mod implements IModApplicableToOsu {
    override readonly acronym: string = "SO";
    override readonly name: string = "SpunOut";

    readonly pcRanked: boolean = true;
    readonly pcScoreMultiplier: number = 0.9;
    readonly bitwise: number = 1 << 12;
}
