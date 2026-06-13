import { Easing } from "../constants/Easing";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModFreezeFrame } from "./ModFreezeFrame";
import { ModHidden } from "./ModHidden";

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

    readonly droidRanked = false;
    readonly droidScoreMultiplier = 1;
    readonly migrationDroidScoreMultiplier = 1;
    readonly isDroidRelevant = true;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * The initial size of the approach circle, relative to hit circles.
     */
    readonly scale = new DecimalModSetting(
        "Initial size",
        "scale",
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
        "style",
        "The animation style of the approach circles.",
        AnimationStyle.Gravity,
    );

    /**
     * The {@link Easing} to apply to the approach circle animation.
     */
    get easing(): Easing {
        switch (this.style.value) {
            case AnimationStyle.Linear:
                return Easing.None;

            case AnimationStyle.Gravity:
                return Easing.InBack;

            case AnimationStyle.InOut1:
                return Easing.InOutCubic;

            case AnimationStyle.InOut2:
                return Easing.InOutQuint;

            case AnimationStyle.Accelerate1:
                return Easing.In;

            case AnimationStyle.Accelerate2:
                return Easing.InCubic;

            case AnimationStyle.Accelerate3:
                return Easing.InQuint;

            case AnimationStyle.Decelerate1:
                return Easing.Out;

            case AnimationStyle.Decelerate2:
                return Easing.OutCubic;

            case AnimationStyle.Decelerate3:
                return Easing.OutQuint;
        }
    }

    constructor() {
        super();

        this.incompatibleMods.add(ModHidden).add(ModFreezeFrame);
    }
}

export enum AnimationStyle {
    Linear,
    Gravity,
    InOut1,
    InOut2,
    Accelerate1,
    Accelerate2,
    Accelerate3,
    Decelerate1,
    Decelerate2,
    Decelerate3,
}
