import { Mod, ModHidden } from "@rian8337/osu-base";
import { DroidFlashlightEvaluator } from "../../evaluators/droid/DroidFlashlightEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class DroidFlashlight extends DroidSkill {
    protected override readonly strainDecayBase: number = 0.15;
    protected override readonly reducedSectionCount: number = 0;
    protected override readonly reducedSectionBaseline: number = 1;
    protected override readonly starsPerDouble: number = 1.06;

    private readonly skillMultiplier: number = 0.052;
    private readonly isHidden: boolean;
    private readonly withSliders: boolean;
    private currentFlashlightStrain: number = 0;

    constructor(mods: Mod[], withSliders: boolean) {
        super(mods);

        this.isHidden = mods.some((m) => m instanceof ModHidden);
        this.withSliders = withSliders;
    }

    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentFlashlightStrain *= this.strainDecay(current.deltaTime);
        this.currentFlashlightStrain +=
            DroidFlashlightEvaluator.evaluateDifficultyOf(
                current,
                this.isHidden,
                this.withSliders,
            ) * this.skillMultiplier;

        return this.currentFlashlightStrain;
    }

    protected override calculateInitialStrain(
        time: number,
        current: DifficultyHitObject,
    ): number {
        return (
            this.currentFlashlightStrain *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        if (this.withSliders) {
            current.flashlightStrainWithSliders = this.currentFlashlightStrain;
        } else {
            current.flashlightStrainWithoutSliders =
                this.currentFlashlightStrain;
        }
    }

    override difficultyValue(): number {
        return Math.pow(
            this.strainPeaks.reduce((a, v) => a + v, 0) * this.starsPerDouble,
            0.8,
        );
    }
}
