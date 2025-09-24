import {
    Interpolation,
    MathUtils,
    ModMap,
    PlaceableHitObject,
} from "@rian8337/osu-base";
import { DroidReadingEvaluator } from "../../evaluators/droid/DroidReadingEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { Skill } from "../../base/Skill";

/**
 * Represents the skill required to read every object in the map.
 */
export class DroidReading extends Skill {
    private readonly noteDifficulties: number[] = [];

    private readonly strainDecayBase = 0.8;
    private readonly skillMultiplier = 1.85;

    private currentNoteDifficulty = 0;

    private difficulty = 0;
    private noteWeightSum = 0;

    constructor(
        mods: ModMap,
        private readonly clockRate: number,
        private readonly hitObjects: readonly PlaceableHitObject[],
    ) {
        super(mods);
    }

    override process(current: DroidDifficultyHitObject) {
        this.currentNoteDifficulty *= this.strainDecay(current.deltaTime);

        this.currentNoteDifficulty +=
            DroidReadingEvaluator.evaluateDifficultyOf(
                current,
                this.clockRate,
                this.mods,
            ) * this.skillMultiplier;

        const difficulty =
            this.currentNoteDifficulty * current.rhythmMultiplier;

        this.noteDifficulties.push(difficulty);

        current.readingDifficulty = difficulty;
    }

    override difficultyValue(): number {
        if (this.hitObjects.length === 0) {
            return 0;
        }

        // Notes with 0 difficulty are excluded to avoid worst-case time complexity of the following sort (e.g. /b/2351871).
        // These notes will not contribute to the difficulty.
        const peaks = this.noteDifficulties.filter((d) => d > 0);

        // Start time at first object.
        const reducedDuration =
            this.hitObjects[0].startTime / this.clockRate + 60 * 1000;

        // Assume the first few seconds are completely memorized.
        let reducedCount = 0;

        for (const object of this.hitObjects) {
            if (object.startTime / this.clockRate > reducedDuration) {
                break;
            }

            ++reducedCount;
        }

        for (let i = 0; i < Math.min(peaks.length, reducedCount); ++i) {
            peaks[i] *= Math.log10(
                Interpolation.lerp(
                    1,
                    10,
                    MathUtils.clamp(i / reducedCount, 0, 1),
                ),
            );
        }

        peaks.sort((a, b) => b - a);

        // Difficulty is the weighted sum of the highest notes.
        // We're sorting from highest to lowest note.
        this.difficulty = 0;
        this.noteWeightSum = 0;

        for (let i = 0; i < peaks.length; ++i) {
            // Use a harmonic sum for note which effectively buffs maps with more notes, especially if
            // note difficulties are consistent. Constants are arbitrary and give good values.
            // https://www.desmos.com/calculator/5eb60faf4c
            const weight =
                (1 + 1 / (1 + i)) / (Math.pow(i, 0.8) + 1 + 1 / (1 + i));

            if (weight === 0) {
                // Shortcut to avoid unnecessary iterations.
                break;
            }

            this.noteWeightSum += weight;
            this.difficulty += peaks[i] * weight;
        }

        return this.difficulty;
    }

    /**
     * Returns the number of relevant objects weighted against the top note.
     */
    countTopWeightedNotes(): number {
        if (
            this.noteDifficulties.length === 0 ||
            this.difficulty === 0 ||
            this.noteWeightSum === 0
        ) {
            return 0;
        }

        // What would the top note be if all note values were identical
        const consistentTopNote = this.difficulty / this.noteWeightSum;

        if (consistentTopNote === 0) {
            return 0;
        }

        // Use a weighted sum of all notes. Constants are arbitrary and give nice values
        return this.noteDifficulties.reduce(
            (total, next) =>
                total +
                1.1 / (1 + Math.exp(-5 * (next / consistentTopNote - 1.15))),
            0,
        );
    }

    private strainDecay(ms: number): number {
        return Math.pow(this.strainDecayBase, ms / 1000);
    }
}
