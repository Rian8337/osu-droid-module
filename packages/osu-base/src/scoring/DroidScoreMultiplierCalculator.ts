import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { MathUtils } from "../math/MathUtils";
import { Mod } from "../mods/Mod";
import { ModApproachDifferent } from "../mods/ModApproachDifferent";
import { ModAutopilot } from "../mods/ModAutopilot";
import { ModDifficultyAdjust } from "../mods/ModDifficultyAdjust";
import { ModEasy } from "../mods/ModEasy";
import { ModFlashlight } from "../mods/ModFlashlight";
import { ModFreezeFrame } from "../mods/ModFreezeFrame";
import { ModHardRock } from "../mods/ModHardRock";
import { ModHidden } from "../mods/ModHidden";
import { ModMap } from "../mods/ModMap";
import { ModNoFail } from "../mods/ModNoFail";
import { ModPrecise } from "../mods/ModPrecise";
import { ModRandom } from "../mods/ModRandom";
import { ModRateAdjust } from "../mods/ModRateAdjust";
import { ModReallyEasy } from "../mods/ModReallyEasy";
import { ModRelax } from "../mods/ModRelax";
import { ModTimeRamp } from "../mods/ModTimeRamp";
import { ModTraceable } from "../mods/ModTraceable";
import { ModWindDown } from "../mods/ModWindDown";
import { ModWindUp } from "../mods/ModWindUp";
import { ModUtil } from "../utils/ModUtil";
import { ScoreMultiplierCalculator } from "./ScoreMultiplierCalculator";

/**
 * Current osu!droid score multiplier calculator. This is used to calculate score after version 5 database migration.
 */
export class DroidScoreMultiplierCalculator extends ScoreMultiplierCalculator {
    private appliedDifficulty: BeatmapDifficulty | null = null;

    constructor(difficulty: BeatmapDifficulty | null) {
        super(difficulty);

        //#region Difficulty Reduction

        this.single(ModEasy, 0.8);
        this.single(ModNoFail, 0.5);
        this.single(ModReallyEasy, 0.3);

        //#endregion

        //#region Difficulty Increase

        this.single(ModHardRock, 1.04);
        this.single(ModPrecise, () => this.preciseMultiplier());
        this.single(ModHidden, (hd) => this.hiddenMultiplier(hd));
        this.single(ModTraceable, 1.02);

        this.combination(
            ModFlashlight,
            ModFreezeFrame,
            (fl) => 1 + (this.flashlightMultiplier(fl) - 1) / 2,
        );

        this.single(ModFlashlight, (fl) => this.flashlightMultiplier(fl));

        //#endregion

        //#region Conversion

        this.single(ModDifficultyAdjust, (da) =>
            this.difficultyAdjustMultiplier(da),
        );

        this.group(ModRateAdjust, (mods) => this.rateAdjustMultiplier(mods));

        //#endregion

        //#region Automation

        this.single(ModRelax, 1e-3);
        this.single(ModAutopilot, 1e-3);

        //#endregion

        //#region Fun

        this.single(ModRandom, 0.7);
        this.single(ModApproachDifferent, 0.7);
        this.single(ModWindUp, (wu) => this.timeRampMultiplier(wu));
        this.single(ModWindDown, (wd) => this.timeRampMultiplier(wd));

        //#endregion
    }

    override calculateFor(mods: Iterable<Mod>): number {
        // `mods` may be a one-shot iterator (e.g. `ModMap.values()`), which would be exhausted after the first
        // pass below. Materialize it once so it can be safely iterated again by `super.calculateFor`.
        const modList = [...mods];

        const { difficulty } = this;

        if (difficulty) {
            this.appliedDifficulty = new BeatmapDifficulty(difficulty);

            const modMap = new ModMap();

            for (const mod of modList) {
                modMap.set(mod);
            }

            ModUtil.applyModsToBeatmapDifficulty(
                this.appliedDifficulty,
                Modes.Droid,
                modMap,
            );
        } else {
            this.appliedDifficulty = null;
        }

        return super.calculateFor(modList);
    }

    private difficultyAdjustMultiplier(mod: ModDifficultyAdjust): number {
        const { difficulty } = this;

        // Graph: https://www.desmos.com/calculator/yrggkhrkzz
        let multiplier = 1;

        if (difficulty) {
            if (mod.cs.value !== null) {
                const diff = mod.cs.value - difficulty.cs;

                multiplier *=
                    diff >= 0
                        ? 1 + 0.0075 * Math.pow(diff, 1.5)
                        : 2 / (1 + Math.exp(-0.5 * diff));
            }

            if (mod.od.value !== null) {
                const diff = mod.od.value - difficulty.od;

                multiplier *=
                    diff >= 0
                        ? 1 + 0.005 * Math.pow(diff, 1.3)
                        : 2 / (1 + Math.exp(-0.25 * diff));
            }
        }

        return multiplier;
    }

    private preciseMultiplier(): number {
        const { appliedDifficulty } = this;

        // Keep original multiplier if applied difficulty is not present.
        if (!appliedDifficulty) {
            return 1.06;
        }

        return 1.02 + 0.08 * Math.pow(appliedDifficulty.od / 10, 2);
    }

    private hiddenMultiplier(mod: ModHidden): number {
        let value = 1.06;

        if (mod.onlyFadeApproachCircles.value) {
            value -= 0.03;
        }

        return value;
    }

    private flashlightMultiplier(mod: ModFlashlight): number {
        // Multiplier of 1.2x, reduced by 0.02 per 0.1 increase in flashlight size.
        let value = MathUtils.clamp(
            1.2 - 0.2 * (mod.sizeMultiplier.value - 1),
            1.02,
            1.2,
        );

        if (!mod.comboBasedSize.value) {
            value = 1 + (value - 1) / 5;
        }

        return value;
    }

    private rateAdjustMultiplier(mods: ModRateAdjust[]): number {
        const multiplier = mods.reduce((acc, mod) => acc * mod.rate, 1);

        return this.rateMultiplier(multiplier);
    }

    private rateMultiplier(rate: number): number {
        return rate >= 1
            ? // Linear from 1.0 to 1.46.
              // Default DT (1.5x) = 1.23
              1 + (rate - 1) * 0.46
            : // 0.25x at 0.5x speed, +0.075x per 0.05x speed increment.
              // Default HT (0.75x) = 0.625.
              Math.max(0.1, rate * 1.5 - 0.5);
    }

    private timeRampMultiplier(mod: ModTimeRamp): number {
        const minSpeed = Math.min(mod.initialRate.value, mod.finalRate.value);
        const maxSpeed = Math.max(mod.initialRate.value, mod.finalRate.value);

        const minMultiplier = this.rateMultiplier(minSpeed);
        const maxMultiplier = this.rateMultiplier(maxSpeed);

        return 0.8 * minMultiplier + 0.2 * maxMultiplier;
    }
}
