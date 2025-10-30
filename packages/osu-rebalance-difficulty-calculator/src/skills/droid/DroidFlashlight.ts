import { ModMap, Slider } from "@rian8337/osu-base";
import { DroidFlashlightEvaluator } from "../../evaluators/droid/DroidFlashlightEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSkill } from "./DroidSkill";
import { StrainUtils } from "../../utils/StrainUtils";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class DroidFlashlight extends DroidSkill {
    protected override readonly strainDecayBase = 0.15;
    protected override readonly reducedSectionCount = 0;
    protected override readonly reducedSectionBaseline = 1;
    protected override readonly starsPerDouble = 1.06;

    private readonly skillMultiplier = 0.023;
    private currentFlashlightStrain = 0;

    readonly withSliders: boolean;
    private readonly sliderStrains: number[] = [];

    constructor(mods: ModMap, withSliders: boolean) {
        super(mods);

        this.withSliders = withSliders;
    }

    static override difficultyToPerformance(difficulty: number): number {
        return Math.pow(difficulty, 1.6) * 25;
    }

    /**
     * Obtains the amount of sliders that are considered difficult in terms of relative strain, weighted by consistency.
     */
    countTopWeightedSliders(): number {
        return StrainUtils.countTopWeightedSliders(
            this.sliderStrains,
            this.difficulty,
        );
    }

    protected override strainValueAt(
        current: DroidDifficultyHitObject,
    ): number {
        this.currentFlashlightStrain *= this.strainDecay(current.deltaTime);
        this.currentFlashlightStrain +=
            DroidFlashlightEvaluator.evaluateDifficultyOf(
                current,
                this.mods,
                this.withSliders,
            ) * this.skillMultiplier;

        if (current.object instanceof Slider) {
            this.sliderStrains.push(this.currentFlashlightStrain);
        }

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

    protected override getObjectStrain(): number {
        return this.currentFlashlightStrain;
    }

    protected override saveToHitObject(
        current: DroidDifficultyHitObject,
    ): void {
        if (this.withSliders) {
            current.flashlightStrainWithSliders = this.currentFlashlightStrain;
        } else {
            current.flashlightStrainWithoutSliders =
                this.currentFlashlightStrain;
        }
    }

    override difficultyValue(): number {
        return (
            this.strainPeaks.reduce((a, v) => a + v, 0) * this.starsPerDouble
        );
    }
}
