import { HitObject } from "../beatmap/hitobjects/HitObject";
import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { Mod } from "../mods/Mod";

/**
 * A utility class for calculating circle sizes across all modes (rimu! and osu!standard).
 */
export abstract class CircleSizeCalculator {
    /**
     * The following comment is copied verbatim from osu!lazer and osu!stable:
     *
     * > Builds of osu! up to 2013-05-04 had the gamefield being rounded down, which caused incorrect radius calculations
     * > in widescreen cases. This ratio adjusts to allow for old replays to work post-fix, which in turn increases the lenience
     * > for all plays, but by an amount so small it should only be effective in replays.
     *
     * To match expectations of gameplay we need to apply this multiplier to circle scale. It's weird but is what it is.
     * It works out to under 1 game pixel and is generally not meaningful to gameplay, but is to replay playback accuracy.
     */
    static readonly brokenGamefieldRoundingAllowance = 1.00041;

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
            (HitObject.baseRadius * Math.max(1e-3, scale)) /
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
        return Math.max(
            1e-3,
            (radius * ((this.assumedDroidHeight * 0.85) / 384)) /
                HitObject.baseRadius,
        );
    }

    /**
     * Converts osu!standard circle size to osu!standard scale.
     *
     * @param cs The osu!standard circle size to convert.
     * @param applyFudge Whether to apply a fudge that was historically applied to osu!standard. Defaults to `false`.
     * @returns The osu!standard scale of the given circle size.
     */
    static standardCSToStandardScale(
        cs: number,
        applyFudge: boolean = false,
    ): number {
        return (
            ((1 - (0.7 * (cs - 5)) / 5) / 2) *
            (applyFudge ? this.brokenGamefieldRoundingAllowance : 1)
        );
    }

    /**
     * Converts osu!standard scale to osu!standard circle size.
     *
     * @param scale The osu!standard scale to convert.
     * @param applyFudge Whether to apply a fudge that was historically applied to osu!standard. Defaults to `false`.
     * @returns The osu!standard circle size of the given scale.
     */
    static standardScaleToStandardCS(
        scale: number,
        applyFudge: boolean = false,
    ): number {
        // Inverse operation: https://www.desmos.com/calculator/74xr7tcmek
        return (
            5 +
            (5 *
                (1 -
                    (2 * scale) /
                        (applyFudge
                            ? this.brokenGamefieldRoundingAllowance
                            : 1))) /
                0.7
        );
    }

    /**
     * Converts osu!standard radius to osu!standard circle size.
     *
     * @param radius The osu!standard radius to convert.
     * @param applyFudge Whether to apply a fudge that was historically applied to osu!standard. Defaults to `false`.
     * @returns The osu!standard circle size of the given radius.
     */
    static standardRadiusToStandardCS(
        radius: number,
        applyFudge: boolean = false,
    ): number {
        return this.standardScaleToStandardCS(
            radius / HitObject.baseRadius,
            applyFudge,
        );
    }

    /**
     * Converts osu!standard scale to osu!droid scale.
     *
     * @param scale The osu!standard scale to convert.
     * @param applyFudge Whether to apply a fudge that was historically applied to osu!standard. Defaults to `false`.
     * @returns The osu!droid scale of the given osu!standard scale.
     */
    static standardScaleToDroidScale(
        scale: number,
        applyFudge: boolean = false,
    ): number {
        return this.standardRadiusToDroidScale(
            (HitObject.baseRadius * scale) /
                (applyFudge ? this.brokenGamefieldRoundingAllowance : 1),
        );
    }

    /**
     * Converts osu!standard circle size to osu!droid scale.
     *
     * @param cs The osu!standard circle size to convert.
     * @param applyFudge Whether to apply a fudge that was historically applied to osu!standard. Defaults to `false`.
     * @returns The osu!droid scale of the given osu!droid scale.
     */
    static standardCSToDroidScale(
        cs: number,
        applyFudge: boolean = false,
    ): number {
        return this.standardScaleToDroidScale(
            this.standardCSToStandardScale(cs, applyFudge),
        );
    }
}
