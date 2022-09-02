import { Mod } from "./Mod";

/**
 * Represents the Auto mod.
 */
export class ModAuto extends Mod {
    override readonly acronym: string = "AT";
    override readonly name: string = "Autoplay";
    override readonly droidRanked: boolean = false;
    override readonly pcRanked: boolean = false;
    override readonly droidScoreMultiplier: number = 1;
    override readonly pcScoreMultiplier: number = 1;
    override readonly bitwise: number = 1 << 11;
    override readonly droidString: string = "a";
    override readonly droidOnly: boolean = false;
}
