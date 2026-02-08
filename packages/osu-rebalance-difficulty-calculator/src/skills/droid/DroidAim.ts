import { ErrorFunction, MathUtils, ModMap, Slider } from "@rian8337/osu-base";
import { TimeSkill } from "../../base/TimeSkill";
import { DroidAimEvaluator } from "../../evaluators/droid/DroidAimEvaluator";
import { DroidSpeedAimEvaluator } from "../../evaluators/droid/DroidSpeedAimEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { StrainUtils } from "../../utils/StrainUtils";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class DroidAim extends TimeSkill {
    private currentAimStrain = 0;
    private currentSpeedStrain = 0;

    private readonly skillMultiplierAim = 130;
    private readonly skillMultiplierSpeed = 6.5;
    private readonly skillMultiplierTotal = 0.98;
    private readonly meanExponent = 1.2;

    private readonly sliderDifficulties: number[] = [];
    private maxSliderDifficulty = 0;

    readonly withSliders: boolean;

    constructor(mods: ModMap, withSliders: boolean) {
        super(mods);

        this.withSliders = withSliders;
    }

    /**
     * Obtains the amount of sliders that are considered difficult in terms of relative difficulty.
     */
    countDifficultSliders(): number {
        if (
            this.sliderDifficulties.length === 0 ||
            this.maxSliderDifficulty === 0
        ) {
            return 0;
        }

        return this.sliderDifficulties.reduce(
            (total, strain) =>
                total +
                1 /
                    (1 +
                        Math.exp(
                            -((strain / this.maxSliderDifficulty) * 12 - 6),
                        )),
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
            this.sliderDifficulties,
            difficultyValue,
        );
    }

    protected override calculateHitProbability(
        skill: number,
        difficulty: number,
    ): number {
        if (difficulty <= 0) {
            return 1;
        }

        if (skill <= 0) {
            return 0;
        }

        return ErrorFunction.erf(skill / (Math.SQRT2 * difficulty));
    }

    protected override objectDifficultyOf(
        current: DroidDifficultyHitObject,
    ): number {
        const decayAim = this.strainDecayAim(current.strainTime);
        const decaySpeed = this.strainDecaySpeed(current.strainTime);

        const aimDifficulty = Math.pow(
            DroidAimEvaluator.evaluateDifficultyOf(current, this.withSliders),
            0.8,
        );

        const speedDifficulty = Math.pow(
            DroidSpeedAimEvaluator.evaluateDifficultyOf(current),
            0.95,
        );

        this.currentAimStrain *= decayAim;
        this.currentAimStrain +=
            aimDifficulty * (1 - decayAim) * this.skillMultiplierAim;

        this.currentSpeedStrain *= decaySpeed;
        this.currentSpeedStrain +=
            speedDifficulty * (1 - decaySpeed) * this.skillMultiplierSpeed;

        const totalStrain = MathUtils.norm(
            this.meanExponent,
            this.currentAimStrain,
            this.currentSpeedStrain,
        );

        if (current.object instanceof Slider) {
            this.sliderDifficulties.push(totalStrain);

            this.maxSliderDifficulty = Math.max(
                this.maxSliderDifficulty,
                totalStrain,
            );
        }

        return totalStrain * this.skillMultiplierTotal;
    }

    protected override saveToHitObject(
        current: DroidDifficultyHitObject,
        difficulty: number,
    ) {
        if (this.withSliders) {
            current.aimStrainWithSliders = difficulty;
        } else {
            current.aimStrainWithoutSliders = difficulty;
        }
    }

    private strainDecayAim(ms: number): number {
        return Math.pow(0.15, ms / 1000);
    }

    private strainDecaySpeed(ms: number): number {
        return Math.pow(0.3, ms / 1000);
    }
}
