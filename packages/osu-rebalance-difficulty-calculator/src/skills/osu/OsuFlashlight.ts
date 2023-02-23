import { Mod, ModHidden } from "@rian8337/osu-base";
import { OsuFlashlightEvaluator } from "../../evaluators/osu/OsuFlashlightEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { OsuSkill } from "./OsuSkill";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class OsuFlashlight extends OsuSkill {
    protected override readonly skillMultiplier: number = 0.052;
    protected override readonly strainDecayBase: number = 0.15;
    protected override readonly reducedSectionCount: number = 0;
    protected override readonly reducedSectionBaseline: number = 1;
    protected override readonly decayWeight: number = 1;

    private readonly isHidden: boolean;

    constructor(mods: Mod[]) {
        super(mods);

        this.isHidden = mods.some((m) => m instanceof ModHidden);
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain +=
            OsuFlashlightEvaluator.evaluateDifficultyOf(
                current,
                this.isHidden
            ) * this.skillMultiplier;

        return this.currentStrain;
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.flashlightStrainWithSliders = this.currentStrain;
    }
}
