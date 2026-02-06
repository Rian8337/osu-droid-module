import { MathUtils, Slider } from "@rian8337/osu-base";
import { HarmonicSkill } from "../../base/HarmonicSkill";
import { OsuRhythmEvaluator } from "../../evaluators/osu/OsuRhythmEvaluator";
import { OsuSpeedEvaluator } from "../../evaluators/osu/OsuSpeedEvaluator";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class OsuSpeed extends HarmonicSkill {
    protected override readonly harmonicScale = 20;
    protected override readonly decayExponent = 0.85;

    private currentDifficulty = 0;
    private currentRhythm = 0;

    private readonly skillMultiplier = 1.035;
    private readonly strainDecayBase = 0.3;

    private readonly sliderDifficulties: number[] = [];
    private maxDifficulty = 0;

    /**
     * The amount of notes that are relevant to the difficulty.
     */
    relevantNoteCount(): number {
        if (this.objectDifficulties.length === 0 || this.maxDifficulty === 0) {
            return 0;
        }

        return this.objectDifficulties.reduce(
            (total, next) =>
                total +
                1 / (1 + Math.exp(-((next / this.maxDifficulty) * 12 - 6))),
            0,
        );
    }

    /**
     * Obtains the amount of sliders that are considered difficult in terms of relative difficulty, weighted by consistency.
     *
     * @param difficultyValue The final difficulty value.
     */
    countTopWeightedSliders(difficultyValue: number): number {
        if (this.sliderDifficulties.length === 0) {
            return 0;
        }

        if (this.noteWeightSum == 0) {
            return 0;
        }

        // What would the top note be if all note values were identical
        const consistentTopNote = difficultyValue / this.noteWeightSum;

        if (consistentTopNote == 0) {
            return 0;
        }

        // Use a weighted sum of all notes. Constants are arbitrary and give nice values
        return this.sliderDifficulties.reduce(
            (total, next) =>
                total +
                MathUtils.offsetLogistic(
                    next / consistentTopNote,
                    0.88,
                    10,
                    1.1,
                ),
            0,
        );
    }

    protected override objectDifficultyOf(
        current: OsuDifficultyHitObject,
    ): number {
        const decay = this.strainDecay(current.strainTime);

        this.currentDifficulty *= decay;
        this.currentDifficulty +=
            OsuSpeedEvaluator.evaluateDifficultyOf(current) *
            (1 - decay) *
            this.skillMultiplier;

        this.currentRhythm = OsuRhythmEvaluator.evaluateDifficultyOf(current);

        const difficulty = this.currentDifficulty * this.currentRhythm;

        if (current.object instanceof Slider) {
            this.sliderDifficulties.push(difficulty);
        }

        return difficulty;
    }

    protected override saveToHitObject(current: OsuDifficultyHitObject) {
        current.speedStrain = this.currentDifficulty * this.currentRhythm;
        current.rhythmMultiplier = this.currentRhythm;
    }

    private strainDecay(ms: number): number {
        return Math.pow(this.strainDecayBase, ms / 1000);
    }
}
