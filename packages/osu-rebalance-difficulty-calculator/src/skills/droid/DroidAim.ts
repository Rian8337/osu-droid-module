import { MathUtils, ModMap, Slider } from "@rian8337/osu-base";
import { DroidAimEvaluator } from "../../evaluators/droid/DroidAimEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSkill } from "./DroidSkill";
import { StrainUtils } from "../../utils/StrainUtils";
import { DroidSpeedAimEvaluator } from "../../evaluators/droid/DroidSpeedAimEvaluator";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class DroidAim extends DroidSkill {
    protected override readonly strainDecayBase = 0.15;
    protected override readonly reducedSectionCount = 10;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly starsPerDouble = 1.05;

    private currentAimStrain = 0;
    private currentSpeedStrain = 0;

    private readonly skillMultiplierAim = 26;
    private readonly skillMultiplierSpeed = 1.3;
    private readonly skillMultiplierTotal = 1.02;
    private readonly meanExponent = 1.2;

    private readonly sliderStrains: number[] = [];
    private maxSliderStrain = 0;

    readonly withSliders: boolean;

    constructor(mods: ModMap, withSliders: boolean) {
        super(mods);

        this.withSliders = withSliders;
    }

    static override difficultyToPerformance(difficulty: number): number {
        return super.difficultyToPerformance(Math.pow(difficulty, 0.8));
    }

    /**
     * Obtains the amount of sliders that are considered difficult in terms of relative strain.
     */
    countDifficultSliders(): number {
        if (this.sliderStrains.length === 0 || this.maxSliderStrain === 0) {
            return 0;
        }

        return this.sliderStrains.reduce(
            (total, strain) =>
                total +
                1 / (1 + Math.exp(-((strain / this.maxSliderStrain) * 12 - 6))),
            0,
        );
    }

    /**
     * Obtains the amount of sliders that are considered difficult in terms of relative strain, weighted by consistency.
     *
     * @param difficultyValue The final difficulty value.
     */
    countTopWeightedSliders(difficultyValue: number): number {
        return StrainUtils.countTopWeightedSliders(
            this.sliderStrains,
            difficultyValue,
        );
    }

    protected override strainValueAt(
        current: DroidDifficultyHitObject,
    ): number {
        const decayAim = this.strainDecayAim(current.strainTime);
        const decaySpeed = this.strainDecaySpeed(current.strainTime);

        this.currentAimStrain *= decayAim;
        this.currentAimStrain +=
            DroidAimEvaluator.evaluateDifficultyOf(current, this.withSliders) *
            (1 - decayAim) *
            this.skillMultiplierAim;

        this.currentSpeedStrain *= decaySpeed;
        this.currentSpeedStrain +=
            DroidSpeedAimEvaluator.evaluateDifficultyOf(current) *
            (1 - decaySpeed) *
            this.skillMultiplierSpeed;

        const totalStrain = MathUtils.norm(
            this.meanExponent,
            this.currentAimStrain,
            this.currentSpeedStrain,
        );

        if (current.object instanceof Slider) {
            this.sliderStrains.push(totalStrain);

            this.maxSliderStrain = Math.max(this.maxSliderStrain, totalStrain);
        }

        return totalStrain * this.skillMultiplierTotal;
    }

    protected override calculateInitialStrain(
        time: number,
        current: DroidDifficultyHitObject,
    ): number {
        const deltaTime = time - (current.previous(0)?.startTime ?? 0);

        return MathUtils.norm(
            this.meanExponent,
            this.currentAimStrain * this.strainDecayAim(deltaTime),
            this.currentSpeedStrain * this.strainDecaySpeed(deltaTime),
        );
    }

    protected override getObjectStrain(): number {
        return MathUtils.norm(
            this.meanExponent,
            this.currentAimStrain,
            this.currentSpeedStrain,
        );
    }

    protected override saveToHitObject(current: DroidDifficultyHitObject) {
        const strain = this.getObjectStrain();

        if (this.withSliders) {
            current.aimStrainWithSliders = strain;
        } else {
            current.aimStrainWithoutSliders = strain;
        }
    }

    private strainDecayAim(ms: number): number {
        return Math.pow(0.15, ms / 1000);
    }

    private strainDecaySpeed(ms: number): number {
        return Math.pow(0.3, ms / 1000);
    }
}
