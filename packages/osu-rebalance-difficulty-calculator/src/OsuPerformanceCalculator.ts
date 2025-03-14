import {
    Accuracy,
    ModHidden,
    ModRelax,
    ModScoreV2,
    ModFlashlight,
    Modes,
    ModAutopilot,
    OsuHitWindow,
    ErrorFunction,
    Interpolation,
    ModTraceable,
} from "@rian8337/osu-base";
import { PerformanceCalculator } from "./base/PerformanceCalculator";
import { OsuDifficultyAttributes } from "./structures/OsuDifficultyAttributes";
import { PerformanceCalculationOptions } from "./structures/PerformanceCalculationOptions";

/**
 * A performance points calculator that calculates performance points for osu!standard gamemode.
 */
export class OsuPerformanceCalculator extends PerformanceCalculator<OsuDifficultyAttributes> {
    /**
     * The aim performance value.
     */
    aim = 0;

    /**
     * The speed performance value.
     */
    speed = 0;

    /**
     * The accuracy performance value.
     */
    accuracy = 0;

    /**
     * The flashlight performance value.
     */
    flashlight = 0;

    protected override finalMultiplier = 1.15;
    protected override readonly mode = Modes.osu;

    private comboPenalty = 1;
    private speedDeviation = 0;

    protected override calculateValues(): void {
        this.speedDeviation = this.calculateSpeedDeviation();

        this.aim = this.calculateAimValue();
        this.speed = this.calculateSpeedValue();
        this.accuracy = this.calculateAccuracyValue();
        this.flashlight = this.calculateFlashlightValue();
    }

    protected override calculateTotalValue(): number {
        return (
            Math.pow(
                Math.pow(this.aim, 1.1) +
                    Math.pow(this.speed, 1.1) +
                    Math.pow(this.accuracy, 1.1) +
                    Math.pow(this.flashlight, 1.1),
                1 / 1.1,
            ) * this.finalMultiplier
        );
    }

    protected override handleOptions(
        options?: PerformanceCalculationOptions,
    ): void {
        super.handleOptions(options);

        const maxCombo = this.difficultyAttributes.maxCombo;
        const miss = this.computedAccuracy.nmiss;
        const combo = options?.combo ?? maxCombo - miss;

        this.comboPenalty = Math.min(Math.pow(combo / maxCombo, 0.8), 1);
    }

    /**
     * Calculates the aim performance value of the beatmap.
     */
    private calculateAimValue(): number {
        if (this.mods.some((m) => m instanceof ModAutopilot)) {
            return 0;
        }

        let aimValue = this.baseValue(this.difficultyAttributes.aimDifficulty);

        // Longer maps are worth more
        let lengthBonus = 0.95 + 0.4 * Math.min(1, this.totalHits / 2000);
        if (this.totalHits > 2000) {
            lengthBonus += Math.log10(this.totalHits / 2000) * 0.5;
        }

        aimValue *= lengthBonus;

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects.
            // Default a 3% reduction for any # of misses.
            aimValue *=
                0.97 *
                Math.pow(
                    1 -
                        Math.pow(
                            this.effectiveMissCount / this.totalHits,
                            0.775,
                        ),
                    this.effectiveMissCount,
                );
        }

        aimValue *= this.calculateStrainBasedMissPenalty(
            this.difficultyAttributes.aimDifficultStrainCount,
        );

        const calculatedAR = this.difficultyAttributes.approachRate;

        if (!this.mods.some((m) => m instanceof ModRelax)) {
            // AR scaling
            let arFactor = 0;
            if (calculatedAR > 10.33) {
                arFactor += 0.3 * (calculatedAR - 10.33);
            } else if (calculatedAR < 8) {
                arFactor += 0.05 * (8 - calculatedAR);
            }

            // Buff for longer maps with high AR.
            aimValue *= 1 + arFactor * lengthBonus;
        }

        // We want to give more reward for lower AR when it comes to aim and HD. This nerfs high AR and buffs lower AR.
        if (
            this.mods.some(
                (m) => m instanceof ModHidden || m instanceof ModTraceable,
            )
        ) {
            aimValue *= 1 + 0.04 * (12 - calculatedAR);
        }

        // Scale the aim value with slider factor to nerf very likely dropped sliderends.
        aimValue *= this.sliderNerfFactor;

        // Scale the aim value with accuracy.
        aimValue *= this.computedAccuracy.value();

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling =
            Math.pow(this.difficultyAttributes.overallDifficulty, 2) / 2500;

        aimValue *= 0.98 + odScaling;

        return aimValue;
    }

    /**
     * Calculates the speed performance value of the beatmap.
     */
    private calculateSpeedValue(): number {
        if (
            this.mods.some((m) => m instanceof ModRelax) ||
            this.speedDeviation === Number.POSITIVE_INFINITY
        ) {
            return 0;
        }

        let speedValue = this.baseValue(
            this.difficultyAttributes.speedDifficulty,
        );

        // Longer maps are worth more
        let lengthBonus = 0.95 + 0.4 * Math.min(1, this.totalHits / 2000);
        if (this.totalHits > 2000) {
            lengthBonus += Math.log10(this.totalHits / 2000) * 0.5;
        }

        speedValue *= lengthBonus;

        speedValue *= this.calculateStrainBasedMissPenalty(
            this.difficultyAttributes.speedDifficultStrainCount,
        );

        // AR scaling
        const calculatedAR = this.difficultyAttributes.approachRate;

        if (
            calculatedAR > 10.33 &&
            !this.mods.some((m) => m instanceof ModAutopilot)
        ) {
            // Buff for longer maps with high AR.
            speedValue *= 1 + 0.3 * (calculatedAR - 10.33) * lengthBonus;
        }

        if (
            this.mods.some(
                (m) => m instanceof ModHidden || m instanceof ModTraceable,
            )
        ) {
            speedValue *= 1 + 0.04 * (12 - calculatedAR);
        }

        // Calculate accuracy assuming the worst case scenario.
        const countGreat = this.computedAccuracy.n300;
        const countOk = this.computedAccuracy.n100;
        const countMeh = this.computedAccuracy.n50;

        const relevantTotalDiff =
            this.totalHits - this.difficultyAttributes.speedNoteCount;

        const relevantAccuracy = new Accuracy(
            this.difficultyAttributes.speedNoteCount > 0
                ? {
                      n300: Math.max(0, countGreat - relevantTotalDiff),
                      n100: Math.max(
                          0,
                          countOk - Math.max(0, relevantTotalDiff - countGreat),
                      ),
                      n50: Math.max(
                          0,
                          countMeh -
                              Math.max(
                                  0,
                                  relevantTotalDiff - countGreat - countOk,
                              ),
                      ),
                  }
                : // Set accuracy to 0.
                  { n300: 0, nobjects: 1 },
        );

        speedValue *= this.calculateSpeedHighDeviationNerf();

        // Scale the speed value with accuracy and OD.
        speedValue *=
            (0.95 +
                Math.pow(
                    Math.max(0, this.difficultyAttributes.overallDifficulty),
                    2,
                ) /
                    750) *
            Math.pow(
                (this.computedAccuracy.value() +
                    relevantAccuracy.value(
                        this.difficultyAttributes.speedNoteCount,
                    )) /
                    2,
                (14.5 - this.difficultyAttributes.overallDifficulty) / 2,
            );

        return speedValue;
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    private calculateAccuracyValue(): number {
        if (this.mods.some((m) => m instanceof ModRelax)) {
            return 0;
        }

        const ncircles = this.mods.some((m) => m instanceof ModScoreV2)
            ? this.totalHits - this.difficultyAttributes.spinnerCount
            : this.difficultyAttributes.hitCircleCount;

        if (ncircles === 0) {
            return 0;
        }

        const realAccuracy = new Accuracy({
            ...this.computedAccuracy,
            n300: this.computedAccuracy.n300 - (this.totalHits - ncircles),
        });

        // Lots of arbitrary values from testing.
        // Considering to use derivation from perfect accuracy in a probabilistic manner - assume normal distribution
        let accuracyValue =
            Math.pow(1.52163, this.difficultyAttributes.overallDifficulty) *
            // It is possible to reach a negative accuracy with this formula. Cap it at zero - zero points.
            Math.pow(realAccuracy.n300 < 0 ? 0 : realAccuracy.value(), 24) *
            2.83;

        // Bonus for many hitcircles - it's harder to keep good accuracy up for longer
        accuracyValue *= Math.min(1.15, Math.pow(ncircles / 1000, 0.3));

        if (
            this.mods.some(
                (m) => m instanceof ModHidden || m instanceof ModTraceable,
            )
        ) {
            accuracyValue *= 1.08;
        }

        if (this.mods.some((m) => m instanceof ModFlashlight)) {
            accuracyValue *= 1.02;
        }

        return accuracyValue;
    }

    /**
     * Calculates the flashlight performance value of the beatmap.
     */
    private calculateFlashlightValue(): number {
        if (!this.mods.some((m) => m instanceof ModFlashlight)) {
            return 0;
        }

        let flashlightValue =
            Math.pow(this.difficultyAttributes.flashlightDifficulty, 2) * 25;

        // Combo scaling
        flashlightValue *= this.comboPenalty;

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            flashlightValue *=
                0.97 *
                Math.pow(
                    1 -
                        Math.pow(
                            this.effectiveMissCount / this.totalHits,
                            0.775,
                        ),
                    Math.pow(this.effectiveMissCount, 0.875),
                );
        }

        // Account for shorter maps having a higher ratio of 0 combo/100 combo flashlight radius.
        flashlightValue *=
            0.7 +
            0.1 * Math.min(1, this.totalHits / 200) +
            (this.totalHits > 200
                ? 0.2 * Math.min(1, (this.totalHits - 200) / 200)
                : 0);

        // Scale the flashlight value with accuracy slightly.
        flashlightValue *= 0.5 + this.computedAccuracy.value() / 2;

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling: number =
            Math.pow(this.difficultyAttributes.overallDifficulty, 2) / 2500;
        flashlightValue *= 0.98 + odScaling;

        return flashlightValue;
    }

    /**
     * Estimates a player's deviation on speed notes using {@link calculateDeviation}, assuming worst-case.
     *
     * Treats all speed notes as hit circles.
     */
    private calculateSpeedDeviation(): number {
        if (this.totalSuccessfulHits === 0) {
            return Number.POSITIVE_INFINITY;
        }

        // Calculate accuracy assuming the worst case scenario
        const speedNoteCount =
            this.difficultyAttributes.speedNoteCount +
            (this.totalHits - this.difficultyAttributes.speedNoteCount) * 0.1;

        // Assume worst case: all mistakes were on speed notes
        const relevantCountMiss = Math.min(
            this.computedAccuracy.nmiss,
            speedNoteCount,
        );

        const relevantCountMeh = Math.min(
            this.computedAccuracy.n50,
            speedNoteCount - relevantCountMiss,
        );

        const relevantCountOk = Math.min(
            this.computedAccuracy.n100,
            speedNoteCount - relevantCountMiss - relevantCountMeh,
        );

        const relevantCountGreat = Math.max(
            0,
            speedNoteCount -
                relevantCountMiss -
                relevantCountMeh -
                relevantCountOk,
        );

        return this.calculateDeviation(
            relevantCountGreat,
            relevantCountOk,
            relevantCountMeh,
            relevantCountMiss,
        );
    }

    /**
     * Estimates the player's tap deviation based on the OD, given number of greats, oks, mehs and misses,
     * assuming the player's mean hit error is 0. The estimation is consistent in that two SS scores on the
     * same map with the same settings will always return the same deviation.
     *
     * Misses are ignored because they are usually due to misaiming.
     *
     * Greats and oks are assumed to follow a normal distribution, whereas mehs are assumed to follow a uniform distribution.
     */
    private calculateDeviation(
        relevantCountGreat: number,
        relevantCountOk: number,
        relevantCountMeh: number,
        relevantCountMiss: number,
    ): number {
        if (relevantCountGreat + relevantCountOk + relevantCountMeh <= 0) {
            return Number.POSITIVE_INFINITY;
        }

        const objectCount =
            relevantCountGreat +
            relevantCountOk +
            relevantCountMeh +
            relevantCountMiss;

        // Obtain the great, ok, and meh windows.
        const hitWindow = new OsuHitWindow(
            OsuHitWindow.greatWindowToOD(
                // Convert current OD to non clock rate-adjusted OD.
                new OsuHitWindow(this.difficultyAttributes.overallDifficulty)
                    .greatWindow * this.difficultyAttributes.clockRate,
            ),
        );

        const { greatWindow, okWindow, mehWindow } = hitWindow;

        // The probability that a player hits a circle is unknown, but we can estimate it to be
        // the number of greats on circles divided by the number of circles, and then add one
        // to the number of circles as a bias correction.
        const n = Math.max(
            1,
            objectCount - relevantCountMiss - relevantCountMeh,
        );

        // 99% critical value for the normal distribution (one-tailed).
        const z = 2.32634787404;

        // Proportion of greats hit on circles, ignoring misses and 50s.
        const p = relevantCountGreat / n;

        // We can be 99% confident that p is at least this value.
        const pLowerBound =
            (n * p + (z * z) / 2) / (n + z * z) -
            (z / (n + z * z)) * Math.sqrt(n * p * (1 - p) + (z * z) / 4);

        // Compute the deviation assuming greats and oks are normally distributed, and mehs are uniformly distributed.
        // Begin with greats and oks first. Ignoring mehs, we can be 99% confident that the deviation is not higher than:
        let deviation =
            greatWindow / (Math.SQRT2 * ErrorFunction.erfInv(pLowerBound));

        const randomValue =
            (Math.sqrt(2 / Math.PI) *
                okWindow *
                Math.pow(Math.exp(-0.5 * (okWindow / deviation)), 2)) /
            (deviation *
                ErrorFunction.erf(okWindow / (Math.SQRT2 * deviation)));

        deviation *= Math.sqrt(1 - randomValue);

        // Value deviation approach as greatCount approaches 0
        const limitValue = okWindow / Math.sqrt(3);

        // If precision is not enough to compute true deviation - use limit value
        if (pLowerBound == 0.0 || randomValue >= 1 || deviation > limitValue) {
            deviation = limitValue;
        }

        // Then compute the variance for mehs.
        const mehVariance =
            (Math.pow(mehWindow, 2) +
                okWindow * mehWindow +
                Math.pow(okWindow, 2)) /
            3;

        // Find the total deviation.
        deviation = Math.sqrt(
            ((relevantCountGreat + relevantCountOk) * Math.pow(deviation, 2) +
                relevantCountMeh * mehVariance) /
                (relevantCountGreat + relevantCountOk + relevantCountMeh),
        );

        return deviation;
    }

    /**
     * Calculates multiplier for speed to account for improper tapping based on the deviation and speed difficulty.
     *
     * [Graph](https://www.desmos.com/calculator/dmogdhzofn)
     */
    private calculateSpeedHighDeviationNerf(): number {
        if (this.speedDeviation == Number.POSITIVE_INFINITY) {
            return 0;
        }

        const speedValue = this.baseValue(
            this.difficultyAttributes.speedDifficulty,
        );

        // Decide a point where the PP value achieved compared to the speed deviation is assumed to be tapped
        // improperly. Any PP above this point is considered "excess" speed difficulty. This is used to cause
        // PP above the cutoff to scale logarithmically towards the original speed value thus nerfing the value.
        const excessSpeedDifficultyCutoff =
            100 + 220 * Math.pow(22 / this.speedDeviation, 6.5);

        if (speedValue <= excessSpeedDifficultyCutoff) {
            return 1;
        }

        const scale = 50;
        const adjustedSpeedValue =
            scale *
            (Math.log((speedValue - excessSpeedDifficultyCutoff) / scale + 1) +
                excessSpeedDifficultyCutoff / scale);

        // 220 UR and less are considered tapped correctly to ensure that normal scores will be punished as little as possible
        const t = 1 - Interpolation.reverseLerp(this.speedDeviation, 22, 27);

        return (
            Interpolation.lerp(adjustedSpeedValue, speedValue, t) / speedValue
        );
    }

    override toString(): string {
        return (
            this.total.toFixed(2) +
            " pp (" +
            this.aim.toFixed(2) +
            " aim, " +
            this.speed.toFixed(2) +
            " speed, " +
            this.accuracy.toFixed(2) +
            " acc, " +
            this.flashlight.toFixed(2) +
            " flashlight)"
        );
    }
}
