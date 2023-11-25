import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";

/**
 * Represents the SmallCircle mod.
 *
 * This is a legacy osu!droid mod that may still be exist when parsing replays.
 */
export class ModSmallCircle extends Mod implements IModApplicableToDroid {
    override readonly acronym: string = "SC";
    override readonly name: string = "SmallCircle";

    readonly droidRanked: boolean = false;
    readonly droidScoreMultiplier: number = 1.06;
    readonly droidString: string = "m";
    readonly isDroidLegacyMod: boolean = true;
}
