import {
    Accuracy,
    ModHidden,
    ModRelax,
    ModScoreV2,
    ModFlashlight,
    modes,
} from "@rian8337/osu-base";
import { PerformanceCalculator } from "./base/PerformanceCalculator";
import { OsuDifficultyCalculator } from "./OsuDifficultyCalculator";

/**
 * A performance points calculator that calculates performance points for osu!standard gamemode.
 */
export class OsuPerformanceCalculator extends PerformanceCalculator<OsuDifficultyCalculator> {
    /**
     * The aim performance value.
     */
    aim: number = 0;

    /**
     * The speed performance value.
     */
    speed: number = 0;

    /**
     * The accuracy performance value.
     */
    accuracy: number = 0;

    /**
     * The flashlight performance value.
     */
    flashlight: number = 0;

    protected override finalMultiplier = 1.14;
    protected override readonly mode: modes = modes.osu;

    protected override calculateValues(): void {
        this.calculateAimValue();
        this.calculateSpeedValue();
        this.calculateAccuracyValue();
        this.calculateFlashlightValue();
    }

    protected override calculateTotalValue(): void {
        this.total =
            Math.pow(
                Math.pow(this.aim, 1.1) +
                    Math.pow(this.speed, 1.1) +
                    Math.pow(this.accuracy, 1.1) +
                    Math.pow(this.flashlight, 1.1),
                1 / 1.1
            ) * this.finalMultiplier;
    }

    /**
     * Calculates the aim performance value of the beatmap.
     */
    private calculateAimValue(): void {
        // Global variables
        const objectCount: number = this.difficultyCalculator.objects.length;
        const calculatedAR: number = this.mapStatistics.ar!;

        this.aim = this.baseValue(this.difficultyCalculator.aim);

        // Longer maps are worth more
        let lengthBonus = 0.95 + 0.4 * Math.min(1, objectCount / 2000);
        if (objectCount > 2000) {
            lengthBonus += Math.log10(objectCount / 2000) * 0.5;
        }

        this.aim *= lengthBonus;

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects.
            // Default a 3% reduction for any # of misses.
            this.aim *=
                0.97 *
                Math.pow(
                    1 - Math.pow(this.effectiveMissCount / objectCount, 0.775),
                    this.effectiveMissCount
                );
        }

        // Combo scaling
        this.aim *= this.comboPenalty;

        if (
            !this.difficultyCalculator.mods.some((m) => m instanceof ModRelax)
        ) {
            // AR scaling
            let arFactor: number = 0;
            if (calculatedAR > 10.33) {
                arFactor += 0.3 * (calculatedAR - 10.33);
            } else if (calculatedAR < 8) {
                arFactor += 0.05 * (8 - calculatedAR);
            }

            // Buff for longer maps with high AR.
            this.aim *= 1 + arFactor * lengthBonus;
        }

        // We want to give more reward for lower AR when it comes to aim and HD. This nerfs high AR and buffs lower AR.
        if (
            this.difficultyCalculator.mods.some((m) => m instanceof ModHidden)
        ) {
            this.aim *= 1 + 0.04 * (12 - calculatedAR);
        }

        // Scale the aim value with slider factor to nerf very likely dropped sliderends.
        this.aim *= this.sliderNerfFactor;

        // Scale the aim value with accuracy.
        this.aim *= this.computedAccuracy.value(objectCount);

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling: number = Math.pow(this.mapStatistics.od!, 2) / 2500;
        this.aim *= 0.98 + odScaling;
    }

    /**
     * Calculates the speed performance value of the beatmap.
     */
    private calculateSpeedValue(): void {
        if (this.difficultyCalculator.mods.some((m) => m instanceof ModRelax)) {
            this.speed = 0;

            return;
        }

        // Global variables
        const objectCount: number = this.difficultyCalculator.objects.length;
        const calculatedAR: number = this.mapStatistics.ar!;

        this.speed = this.baseValue(this.difficultyCalculator.speed);

        // Longer maps are worth more
        let lengthBonus = 0.95 + 0.4 * Math.min(1, objectCount / 2000);
        if (objectCount > 2000) {
            lengthBonus += Math.log10(objectCount / 2000) * 0.5;
        }

        this.speed *= lengthBonus;

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects.
            // Default a 3% reduction for any # of misses.
            this.speed *=
                0.97 *
                Math.pow(
                    1 - Math.pow(this.effectiveMissCount / objectCount, 0.775),
                    Math.pow(this.effectiveMissCount, 0.875)
                );
        }

        // Combo scaling
        this.speed *= this.comboPenalty;

        // AR scaling
        if (calculatedAR > 10.33) {
            // Buff for longer maps with high AR.
            this.speed *= 1 + 0.3 * (calculatedAR - 10.33) * lengthBonus;
        }

        if (
            this.difficultyCalculator.mods.some((m) => m instanceof ModHidden)
        ) {
            this.speed *= 1 + 0.04 * (12 - calculatedAR);
        }

        // Calculate accuracy assuming the worst case scenario.
        const countGreat: number = this.computedAccuracy.n300;
        const countOk: number = this.computedAccuracy.n100;
        const countMeh: number = this.computedAccuracy.n50;

        const relevantTotalDiff: number =
            objectCount - this.difficultyCalculator.attributes.speedNoteCount;

        const relevantAccuracy: Accuracy = new Accuracy({
            n300: Math.max(0, countGreat - relevantTotalDiff),
            n100: Math.max(
                0,
                countOk - Math.max(0, relevantTotalDiff - countGreat)
            ),
            n50: Math.max(
                0,
                countMeh - Math.max(0, relevantTotalDiff - countGreat - countOk)
            ),
            nmiss: this.effectiveMissCount,
        });

        // Scale the speed value with accuracy and OD.
        this.speed *=
            (0.95 + Math.pow(this.mapStatistics.od!, 2) / 750) *
            Math.pow(
                (this.computedAccuracy.value(objectCount) +
                    relevantAccuracy.value()) /
                    2,
                (14.5 - Math.max(this.mapStatistics.od!, 8)) / 2
            );

        // Scale the speed value with # of 50s to punish doubletapping.
        this.speed *= Math.pow(
            0.99,
            Math.max(0, this.computedAccuracy.n50 - objectCount / 500)
        );
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    private calculateAccuracyValue(): void {
        if (this.difficultyCalculator.mods.some((m) => m instanceof ModRelax)) {
            this.accuracy = 0;

            return;
        }

        // Global variables
        const nobjects: number = this.difficultyCalculator.objects.length;
        const ncircles: number = this.difficultyCalculator.mods.some(
            (m) => m instanceof ModScoreV2
        )
            ? nobjects - this.difficultyCalculator.beatmap.hitObjects.spinners
            : this.difficultyCalculator.beatmap.hitObjects.circles;

        if (ncircles === 0) {
            this.accuracy = 0;

            return;
        }

        const realAccuracy: Accuracy = new Accuracy({
            ...this.computedAccuracy,
            n300: this.computedAccuracy.n300 - (nobjects - ncircles),
        });

        // Lots of arbitrary values from testing.
        // Considering to use derivation from perfect accuracy in a probabilistic manner - assume normal distribution
        this.accuracy =
            Math.pow(1.52163, this.mapStatistics.od!) *
            Math.pow(realAccuracy.value(ncircles), 24) *
            2.83;

        // Bonus for many hitcircles - it's harder to keep good accuracy up for longer
        this.accuracy *= Math.min(1.15, Math.pow(ncircles / 1000, 0.3));

        if (
            this.difficultyCalculator.mods.some((m) => m instanceof ModHidden)
        ) {
            this.accuracy *= 1.08;
        }
        if (
            this.difficultyCalculator.mods.some(
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
            !this.difficultyCalculator.mods.some(
                (m) => m instanceof ModFlashlight
            )
        ) {
            this.flashlight = 0;

            return;
        }

        // Global variables
        const objectCount: number = this.difficultyCalculator.objects.length;

        this.flashlight =
            Math.pow(this.difficultyCalculator.flashlight, 2) * 25;

        // Combo scaling
        this.flashlight *= this.comboPenalty;

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.flashlight *=
                0.97 *
                Math.pow(
                    1 - Math.pow(this.effectiveMissCount / objectCount, 0.775),
                    Math.pow(this.effectiveMissCount, 0.875)
                );
        }

        // Account for shorter maps having a higher ratio of 0 combo/100 combo flashlight radius.
        this.flashlight *=
            0.7 +
            0.1 * Math.min(1, objectCount / 200) +
            (objectCount > 200
                ? 0.2 * Math.min(1, (objectCount - 200) / 200)
                : 0);

        // Scale the flashlight value with accuracy slightly.
        this.flashlight *= 0.5 + this.computedAccuracy.value(objectCount) / 2;

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling: number = Math.pow(this.mapStatistics.od!, 2) / 2500;
        this.flashlight *= 0.98 + odScaling;
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
