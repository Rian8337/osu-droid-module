import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";

/**
 * Represents a group of consecutive objects with the same delta time.
 */
export class Island {
    /**
     * Delta time of every object in this island.
     */
    delta = Number.MAX_SAFE_INTEGER;

    /**
     * How long the island is.
     */
    deltaCount = 1;

    /**
     * How many times the island already occured.
     */
    occurrences = 1;

    constructor(delta: number) {
        this.delta = Math.max(
            Math.trunc(delta),
            DifficultyHitObject.minDeltaTime,
        );
    }

    addDelta(delta: number) {
        if (this.delta === Number.MAX_SAFE_INTEGER) {
            this.delta = Math.max(
                Math.trunc(delta),
                DifficultyHitObject.minDeltaTime,
            );
        }

        ++this.deltaCount;
    }

    isSimilarPolarity(other: Island, epsilon: number): boolean {
        // Single delta islands should not be compared.
        if (this.deltaCount <= 1 || other.deltaCount <= 1) {
            return false;
        }

        return (
            Math.abs(this.delta - other.delta) < epsilon &&
            this.deltaCount % 2 === other.deltaCount % 2
        );
    }

    almostEquals(other: Island, epsilon: number): boolean {
        return (
            Math.abs(this.delta - other.delta) < epsilon &&
            this.deltaCount === other.deltaCount
        );
    }
}
