import { Mod, OsuHitWindow } from "@rian8337/osu-base";
import { DroidRhythmEvaluator } from "../../evaluators/droid/DroidRhythmEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to properly follow a beatmap's rhythm.
 */
export class DroidRhythm extends DroidSkill {
    protected override readonly strainDecayBase: number = 0.3;

    private currentRhythm: number = 1;
    private readonly skillMultiplier: number = 20;
    private readonly hitWindow: OsuHitWindow;

    constructor(mods: Mod[], overallDifficulty: number) {
        super(mods);

        this.hitWindow = new OsuHitWindow(overallDifficulty);
    }

    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentRhythm = DroidRhythmEvaluator.evaluateDifficultyOf(
            current,
            this.hitWindow.hitWindowFor300()
        );

        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain += (this.currentRhythm - 1) * this.skillMultiplier;

        return this.currentStrain;
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.rhythmStrain = this.currentStrain;
        current.rhythmMultiplier = this.currentRhythm;
    }
}
