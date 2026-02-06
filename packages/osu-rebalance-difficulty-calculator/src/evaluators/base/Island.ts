import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";

export class Island {
    private readonly deltaDifferenceEpsilon: number;
    delta = Number.MAX_SAFE_INTEGER;
    deltaCount = 0;

    constructor(epsilon: number);
    constructor(delta: number, deltaDifferenceEpsilon?: number) {
        if (deltaDifferenceEpsilon === undefined) {
            this.deltaDifferenceEpsilon = delta;
        } else {
            this.deltaDifferenceEpsilon = deltaDifferenceEpsilon;
            this.addDelta(delta);
        }
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

    isSimilarPolarity(other: Island): boolean {
        // Single delta islands should not be compared.
        if (this.deltaCount <= 1 || other.deltaCount <= 1) {
            return false;
        }

        return (
            Math.abs(this.delta - other.delta) < this.deltaDifferenceEpsilon &&
            this.deltaCount % 2 === other.deltaCount % 2
        );
    }

    equals(other: Island): boolean {
        return (
            Math.abs(this.delta - other.delta) < this.deltaDifferenceEpsilon &&
            this.deltaCount === other.deltaCount
        );
    }
}
