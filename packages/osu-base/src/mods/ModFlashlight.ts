import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModBlinds } from "./ModBlinds";
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

    get droidRanked(): boolean {
        return this.usesDefaultSettings;
    }

    readonly isDroidRelevant = true;
    readonly droidScoreMultiplier = 1.12;

    get osuRanked(): boolean {
        return this.usesDefaultSettings;
    }

    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1.12;
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

    constructor() {
        super();

        this.incompatibleMods.add(ModBlinds);
    }

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        this.followDelay.value =
            (mod.settings?.areaFollowDelay as number | undefined) ??
            this.followDelay.value;
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        return { areaFollowDelay: this.followDelay.value };
    }

    override toString(): string {
        if (this.followDelay.value === ModFlashlight.defaultFollowDelay) {
            return super.toString();
        }

        return `${super.toString()} (${this.followDelay.toDisplayString()}s follow delay)`;
    }
}
