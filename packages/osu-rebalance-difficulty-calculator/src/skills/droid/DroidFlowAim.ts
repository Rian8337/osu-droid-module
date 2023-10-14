import { DroidFlowAimEvaluator } from "../../evaluators/droid/DroidFlowAimEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidAim } from "./DroidAim";

/**
 * Represents the skill required to correctly flow aim at every object in the map
 * with a uniform CircleSize and normalized distances.
 */
export class DroidFlowAim extends DroidAim {
    private readonly skillMultiplier: number = 22.55;

    protected override strainValueAt(
        current: DroidDifficultyHitObject,
    ): number {
        this.currentAimStrain *= this.strainDecay(current.deltaTime);
        this.currentAimStrain +=
            DroidFlowAimEvaluator.evaluateDifficultyOf(current) *
            this.skillMultiplier;

        return this.currentAimStrain;
    }

    protected override saveToHitObject(
        current: DroidDifficultyHitObject,
    ): void {
        current.flowAimStrain = this.currentAimStrain;
    }
}
