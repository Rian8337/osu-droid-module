import { Beatmap, Mod, MapStats } from "@rian8337/osu-base";
import { DroidDifficultyCalculator } from "./DroidDifficultyCalculator";
import { OsuDifficultyCalculator } from "./OsuDifficultyCalculator";

/**
 * A star rating calculator that configures which mode to calculate difficulty for and what mods are applied.
 */
export class MapStars {
    /**
     * The osu!droid star rating of the beatmap.
     */
    readonly droidStars: DroidDifficultyCalculator =
        new DroidDifficultyCalculator();

    /**
     * The osu!standard star rating of the beatmap.
     */
    readonly pcStars: OsuDifficultyCalculator = new OsuDifficultyCalculator();

    /**
     * Calculates the star rating of a beatmap.
     */
    calculate(params: {
        /**
         * The beatmap to calculate.
         */
        map: Beatmap;

        /**
         * Applied modifications.
         */
        mods?: Mod[];

        /**
         * Custom map statistics to apply speed multiplier and force AR values as well as old statistics.
         */
        stats?: MapStats;
    }): MapStars {
        const mod: Mod[] = params.mods ?? [];

        const stats: MapStats = new MapStats({
            speedMultiplier: params.stats?.speedMultiplier ?? 1,
            isForceAR: params.stats?.isForceAR ?? false,
            oldStatistics: params.stats?.oldStatistics ?? false,
        });

        this.droidStars.calculate({
            map: params.map,
            mods: mod,
            stats,
        });
        this.pcStars.calculate({
            map: params.map,
            mods: mod,
            stats,
        });

        return this;
    }

    /**
     * Returns a string representative of the class.
     */
    toString() {
        return `${this.droidStars.toString()}\n${this.pcStars.toString()}`;
    }
}
