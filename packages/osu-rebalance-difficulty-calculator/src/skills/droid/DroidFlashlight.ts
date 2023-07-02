import { Mod, ModHidden } from "@rian8337/osu-base";
import { DroidFlashlightEvaluator } from "../../evaluators/droid/DroidFlashlightEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class DroidFlashlight extends DroidSkill {
    protected override readonly strainDecayBase: number = 0.15;

    private readonly isHidden: boolean;
    private readonly withSliders: boolean;
    private readonly skillMultiplier: number = 0.052;

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

    override difficultyValue(): number {
        return (
            this.strains.reduce(
                (a, v) => a + (v.strainCountChange > 0 ? v.strain : 0),
                0
            ) * this.difficultyMultiplier
        );
    }
}
