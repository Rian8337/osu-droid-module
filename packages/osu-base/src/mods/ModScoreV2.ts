import { Mod } from "./Mod";

/**
 * Represents the ScoreV2 mod.
 */
export class ModScoreV2 extends Mod {
    override readonly acronym: string = "V2";
    override readonly name: string = "ScoreV2";
    override readonly droidRanked: boolean = false;
    override readonly pcRanked: boolean = false;
    override readonly droidScoreMultiplier: number = 1;
    override readonly pcScoreMultiplier: number = 1;
    override readonly bitwise: number = 1 << 29;
    override readonly droidString: string = "v";
    override readonly droidOnly: boolean = false;
}
