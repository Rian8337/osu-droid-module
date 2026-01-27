import {
    Interpolation,
    MathUtils,
    ModMap,
    PlaceableHitObject,
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

    private readonly skillMultiplier = 2.5;
    private readonly difficultyDecayBase = 0.8;

    constructor(
        mods: ModMap,
        private readonly clockRate: number,
        private readonly hitObjects: readonly PlaceableHitObject[],
    ) {
        super(mods);
    }

    protected override objectDifficultyOf(
        current: DroidDifficultyHitObject,
    ): number {
        this.currentDifficulty *= this.difficultyDecay(current.deltaTime);

        this.currentDifficulty +=
            DroidReadingEvaluator.evaluateDifficultyOf(current, this.mods) *
            this.skillMultiplier;

        return this.currentDifficulty;
    }

    protected override applyDifficultyTransformation(difficulties: number[]) {
        if (difficulties.length === 0) {
            return;
        }

        // Assume the first few seconds are completely memorized.
        const reducedNoteCount = this.calculateReducedNoteCount();

        for (
            let i = 0;
            i < Math.min(difficulties.length, reducedNoteCount);
            ++i
        ) {
            const scale = Math.log10(
                Interpolation.lerp(
                    1,
                    10,
                    MathUtils.clamp(i / reducedNoteCount, 0, 1),
                ),
            );

            difficulties[i] *= Interpolation.lerp(0, 1, scale);
        }
    }

    protected override saveToHitObject(
        current: DifficultyHitObject,
        difficulty: number,
    ) {
        current.readingDifficulty = difficulty;
    }

    private calculateReducedNoteCount(): number {
        if (this.hitObjects.length < 2) {
            return 0;
        }

        const reducedDifficultyDuration = 60 * 1000;

        // We take the 2nd note to match `createDifficultyHitObjects`
        const firstDifficultyObject = this.hitObjects[1];

        const reducedDuration =
            firstDifficultyObject.startTime / this.clockRate +
            reducedDifficultyDuration;

        let reducedNoteCount = 0;

        for (const object of this.hitObjects) {
            if (object.startTime / this.clockRate > reducedDuration) {
                break;
            }

            ++reducedNoteCount;
        }

        return reducedNoteCount;
    }

    private difficultyDecay(ms: number): number {
        return Math.pow(this.difficultyDecayBase, ms / 1000);
    }
}
