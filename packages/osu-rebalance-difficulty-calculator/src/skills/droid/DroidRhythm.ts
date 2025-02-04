import { DroidRhythmEvaluator } from "../../evaluators/droid/DroidRhythmEvaluator";
import { DroidSkill } from "./DroidSkill";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { Mod, ModScoreV2 } from "@rian8337/osu-base";

/**
 * Represents the skill required to properly follow a beatmap's rhythm.
 */
export class DroidRhythm extends DroidSkill {
    protected override readonly reducedSectionCount = 5;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly strainDecayBase = 0.3;
    protected override readonly starsPerDouble = 1.75;

    private readonly useSliderAccuracy: boolean;

    private currentRhythmStrain = 0;
    private currentRhythmMultiplier = 1;

    constructor(mods: Mod[]) {
        super(mods);

        this.useSliderAccuracy = mods.some((m) => m instanceof ModScoreV2);
    }

    protected override strainValueAt(
        current: DroidDifficultyHitObject,
    ): number {
        this.currentRhythmMultiplier =
            DroidRhythmEvaluator.evaluateDifficultyOf(
                current,
                this.useSliderAccuracy,
            );

        this.currentRhythmStrain *= this.strainDecay(current.deltaTime);
        this.currentRhythmStrain += this.currentRhythmMultiplier - 1;

        return this.currentRhythmStrain;
    }

    protected override calculateInitialStrain(
        time: number,
        current: DroidDifficultyHitObject,
    ): number {
        return (
            this.currentRhythmStrain *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override getObjectStrain(): number {
        return this.currentRhythmStrain;
    }

    protected override saveToHitObject(
        current: DroidDifficultyHitObject,
    ): void {
        current.rhythmStrain = this.currentRhythmStrain;
        current.rhythmMultiplier = this.currentRhythmMultiplier;
    }
}
