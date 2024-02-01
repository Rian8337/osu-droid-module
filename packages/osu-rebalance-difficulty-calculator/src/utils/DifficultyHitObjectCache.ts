import { PlaceableHitObject } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";

/**
 * A {@link DifficultyHitObject} cache, making use of its `equals` and `objectEquals` methods.
 *
 * This cache is minimal by design as it is only used for touch star rating assessments.
 */
export class DifficultyHitObjectCache<T extends DifficultyHitObject> {
    private readonly cache = new Set<T>();

    /**
     * Adds a {@link T} to this cache.
     *
     * @param object The {@link T} to add.
     * @returns Whether the {@link T} was added.
     */
    add(object: T): boolean {
        if (this.cache.has(object)) {
            return false;
        }

        for (const o of this.cache) {
            if (o.equals(object)) {
                return false;
            }
        }

        this.cache.add(object);

        return true;
    }

    /**
     * Gets a {@link T} from this cache.
     *
     * @param current The {@link PlaceableHitObject} to get for.
     * @param last The last {@link PlaceableHitObject}.
     * @param lastLast The object before the last {@link PlaceableHitObject}.
     * @returns The {@link T}, `null` if not found.
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
        this.cache.clear();
    }
}
