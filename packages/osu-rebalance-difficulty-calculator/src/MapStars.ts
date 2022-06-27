import { Beatmap, Mod, MapStats } from "@rian8337/osu-base";
import { DroidDifficultyCalculator } from "./DroidDifficultyCalculator";
import { OsuDifficultyCalculator } from "./OsuDifficultyCalculator";

/**
 * A difficulty calculator that calculates for both osu!droid and osu!standard gamemode.
 */
export class MapStars {
    /**
     * The osu!droid difficulty calculator of the beatmap.
     */
    readonly droid: DroidDifficultyCalculator = new DroidDifficultyCalculator();

    /**
     * The osu!standard difficulty calculator of the beatmap.
     */
    readonly osu: OsuDifficultyCalculator = new OsuDifficultyCalculator();

    /**
     * Initializes the instance and calculates the given beatmap's osu!droid and osu!standard difficulty.
     *
     * @param beatmap The beatmap to calculate.
     * @param options Options for the difficulty calculation.
     */
    constructor(
        beatmap: Beatmap,
        options?: {
            /**
             * The modifications to apply.
             */
            mods?: Mod[];

            /**
             * Custom map statistics to apply speed multiplier and force AR values as well as old statistics.
             */
            stats?: MapStats;
        }
    ) {
        const stats: MapStats = new MapStats({
            speedMultiplier: options?.stats?.speedMultiplier ?? 1,
            isForceAR: options?.stats?.isForceAR ?? false,
            oldStatistics: options?.stats?.oldStatistics ?? false,
        });

        this.droid.calculate({
            map: beatmap,
            mods: options?.mods,
            stats,
        });

        this.osu.calculate({
            map: beatmap,
            mods: options?.mods,
            stats,
        });
    }

    /**
     * Returns a string representative of the class.
     */
    toString() {
        return `${this.droid.toString()}\n${this.osu.toString()}`;
    }
}
