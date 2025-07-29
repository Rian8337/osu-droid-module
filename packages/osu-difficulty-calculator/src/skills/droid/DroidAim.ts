import { MathUtils, ModMap, Slider } from "@rian8337/osu-base";
import { DroidAimEvaluator } from "../../evaluators/droid/DroidAimEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class DroidAim extends DroidSkill {
    protected override readonly strainDecayBase = 0.15;
    protected override readonly reducedSectionCount = 10;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly starsPerDouble = 1.05;

    private readonly skillMultiplier = 26.5;
    private currentAimStrain = 0;

    private readonly sliderStrains: number[] = [];

    readonly withSliders: boolean;

    constructor(mods: ModMap, withSliders: boolean) {
        super(mods);

        this.withSliders = withSliders;
    }

    /**
     * Obtains the amount of sliders that are considered difficult in terms of relative strain.
     */
    countDifficultSliders(): number {
        if (this.sliderStrains.length === 0) {
            return 0;
        }

        const maxSliderStrain = MathUtils.max(this.sliderStrains);

        if (maxSliderStrain === 0) {
            return 0;
        }

        return this.sliderStrains.reduce(
            (total, strain) =>
                total +
                1 / (1 + Math.exp(-((strain / maxSliderStrain) * 12 - 6))),
            0,
        );
    }

    protected override strainValueAt(
        current: DroidDifficultyHitObject,
    ): number {
        this.currentAimStrain *= this.strainDecay(current.deltaTime);
        this.currentAimStrain +=
            DroidAimEvaluator.evaluateDifficultyOf(current, this.withSliders) *
            this.skillMultiplier;

        if (current.object instanceof Slider) {
            this.sliderStrains.push(this.currentAimStrain);
        }

        return this.currentAimStrain;
    }

    protected override calculateInitialStrain(
        time: number,
        current: DroidDifficultyHitObject,
    ): number {
        return (
            this.currentAimStrain *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override getObjectStrain(): number {
        return this.currentAimStrain;
    }

    /**
     * @param current The hitobject to save to.
     */
    protected override saveToHitObject(
        current: DroidDifficultyHitObject,
    ): void {
        if (this.withSliders) {
            current.aimStrainWithSliders = this.currentAimStrain;
        } else {
            current.aimStrainWithoutSliders = this.currentAimStrain;
        }
    }
}
