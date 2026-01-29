import { MathUtils, ModMap, Slider } from "@rian8337/osu-base";
import { HarmonicSkill } from "../../base/HarmonicSkill";
import { DroidTapEvaluator } from "../../evaluators/droid/DroidTapEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class DroidTap extends HarmonicSkill {
    protected override readonly harmonicScale = 20;
    protected override readonly decayExponent = 0.85;

    private readonly skillMultiplier = 0.93;
    private readonly strainDecayBase = 0.3;

    private currentTapDifficulty = 0;
    private currentRhythmMultiplier = 0;

    private readonly objectDeltaTimes: number[] = [];
    private readonly sliderDifficulties: number[] = [];

    private maxDifficulty = 0;

    readonly considerCheesability: boolean;
    readonly strainTimeCap?: number;

    constructor(
        mods: ModMap,
        considerCheesability: boolean,
        strainTimeCap?: number,
    ) {
        super(mods);

        this.considerCheesability = considerCheesability;
        this.strainTimeCap = strainTimeCap;
    }

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
     * The delta time relevant to the difficulty.
     */
    relevantDeltaTime(): number {
        if (this.objectDifficulties.length === 0 || this.maxDifficulty === 0) {
            return 0;
        }

        return (
            this.objectDeltaTimes.reduce(
                (total, next, index) =>
                    total +
                    next /
                        (1 +
                            Math.exp(
                                -(
                                    (this.objectDifficulties[index] /
                                        this.maxDifficulty) *
                                        25 -
                                    20
                                ),
                            )),
                0,
            ) /
            this.objectDifficulties.reduce(
                (total, next) =>
                    total +
                    1 /
                        (1 +
                            Math.exp(-((next / this.maxDifficulty) * 25 - 20))),
                0,
            )
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

        if (this.noteWeightSum === 0) {
            return 0;
        }

        // What would the top note be if all note values were identical
        const consistentTopNote = difficultyValue / this.noteWeightSum;

        if (consistentTopNote === 0) {
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
        current: DroidDifficultyHitObject,
    ): number {
        const decay = this.strainDecay(current.strainTime);

        this.currentTapDifficulty *= decay;
        this.currentTapDifficulty +=
            DroidTapEvaluator.evaluateDifficultyOf(
                current,
                this.considerCheesability,
                this.strainTimeCap,
            ) *
            (1 - decay) *
            this.skillMultiplier;

        this.currentRhythmMultiplier = current.rhythmMultiplier;

        this.objectDeltaTimes.push(current.deltaTime);

        const difficulty =
            this.currentTapDifficulty * this.currentRhythmMultiplier;

        this.maxDifficulty = Math.max(this.maxDifficulty, difficulty);

        if (current.object instanceof Slider) {
            this.sliderDifficulties.push(difficulty);
        }

        return difficulty;
    }

    protected override saveToHitObject(current: DroidDifficultyHitObject) {
        if (this.strainTimeCap !== undefined) {
            return;
        }

        const difficulty =
            this.currentTapDifficulty * this.currentRhythmMultiplier;

        if (this.considerCheesability) {
            current.tapDifficulty = difficulty;
        } else {
            current.originalTapDifficulty = difficulty;
        }
    }

    private strainDecay(ms: number): number {
        return Math.pow(this.strainDecayBase, ms / 1000);
    }
}
