import { SerializedMod } from "@rian8337/osu-base";
import { IDifficultyAttributes } from "./IDifficultyAttributes";

/**
 * Represents difficulty attributes that can be cached.
 */
export type CacheableDifficultyAttributes<T extends IDifficultyAttributes> =
    Omit<T, "mods" | "toCacheableAttributes"> & {
        /**
         * The mods which were applied to the beatmap.
         */
        mods: SerializedMod[];
    };
