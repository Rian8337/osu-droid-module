import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";

export class Island {
    private readonly deltaDifferenceEpsilon: number;
    delta = Number.MAX_SAFE_INTEGER;
    deltaCount = 0;

    constructor(epsilon: number);
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    constructor(delta: number, deltaDifferenceEpsilon: number);
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
        // TODO: consider islands to be of similar polarity only if they're having the same average delta (we don't want to consider 3 singletaps similar to a triple)
        // naively adding delta check here breaks _a lot_ of maps because of the flawed ratio calculation
        return this.deltaCount % 2 == other.deltaCount % 2;
    }

    equals(other: Island): boolean {
        return (
            Math.abs(this.delta - other.delta) < this.deltaDifferenceEpsilon &&
            this.deltaCount === other.deltaCount
        );
    }
}
