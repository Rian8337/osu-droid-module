import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";

/**
 * Represents the SpeedUp mod.
 *
 * This is a legacy osu!droid mod that may still be exist when parsing replays.
 */
export class ModSpeedUp extends Mod implements IModApplicableToDroid {
    override readonly acronym: string = "SU";
    override readonly name: string = "Speed Up";

    readonly droidRanked: boolean = false;
    readonly droidScoreMultiplier: number = 1.06;
    readonly droidString: string = "b";
}
