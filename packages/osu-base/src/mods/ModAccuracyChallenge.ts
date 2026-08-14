import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModPerfect } from "./ModPerfect";
import { DecimalModSetting } from "./settings/DecimalModSetting";
import { EnumModSetting } from "./settings/EnumModSetting";

/**
 * The mode of accuracy that triggers a failure in {@link ModAccuracyChallenge}.
 */
export enum AccuracyMode {
    MaximumAchievable,
    Standard,
}

/**
 * Represents the Accuracy Challenge mod.
 */
export class ModAccuracyChallenge extends Mod implements IModApplicableToOsu {
    override readonly acronym = "AC";
    override readonly name = "Accuracy Challenge";

    readonly osuRanked = true;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * Trigger a failure if accuracy goes below this value.
     */
    readonly minimumAccuracy = new DecimalModSetting(
        "Minimum accuracy",
        "minimumAccuracy",
        "Trigger a failure if your accuracy goes below this value.",
        0.9,
        0.6,
        0.999,
        0.001,
        3,
    );

    /**
     * The mode of accuracy that will trigger failure.
     */
    readonly accuracyJudgeMode = new EnumModSetting<AccuracyMode>(
        "Accuracy mode",
        "accuracyJudgeMode",
        "The mode of accuracy that will trigger failure.",
        AccuracyMode.MaximumAchievable,
        [AccuracyMode.MaximumAchievable, AccuracyMode.Standard],
        (v) => AccuracyMode[v],
    );

    constructor() {
        super();

        this.incompatibleMods.add(ModPerfect);
    }
}
