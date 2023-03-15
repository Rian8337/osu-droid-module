import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Mod } from "../mods/Mod";
import { ModEasy } from "../mods/ModEasy";
import { ModHardRock } from "../mods/ModHardRock";
import { ModReallyEasy } from "../mods/ModReallyEasy";
import { ModSmallCircle } from "../mods/ModSmallCircle";

/**
 * A utility class for calculating circle sizes across all modes (rimu! and osu!standard).
 */
export abstract class CircleSizeCalculator {
    private static readonly assumedDroidHeight: number = 681;

    /**
     * Converts osu!droid CS to osu!droid scale.
     *
     * @param cs The CS to convert.
     * @param mods The mods to apply.
     * @returns The calculated osu!droid scale.
     */
    static droidCSToDroidScale(cs: number, mods: Mod[] = []): number {
        let scale: number =
            ((this.assumedDroidHeight / 480) * (54.42 - cs * 4.48) * 2) / 128 +
            (0.5 * (11 - 5.2450170716245195)) / 5;

        if (mods.some((m) => m instanceof ModHardRock)) {
            scale -= 0.125;
        }
        if (mods.some((m) => m instanceof ModEasy)) {
            scale += 0.125;
        }
        if (mods.some((m) => m instanceof ModReallyEasy)) {
            scale += 0.125;
        }
        if (mods.some((m) => m instanceof ModSmallCircle)) {
            scale -= ((this.assumedDroidHeight / 480) * (4 * 4.48) * 2) / 128;
        }

        return Math.max(scale, 1e-3);
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
            this.standardCSToStandardScale(cs)
        );
    }
}
