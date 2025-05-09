import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { SerializedMod } from "./SerializedMod";
import { DecimalModSetting } from "./settings/DecimalModSetting";

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
    readonly followDelay = new DecimalModSetting(
        "Flashlight follow delay",
        "The amount of seconds until the Flashlight follow area reaches the cursor.",
        ModFlashlight.defaultFollowDelay,
        ModFlashlight.defaultFollowDelay,
        ModFlashlight.defaultFollowDelay * 10,
        ModFlashlight.defaultFollowDelay,
        2,
    );

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        this.followDelay.value =
            (mod.settings?.areaFollowDelay as number | undefined) ??
            this.followDelay.value;
    }

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 1.12;
    }

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 1.12;
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        return { areaFollowDelay: this.followDelay.value };
    }

    override equals(other: Mod): other is this {
        return (
            super.equals(other) &&
            other instanceof ModFlashlight &&
            other.followDelay.value === this.followDelay.value
        );
    }

    override toString(): string {
        if (this.followDelay.value === ModFlashlight.defaultFollowDelay) {
            return super.toString();
        }

        return `${super.toString()} (${this.followDelay.toDisplayString()}s follow delay)`;
    }
}
