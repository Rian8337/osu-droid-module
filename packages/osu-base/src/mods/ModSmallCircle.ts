import { Mod } from "./Mod";

/**
 * Represents the SmallCircle mod.
 */
export class ModSmallCircle extends Mod {
    override readonly scoreMultiplier: number = 1.06;
    override readonly acronym: string = "SC";
    override readonly name: string = "SmallCircle";
    override readonly droidRanked: boolean = false;
    override readonly pcRanked: boolean = false;
    override readonly droidScoreMultiplier: number = 1.06;
    override readonly pcScoreMultiplier: number = 1;
    override readonly bitwise: number = Number.NaN;
    override readonly droidString: string = "m";
    override readonly droidOnly: boolean = true;
}
