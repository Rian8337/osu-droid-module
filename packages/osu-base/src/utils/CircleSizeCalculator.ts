import { HitObject } from "../beatmap/hitobjects/HitObject";
import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { Mod } from "../mods/Mod";

/**
 * A utility class for calculating circle sizes across all modes (rimu! and osu!standard).
 */
export abstract class CircleSizeCalculator {
    /**
     * NOTE: This is not the real height that is used in the game, but rather an
     * assumption so that we can treat circle sizes similarly across all devices.
     */
    static readonly assumedDroidHeight = 681;

    /**
     * Converts osu!droid CS to osu!droid scale.
     *
     * @param cs The CS to convert.
     * @param mods The mods to apply.
     * @returns The calculated osu!droid scale.
     */
    static droidCSToDroidScale(cs: number, mods: Mod[] = []): number {
        // Create a dummy beatmap difficulty for circle size calculation.
        const difficulty = new BeatmapDifficulty();
        difficulty.cs = cs;

        for (const mod of mods) {
            if (mod.isApplicableToDifficulty()) {
                mod.applyToDifficulty(Modes.droid, difficulty);
            }
        }

        for (const mod of mods) {
            if (mod.isApplicableToDifficultyWithSettings()) {
                mod.applyToDifficultyWithSettings(
                    Modes.droid,
                    difficulty,
                    mods,
                    1,
                );
            }
        }

        return Math.max(
            ((this.assumedDroidHeight / 480) *
                (54.42 - difficulty.cs * 4.48) *
                2) /
                128 +
                (0.5 * (11 - 5.2450170716245195)) / 5,
            1e-3,
        );
    }

    /**
     * Converts osu!droid scale to osu!droid circle size.
     *
     * @param scale The osu!droid scale to convert.
     * @returns The calculated osu!droid circle size.
     */
    static droidScaleToDroidCS(scale: number): number {
        return (
            (54.42 -
                ((((Math.max(1e-3, scale) -
                    (0.5 * (11 - 5.2450170716245195)) / 5) *
                    128) /
                    2) *
                    480) /
                    this.assumedDroidHeight) /
            4.48
        );
    }

    /**
     * Converts osu!droid scale to osu!standard radius.
     *
     * @param scale The osu!droid scale to convert.
     * @returns The osu!standard radius of the given osu!droid scale.
     */
    static droidScaleToStandardRadius(scale: number): number {
        return (
            (64 * Math.max(1e-3, scale)) /
            ((this.assumedDroidHeight * 0.85) / 384)
        );
    }

    /**
     * Converts osu!standard radius to osu!droid scale.
     *
     * @param radius The osu!standard radius to convert.
     * @returns The osu!droid scale of the given osu!standard radius.
     */
    static standardRadiusToDroidScale(radius: number): number {
        return (
            (radius * ((this.assumedDroidHeight * 0.85) / 384)) /
            HitObject.baseRadius
        );
    }

    /**
     * Converts osu!standard radius to osu!standard circle size.
     *
     * @param radius The osu!standard radius to convert.
     * @returns The osu!standard circle size of the given radius.
     */
    static standardRadiusToStandardCS(radius: number): number {
        return 5 + ((1 - radius / (HitObject.baseRadius / 2)) * 5) / 0.7;
    }

    /**
     * Converts osu!standard circle size to osu!standard scale.
     *
     * @param cs The osu!standard circle size to convert.
     * @returns The osu!standard scale of the given circle size.
     */
    static standardCSToStandardScale(cs: number): number {
        return (1 - (0.7 * (cs - 5)) / 5) / 2;
    }

    /**
     * Converts osu!standard scale to osu!droid scale.
     *
     * @param scale The osu!standard scale to convert.
     * @returns The osu!droid scale of the given osu!standard scale.
     */
    static standardScaleToDroidScale(scale: number): number {
        return this.standardRadiusToDroidScale(HitObject.baseRadius * scale);
    }

    /**
     * Converts osu!standard circle size to osu!droid scale.
     *
     * @param cs The osu!standard circle size to convert.
     * @returns The osu!droid scale of the given osu!droid scale.
     */
    static standardCSToDroidScale(cs: number): number {
        return this.standardScaleToDroidScale(
            this.standardCSToStandardScale(cs),
        );
    }
}
