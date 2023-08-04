import {
    ModRelax,
    ModFlashlight,
    Modes,
    Utils,
    OsuHitWindow,
    DroidHitWindow,
    ModPrecise,
    ErrorFunction,
    ModScoreV2,
} from "@rian8337/osu-base";
import { PerformanceCalculator } from "./base/PerformanceCalculator";
import { DroidDifficultyAttributes } from "./structures/DroidDifficultyAttributes";
import { PerformanceCalculationOptions } from "./structures/PerformanceCalculationOptions";

/**
 * A performance points calculator that calculates performance points for osu!droid gamemode.
 */
export class DroidPerformanceCalculator extends PerformanceCalculator {
    /**
     * The aim performance value.
     */
    aim: number = 0;

    /**
     * The tap performance value.
     */
    tap: number = 0;

    /**
     * The accuracy performance value.
     */
    accuracy: number = 0;

    /**
     * The flashlight performance value.
     */
    flashlight: number = 0;

    /**
     * The visual performance value.
     */
    visual: number = 0;

    /**
     * The penalty used to penalize the tap performance value.
     *
     * Can be properly obtained by analyzing the replay associated with the score.
     */
    get tapPenalty(): number {
        return this._tapPenalty;
    }

    /**
     * The estimated deviation of the score.
     */
    get deviation(): number {
        return this._deviation;
    }

    /**
     * The estimated tap deviation of the score.
     */
    get tapDeviation(): number {
        return this._tapDeviation;
    }

    /**
     * The penalty used to penalize the aim performance value.
     *
     * Can be properly obtained by analyzing the replay associated with the score.
     */
    get aimSliderCheesePenalty(): number {
        return this._aimSliderCheesePenalty;
    }

    /**
     * The penalty used to penalize the flashlight performance value.
     *
     * Can be properly obtained by analyzing the replay associated with the score.
     */
    get flashlightSliderCheesePenalty(): number {
        return this._flashlightSliderCheesePenalty;
    }

    /**
     * The penalty used to penalize the visual performance value.
     *
     * Can be properly obtained by analyzing the replay associated with the score.
     */
    get visualSliderCheesePenalty(): number {
        return this._visualSliderCheesePenalty;
    }

    override readonly difficultyAttributes: DroidDifficultyAttributes;
    protected override finalMultiplier = 1.24;
    protected override readonly mode: Modes = Modes.droid;

    private _aimSliderCheesePenalty: number = 1;
    private _flashlightSliderCheesePenalty: number = 1;
    private _visualSliderCheesePenalty: number = 1;

    private _tapPenalty: number = 1;
    private _deviation: number = 0;
    private _tapDeviation: number = 0;

    /**
     * @param difficultyAttributes The difficulty attributes to calculate.
     */
    constructor(difficultyAttributes: DroidDifficultyAttributes) {
        super();

        this.difficultyAttributes = Utils.deepCopy(difficultyAttributes);
    }

    /**
     * Applies a tap penalty value to this calculator.
     *
     * The tap and total performance value will be recalculated afterwards.
     *
     * @param value The tap penalty value. Must be greater than or equal to 1.
     */
    applyTapPenalty(value: number): void {
        if (value < 1) {
            throw new RangeError(
                "New tap penalty must be greater than or equal to one."
            );
        }

        if (value === this._tapPenalty) {
            return;
        }

        this.tap *= this._tapPenalty / value;
        this._tapPenalty = value;

        this.calculateTotalValue();
    }

    /**
     * Applies an aim slider cheese penalty value to this calculator.
     *
     * The aim and total performance value will be recalculated afterwards.
     *
     * @param value The slider cheese penalty value. Must be between than 0 and 1.
     */
    applyAimSliderCheesePenalty(value: number): void {
        if (value < 0) {
            throw new RangeError(
                "New aim slider cheese penalty must be greater than or equal to zero."
            );
        }

        if (value > 1) {
            throw new RangeError(
                "New aim slider cheese penalty must be less than or equal to one."
            );
        }

        if (value === this._aimSliderCheesePenalty) {
            return;
        }

        this._aimSliderCheesePenalty = value;

        this.calculateAimValue();
        this.calculateTotalValue();
    }

    /**
     * Applies a flashlight slider cheese penalty value to this calculator.
     *
     * The flashlight and total performance value will be recalculated afterwards.
     *
     * @param value The slider cheese penalty value. Must be between 0 and 1.
     */
    applyFlashlightSliderCheesePenalty(value: number): void {
        if (value < 0) {
            throw new RangeError(
                "New flashlight slider cheese penalty must be greater than or equal to zero."
            );
        }

        if (value > 1) {
            throw new RangeError(
                "New flashlight slider cheese penalty must be less than or equal to one."
            );
        }

        if (value === this._flashlightSliderCheesePenalty) {
            return;
        }

        this._flashlightSliderCheesePenalty = value;

        this.calculateFlashlightValue();
        this.calculateTotalValue();
    }

    /**
     * Applies a visual slider cheese penalty value to this calculator.
     *
     * The visual and total performance value will be recalculated afterwards.
     *
     * @param value The slider cheese penalty value. Must be between 0 and 1.
     */
    applyVisualSliderCheesePenalty(value: number): void {
        if (value < 0) {
            throw new RangeError(
                "New visual slider cheese penalty must be greater than or equal to zero."
            );
        }

        if (value > 1) {
            throw new RangeError(
                "New visual slider cheese penalty must be less than or equal to one."
            );
        }

        if (value === this._visualSliderCheesePenalty) {
            return;
        }

        this._visualSliderCheesePenalty = value;

        this.calculateVisualValue();
        this.calculateTotalValue();
    }

    protected override calculateValues(): void {
        this._deviation = this.calculateDeviation();
        this._tapDeviation = this.calculateTapDeviation();

        this.calculateAimValue();
        this.calculateTapValue();
        this.calculateAccuracyValue();
        this.calculateFlashlightValue();
        this.calculateVisualValue();
    }

    protected override calculateTotalValue(): void {
        this.total =
            Math.pow(
                Math.pow(this.aim, 1.1) +
                    Math.pow(this.tap, 1.1) +
                    Math.pow(this.accuracy, 1.1) +
                    Math.pow(this.flashlight, 1.1) +
                    Math.pow(this.visual, 1.1),
                1 / 1.1
            ) * this.finalMultiplier;
    }

    protected override handleOptions(
        options?: PerformanceCalculationOptions
    ): void {
        this._tapPenalty = options?.tapPenalty ?? 1;
        this._aimSliderCheesePenalty = options?.aimSliderCheesePenalty ?? 1;
        this._flashlightSliderCheesePenalty =
            options?.flashlightSliderCheesePenalty ?? 1;
        this._visualSliderCheesePenalty =
            options?.visualSliderCheesePenalty ?? 1;

        super.handleOptions(options);
    }

    /**
     * Calculates the aim performance value of the beatmap.
     */
    private calculateAimValue(): void {
        this.aim = this.baseValue(
            Math.pow(this.difficultyAttributes.aimDifficulty, 0.8)
        );

        this.aim *= this.calculateMissPenalty(
            this.difficultyAttributes.aimDifficultStrainCount
        );

        // Scale the aim value with object count to penalize short maps.
        this.aim *= Math.min(
            1,
            1.650668 +
                (0.4845796 - 1.650668) /
                    (1 + Math.pow(this.totalHits / 817.9306, 1.147469))
        );

        // Scale the aim value with slider factor to nerf very likely dropped sliderends.
        this.aim *= this.sliderNerfFactor;

        // Scale the aim value with slider cheese penalty.
        this.aim *= this._aimSliderCheesePenalty;

        // Scale the aim value with deviation.
        this.aim *=
            1.05 *
            Math.pow(
                ErrorFunction.erf(32.0625 / (Math.SQRT2 * this._deviation)),
                1.5
            );
    }

    /**
     * Calculates the tap performance value of the beatmap.
     */
    private calculateTapValue(): void {
        this.tap = this.baseValue(this.difficultyAttributes.tapDifficulty);

        this.tap *= this.calculateMissPenalty(
            this.difficultyAttributes.tapDifficultStrainCount
        );

        // Scale the tap value with object count to penalize short maps.
        this.tap *= Math.min(
            1,
            1.625 +
                (0.4845796 - 1.625) /
                    (1 + Math.pow(this.totalHits / 850, 1.147469))
        );

        // Normalize the deviation to 300 BPM.
        const normalizedDeviation: number =
            this.tapDeviation *
            Math.max(1, 50 / this.difficultyAttributes.averageSpeedDeltaTime);
        // We expect the player to get 7500/x deviation when doubletapping x BPM.
        // Using this expectation, we penalize scores with deviation above 25.
        const averageBPM: number =
            60000 / 4 / this.difficultyAttributes.averageSpeedDeltaTime;
        const adjustedDeviation: number =
            normalizedDeviation *
            (1 +
                1 /
                    (1 +
                        Math.exp(
                            -(normalizedDeviation - 7500 / averageBPM) /
                                ((2 * 300) / averageBPM)
                        )));

        // Scale the tap value with tap deviation.
        this.tap *=
            1.1 *
            Math.pow(
                ErrorFunction.erf(25 / (Math.SQRT2 * adjustedDeviation)),
                1.25
            );

        // Scale the tap value with three-fingered penalty.
        this.tap /= this._tapPenalty;
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    private calculateAccuracyValue(): void {
        if (
            this.difficultyAttributes.mods.some((m) => m instanceof ModRelax) ||
            this.totalSuccessfulHits === 0
        ) {
            this.accuracy = 0;

            return;
        }

        this.accuracy =
            650 *
            Math.exp(-0.125 * this._deviation) *
            // The following function is to give higher reward for deviations lower than 25 (250 UR).
            (15 / (this._deviation + 15) + 0.65);

        // Bonus for many hitcircles - it's harder to keep good accuracy up for longer.
        const ncircles: number = this.difficultyAttributes.mods.some(
            (m) => m instanceof ModScoreV2
        )
            ? this.totalHits - this.difficultyAttributes.spinnerCount
            : this.difficultyAttributes.hitCircleCount;

        this.accuracy *= Math.min(
            1.15,
            Math.sqrt(Math.log(1 + ((Math.E - 1) * ncircles) / 1000))
        );

        // Scale the accuracy value with rhythm complexity.
        this.accuracy *=
            1.5 /
            (1 +
                Math.exp(
                    -(this.difficultyAttributes.rhythmDifficulty - 1) / 2
                ));

        if (
            this.difficultyAttributes.mods.some(
                (m) => m instanceof ModFlashlight
            )
        ) {
            this.accuracy *= 1.02;
        }
    }

    /**
     * Calculates the flashlight performance value of the beatmap.
     */
    private calculateFlashlightValue(): void {
        if (
            !this.difficultyAttributes.mods.some(
                (m) => m instanceof ModFlashlight
            )
        ) {
            this.flashlight = 0;

            return;
        }

        this.flashlight =
            Math.pow(this.difficultyAttributes.flashlightDifficulty, 1.6) * 25;

        this.flashlight *= this.calculateMissPenalty(
            this.difficultyAttributes.flashlightDifficultStrainCount
        );

        // Account for shorter maps having a higher ratio of 0 combo/100 combo flashlight radius.
        this.flashlight *=
            0.7 +
            0.1 * Math.min(1, this.totalHits / 200) +
            (this.totalHits > 200
                ? 0.2 * Math.min(1, (this.totalHits - 200) / 200)
                : 0);

        // Scale the flashlight value with slider cheese penalty.
        this.flashlight *= this._flashlightSliderCheesePenalty;

        // Scale the flashlight value with deviation.
        this.flashlight *= ErrorFunction.erf(
            50 / (Math.SQRT2 * this._deviation)
        );
    }

    /**
     * Calculates the visual performance value of the beatmap.
     */
    private calculateVisualValue(): void {
        this.visual =
            Math.pow(this.difficultyAttributes.visualDifficulty, 1.6) * 22.5;

        this.visual *= this.calculateMissPenalty(
            this.difficultyAttributes.visualDifficultStrainCount
        );

        // Scale the visual value with object count to penalize short maps.
        this.visual *= Math.min(
            1,
            1.650668 +
                (0.4845796 - 1.650668) /
                    (1 + Math.pow(this.totalHits / 817.9306, 1.147469))
        );

        // Scale the visual value with slider cheese penalty.
        this.visual *= this._visualSliderCheesePenalty;

        // Scale the visual value with deviation.
        this.visual *=
            1.065 *
            Math.pow(
                ErrorFunction.erf(30 / (Math.SQRT2 * this._deviation)),
                1.75
            );
    }

    /**
     * Calculates miss penalty.
     *
     * Miss penalty assumes that a player will miss on the hardest parts of a map,
     * so we use the amount of relatively difficult sections to adjust miss penalty
     * to make it more punishing on maps with lower amount of hard sections.
     */
    private calculateMissPenalty(difficultStrainCount: number): number {
        if (this.effectiveMissCount === 0) {
            return 1;
        }

        return (
            0.94 /
            (this.effectiveMissCount / (2 * Math.sqrt(difficultStrainCount)) +
                1)
        );
    }

    /**
     * Estimates the player's tap deviation based on the OD, number of circles and sliders,
     * and number of 300s, 100s, 50s, and misses, assuming the player's mean hit error is 0.
     *
     * The estimation is consistent in that two SS scores on the same map
     * with the same settings will always return the same deviation.
     *
     * Sliders are treated as circles with a 50 hit window.
     *
     * Misses are ignored because they are usually due to misaiming, and 50s
     * are grouped with 100s since they are usually due to misreading.
     *
     * Inaccuracies are capped to the number of circles in the map.
     */
    private calculateDeviation(): number {
        if (this.totalSuccessfulHits === 0) {
            return Number.POSITIVE_INFINITY;
        }

        const hitWindow300: number = new OsuHitWindow(
            this.difficultyAttributes.overallDifficulty
        ).hitWindowFor300();

        // Obtain the 50 and 100 hit window for droid.
        const realHitWindow300: number =
            hitWindow300 * this.difficultyAttributes.clockRate;
        const droidHitWindow: DroidHitWindow = new DroidHitWindow(
            OsuHitWindow.hitWindow300ToOD(realHitWindow300)
        );
        const isPrecise: boolean = this.difficultyAttributes.mods.some(
            (m) => m instanceof ModPrecise
        );
        const hitWindow50: number =
            droidHitWindow.hitWindowFor50(isPrecise) /
            this.difficultyAttributes.clockRate;
        const hitWindow100: number =
            droidHitWindow.hitWindowFor100(isPrecise) /
            this.difficultyAttributes.clockRate;

        const { n300, n100, n50, nmiss } = this.computedAccuracy;

        const greatCountOnCircles: number =
            this.difficultyAttributes.hitCircleCount - n100 - n50 - nmiss;

        // The probability that a player hits a circle is unknown, but we can estimate it to be
        // the number of greats on circles divided by the number of circles, and then add one
        // to the number of circles as a bias correction / bayesian prior.
        const greatProbabilityCircle: number = Math.max(
            0,
            greatCountOnCircles / (this.difficultyAttributes.hitCircleCount + 1)
        );
        let greatProbabilitySlider: number;

        if (greatCountOnCircles < 0) {
            const nonCircleMisses: number = -greatCountOnCircles;
            greatProbabilitySlider = Math.max(
                0,
                (this.difficultyAttributes.sliderCount - nonCircleMisses) /
                    (this.difficultyAttributes.sliderCount + 1)
            );
        } else {
            greatProbabilitySlider =
                this.difficultyAttributes.sliderCount /
                (this.difficultyAttributes.sliderCount + 1);
        }

        if (greatProbabilityCircle === 0 && greatProbabilitySlider === 0) {
            return Number.POSITIVE_INFINITY;
        }

        const calculateDeviation = (
            mainHitWindow: number,
            probability: number
        ): number => {
            if (probability === 0) {
                return Number.POSITIVE_INFINITY;
            }

            // Start with normal deviation.
            const normalDeviation: number =
                mainHitWindow /
                (Math.SQRT2 * ErrorFunction.erfInv(probability));

            // Get the variance of the truncated variable.
            const truncatedVariance: number =
                Math.pow(normalDeviation, 2) -
                (Math.SQRT2 *
                    hitWindow100 *
                    normalDeviation *
                    Math.exp(
                        -0.5 * Math.pow(hitWindow100 / normalDeviation, 2)
                    )) /
                    (Math.sqrt(Math.PI) *
                        ErrorFunction.erf(
                            hitWindow100 / (Math.SQRT2 * normalDeviation)
                        ));

            // Add 50s by assuming they are uniformly distributed.
            return Math.sqrt(
                (1 / (n300 + n100 + n50)) *
                    ((n300 + n100) * truncatedVariance +
                        (n50 *
                            (Math.pow(hitWindow50, 2) +
                                hitWindow100 * hitWindow50 +
                                Math.pow(hitWindow100, 2))) /
                            3)
            );
        };

        const deviationOnCircles: number = calculateDeviation(
            hitWindow300,
            greatProbabilityCircle
        );
        const deviationOnSliders: number = calculateDeviation(
            hitWindow50,
            greatProbabilitySlider
        );

        return Math.min(deviationOnCircles, deviationOnSliders);
    }

    /**
     * Does the same as {@link calculateDeviation}, but only for notes and inaccuracies that are relevant to tap difficulty.
     *
     * Treats all difficult speed notes as circles, so this method can sometimes return a lower deviation than {@link calculateDeviation}.
     * This is fine though, since this method is only used to scale tap pp.
     */
    private calculateTapDeviation(): number {
        if (this.totalSuccessfulHits === 0) {
            return Number.POSITIVE_INFINITY;
        }

        const hitWindow300: number = new OsuHitWindow(
            this.difficultyAttributes.overallDifficulty
        ).hitWindowFor300();
        // Obtain the 50 and 100 hit window for droid.
        const realHitWindow300: number =
            hitWindow300 * this.difficultyAttributes.clockRate;
        const droidHitWindow: DroidHitWindow = new DroidHitWindow(
            OsuHitWindow.hitWindow300ToOD(realHitWindow300)
        );
        const isPrecise: boolean = this.difficultyAttributes.mods.some(
            (m) => m instanceof ModPrecise
        );
        const hitWindow50: number =
            droidHitWindow.hitWindowFor50(isPrecise) /
            this.difficultyAttributes.clockRate;
        const hitWindow100: number =
            droidHitWindow.hitWindowFor100(isPrecise) /
            this.difficultyAttributes.clockRate;

        const { n300, n100, n50, nmiss } = this.computedAccuracy;

        // Assume a fixed ratio of non-300s hit in speed notes based on speed note count ratio and OD.
        // Graph: https://www.desmos.com/calculator/31argjcxqc
        const speedNoteRatio: number =
            this.difficultyAttributes.speedNoteCount / this.totalHits;

        const nonGreatCount: number = n100 + n50 + nmiss;
        const nonGreatRatio: number =
            1 -
            (Math.pow(
                Math.exp(Math.sqrt(hitWindow300)) + 1,
                1 - speedNoteRatio
            ) -
                1) /
                Math.exp(Math.sqrt(hitWindow300));
        const relevantCountGreat: number = Math.max(
            0,
            this.difficultyAttributes.speedNoteCount -
                nonGreatCount * nonGreatRatio
        );

        if (relevantCountGreat === 0) {
            return Number.POSITIVE_INFINITY;
        }

        const greatProbability: number =
            relevantCountGreat / (this.difficultyAttributes.speedNoteCount + 1);

        // Start with normal deviation.
        const normalDeviation: number =
            hitWindow300 /
            (Math.SQRT2 * ErrorFunction.erfInv(greatProbability));

        // Get the variance of the truncated variable.
        const truncatedVariance: number =
            Math.pow(normalDeviation, 2) -
            (Math.SQRT2 *
                hitWindow100 *
                normalDeviation *
                Math.exp(-0.5 * Math.pow(hitWindow100 / normalDeviation, 2))) /
                (Math.sqrt(Math.PI) *
                    ErrorFunction.erf(
                        hitWindow100 / (Math.SQRT2 * normalDeviation)
                    ));

        // Add 50s by assuming they are uniformly distributed.
        return Math.sqrt(
            (1 / (n300 + n100 + n50)) *
                ((n300 + n100) * truncatedVariance +
                    (n50 *
                        (Math.pow(hitWindow50, 2) +
                            hitWindow100 * hitWindow50 +
                            Math.pow(hitWindow100, 2))) /
                        3)
        );
    }

    override toString(): string {
        return (
            this.total.toFixed(2) +
            " pp (" +
            this.aim.toFixed(2) +
            " aim, " +
            this.tap.toFixed(2) +
            " tap, " +
            this.accuracy.toFixed(2) +
            " acc, " +
            this.flashlight.toFixed(2) +
            " flashlight, " +
            this.visual.toFixed(2) +
            " visual)"
        );
    }
}
