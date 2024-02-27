import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { Mod } from "../mods/Mod";
import { ModDifficultyAdjust } from "../mods/ModDifficultyAdjust";
import { ModDoubleTime } from "../mods/ModDoubleTime";
import { ModHalfTime } from "../mods/ModHalfTime";
import { ModNightCore } from "../mods/ModNightCore";
import { ModPrecise } from "../mods/ModPrecise";
import { ModSpeedUp } from "../mods/ModSpeedUp";
import { CircleSizeCalculator } from "./CircleSizeCalculator";
import { DifficultyStatisticsCalculatorOptions } from "./DifficultyStatisticsCalculatorOptions";
import { DifficultyStatisticsCalculatorResult } from "./DifficultyStatisticsCalculatorResult";
import { DroidDifficultyStatisticsCalculatorOptions } from "./DroidDifficultyStatisticsCalculatorOptions";
import { DroidHitWindow, OsuHitWindow } from "./HitWindow";
import { OmitType } from "./OmitType";

/**
 * Calculates the osu!droid difficulty statistics of a beatmap.
 *
 * This provides functionality to apply speed-changing mods to the difficulty statistics.
 *
 * @param options The options for the difficulty statistics calculator.
 * @returns The difficulty statistics of the beatmap.
 */
export function calculateDroidDifficultyStatistics<
    TCircleSize extends number | undefined = number | undefined,
    TApproachRate extends number | undefined = number | undefined,
    TOverallDifficulty extends number | undefined = number | undefined,
    THealthDrain extends number | undefined = number | undefined,
    TMods extends Mod[] | undefined = Mod[] | undefined,
    TCustomSpeedMultiplier extends number | undefined = number | undefined,
>(
    options: Partial<
        DroidDifficultyStatisticsCalculatorOptions<
            TCircleSize,
            TApproachRate,
            TOverallDifficulty,
            THealthDrain,
            TMods,
            TCustomSpeedMultiplier
        >
    >,
): OmitType<
    DifficultyStatisticsCalculatorResult<
        TCircleSize,
        TApproachRate,
        TOverallDifficulty,
        THealthDrain
    >,
    undefined
> {
    const overallSpeedMultiplier =
        calculateSpeedMultiplierFromMods(
            options.mods ?? [],
            options.oldStatistics,
        ) * (options.customSpeedMultiplier ?? 1);

    const difficulty = new BeatmapDifficulty();
    difficulty.cs = options.circleSize ?? difficulty.cs;
    difficulty.ar = options.approachRate ?? difficulty.ar ?? difficulty.od;
    difficulty.od = options.overallDifficulty ?? difficulty.od;
    difficulty.hp = options.healthDrain ?? difficulty.hp;

    const difficultyAdjustMod = options.mods?.find(
        (mod) => mod instanceof ModDifficultyAdjust,
    ) as ModDifficultyAdjust | undefined;

    options.mods?.forEach((mod) => {
        if (mod.isApplicableToDifficulty()) {
            mod.applyToDifficulty(Modes.droid, difficulty);
        }
    });

    // Special handling for difficulty adjust mod where difficulty statistics are forced.
    difficultyAdjustMod?.applyToDifficulty(Modes.droid, difficulty);

    options.mods?.forEach((mod, _, arr) => {
        if (mod.isApplicableToDifficultyWithSettings()) {
            mod.applyToDifficultyWithSettings(
                Modes.droid,
                difficulty,
                arr,
                options.customSpeedMultiplier ?? 1,
            );
        }
    });

    if (
        options.circleSize !== undefined &&
        options.convertCircleSize !== false
    ) {
        const scale = CircleSizeCalculator.droidCSToDroidScale(difficulty.cs);

        const radius = CircleSizeCalculator.droidScaleToStandardRadius(scale);

        difficulty.cs = CircleSizeCalculator.standardRadiusToStandardCS(
            radius,
            true,
        );
    }

    // Apply speed-changing mods
    if (
        options.approachRate !== undefined &&
        difficultyAdjustMod?.ar === undefined
    ) {
        const approachRateMilliseconds =
            convertApproachRateToMilliseconds(difficulty.ar) /
            overallSpeedMultiplier;

        difficulty.ar = convertApproachRateMilliseconds(
            approachRateMilliseconds,
        );
    }

    if (options.overallDifficulty !== undefined) {
        const isPrecise =
            options.mods?.some((mod) => mod instanceof ModPrecise) ?? false;

        let hitWindowGreat = new DroidHitWindow(difficulty.od).hitWindowFor300(
            isPrecise,
        );

        if (difficultyAdjustMod?.od === undefined) {
            hitWindowGreat /= overallSpeedMultiplier;
        }

        difficulty.od =
            options.convertOverallDifficulty !== false
                ? OsuHitWindow.hitWindow300ToOD(hitWindowGreat)
                : DroidHitWindow.hitWindow300ToOD(hitWindowGreat, isPrecise);
    }

    return {
        circleSize: (options.circleSize !== undefined
            ? difficulty.cs
            : undefined) as TCircleSize,
        approachRate: (options.approachRate !== undefined
            ? difficulty.ar
            : undefined) as TApproachRate,
        overallDifficulty: (options.overallDifficulty !== undefined
            ? difficulty.od
            : undefined) as TOverallDifficulty,
        healthDrain: (options.healthDrain !== undefined
            ? difficulty.hp
            : undefined) as THealthDrain,
        overallSpeedMultiplier: overallSpeedMultiplier,
    } as OmitType<
        DifficultyStatisticsCalculatorResult<
            TCircleSize,
            TApproachRate,
            TOverallDifficulty,
            THealthDrain
        >,
        undefined
    >;
}

/**
 * Calculates the osu!standard difficulty statistics of a beatmap.
 *
 * This provides functionality to apply speed-changing mods to the difficulty statistics.
 *
 * @param options The options for the difficulty statistics calculator.
 * @returns The difficulty statistics of the beatmap.
 */
export function calculateOsuDifficultyStatistics<
    TCircleSize extends number | undefined = number | undefined,
    TApproachRate extends number | undefined = number | undefined,
    TOverallDifficulty extends number | undefined = number | undefined,
    THealthDrain extends number | undefined = number | undefined,
    TMods extends Mod[] | undefined = Mod[] | undefined,
    TCustomSpeedMultiplier extends number | undefined = number | undefined,
>(
    options: Partial<
        DifficultyStatisticsCalculatorOptions<
            TCircleSize,
            TApproachRate,
            TOverallDifficulty,
            THealthDrain,
            TMods,
            TCustomSpeedMultiplier
        >
    >,
): OmitType<
    DifficultyStatisticsCalculatorResult<
        TCircleSize,
        TApproachRate,
        TOverallDifficulty,
        THealthDrain
    >,
    undefined
> {
    const overallSpeedMultiplier =
        calculateSpeedMultiplierFromMods(options.mods ?? []) *
        (options.customSpeedMultiplier ?? 1);

    const difficulty = new BeatmapDifficulty();
    difficulty.cs = options.circleSize ?? difficulty.cs;
    difficulty.ar = options.approachRate ?? difficulty.ar ?? difficulty.od;
    difficulty.od = options.overallDifficulty ?? difficulty.od;
    difficulty.hp = options.healthDrain ?? difficulty.hp;

    const difficultyAdjustMod = options.mods?.find(
        (mod) => mod instanceof ModDifficultyAdjust,
    ) as ModDifficultyAdjust | undefined;

    options.mods?.forEach((mod) => {
        if (mod.isApplicableToDifficulty()) {
            mod.applyToDifficulty(Modes.osu, difficulty);
        }
    });

    // Special handling for difficulty adjust mod where difficulty statistics are forced.
    difficultyAdjustMod?.applyToDifficulty(Modes.osu, difficulty);

    options.mods?.forEach((mod, _, arr) => {
        if (mod.isApplicableToDifficultyWithSettings()) {
            mod.applyToDifficultyWithSettings(
                Modes.osu,
                difficulty,
                arr,
                options.customSpeedMultiplier ?? 1,
            );
        }
    });

    // Apply speed-changing mods
    if (
        options.approachRate !== undefined &&
        difficultyAdjustMod?.ar === undefined
    ) {
        const approachRateMilliseconds =
            convertApproachRateToMilliseconds(difficulty.ar) /
            overallSpeedMultiplier;

        difficulty.ar = convertApproachRateMilliseconds(
            approachRateMilliseconds,
        );
    }

    if (
        options.overallDifficulty !== undefined &&
        difficultyAdjustMod?.od === undefined
    ) {
        const hitWindowGreat =
            new OsuHitWindow(difficulty.od).hitWindowFor300() /
            overallSpeedMultiplier;

        difficulty.od = OsuHitWindow.hitWindow300ToOD(hitWindowGreat);
    }

    return {
        circleSize: (options.circleSize !== undefined
            ? difficulty.cs
            : undefined) as TCircleSize,
        approachRate: (options.approachRate !== undefined
            ? difficulty.ar
            : undefined) as TApproachRate,
        overallDifficulty: (options.overallDifficulty !== undefined
            ? difficulty.od
            : undefined) as TOverallDifficulty,
        healthDrain: (options.healthDrain !== undefined
            ? difficulty.hp
            : undefined) as THealthDrain,
        overallSpeedMultiplier: overallSpeedMultiplier,
    } as OmitType<
        DifficultyStatisticsCalculatorResult<
            TCircleSize,
            TApproachRate,
            TOverallDifficulty,
            THealthDrain
        >,
        undefined
    >;
}

/**
 * Calculates the speed multiplier obtained from mods.
 *
 * @param mods The mods to calculate the speed multiplier from.
 * @param oldStatistics Whether to calculate for old statistics for osu!droid (1.6.7 and older). Defaults to `false`.
 * @returns The speed multiplier obtained from the mods.
 */
export function calculateSpeedMultiplierFromMods(
    mods: Mod[],
    oldStatistics?: boolean,
): number {
    let speedMultiplier = 1;

    for (const mod of mods) {
        switch (true) {
            case mod instanceof ModDoubleTime:
                speedMultiplier *= 1.5;
                break;
            case mod instanceof ModHalfTime:
                speedMultiplier *= 0.75;
                break;
            case mod instanceof ModNightCore:
                speedMultiplier *= oldStatistics ? 1.39 : 1.5;
                break;
            case mod instanceof ModSpeedUp:
                speedMultiplier *= 1.25;
                break;
        }
    }

    return speedMultiplier;
}

export const AR0_MS = 1800;
export const AR5_MS = 1200;
export const AR10_MS = 450;

const AR_MS_STEP1 = (AR0_MS - AR5_MS) / 5;
const AR_MS_STEP2 = (AR5_MS - AR10_MS) / 5;

/**
 * Converts an approach rate value to its milliseconds counterpart.
 *
 * @param ar The approach rate to convert.
 * @returns The converted approach rate in milliseconds.
 */
export function convertApproachRateToMilliseconds(ar: number): number {
    return ar < 5 ? AR0_MS - AR_MS_STEP1 * ar : AR5_MS - AR_MS_STEP2 * (ar - 5);
}

/**
 * Converts an approach rate value in milliseconds to its approach rate value counterpart.
 *
 * @param ms The approach rate in milliseconds to convert.
 * @returns The converted approach rate value.
 */
export function convertApproachRateMilliseconds(ms: number): number {
    return ms > AR5_MS
        ? (AR0_MS - ms) / AR_MS_STEP1
        : 5 + (AR5_MS - ms) / AR_MS_STEP2;
}
