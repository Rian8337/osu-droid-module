import { Mod } from "./Mod";

/**
 * Represents the NoFail mod.
 */
export class ModNoFail extends Mod {
    override readonly acronym: string = "NF";
    override readonly name: string = "NoFail";
    override readonly droidRanked: boolean = true;
    override readonly pcRanked: boolean = true;
    override readonly droidScoreMultiplier: number = 0.5;
    override readonly pcScoreMultiplier: number = 0.5;
    override readonly bitwise: number = 1 << 0;
    override readonly droidString: string = "n";
    override readonly droidOnly: boolean = false;
}
