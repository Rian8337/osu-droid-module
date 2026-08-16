import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModStrictTracking } from "./ModStrictTracking";

import { BooleanModSetting } from "./settings/BooleanModSetting";

/**
 * Represents the Classic mod.
 *
 * Classic mods are not to be ranked yet due to compatibility and multiplier concerns. Right now
 * they are considered, for leaderboard purposes, to be equal to scores set on osu!stable, but
 * this is not the case (e.g. hit windows differ, sliders always give combo for the slider end
 * even on miss).
 */
export class ModClassic extends Mod implements IModApplicableToOsu {
    override readonly acronym = "CL";
    override readonly name = "Classic";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * Scores sliders proportionally to the number of ticks hit.
     */
    readonly noSliderHeadAccuracy = new BooleanModSetting(
        "No slider head accuracy requirement",
        "noSliderHeadAccuracy",
        "Scores sliders proportionally to the number of ticks hit.",
        true,
    );

    /**
     * Applies note lock to the full hit window.
     */
    readonly classicNoteLock = new BooleanModSetting(
        "Apply classic note lock",
        "classicNoteLock",
        "Applies note lock to the full hit window.",
        true,
    );

    /**
     * Always plays a slider's tail sample regardless of whether it was hit or not.
     */
    readonly alwaysPlayTailSample = new BooleanModSetting(
        "Always play a slider's tail sample",
        "alwaysPlayTailSample",
        "Always plays a slider's tail sample regardless of whether it was hit or not.",
        true,
    );

    /**
     * Make hit circles fade out into a miss, rather than after it.
     */
    readonly fadeHitCircleEarly = new BooleanModSetting(
        "Fade out hit circles earlier",
        "fadeHitCircleEarly",
        "Make hit circles fade out into a miss, rather than after it.",
        true,
    );

    /**
     * More closely resembles the original HP drain mechanics.
     */
    readonly classicHealth = new BooleanModSetting(
        "Classic health",
        "classicHealth",
        "More closely resembles the original HP drain mechanics.",
        true,
    );

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModStrictTracking) &&
            super.isCompatibleWith(other)
        );
    }
}
