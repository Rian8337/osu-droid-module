import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { SerializedMod } from "./SerializedMod";

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

    readonly osuRanked = true;
    readonly bitwise = 1 << 10;

    /**
     * The amount of seconds until the Flashlight follow area reaches the cursor.
     */
    followDelay = ModFlashlight.defaultFollowDelay;

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        this.followDelay =
            (mod.settings?.areaFollowDelay as number | undefined) ??
            this.followDelay;
    }

    calculateDroidScoreMultiplier(): number {
        return 1.12;
    }

    get osuScoreMultiplier(): number {
        return 1.12;
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        return { areaFollowDelay: this.followDelay };
    }
}
