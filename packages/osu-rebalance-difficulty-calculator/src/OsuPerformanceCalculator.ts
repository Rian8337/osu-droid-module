import {
    Accuracy,
    ModHidden,
    ModRelax,
    ModScoreV2,
    ModFlashlight,
    Modes,
    ModAutopilot,
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

    protected override calculateValues(): void {
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
        if (this.mods.some((m) => m instanceof ModHidden)) {
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
        if (this.mods.some((m) => m instanceof ModRelax)) {
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

        if (this.mods.some((m) => m instanceof ModHidden)) {
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

        // Scale the speed value with accuracy and OD.
        speedValue *=
            (0.95 +
                Math.pow(this.difficultyAttributes.overallDifficulty, 2) /
                    750) *
            Math.pow(
                (this.computedAccuracy.value() +
                    relevantAccuracy.value(
                        this.difficultyAttributes.speedNoteCount,
                    )) /
                    2,
                (14.5 - this.difficultyAttributes.overallDifficulty) / 2,
            );

        // Scale the speed value with # of 50s to punish doubletapping.
        speedValue *= Math.pow(
            0.99,
            Math.max(0, this.computedAccuracy.n50 - this.totalHits / 500),
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

        if (this.mods.some((m) => m instanceof ModHidden)) {
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
