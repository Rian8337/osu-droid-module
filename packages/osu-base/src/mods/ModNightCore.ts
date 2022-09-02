import { Mod } from "./Mod";

/**
 * Represents the NightCore mod.
 */
export class ModNightCore extends Mod {
    override readonly scoreMultiplier: number = 1.12;
    override readonly acronym: string = "NC";
    override readonly name: string = "NightCore";
    override readonly droidRanked: boolean = true;
    override readonly pcRanked: boolean = true;
    override readonly droidScoreMultiplier: number = 1.12;
    override readonly pcScoreMultiplier: number = 1.12;
    override readonly bitwise: number = 1 << 9;
    override readonly droidString: string = "c";
    override readonly droidOnly: boolean = false;
}
