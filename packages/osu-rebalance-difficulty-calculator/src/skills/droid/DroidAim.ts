import {
    Interpolation,
    MathUtils,
    ModMap,
    ModRelax,
    Slider,
} from "@rian8337/osu-base";
import { VariableLengthStrainSkill } from "../../base/VariableLengthStrainSkill";
import { DroidAgilityEvaluator } from "../../evaluators/droid/DroidAgilityEvaluator";
import { DroidFlowAimEvaluator } from "../../evaluators/droid/DroidFlowAimEvaluator";
import { DroidSnapAimEvaluator } from "../../evaluators/droid/DroidSnapAimEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { StrainPeak } from "../../structures/StrainPeak";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class DroidAim extends VariableLengthStrainSkill {
    private currentStrain = 0;

    private readonly skillMultiplierSnap = 70.9;
    private readonly skillMultiplierAgility = 2.35;
    private readonly skillMultiplierFlow = 243;
    private readonly skillMultiplierTotal = 1.12;
    private readonly combinedSnapNormExponent = 1.2;

    /**
     * The number of sections with the highest strains, which the peak strain reductions will apply to.
     * This is done in order to decrease their impact on the overall difficulty of the beatmap.
     */
    private readonly reducedSectionTime = 4000;

    /**
     * The baseline multiplier applied to the section with the biggest strain.
     */
    private readonly reducedStrainBaseline = 0.727;

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

        const consistentTopStrain = difficultyValue / 10;

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

    protected override strainValueAt(
        current: DroidDifficultyHitObject,
    ): number {
        const decay = this.strainDecay(current.strainTime);

        const snapDifficulty =
            DroidSnapAimEvaluator.evaluateDifficultyOf(
                current,
                this.withSliders,
            ) * this.skillMultiplierSnap;

        const agilityDifficulty =
            DroidAgilityEvaluator.evaluateDifficultyOf(current) *
            this.skillMultiplierAgility;

        const flowDifficulty =
            DroidFlowAimEvaluator.evaluateDifficultyOf(
                current,
                this.withSliders,
            ) * this.skillMultiplierFlow;

        const totalDifficulty = this.calculateTotalValue(
            snapDifficulty,
            agilityDifficulty,
            flowDifficulty,
        );

        this.currentStrain *= decay;
        this.currentStrain += totalDifficulty * (1 - decay);

        if (current.object instanceof Slider) {
            this.sliderStrains.push(this.currentStrain);
            this.maxSliderStrain = Math.max(
                this.maxSliderStrain,
                this.currentStrain,
            );
        }

        return this.currentStrain;
    }

    protected override calculateInitialStrain(
        time: number,
        current: DroidDifficultyHitObject,
    ): number {
        return (
            this.currentStrain *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
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

    private calculateTotalValue(
        snapDifficulty: number,
        agilityDifficulty: number,
        flowDifficulty: number,
    ): number {
        // We compare flow to combined snap and agility because snap by itself does not have enough difficulty
        // to be above flow on streams. Agility, on the other hand, is supposed to measure the rate of cursor
        // velocity changes while snapping. This means snapping every circle on a stream requires an enormous
        // amount of agility at which point it is easier to flow.

        let combinedSnapDifficulty = MathUtils.norm(
            this.combinedSnapNormExponent,
            snapDifficulty,
            agilityDifficulty,
        );

        const pSnap = this.calculateSnapFlowProbability(
            flowDifficulty / combinedSnapDifficulty,
        );

        const pFlow = 1 - pSnap;

        // Invert rating summation to obtain a more accurate TD adjustment.
        snapDifficulty =
            Math.pow(0.02275 * Math.pow(10, 0.63), (0.8 - 1) / 0.63) *
            Math.pow(snapDifficulty, 0.8);

        combinedSnapDifficulty = MathUtils.norm(
            this.combinedSnapNormExponent,
            snapDifficulty,
            agilityDifficulty,
        );

        if (this.mods.has(ModRelax)) {
            combinedSnapDifficulty *= 0.75;
            flowDifficulty *= 0.6;
        }

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

    override difficultyValue(): number {
        let time = 0;
        let difficulty = 0;

        for (const strain of this.getReducedStrainPeaks()) {
            /* Weighting function can be thought of as:
                    b
                    ∫ decayWeight^x dx
                    a
                where a = startTime and b = endTime

                Technically, the function below has been slightly modified from the equation above.
                The real function would be
                    double weight = Math.pow(this.decayWeight, startTime) - Math.pow(this.decayWeight, endTime))
                    ...
                    return difficulty / Math.log(1 / this.decayWeight)
                E.g. for a decayWeight of 0.9, we're multiplying by 10 instead of 9.49122...

                This change makes it so that a beatmap composed solely of maxSectionLength chunks will have the exact same value
                when summed in this class and StrainSkill.
                Doing this ensures the relationship between strain values and difficulty values remains the same between the two
                classes.
            */
            const startTime = time;
            const endTime = time + strain.sectionLength / this.maxSectionLength;

            const weight =
                Math.pow(this.decayWeight, startTime) -
                Math.pow(this.decayWeight, endTime);

            difficulty += strain.value * weight;
            time = endTime;
        }

        return difficulty / (1 - this.decayWeight);
    }

    private getReducedStrainPeaks(): StrainPeak[] {
        // Sections with 0 strain are excluded to avoid worst-case time complexity of the following sort (e.g. /b/2351871).
        // These sections will not contribute to the difficulty.
        const strains = this.currentStrainPeaks
            .filter((s) => s.value > 0)
            .sort((a, b) => b.value - a.value);

        let time = 0;
        // All strains are removed at the end for optimization.
        let strainsToRemove = 0;

        // We are reducing the highest strains first to account for extreme difficulty spikes.
        // Strains are split into 20ms chunks to try to mitigate inconsistencies caused by reducing strains.
        const chunkSize = 20;

        while (
            strains.length > strainsToRemove &&
            time < this.reducedSectionTime
        ) {
            const strain = strains[strainsToRemove];

            for (
                let addedTime = 0;
                addedTime < strain.sectionLength;
                addedTime += chunkSize
            ) {
                const scale = Math.log10(
                    Interpolation.lerp(
                        1,
                        10,
                        MathUtils.clamp(
                            (time + addedTime) / this.reducedSectionTime,
                            0,
                            1,
                        ),
                    ),
                );

                strains.push(
                    new StrainPeak(
                        strain.value *
                            Interpolation.lerp(
                                this.reducedStrainBaseline,
                                1,
                                scale,
                            ),
                        Math.min(chunkSize, strain.sectionLength - addedTime),
                    ),
                );
            }

            time += strain.sectionLength;
            ++strainsToRemove;
        }

        strains.splice(0, strainsToRemove);

        return strains.sort((a, b) => b.value - a.value);
    }

    private strainDecay(ms: number): number {
        return Math.pow(0.2, ms / 1000);
    }
}
