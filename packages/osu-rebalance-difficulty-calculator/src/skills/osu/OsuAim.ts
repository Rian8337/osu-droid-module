import { MathUtils, ModMap, ModTouchDevice, Slider } from "@rian8337/osu-base";
import { OsuAimEvaluator } from "../../evaluators/osu/OsuAimEvaluator";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";
import { OsuSkill } from "./OsuSkill";
import { StrainUtils } from "../../utils/StrainUtils";
import { OsuSpeedAimEvaluator } from "../../evaluators/osu/OsuSpeedAimEvaluator";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class OsuAim extends OsuSkill {
    protected override readonly strainDecayBase = 0.15;
    protected override readonly reducedSectionCount = 10;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly decayWeight = 0.9;

    private currentAimStrain = 0;
    private currentSpeedStrain = 0;

    private readonly skillMultiplierAim = 26;
    private readonly skillMultiplierSpeed = 1.3;
    private readonly skillMultiplierTotal = 1.02;
    private readonly meanExponent = 1.2;

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

    protected override strainValueAt(current: OsuDifficultyHitObject): number {
        const decayAim = this.strainDecayAim(current.strainTime);
        const decaySpeed = this.strainDecaySpeed(current.strainTime);

        let aimDifficulty = OsuAimEvaluator.evaluateDifficultyOf(
            current,
            this.withSliders,
        );

        let speedDifficulty =
            OsuSpeedAimEvaluator.evaluateDifficultyOf(current);

        if (this.mods.has(ModTouchDevice)) {
            aimDifficulty = Math.pow(aimDifficulty, 0.8);
            speedDifficulty = Math.pow(speedDifficulty, 0.95);
        }

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

        this._objectStrains.push(totalStrain);

        if (current.object instanceof Slider) {
            this.sliderStrains.push(totalStrain);
        }

        return totalStrain * this.skillMultiplierTotal;
    }

    protected override calculateInitialStrain(
        time: number,
        current: OsuDifficultyHitObject,
    ): number {
        const deltaTime = time - (current.previous(0)?.startTime ?? 0);

        return MathUtils.norm(
            this.meanExponent,
            this.currentAimStrain * this.strainDecayAim(deltaTime),
            this.currentSpeedStrain * this.strainDecaySpeed(deltaTime),
        );
    }

    protected override saveToHitObject(current: OsuDifficultyHitObject) {
        const strain = MathUtils.norm(
            this.meanExponent,
            this.currentAimStrain,
            this.currentSpeedStrain,
        );

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
