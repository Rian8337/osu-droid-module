import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";

/**
 * Represents the Flashlight mod.
 */
export class ModFlashlight
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsuStable
{
    /**
     * The default amount of seconds until the Flashlight follow area reaches the cursor.
     */
    static readonly defaultFollowDelay = 0.12;

    override readonly acronym = "FL";
    override readonly name = "Flashlight";

    readonly droidRanked = true;
    readonly droidString = "i";

    readonly pcRanked = true;
    readonly pcScoreMultiplier = 1.12;
    readonly bitwise = 1 << 10;

    /**
     * The amount of seconds until the Flashlight follow area reaches the cursor.
     */
    followDelay = ModFlashlight.defaultFollowDelay;

    calculateDroidScoreMultiplier(): number {
        return 1.12;
    }
}
