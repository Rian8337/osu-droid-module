import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDifficultyWithSettings } from "./IModApplicableToDifficultyWithSettings";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObject } from "./IModApplicableToHitObject";
import { IModApplicableToHitObjectWithSettings } from "./IModApplicableToHitObjectWithSettings";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";

/**
 * Represents a mod.
 */
export abstract class Mod {
    /**
     * The acronym of this `Mod`.
     */
    abstract readonly acronym: string;

    /**
     * The name of this `Mod`.
     */
    abstract readonly name: string;

    /**
     * `Mod`s that are incompatible with this `Mod`.
     */
    readonly incompatibleMods = new Set<typeof Mod>();

    /**
     * Whether this `Mod` can be applied to osu!droid.
     */
    isApplicableToDroid(): this is this & IModApplicableToDroid {
        return "droidRanked" in this;
    }

    /**
     * Whether this `Mod` can be applied to osu!standard.
     */
    isApplicableToOsu(): this is this & IModApplicableToOsu {
        return "pcRanked" in this;
    }

    /**
     * Whether this `Mod` can be applied to osu!standard, specifically the osu!stable client.
     */
    isApplicableToOsuStable(): this is this & IModApplicableToOsuStable {
        return "bitwise" in this;
    }

    /**
     * Whether this `Mod` can be applied to a `Beatmap`.
     */
    isApplicableToBeatmap(): this is this & IModApplicableToBeatmap {
        return "applyToBeatmap" in this;
    }

    /**
     * Whether this `Mod` can be applied to a `BeatmapDifficulty`.
     */
    isApplicableToDifficulty(): this is this & IModApplicableToDifficulty {
        return "applyToDifficulty" in this;
    }

    /**
     * Whether this `Mod` can be applied to a `BeatmapDifficulty` relative to other `Mod`s and settings.
     */
    isApplicableToDifficultyWithSettings(): this is this &
        IModApplicableToDifficultyWithSettings {
        return "applyToDifficultyWithSettings" in this;
    }

    /**
     * Whether this `Mod` can be applied to a `HitObject`.
     */
    isApplicableToHitObject(): this is this & IModApplicableToHitObject {
        return "applyToHitObject" in this;
    }

    /**
     * Whether this `Mod` can be applied to a `HitObject` relative to other `Mod`s and settings.
     */
    isApplicableToHitObjectWithSettings(): this is this &
        IModApplicableToHitObjectWithSettings {
        return "applyToHitObjectWithSettings" in this;
    }

    /**
     * Whether this `Mod`s can be applied to a track's playback rate.
     */
    isApplicableToTrackRate(): this is this & IModApplicableToTrackRate {
        return "applyToRate" in this;
    }
}
