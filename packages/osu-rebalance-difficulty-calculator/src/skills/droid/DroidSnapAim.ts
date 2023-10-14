import { Mod } from "@rian8337/osu-base";
import { DroidAim } from "./DroidAim";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSnapAimEvaluator } from "../../evaluators/droid/DroidSnapAimEvaluator";

/**
 * Represents the skill required to correctly snap aim at every object in the map
 * with a uniform CircleSize and normalized distances.
 */
export class DroidSnapAim extends DroidAim {
    protected override readonly starsPerDouble: number = 1.025;

    private readonly skillMultiplier: number = 22.55;
    private readonly withSliders: boolean;

    constructor(mods: Mod[], withSliders: boolean) {
        super(mods);

        this.withSliders = withSliders;
    }

    protected override strainValueAt(
        current: DroidDifficultyHitObject,
    ): number {
        this.currentAimStrain *= this.strainDecay(current.deltaTime);
        this.currentAimStrain +=
            DroidSnapAimEvaluator.evaluateDifficultyOf(
                current,
                this.withSliders,
            ) * this.skillMultiplier;

        return this.currentAimStrain;
    }

    protected override saveToHitObject(
        current: DroidDifficultyHitObject,
    ): void {
        current.snapAimStrain = this.currentAimStrain;
    }
}
