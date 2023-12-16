import { DifficultyAttributes } from "./DifficultyAttributes";

/**
 * Represents difficulty attributes that can be cached.
 */
export type CacheableDifficultyAttributes<T extends DifficultyAttributes> =
    Omit<T, "mods"> & {
        /**
         * The mods which were applied to the beatmap.
         */
        mods: string;
    };
