import { IMigratableDroidMod } from "./IMigratableDroidMod";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDifficultyWithSettings } from "./IModApplicableToDifficultyWithSettings";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObject } from "./IModApplicableToHitObject";
import { IModApplicableToHitObjectWithSettings } from "./IModApplicableToHitObjectWithSettings";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { SerializedMod } from "./SerializedMod";

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
     * Whether this `Mod` is playable by a real human user.
     *
     * Should be `false` for cases where the user is not meant to apply the `Mod` by themselves.
     */
    readonly userPlayable: boolean = true;

    /**
     * `Mod`s that are incompatible with this `Mod`.
     */
    readonly incompatibleMods = new Set<typeof Mod>();

    /**
     * Serializes this `Mod` to a `SerializedMod`.
     */
    serialize(): SerializedMod {
        const serialized = {
            acronym: this.acronym,
            settings: this.serializeSettings() ?? undefined,
        } satisfies SerializedMod;

        if (!serialized.settings) {
            delete serialized.settings;
        }

        return serialized;
    }

    /**
     * Copies the settings of a `SerializedMod` to this `Mod`.
     *
     * @param mod The `SerializedMod` to copy the settings from. Must be the same `Mod` type.
     * @throws {TypeError} If the `SerializedMod` is not the same type as this `Mod`.
     */
    copySettings(mod: SerializedMod) {
        if (mod.acronym !== this.acronym) {
            throw new TypeError(
                `Cannot copy settings from ${mod.acronym} to ${this.acronym}`,
            );
        }
    }

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
        return "osuRanked" in this;
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
     * Whether this `Mod` can be applied to a track's playback rate.
     */
    isApplicableToTrackRate(): this is this & IModApplicableToTrackRate {
        return "applyToRate" in this;
    }

    /**
     * Whether this `Mod` is migratable to a new `Mod` in osu!droid.
     */
    isMigratableDroidMod(): this is this & IMigratableDroidMod {
        return "migrateDroidMod" in this;
    }

    /**
     * Serializes the settings of this `Mod` to an object that can be converted to a JSON.
     *
     * @returns The serialized settings of this `Mod`, or `null` if there are no settings.
     */
    protected serializeSettings(): Record<string, unknown> | null {
        return null;
    }

    /**
     * Returns the string representation of this `Mod`.
     */
    toString(): string {
        return this.acronym;
    }
}
