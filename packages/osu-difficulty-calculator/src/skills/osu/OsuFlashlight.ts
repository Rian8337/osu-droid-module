import { OsuFlashlightEvaluator } from "../../evaluators/osu/OsuFlashlightEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { OsuSkill } from "./OsuSkill";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class OsuFlashlight extends OsuSkill {
    protected override readonly skillMultiplier: number = 0.15;
    protected override readonly strainDecayBase: number = 0.15;
    protected override readonly reducedSectionCount: number = 10;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly difficultyMultiplier: number = 1.06;
    protected override readonly decayWeight: number = 1;

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain +=
            OsuFlashlightEvaluator.evaluateDifficultyOf(current) *
            this.skillMultiplier;

        return this.currentStrain;
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.flashlightStrain = this.currentStrain;
    }
}
