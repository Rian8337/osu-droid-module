import { MathUtils } from "@rian8337/osu-base";
import { ObjectDifficultySkill } from "./ObjectDifficultySkill";

/**
 * A skill that calculates the difficulty of {@link DifficultyHitObject}s using harmonic summation.
 */
export abstract class HarmonicSkill extends ObjectDifficultySkill {
    private _noteWeightSum = 0;

    /**
     * The sum of note weights, calculated during summation.
     *
     * Required for any calculations that normalizes the difficulty value.
     */
    protected get noteWeightSum(): number {
        return this._noteWeightSum;
    }

    /**
     * Scaling factor applied as `x / (i + 1)`, where `x` is the skill's {@link harmonicScale} and `i`
     * is the index of the {@link DifficultyHitObject} being processed.
     *
     * A higher value increases the influence of the hardest {@link DifficultyHitObject}s during summation.
     */
    protected readonly harmonicScale: number = 1;

    /**
     * An exponent that controls the rate of which decay increases as the index increases.
     *
     * Values closer to 1 decay faster, whilst lower values give more weight to easier {@link DifficultyHitObject}s.
     */
    protected readonly decayExponent: number = 0.9;

    static difficultyToPerformance(difficulty: number): number {
        return 4 * Math.pow(difficulty, 3);
    }

    override difficultyValue(): number {
        if (this.objectDifficulties.length === 0) {
            return 0;
        }

        // Notes with 0 difficulty are excluded to avoid worst-case time complexity of the following sort (e.g. /b/2351871).
        // These notes will not contribute to the difficulty.
        const difficulties = this.objectDifficulties.filter((d) => d > 0);

        this.applyDifficultyTransformation(difficulties);

        let difficulty = 0;
        let index = 0;
        this._noteWeightSum = 0;

        for (const objectDifficulty of difficulties.sort((a, b) => b - a)) {
            const weight =
                (1 + this.harmonicScale / (1 + index)) /
                (Math.pow(index, this.decayExponent) +
                    1 +
                    this.harmonicScale / (1 + index));

            this._noteWeightSum += weight;
            difficulty += objectDifficulty * weight;

            ++index;
        }

        return difficulty;
    }

    /**
     * Calculates the amount of object difficulties weighed against the top object difficulty.
     *
     * @param difficultyValue The final difficulty value.
     */
    countTopWeightedObjectDifficulties(difficultyValue: number): number {
        if (difficultyValue === 0) {
            return 0;
        }

        if (this._noteWeightSum === 0) {
            return 0;
        }

        // This is what the top object difficulty is if all object difficulties were identical.
        const consistentTopNote = difficultyValue / this._noteWeightSum;

        if (consistentTopNote === 0) {
            return 0;
        }

        return this.objectDifficulties.reduce(
            (total, next) =>
                total +
                MathUtils.offsetLogistic(
                    next / consistentTopNote,
                    0.88,
                    10,
                    1.1,
                ),
        );
    }

    /**
     * Transforms the difficulties of {@link DifficultyHitObject}s before they are summed together.
     *
     * This can be used to decrease weight of certain {@link DifficultyHitObject}s based on a skill-specific criteria.
     *
     * @param difficulties The difficulties of {@link DifficultyHitObject}s to transform.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected applyDifficultyTransformation(difficulties: number[]) {}
}
