import { IMigratableDroidMod } from "./IMigratableDroidMod";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDifficultyWithMods } from "./IModApplicableToDifficultyWithMods";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObject } from "./IModApplicableToHitObject";
import { IModApplicableToHitObjectWithMods } from "./IModApplicableToHitObjectWithMods";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { IModFacilitatesAdjustment } from "./IModFacilitatesAdjustment";
import { IModRequiresOriginalBeatmap } from "./IModRequiresOriginalBeatmap";
import { SerializedMod } from "./SerializedMod";
import { ModSetting } from "./settings/ModSetting";

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
     * The {@link Mod}s this {@link Mod} cannot be enabled with.
     *
     * This is merely a static list of {@link Mod} constructors that this {@link Mod} is incompatible with,
     * regardless of the actual instance of the {@link Mod}.
     *
     * Some {@link Mod}s may have additional compatibility requirements that are captured in
     * {@link isCompatibleWith}. When checking for {@link Mod} compatibility, always use
     * {@link isCompatibleWith}.
     */
    readonly incompatibleMods = new Set<typeof Mod>();

    private settingsBacking: ModSetting[] | null = null;

    /**
     * `ModSetting`s that are specific to this `Mod`.
     */
    get settings(): ModSetting[] {
        if (this.settingsBacking !== null) {
            return this.settingsBacking;
        }

        this.settingsBacking = [];

        for (const prop in this) {
            const value = (this as Record<string, unknown>)[prop];

            if (value instanceof ModSetting) {
                this.settingsBacking.push(value);
            }
        }

        return this.settingsBacking;
    }

    /**
     * Whether all `ModSetting`s of this `Mod` are set to their default values.
     */
    get usesDefaultSettings(): boolean {
        return this.settings.every((s) => s.isDefault);
    }

    /**
     * Determines whether this {@link Mod} is compatible with another {@link Mod}.
     *
     * This extends {@link incompatibleMods} by allowing for dynamic checks against
     * the actual instance of the {@link Mod} (i.e., its specific settings).
     *
     * @param other The {@link Mod} to check compatibility with.
     * @return `true` if this {@link Mod} is compatible with {@link other}, `false` otherwise.
     */
    isCompatibleWith(other: Mod): boolean {
        return (
            !this.incompatibleMods.has(other.constructor as typeof Mod) &&
            !other.incompatibleMods.has(this.constructor as typeof Mod)
        );
    }

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
    isApplicableToDifficultyWithMods(): this is this &
        IModApplicableToDifficultyWithMods {
        return "applyToDifficultyWithMods" in this;
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
    isApplicableToHitObjectWithMods(): this is this &
        IModApplicableToHitObjectWithMods {
        return "applyToHitObjectWithMods" in this;
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
     * Whether this `Mod` facilitates adjustment to a `HitObject` or `BeatmapDifficulty`.
     */
    facilitatesAdjustment(): this is this & IModFacilitatesAdjustment {
        return "facilitateAdjustment" in this;
    }

    /**
     * Whether this `Mod` requires the original `Beatmap` for conversion and processing.
     */
    requiresOriginalBeatmap(): this is this & IModRequiresOriginalBeatmap {
        return "applyFromBeatmap" in this;
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
     * Compares this `Mod` to another `Mod` for equality.
     *
     * @param other The object to compare to.
     * @returns `true` if the object is the same `Mod`, `false` otherwise.
     */
    equals(other: Mod): other is this {
        if (this === other) {
            return true;
        }

        if (this.acronym !== other.acronym) {
            return false;
        }

        const settings = this.settings;
        const otherSettings = other.settings;

        if (settings.length !== otherSettings.length) {
            return false;
        }

        for (const setting of settings) {
            const otherSetting = otherSettings.find(
                (s) => s.name === setting.name,
            );

            if (!otherSetting) {
                return false;
            }

            if (setting.value !== otherSetting.value) {
                return false;
            }
        }

        return true;
    }

    /**
     * Returns the string representation of this `Mod`.
     */
    toString(): string {
        return this.acronym;
    }
}
