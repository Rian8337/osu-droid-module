import {
    Accuracy,
    modes,
    ModRelax,
    ModScoreV2,
    ModFlashlight,
} from "@rian8337/osu-base";
import { DroidDifficultyCalculator } from "./DroidDifficultyCalculator";
import { PerformanceCalculator } from "./base/PerformanceCalculator";
import { PerformanceCalculationOptions } from "./structures/PerformanceCalculationOptions";

/**
 * A performance points calculator that calculates performance points for osu!droid gamemode.
 */
export class DroidPerformanceCalculator extends PerformanceCalculator<DroidDifficultyCalculator> {
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

    protected override finalMultiplier = 1.24;
    protected override readonly mode: modes = modes.droid;

    private tapPenalty: number = 1;

    protected override calculateValues(): void {
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
        this.tapPenalty = options?.tapPenalty ?? 1;

        super.handleOptions(options);
    }

    /**
     * Calculates the aim performance value of the beatmap.
     */
    private calculateAimValue(): void {
        // Global variables
        const objectCount: number = this.difficultyCalculator.objects.length;

        this.aim = this.baseValue(Math.pow(this.difficultyCalculator.aim, 0.8));

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

        // Scale the aim value with slider factor to nerf very likely dropped sliderends.
        this.aim *= this.sliderNerfFactor;

        // Scale the aim value with accuracy.
        this.aim *= this.computedAccuracy.value(objectCount);

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling: number = Math.pow(this.mapStatistics.od!, 2) / 2500;
        this.aim *=
            0.98 + (this.mapStatistics.od! >= 0 ? odScaling : -odScaling);
    }

    /**
     * Calculates the tap performance value of the beatmap.
     */
    private calculateTapValue(): void {
        // Global variables
        const objectCount: number = this.difficultyCalculator.objects.length;

        this.tap = this.baseValue(this.difficultyCalculator.tap);

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects.
            // Default a 3% reduction for any # of misses.
            this.tap *=
                0.97 *
                Math.pow(
                    1 - Math.pow(this.effectiveMissCount / objectCount, 0.775),
                    Math.pow(this.effectiveMissCount, 0.875)
                );
        }

        // Combo scaling
        this.tap *= this.comboPenalty;

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

        // Scale the tap value with accuracy and OD.
        const od: number = this.mapStatistics.od!;
        const odScaling: number = Math.pow(od, 2) / 750;
        this.tap *=
            (0.95 + (od > 0 ? odScaling : -odScaling)) *
            Math.pow(
                (this.computedAccuracy.value(objectCount) +
                    relevantAccuracy.value(
                        this.difficultyCalculator.attributes.speedNoteCount
                    )) /
                    2,
                (14 - Math.max(od, 2.5)) / 2
            );

        // Scale the tap value with three-fingered penalty.
        this.tap /= this.tapPenalty;
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    private calculateAccuracyValue(): void {
        if (this.difficultyCalculator.mods.some((m) => m instanceof ModRelax)) {
            return;
        }

        // Global variables
        const objectCount: number = this.difficultyCalculator.objects.length;
        const ncircles: number = this.difficultyCalculator.mods.some(
            (m) => m instanceof ModScoreV2
        )
            ? objectCount -
              this.difficultyCalculator.beatmap.hitObjects.spinners
            : this.difficultyCalculator.beatmap.hitObjects.circles;

        if (ncircles === 0) {
            return;
        }

        const realAccuracy: Accuracy = new Accuracy({
            ...this.computedAccuracy,
            n300: this.computedAccuracy.n300 - (objectCount - ncircles),
        });

        // Lots of arbitrary values from testing.
        // Considering to use derivation from perfect accuracy in a probabilistic manner - assume normal distribution
        this.accuracy =
            Math.pow(1.4, this.mapStatistics.od!) *
            Math.pow(realAccuracy.value(ncircles), 12) *
            10;

        // Bonus for many hitcircles - it's harder to keep good accuracy up for longer
        this.accuracy *= Math.min(1.15, Math.pow(ncircles / 1000, 0.3));

        // Scale the accuracy value with rhythm complexity.
        this.accuracy *=
            1.5 / (1 + Math.exp(-(this.difficultyCalculator.rhythm - 1) / 2));

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
            return;
        }

        // Global variables
        const objectCount: number = this.difficultyCalculator.objects.length;

        this.flashlight =
            Math.pow(Math.pow(this.difficultyCalculator.flashlight, 0.8), 2) *
            25;

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
        this.flashlight *=
            0.98 + (this.mapStatistics.od! >= 0 ? odScaling : -odScaling);
    }

    /**
     * Calculates the visual performance value of the beatmap.
     */
    private calculateVisualValue(): void {
        // Global variables
        const objectCount: number = this.difficultyCalculator.objects.length;

        this.visual = Math.pow(this.difficultyCalculator.visual, 1.6) * 22.5;

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.visual *=
                0.97 *
                Math.pow(
                    1 - Math.pow(this.effectiveMissCount / objectCount, 0.775),
                    this.effectiveMissCount
                );
        }

        // Combo scaling
        this.visual *= this.comboPenalty;

        // Scale the visual value with object count to penalize short maps.
        this.visual *= Math.min(
            1,
            1.650668 +
                (0.4845796 - 1.650668) /
                    (1 + Math.pow(objectCount / 817.9306, 1.147469))
        );

        // Scale the visual value with accuracy harshly.
        this.visual *= Math.pow(this.computedAccuracy.value(), 8);

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling: number = Math.pow(this.mapStatistics.od!, 2) / 2500;
        this.visual *=
            0.98 + (this.mapStatistics.od! >= 0 ? odScaling : -odScaling);
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
