import {
    Interpolation,
    MathUtils,
    ModAutopilot,
    ModRelax,
} from "@rian8337/osu-base";
import { HarmonicSkill } from "../../base/HarmonicSkill";
import { DroidReadingEvaluator } from "../../evaluators/droid/DroidReadingEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * Represents the skill required to read every object in the beatmap.
 */
export class DroidReading extends HarmonicSkill {
    private currentDifficulty = 0;
    private firstObjectStartTime: number | null = null;

    private readonly skillMultiplier = 2.5;
    private readonly difficultyDecayBase = 0.8;

    /**
     * The duration for which the difficulty of objects is reduced, assuming the player has
     * memorized the beatmap.
     */
    private readonly reducedDifficultyDuration = 40 * 1000;

    /**
     * The baseline multiplier applied to the difficulty of the first object.
     *
     * Assume that even with full memorization, skill is still required to read and play the
     * first objects.
     */
    private readonly reducedDifficultyBaseline = 0.2;

    override countTopWeightedObjectDifficulties(
        difficultyValue: number,
    ): number {
        if (difficultyValue === 0) {
            return 0;
        }

        if (this.noteWeightSum === 0) {
            return 0;
        }

        // This is what the top object difficulty is if all object difficulties were identical.
        const consistentTopNote = difficultyValue / this.noteWeightSum;

        if (consistentTopNote === 0) {
            return 0;
        }

        return this.objectDifficulties.reduce(
            (total, next) =>
                total +
                MathUtils.offsetLogistic(
                    next / consistentTopNote,
                    1.15,
                    5,
                    1.1,
                ),
            0,
        );
    }

    protected override objectDifficultyOf(
        current: DroidDifficultyHitObject,
    ): number {
        const decay = this.difficultyDecay(current.deltaTime);

        // This currently operates under the assumption that `objectDifficultyOf` is called once
        // per object, and in order. Under that assumption, we can trust that `current.startTime`
        // refers to the start time of the first object in the case that `firstObjectStartTime`
        // is yet to be set.
        this.firstObjectStartTime ??= current.startTime;

        let currentObjectStrain =
            this.calculateAdjustedDifficulty(current) *
            (1 - decay) *
            this.skillMultiplier;

        if (
            current.startTime <=
            this.firstObjectStartTime + this.reducedDifficultyDuration
        ) {
            const scale = Math.log10(
                Interpolation.lerp(
                    1,
                    10,
                    MathUtils.clamp(
                        (current.startTime - this.firstObjectStartTime) /
                            this.reducedDifficultyDuration,
                        0,
                        1,
                    ),
                ),
            );

            currentObjectStrain *= Interpolation.lerp(
                this.reducedDifficultyBaseline,
                1,
                scale,
            );
        }

        this.currentDifficulty *= decay;
        this.currentDifficulty += currentObjectStrain;

        return this.currentDifficulty;
    }

    protected override saveToHitObject(
        current: DifficultyHitObject,
        difficulty: number,
    ) {
        current.readingDifficulty = difficulty;
    }

    private calculateAdjustedDifficulty(
        current: DroidDifficultyHitObject,
    ): number {
        let difficulty = Math.pow(
            DroidReadingEvaluator.evaluateDifficultyOf(current, this.mods),
            0.89,
        );

        if (this.mods.has(ModRelax)) {
            difficulty *= 0.4;
        } else if (this.mods.has(ModAutopilot)) {
            difficulty *= 0.1;
        }

        return difficulty;
    }

    private difficultyDecay(ms: number): number {
        return Math.pow(this.difficultyDecayBase, ms / 1000);
    }
}
