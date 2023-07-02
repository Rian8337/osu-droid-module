import { Mod, OsuHitWindow } from "@rian8337/osu-base";
import { DroidRhythmEvaluator } from "../../evaluators/droid/DroidRhythmEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to properly follow a beatmap's rhythm.
 */
export class DroidRhythm extends DroidSkill {
    protected override readonly strainDecayBase: number = 0.3;
    protected override readonly difficultyMultiplier: number = 2;

    private currentRhythm: number = 1;
    private readonly hitWindow: OsuHitWindow;

    constructor(mods: Mod[], overallDifficulty: number) {
        super(mods);

        this.hitWindow = new OsuHitWindow(overallDifficulty);
    }

    override difficultyValue(): number {
        // Math here preserves the property that two notes of equal difficulty x, we have their summed difficulty = x * starsPerDouble.
        // This also applies to two sets of notes with equal difficulty.
        return Math.pow(
            this.strains.reduce((a, v) => {
                if (v.strainCountChange <= 0 || v.strain <= 0) {
                    return a;
                }

                return (
                    a +
                    Math.pow(v.strain, 1 / Math.log2(this.difficultyMultiplier))
                );
            }, 0),
            Math.log2(this.difficultyMultiplier)
        );
    }

    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentRhythm = DroidRhythmEvaluator.evaluateDifficultyOf(
            current,
            this.hitWindow.hitWindowFor300()
        );

        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain += this.currentRhythm - 1;

        return this.currentStrain;
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.rhythmStrain = this.currentStrain;
        current.rhythmMultiplier = this.currentRhythm;
    }
}
