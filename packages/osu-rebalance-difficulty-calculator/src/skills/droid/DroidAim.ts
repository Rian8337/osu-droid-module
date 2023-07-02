import { Mod } from "@rian8337/osu-base";
import { DroidAimEvaluator } from "../../evaluators/droid/DroidAimEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class DroidAim extends DroidSkill {
    protected override readonly strainDecayBase: number = 0.15;

    private readonly withSliders: boolean;
    private readonly skillMultiplier: number = 23.55;

    constructor(mods: Mod[], withSliders: boolean) {
        super(mods);

        this.withSliders = withSliders;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain +=
            DroidAimEvaluator.evaluateDifficultyOf(current, this.withSliders) *
            this.skillMultiplier;

        return this.currentStrain;
    }

    /**
     * @param current The hitobject to save to.
     */
    protected override saveToHitObject(current: DifficultyHitObject): void {
        if (this.withSliders) {
            current.aimStrainWithSliders = this.currentStrain;
        } else {
            current.aimStrainWithoutSliders = this.currentStrain;
        }
    }
}
