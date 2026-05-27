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

    get droidScoreMultiplier(): number {
        return this.usesDefaultSettings ? 1.12 : 1;
    }

    get migrationDroidScoreMultiplier(): number {
        return this.droidScoreMultiplier;
    }

    get osuRanked(): boolean {
        return this.usesDefaultSettings;
    }

    readonly isOsuRelevant = true;

    get osuScoreMultiplier(): number {
        return this.usesDefaultSettings ? 1.12 : 1;
    }

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

    /**
     * The multiplier applied to the default Flashlight size.
     */
    readonly sizeMultiplier = new DecimalModSetting(
        "Flashlight size",
        "The multiplier applied to the default Flashlight size.",
        1,
        0.5,
        2,
        0.1,
        1,
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

        this.sizeMultiplier.value =
            (mod.settings?.sizeMultiplier as number | undefined) ??
            this.sizeMultiplier.value;
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        return {
            areaFollowDelay: this.followDelay.value,
            sizeMultiplier: this.sizeMultiplier.value,
        };
    }

    override toString(): string {
        if (this.usesDefaultSettings) {
            return super.toString();
        }

        return `${super.toString()} (${this.followDelay.toDisplayString()}s follow delay, ${this.sizeMultiplier.toDisplayString()}x size)`;
    }
}
