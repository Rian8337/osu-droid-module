import { OsuHitWindow, Mod } from "@rian8337/osu-base";
import { DroidTapEvaluator } from "../../evaluators/droid/DroidTapEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class DroidTap extends DroidSkill {
    protected override readonly skillMultiplier: number = 1375;
    protected override readonly reducedSectionCount: number = 5;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly strainDecayBase: number = 0.3;
    protected override readonly starsPerDouble: number = 1.1;

    // ~200 1/4 BPM streams
    private readonly minSpeedBonus: number = 75;

    private currentTapStrain: number = 0;
    private currentOriginalTapStrain: number = 0;

    private readonly greatWindow: number;

    constructor(mods: Mod[], overallDifficulty: number) {
        super(mods);

        this.greatWindow = new OsuHitWindow(
            overallDifficulty
        ).hitWindowFor300();
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        const decay: number = this.strainDecay(current.strainTime);

        this.currentTapStrain *= decay;
        this.currentTapStrain +=
            DroidTapEvaluator.evaluateDifficultyOf(
                current,
                this.greatWindow,
                true
            ) * this.skillMultiplier;

        this.currentOriginalTapStrain *= decay;
        this.currentOriginalTapStrain +=
            DroidTapEvaluator.evaluateDifficultyOf(
                current,
                this.greatWindow,
                false
            ) * this.skillMultiplier;
        this.currentOriginalTapStrain *= current.rhythmMultiplier;

        return this.currentTapStrain * current.rhythmMultiplier;
    }

    /**
     * @param current The hitobject to save to.
     */
    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.tapStrain = this.currentStrain;
        current.originalTapStrain = this.currentOriginalTapStrain;
    }
}
