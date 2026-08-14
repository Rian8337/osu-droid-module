import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { MathUtils } from "../math/MathUtils";
import { ModApproachDifferent } from "../mods/ModApproachDifferent";
import { ModAutopilot } from "../mods/ModAutopilot";
import { ModBlinds } from "../mods/ModBlinds";
import { ModDeflate } from "../mods/ModDeflate";
import { ModDifficultyAdjust } from "../mods/ModDifficultyAdjust";
import { ModDoubleTime } from "../mods/ModDoubleTime";
import { ModEasy } from "../mods/ModEasy";
import { ModFlashlight } from "../mods/ModFlashlight";
import { ModFreezeFrame } from "../mods/ModFreezeFrame";
import { ModGrow } from "../mods/ModGrow";
import { ModHalfTime } from "../mods/ModHalfTime";
import { ModHardRock } from "../mods/ModHardRock";
import { ModHidden } from "../mods/ModHidden";
import { ModMagnetised } from "../mods/ModMagnetised";
import { ModNightCore } from "../mods/ModNightCore";
import { ModNoFail } from "../mods/ModNoFail";
import { ModRandom } from "../mods/ModRandom";
import { ModRelax } from "../mods/ModRelax";
import { ModSpunOut } from "../mods/ModSpunOut";
import { ModSynesthesia } from "../mods/ModSynesthesia";
import { ModTimeRamp } from "../mods/ModTimeRamp";
import { ModTraceable } from "../mods/ModTraceable";
import { ModWindDown } from "../mods/ModWindDown";
import { ModWindUp } from "../mods/ModWindUp";
import { ScoreMultiplierCalculator } from "./ScoreMultiplierCalculator";

/**
 * A score multiplier calculator for osu!standard.
 * 
 * Used for osu!lazer version 2026.621.0 and onwards.
 */
export class OsuScoreMultiplierCalculatorV2 extends ScoreMultiplierCalculator {
    constructor(difficulty: BeatmapDifficulty) {
        super(difficulty);

        //#region Difficulty Reduction

        this.single(ModEasy, (ez) => this.easyMultiplier(ez));
        this.single(ModNoFail, 0.5);
        this.single(ModHalfTime, (ht) => this.halfTimeMultiplier(ht.rate));

        //#endregion

        //#region Difficulty Increase

        this.single(ModHardRock, 1.09);
        this.single(ModDoubleTime, (dt) => this.doubleTimeMultiplier(dt.rate));
        this.single(ModNightCore, (nc) => this.doubleTimeMultiplier(nc.rate));

        const blindsMultiplier = 1.24;

        this.combination(ModHidden, ModBlinds, () => blindsMultiplier);
        // Hidden, Wiggle
        this.combination(ModHidden, ModGrow, (hd) => this.hiddenMultiplier(hd, true));
        this.combination(ModHidden, ModDeflate, (hd) => this.hiddenMultiplier(hd, true));
        // Hidden + Repel
        // Hidden + Depth

        this.single(ModHidden, (hd) => this.hiddenMultiplier(hd, false));

        this.combination(ModTraceable, ModBlinds, () => blindsMultiplier);
        this.single(ModTraceable, 1.02);

        this.combination(ModFlashlight, ModFreezeFrame, (fl) => 1 + (this.flashlightMultiplier(fl) - 1) / 2);
        this.single(ModFlashlight, (fl) => this.flashlightMultiplier(fl));

        this.single(ModBlinds, blindsMultiplier);

        //#endregion

        //#region Conversion

        // Target Practice
        this.single(ModDifficultyAdjust, (da) => this.difficultyAdjustMultiplier(da));
        this.single(ModRandom, 0.7);

        //#endregion

        //#region Automation

        this.single(ModRelax, 0.1);
        this.single(ModAutopilot, 0.1);
        this.single(ModSpunOut, 0.95);

        //#endregion

        //#region Fun

        this.single(ModDeflate, (df) => this.deflateMultiplier(df));
        this.single(ModWindUp, (wu) => this.timeRampMultiplier(wu));
        this.single(ModWindDown, (wd) => this.timeRampMultiplier(wd));
        this.single(ModApproachDifferent, 0.7);
        this.single(ModMagnetised, (mg) => 0.7 - mg.attractionStrength.value * 0.6);
        // Adaptive Speed
        this.single(ModSynesthesia, 0.99);

        //#endregion
    }

    private easyMultiplier(mod: ModEasy): number {
        // 0.8x base multiplier
        // Reduce by 0.1x per extra life
        const value = 0.8 - Math.max(0, 0.1 * (mod.retries.value - mod.retries.defaultValue));

        return Math.max(0.4, value);
    }

    private halfTimeMultiplier(rate: number): number {
        // 0.2x at 0.5x speed, +0.07x per 0.05x speed increment.
        // Default HT (0.75x) = 0.55
        return Math.trunc(rate * 20) / 20 * 1.4 - 0.5;
    }

    private doubleTimeMultiplier(rate: number): number {
        // Floor to the nearest multiple of 0.1.
        const value = Math.trunc(rate * 10) / 10;

        // 0.01 penalty for non-default rates.
        const penalty = value != 1.5 && value != 1 ? 0.01 : 0;

        // Linear from 1.0 to 1.46, minus the penalty.
        // Default DT (1.5x) = 1.23
        return (value - 1) * 0.46 + 1 - penalty;
    }

    private hiddenMultiplier(mod: ModHidden, otherModsProvideTimingInfo: boolean): number {
        let value = 1.04;

        if (mod.onlyFadeApproachCircles.value) {
            value -= 0.02;
        }

        if (otherModsProvideTimingInfo) {
            value -= 0.02;
        }

        return value;
    }

    private flashlightMultiplier(mod: ModFlashlight): number {
        // Multiplier of 1.2x, reduced by 0.02 per 0.1 increase in flashlight size.
        let value = MathUtils.clamp(1.2 - 0.2 * (mod.sizeMultiplier.value - 1), 1.02, 1.2);

        if (!mod.comboBasedSize.value) {
            value = 1 + (value - 1) / 5;
        }

        return value;
    }

    private difficultyAdjustMultiplier(mod: ModDifficultyAdjust): number {
        const { difficulty } = this;
        const { cs, ar, od, hp } = mod;

        if (!difficulty) {
            return 1;
        }

        const selectedCircleSize = cs.value ?? difficulty.cs;
        const selectedApproachRate = ar.value ?? difficulty.ar;
        const selectedOverallDifficulty = od.value ?? difficulty.od;
        const selectedHealthDrain = hp.value ?? difficulty.hp;

        const csDifference = Math.abs(selectedCircleSize - difficulty.cs);
        const arDifference = Math.abs(selectedApproachRate - difficulty.ar);
        const odDifference = Math.abs(selectedOverallDifficulty - difficulty.od);
        const hpDifference = Math.abs(selectedHealthDrain - difficulty.hp);

        // Per parameter, reduce multiplier by 0.05x per 0.1 change.
        const csMultiplier = Math.max(0.1, 1 - csDifference * 0.5);
        const arMultiplier = Math.max(0.1, 1 - arDifference * 0.5);
        const odMultiplier = Math.max(0.1, 1 - odDifference * 0.5);
        const hpMultiplier = Math.max(0.1, 1 - hpDifference * 0.5);

        return Math.max(0.1, csMultiplier * arMultiplier * odMultiplier * hpMultiplier);
    }

    private timeRampMultiplier(mod: ModTimeRamp): number {
        const minSpeed = Math.min(mod.initialRate.value, mod.finalRate.value);
        const maxSpeed = Math.max(mod.initialRate.value, mod.finalRate.value);

        const minMultiplier = minSpeed < 1 ? this.halfTimeMultiplier(minSpeed) : this.doubleTimeMultiplier(minSpeed);
        const maxMultiplier = maxSpeed < 1 ? this.halfTimeMultiplier(maxSpeed) : this.doubleTimeMultiplier(maxSpeed);

        return 0.8 * minMultiplier + 0.2 * maxMultiplier;
    }

    private deflateMultiplier(mod: ModDeflate): number {
        return 1 - Math.max(0, 0.02 * (mod.startScale.value - mod.startScale.defaultValue));
    }
}