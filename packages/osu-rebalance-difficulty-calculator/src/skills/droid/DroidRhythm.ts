import { ModMap, ModScoreV2 } from "@rian8337/osu-base";
import { HarmonicSkill } from "../../base/HarmonicSkill";
import { DroidRhythmEvaluator } from "../../evaluators/droid/DroidRhythmEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * Represents the skill required to properly follow a beatmap's rhythm.
 */
export class DroidRhythm extends HarmonicSkill {
    protected override readonly decayExponent = 0.8;

    private readonly skillMultiplier = 7.5;
    private readonly strainDecayBase = 0.3;

    private currentRhythmDifficulty = 0;
    private currentRhythmMultiplier = 0;

    private readonly useSliderAccuracy: boolean;

    constructor(mods: ModMap) {
        super(mods);

        this.useSliderAccuracy = mods.has(ModScoreV2);
    }

    protected override objectDifficultyOf(
        current: DroidDifficultyHitObject,
    ): number {
        const rhythmMultiplier = DroidRhythmEvaluator.evaluateDifficultyOf(
            current,
            this.useSliderAccuracy,
        );

        this.currentRhythmDifficulty *= this.strainDecay(current.strainTime);
        this.currentRhythmDifficulty +=
            (rhythmMultiplier - 1) * this.skillMultiplier;

        this.currentRhythmMultiplier = rhythmMultiplier;

        return this.currentRhythmDifficulty;
    }

    protected override saveToHitObject(current: DroidDifficultyHitObject) {
        current.rhythmDifficulty = this.currentRhythmDifficulty;
        current.rhythmMultiplier = this.currentRhythmMultiplier;
    }

    private strainDecay(ms: number): number {
        return Math.pow(this.strainDecayBase, ms / 1000);
    }
}
