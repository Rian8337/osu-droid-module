import { PlaceableHitObject } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";

/**
 * A {@link DifficultyHitObject} cache, making use of its `equals` and `objectEquals` methods.
 *
 * This cache is minimal by design as it is only used for touch star rating assessments.
 */
export class DifficultyHitObjectCache<T extends DifficultyHitObject> {
    private readonly cache: T[] = [];

    /**
     * Adds a {@link DifficultyHitObject} to this cache.
     *
     * @param object The {@link DifficultyHitObject} to add.
     * @returns Whether the {@link DifficultyHitObject} was added.
     */
    add(object: T): boolean {
        for (const o of this.cache) {
            if (o.equals(object)) {
                return false;
            }
        }

        this.cache.push(object);

        return true;
    }

    /**
     * Gets a {@link DifficultyHitObject} from this cache.
     *
     * @param current The {@link PlaceableHitObject} to get for.
     * @param last The last {@link PlaceableHitObject}.
     * @param lastLast The object before the last {@link PlaceableHitObject}.
     * @returns The {@link DifficultyHitObject}, `null` if not found.
     */
    get(
        current: PlaceableHitObject,
        last: PlaceableHitObject | null,
        lastLast: PlaceableHitObject | null,
    ): T | null {
        for (const o of this.cache) {
            if (o.objectEquals(current, last, lastLast)) {
                return o;
            }
        }

        return null;
    }

    /**
     * Clears this cache.
     */
    clear() {
        this.cache.length = 0;
    }
}
