import {
    Interpolation,
    MathUtils,
    ModMap,
    PlaceableHitObject,
} from "@rian8337/osu-base";
import { HarmonicSkill } from "../../base/HarmonicSkill";
import { OsuReadingEvaluator } from "../../evaluators/osu/OsuReadingEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * Represents the skill required to read every object in the beatmap.
 */
export class OsuReading extends HarmonicSkill {
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
        current: OsuDifficultyHitObject,
    ): number {
        const decay = this.difficultyDecay(current.deltaTime);

        this.currentDifficulty *= decay;

        this.currentDifficulty +=
            OsuReadingEvaluator.evaluateDifficultyOf(current, this.mods) *
            (1 - decay) *
            this.skillMultiplier;

        return this.currentDifficulty;
    }

    protected override applyDifficultyTransformation(difficulties: number[]) {
        // Assume the first few seconds are completely memorized.
        const reducedNoteCount = this.calculateReducedNoteCount();

        for (
            let i = 0;
            i < Math.min(difficulties.length, reducedNoteCount);
            ++i
        ) {
            difficulties[i] *= Math.log10(
                Interpolation.lerp(
                    1,
                    10,
                    MathUtils.clamp(i / reducedNoteCount, 0, 1),
                ),
            );
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
