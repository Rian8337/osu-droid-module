import { Beatmap, MapStats } from "@rian8337/osu-base";
import { DifficultyCalculationOptions } from "./structures/DifficultyCalculationOptions";
import { DroidDifficultyCalculator } from "./DroidDifficultyCalculator";
import { OsuDifficultyCalculator } from "./OsuDifficultyCalculator";

/**
 * A difficulty calculator that calculates for both osu!droid and osu!standard gamemode.
 */
export class MapStars {
    /**
     * The osu!droid difficulty calculator of the beatmap.
     */
    readonly droid: DroidDifficultyCalculator;

    /**
     * The osu!standard difficulty calculator of the beatmap.
     */
    readonly osu: OsuDifficultyCalculator;

    /**
     * Constructs this instance and calculates the given beatmap's osu!droid and osu!standard difficulty.
     *
     * @param beatmap The beatmap to calculate.
     * @param options Options for the difficulty calculation.
     */
    constructor(beatmap: Beatmap, options?: DifficultyCalculationOptions) {
        const stats: MapStats = new MapStats({
            speedMultiplier: options?.stats?.speedMultiplier ?? 1,
            isForceAR: options?.stats?.isForceAR ?? false,
            oldStatistics: options?.stats?.oldStatistics ?? false,
        });

        this.droid = new DroidDifficultyCalculator(beatmap).calculate({
            ...options,
            stats,
        });


        this.osu = new OsuDifficultyCalculator(beatmap).calculate({
            ...options,
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
