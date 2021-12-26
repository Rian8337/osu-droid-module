import { Beatmap } from "../beatmap/Beatmap";
import { MapStats } from "../utils/MapStats";
import { RebalanceDroidStarRating } from "../rebaldifficulty/RebalanceDroidStarRating";
import { RebalanceOsuStarRating } from "../rebaldifficulty/RebalanceOsuStarRating";
import { Mod } from "../mods/Mod";
import { Utils } from "../utils/Utils";

/**
 * A star rating calculator that configures which mode to calculate difficulty for and what mods are applied.
 */
export class RebalanceMapStars {
    /**
     * The osu!droid star rating of the beatmap.
     */
    readonly droidStars: RebalanceDroidStarRating =
        new RebalanceDroidStarRating();

    /**
     * The osu!standard star rating of the beatmap.
     */
    readonly pcStars: RebalanceOsuStarRating = new RebalanceOsuStarRating();

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
    }): RebalanceMapStars {
        const mod: Mod[] = params.mods ?? [];

        const stats: MapStats = new MapStats({
            speedMultiplier: params.stats?.speedMultiplier ?? 1,
            isForceAR: params.stats?.isForceAR ?? false,
            oldStatistics: params.stats?.oldStatistics ?? false,
        });

        this.droidStars.calculate({
            map: Utils.deepCopy(params.map),
            mods: mod,
            stats,
        });
        this.pcStars.calculate({
            map: Utils.deepCopy(params.map),
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
