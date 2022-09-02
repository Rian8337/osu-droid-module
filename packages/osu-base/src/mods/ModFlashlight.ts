import { Mod } from "./Mod";

/**
 * Represents the Flashlight mod.
 */
export class ModFlashlight extends Mod {
    override readonly acronym: string = "FL";
    override readonly name: string = "Flashlight";
    override readonly droidRanked: boolean = false;
    override readonly pcRanked: boolean = true;
    override readonly droidScoreMultiplier: number = 1.12;
    override readonly pcScoreMultiplier: number = 1.12;
    override readonly bitwise: number = 1 << 10;
    override readonly droidString: string = "i";
    override readonly droidOnly: boolean = false;
}
