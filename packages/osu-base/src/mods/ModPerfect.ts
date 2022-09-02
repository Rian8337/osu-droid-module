import { Mod } from "./Mod";

/**
 * Represents the Perfect mod.
 */
export class ModPerfect extends Mod {
    override readonly acronym: string = "PF";
    override readonly name: string = "Perfect";
    override readonly droidRanked: boolean = false;
    override readonly pcRanked: boolean = true;
    override readonly droidScoreMultiplier: number = 1;
    override readonly pcScoreMultiplier: number = 1;
    override readonly bitwise: number = 1 << 14;
    override readonly droidString: string = "f";
    override readonly droidOnly: boolean = false;
}
