import { Mod, OsuHitWindow } from "@rian8337/osu-base";
import { DroidRhythmEvaluator } from "../../evaluators/droid/DroidRhythmEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to properly follow a beatmap's rhythm.
 */
export class DroidRhythm extends DroidSkill {
    protected override readonly reducedSectionCount: number = 5;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly strainDecayBase: number = 0.3;
    protected override readonly starsPerDouble: number = 1.75;

    private currentRhythmStrain: number = 0;
    private currentRhythmMultiplier: number = 1;
    private readonly hitWindow: OsuHitWindow;

    constructor(mods: Mod[], overallDifficulty: number) {
        super(mods);

        this.hitWindow = new OsuHitWindow(overallDifficulty);
    }

    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentRhythmMultiplier =
            DroidRhythmEvaluator.evaluateDifficultyOf(
                current,
                this.hitWindow.hitWindowFor300(),
            );

        this.currentRhythmStrain *= this.strainDecay(current.deltaTime);
        this.currentRhythmStrain += this.currentRhythmMultiplier - 1;

        return this.currentRhythmStrain;
    }

    protected override calculateInitialStrain(
        time: number,
        current: DifficultyHitObject,
    ): number {
        return (
            this.currentRhythmStrain *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.rhythmStrain = this.currentRhythmStrain;
        current.rhythmMultiplier = this.currentRhythmMultiplier;
    }
}
