import { Utils } from "../utils/Utils";

/**
 * A pseudo-random number generator that shares the same implementation with
 * {@link https://github.com/dotnet/runtime/blob/v9.0.4/src/libraries/System.Private.CoreLib/src/System/Random.Net5CompatImpl.cs .NET 5's `System.Random`}.
 *
 * Used in the Random mod to ensure that a seed generates the result that users expect.
 */
export class Random {
    private static readonly MIN_VALUE = -2147483648;
    private static readonly MAX_VALUE = 2147483647;

    private readonly seedArray = Utils.initializeArray(56, 0);
    private iNext = 0;
    private iNextP = 21;

    /**
     * Constructs a new instance of the `Random` class using the specified seed.
     *
     * @param seed The seed to use for the random number generator. This value is clamped to the range [-2147483648, 2147483647] and must be an integer.
     */
    constructor(seed: number) {
        seed = Math.trunc(seed);

        const subtraction =
            seed <= Random.MIN_VALUE ? Random.MAX_VALUE : Math.abs(seed);

        // Magic number based on Phi (golden ratio).
        let mj = 161803398 - subtraction;
        this.seedArray[55] = mj;
        let mk = 1;

        let ii = 0;
        for (let i = 1; i < 55; ++i) {
            // The range [1..55] is special (Knuth) and so we're wasting the 0'th position.
            ii = (21 * i) % 55;
            this.seedArray[ii] = mk;
            mk = mj - mk;

            if (mk < 0) {
                mk += Random.MAX_VALUE;
            }

            mj = this.seedArray[ii];
        }

        for (let k = 1; k < 5; ++k) {
            for (let i = 1; i < 56; ++i) {
                const n = (i + 30) % 55;

                this.seedArray[i] -= this.seedArray[n + 1];

                if (this.seedArray[i] < 0) {
                    this.seedArray[i] += Random.MAX_VALUE;
                }
            }
        }
    }

    nextDouble(): number {
        return this.sample();
    }

    private sample(): number {
        return this.internalSample() / 2147483647;
    }

    private internalSample(): number {
        let locINext = this.iNext;
        if (++locINext >= 56) {
            locINext = 1;
        }

        let locINextP = this.iNextP;
        if (++locINextP >= 56) {
            locINextP = 1;
        }

        let retVal = this.seedArray[locINext] - this.seedArray[locINextP];

        if (retVal === Random.MAX_VALUE) {
            --retVal;
        }
        if (retVal < 0) {
            retVal += Random.MAX_VALUE;
        }

        this.seedArray[locINext] = retVal;
        this.iNext = locINext;
        this.iNextP = locINextP;

        return retVal;
    }
}
