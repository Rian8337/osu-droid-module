import { Mod, ModHidden } from "@rian8337/osu-base";
import { DroidFlashlightEvaluator } from "../../evaluators/droid/DroidFlashlightEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class DroidFlashlight extends DroidSkill {
    protected override readonly skillMultiplier: number = 0.125;
    protected override readonly strainDecayBase: number = 0.15;
    protected override readonly reducedSectionCount: number = 0;
    protected override readonly reducedSectionBaseline: number = 1;
    protected override readonly starsPerDouble: number = 1.05;

    private readonly isHidden: boolean;
    private readonly withSliders: boolean;

    constructor(mods: Mod[], withSliders: boolean) {
        super(mods);

        this.isHidden = mods.some((m) => m instanceof ModHidden);
        this.withSliders = withSliders;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain +=
            DroidFlashlightEvaluator.evaluateDifficultyOf(
                current,
                this.isHidden,
                this.withSliders
            ) * this.skillMultiplier;

        return this.currentStrain;
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        if (this.withSliders) {
            current.flashlightStrainWithSliders = this.currentStrain;
        } else {
            current.flashlightStrainWithoutSliders = this.currentStrain;
        }
    }
}
