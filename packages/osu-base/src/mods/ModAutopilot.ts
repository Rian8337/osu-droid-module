import { Mod } from "./Mod";

/**
 * Represents the Autopilot mod.
 */
export class ModAutopilot extends Mod {
    override readonly acronym: string = "AP";
    override readonly name: string = "Autopilot";
    override readonly droidRanked: boolean = false;
    override readonly pcRanked: boolean = false;
    override readonly droidScoreMultiplier: number = 0.001;
    override readonly pcScoreMultiplier: number = 0;
    override readonly bitwise: number = 1 << 13;
    override readonly droidString: string = "p";
    override readonly droidOnly: boolean = false;
}
