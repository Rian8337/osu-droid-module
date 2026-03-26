import {
    MathUtils,
    ModMap,
    ModRelax,
    ModTouchDevice,
    Slider,
} from "@rian8337/osu-base";
import { OsuAgilityEvaluator } from "../../evaluators/osu/OsuAgilityEvaluator";
import { OsuFlowAimEvaluator } from "../../evaluators/osu/OsuFlowAimEvaluator";
import { OsuSnapAimEvaluator } from "../../evaluators/osu/OsuSnapAimEvaluator";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";
import { OsuSkill } from "./OsuSkill";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class OsuAim extends OsuSkill {
    private currentAimStrain = 0;

    private readonly skillMultiplierSnap = 71;
    private readonly skillMultiplierAgility = 2.35;
    private readonly skillMultiplierFlow = 245;
    private readonly skillMultiplierTotal = 1.11;
    private readonly meanExponent = 1.2;

    private readonly sliderStrains: number[] = [];
    private maxSliderStrain = 0;

    readonly withSliders: boolean;

    constructor(mods: ModMap, withSliders: boolean) {
        super(mods);

        this.withSliders = withSliders;
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
        if (this.sliderStrains.length === 0) {
            return 0;
        }

        const consistentTopStrain = difficultyValue * (1 - this.decayWeight);

        if (consistentTopStrain === 0) {
            return 0;
        }

        // Use a weighted sum of all strains. Constants are arbitrary and give nice values
        return this.sliderStrains.reduce(
            (total, next) =>
                total +
                MathUtils.offsetLogistic(
                    next / consistentTopStrain,
                    0.88,
                    10,
                    1.1,
                ),
            0,
        );
    }

    protected override strainValueAt(current: OsuDifficultyHitObject): number {
        const decay = this.strainDecay(current.strainTime);

        let snapDifficulty =
            OsuSnapAimEvaluator.evaluateDifficultyOf(
                current,
                this.withSliders,
            ) * this.skillMultiplierSnap;

        let agilityDifficulty =
            OsuAgilityEvaluator.evaluateDifficultyOf(current) *
            this.skillMultiplierAgility;

        let flowDifficulty =
            OsuFlowAimEvaluator.evaluateDifficultyOf(
                current,
                this.withSliders,
            ) * this.skillMultiplierFlow;

        if (this.mods.has(ModTouchDevice)) {
            // We do not adjust agility here since agility represents TD difficulty in a decent enough way.
            snapDifficulty = Math.pow(snapDifficulty, 0.89);
            flowDifficulty = Math.pow(flowDifficulty, 1.1);
        }

        if (this.mods.has(ModRelax)) {
            agilityDifficulty *= 0.3;
        }

        const totalDifficulty = this.calculateTotalValue(
            snapDifficulty,
            agilityDifficulty,
            flowDifficulty,
        );

        this.currentAimStrain *= decay;
        this.currentAimStrain += totalDifficulty * (1 - decay);

        this._objectStrains.push(this.currentAimStrain);

        if (current.object instanceof Slider) {
            this.sliderStrains.push(this.currentAimStrain);
            this.maxSliderStrain = Math.max(
                this.maxSliderStrain,
                this.currentAimStrain,
            );
        }

        return this.currentAimStrain;
    }

    protected override calculateInitialStrain(
        time: number,
        current: OsuDifficultyHitObject,
    ): number {
        return (
            this.currentAimStrain *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override saveToHitObject(current: OsuDifficultyHitObject) {
        if (this.withSliders) {
            current.aimStrainWithSliders = this.currentAimStrain;
        } else {
            current.aimStrainWithoutSliders = this.currentAimStrain;
        }
    }

    private calculateTotalValue(
        snapDifficulty: number,
        agilityDifficulty: number,
        flowDifficulty: number,
    ): number {
        // We compare flow to combined snap and agility because snap by itself does not have enough difficulty
        // to be above flow on streams. Agility, on the other hand, is supposed to measure the rate of cursor
        // velocity changes while snapping. This means snapping every circle on a stream requires an enormous
        // amount of agility at which point it is easier to flow.
        const combinedSnapDifficulty = MathUtils.norm(
            this.meanExponent,
            snapDifficulty,
            agilityDifficulty,
        );

        const pSnap = this.calculateSnapFlowProbability(
            flowDifficulty / combinedSnapDifficulty,
        );

        const pFlow = 1 - pSnap;

        const totalDifficulty =
            combinedSnapDifficulty * pSnap + flowDifficulty * pFlow;

        return totalDifficulty * this.skillMultiplierTotal;
    }

    /**
     * Converts the ratio of snap to flow into the probability of snapping or flowing.
     *
     * Constraints:
     * - `P(snap) + P(flow) = 1` (the object is always either snapped or flowed)
     * - `P(snap) = f(snap / flow)` and `P(flow) = f(flow/snap)` (i.e., snap and flow are symmetric and
     * reversible). This means `f(x) + f(1/x) = 1`
     * - `0 <= f(x) <= 1` (cannot have negative or greater than 100% probability of snapping or flowing)
     *
     * This logistic function is a solution, which fits nicely with the general idea of interpolation and
     * provides a tuneable constant.
     *
     * @param ratio The ratio.
     * @returns The probability.
     */
    private calculateSnapFlowProbability(ratio: number): number {
        if (ratio === 0) {
            return 0;
        }

        if (Number.isNaN(ratio)) {
            return 1;
        }

        return MathUtils.logistic(-7.27 * Math.log(ratio));
    }

    private strainDecay(ms: number): number {
        return Math.pow(0.15, ms / 1000);
    }
}
