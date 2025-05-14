import { Easing } from "../constants/Easing";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModFreezeFrame } from "./ModFreezeFrame";
import { ModHidden } from "./ModHidden";
import { SerializedMod } from "./SerializedMod";
import { DecimalModSetting } from "./settings/DecimalModSetting";
import { ModSetting } from "./settings/ModSetting";

/**
 * Represents the Approach Different mod.
 */
export class ModApproachDifferent
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly name = "Approach Different";
    override readonly acronym = "AD";

    /**
     * The initial size of the approach circle, relative to hit circles.
     */
    readonly scale = new DecimalModSetting(
        "Initial size",
        "The initial size of the approach circle, relative to hit circles.",
        3,
        1.5,
        10,
        0.1,
        1,
    );

    /**
     * The animation style of the approach circles.
     */
    readonly style = new ModSetting(
        "Style",
        "The animation style of the approach circles.",
        AnimationStyle.gravity,
    );

    /**
     * The {@link Easing} to apply to the approach circle animation.
     */
    get easing(): Easing {
        switch (this.style.value) {
            case AnimationStyle.linear:
                return Easing.none;

            case AnimationStyle.gravity:
                return Easing.inBack;

            case AnimationStyle.inOut1:
                return Easing.inOutCubic;

            case AnimationStyle.inOut2:
                return Easing.inOutQuint;

            case AnimationStyle.accelerate1:
                return Easing.in;

            case AnimationStyle.accelerate2:
                return Easing.inCubic;

            case AnimationStyle.accelerate3:
                return Easing.inQuint;

            case AnimationStyle.decelerate1:
                return Easing.out;

            case AnimationStyle.decelerate2:
                return Easing.outCubic;

            case AnimationStyle.decelerate3:
                return Easing.outQuint;
        }
    }

    constructor() {
        super();

        this.incompatibleMods.add(ModHidden).add(ModFreezeFrame);
    }

    get droidRanked(): boolean {
        return false;
    }

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 1;
    }

    get osuRanked(): boolean {
        return false;
    }

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 1;
    }

    override copySettings(mod: SerializedMod) {
        super.copySettings(mod);

        const { settings } = mod;

        if (typeof settings?.scale === "number") {
            this.scale.value = settings.scale;
        }

        if (typeof settings?.style === "number") {
            this.style.value = settings.style;
        }
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        return {
            scale: this.scale.value,
            style: this.style.value,
        };
    }
}

export enum AnimationStyle {
    linear,
    gravity,
    inOut1,
    inOut2,
    accelerate1,
    accelerate2,
    accelerate3,
    decelerate1,
    decelerate2,
    decelerate3,
}
