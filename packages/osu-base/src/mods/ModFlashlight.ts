import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModBlinds } from "./ModBlinds";

import { BooleanModSetting } from "./settings/BooleanModSetting";
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
        "areaFollowDelay",
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
        "sizeMultiplier",
        "The multiplier applied to the default Flashlight size.",
        1,
        0.5,
        2,
        0.1,
        1,
    );

    /**
     * Whether to decrease the Flashlight size as combo increases.
     */
    readonly comboBasedSize = new BooleanModSetting(
        "Change size based on combo",
        "comboBasedSize",
        "Whether to decrease the Flashlight size as combo increases.",
        true,
    );

    constructor() {
        super();

        this.incompatibleMods.add(ModBlinds);
    }

    override toString(): string {
        if (this.usesDefaultSettings) {
            return super.toString();
        }

        const parts: string[] = [];

        if (!this.followDelay.isDefault) {
            parts.push(`${this.followDelay.toDisplayString()}s follow delay`);
        }

        if (!this.sizeMultiplier.isDefault) {
            parts.push(`${this.sizeMultiplier.toDisplayString()}x size`);
        }

        if (!this.comboBasedSize.isDefault) {
            parts.push(
                `${this.comboBasedSize.value ? "decrease" : "no"} size change with combo`,
            );
        }

        return `${super.toString()} (${parts.join(", ")})`;
    }
}
