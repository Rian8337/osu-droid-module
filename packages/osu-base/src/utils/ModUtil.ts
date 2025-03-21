import { HitObject } from "../beatmap/hitobjects/HitObject";
import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { IModApplicableToDroid } from "../mods/IModApplicableToDroid";
import { IModApplicableToOsuStable } from "../mods/IModApplicableToOsuStable";
import { Mod } from "../mods/Mod";
import { ModAuto } from "../mods/ModAuto";
import { ModAutopilot } from "../mods/ModAutopilot";
import { ModDifficultyAdjust } from "../mods/ModDifficultyAdjust";
import { ModDoubleTime } from "../mods/ModDoubleTime";
import { ModEasy } from "../mods/ModEasy";
import { ModFlashlight } from "../mods/ModFlashlight";
import { ModHalfTime } from "../mods/ModHalfTime";
import { ModHardRock } from "../mods/ModHardRock";
import { ModHidden } from "../mods/ModHidden";
import { ModNightCore } from "../mods/ModNightCore";
import { ModNoFail } from "../mods/ModNoFail";
import { ModPerfect } from "../mods/ModPerfect";
import { ModPrecise } from "../mods/ModPrecise";
import { ModRateAdjust } from "../mods/ModRateAdjust";
import { ModReallyEasy } from "../mods/ModReallyEasy";
import { ModRelax } from "../mods/ModRelax";
import { ModScoreV2 } from "../mods/ModScoreV2";
import { ModSmallCircle } from "../mods/ModSmallCircle";
import { ModSpunOut } from "../mods/ModSpunOut";
import { ModSuddenDeath } from "../mods/ModSuddenDeath";
import { ModTouchDevice } from "../mods/ModTouchDevice";
import { ModTraceable } from "../mods/ModTraceable";
import { DroidHitWindow } from "./DroidHitWindow";
import { OsuHitWindow } from "./OsuHitWindow";
import { PreciseDroidHitWindow } from "./PreciseDroidHitWindow";

/**
 * Options for parsing mods.
 */
export interface ModParseOptions {
    /**
     * Whether to check for duplicate mods. Defaults to `true`.
     */
    checkDuplicate?: boolean;

    /**
     * Whether to check for incompatible mods. Defaults to `true`.
     */
    checkIncompatible?: boolean;
}

/**
 * Utilities for mods.
 */
export abstract class ModUtil {
    /**
     * All mods that exists.
     */
    static readonly allMods: Mod[] = [
        // Janky order to keep the order on what players are used to
        new ModAuto(),
        new ModRelax(),
        new ModAutopilot(),
        new ModEasy(),
        new ModNoFail(),
        new ModHidden(),
        new ModTraceable(),
        new ModHardRock(),
        new ModDoubleTime(),
        new ModNightCore(),
        new ModHalfTime(),
        new ModFlashlight(),
        new ModSuddenDeath(),
        new ModPerfect(),
        new ModPrecise(),
        new ModReallyEasy(),
        new ModScoreV2(),
        new ModSmallCircle(),
        new ModSpunOut(),
        new ModTouchDevice(),
    ];

    /**
     * Mods that change the playback speed of a beatmap.
     */
    static readonly speedChangingMods: ModRateAdjust[] = [
        new ModDoubleTime(),
        new ModNightCore(),
        new ModHalfTime(),
    ];

    /**
     * Gets a list of mods from a droid mod string, such as "hd".
     *
     * @param str The string.
     * @param options Options for parsing behavior.
     */
    static droidStringToMods(
        str: string,
        options?: ModParseOptions,
    ): (Mod & IModApplicableToDroid)[] {
        return <(Mod & IModApplicableToDroid)[]>this.processParsingOptions(
            this.allMods.filter(
                (m) =>
                    m.isApplicableToDroid() &&
                    str.toLowerCase().includes(m.droidString),
            ),
            options,
        );
    }

    /**
     * Gets a list of mods from a PC modbits.
     *
     * @param modbits The modbits.
     * @param options Options for parsing behavior.
     */
    static pcModbitsToMods(
        modbits: number,
        options?: ModParseOptions,
    ): (Mod & IModApplicableToOsuStable)[] {
        return <(Mod & IModApplicableToOsuStable)[]>this.processParsingOptions(
            this.allMods.filter(
                (m) => m.isApplicableToOsuStable() && (m.bitwise & modbits) > 0,
            ),
            options,
        );
    }

    /**
     * Gets a list of mods from a PC mod string, such as "HDHR".
     *
     * @param str The string.
     * @param options Options for parsing behavior.
     */
    static pcStringToMods(str: string, options?: ModParseOptions): Mod[] {
        const finalMods: Mod[] = [];

        str = str.toLowerCase();

        while (str) {
            let nchars: number = 1;

            for (const mod of this.allMods) {
                if (str.startsWith(mod.acronym.toLowerCase())) {
                    finalMods.push(mod);
                    nchars = 2;
                    break;
                }
            }

            str = str.slice(nchars);
        }

        return this.processParsingOptions(finalMods, options);
    }

    /**
     * Converts an array of mods into its osu!droid string counterpart.
     *
     * @param mods The array of mods to convert.
     * @returns The string representing the mods in osu!droid.
     */
    static modsToDroidString(mods: IModApplicableToDroid[]): string {
        return mods.reduce((a, v) => a + v.droidString, "");
    }

    /**
     * Converts an array of mods into its osu!standard string counterpart.
     *
     * @param mods The array of mods to convert.
     * @returns The string representing the mods in osu!standard.
     */
    static modsToOsuString(mods: Mod[]): string {
        return mods.reduce((a, v) => {
            if (v instanceof ModDifficultyAdjust) {
                return a;
            }

            return a + v.acronym;
        }, "");
    }

    /**
     * Checks for mods that are duplicated.
     *
     * @param mods The mods to check for.
     * @returns Mods that have been filtered.
     */
    static checkDuplicateMods<T extends Mod>(mods: T[]): T[] {
        return Array.from(new Set(mods));
    }

    /**
     * Checks for mods that are incompatible with each other.
     *
     * @param mods The mods to check for.
     * @returns Mods that have been filtered.
     */
    static checkIncompatibleMods<T extends Mod>(mods: T[]): T[] {
        for (let i = 0; i < mods.length; ++i) {
            const mod = mods[i];

            for (const incompatibleMod of mod.incompatibleMods) {
                if (
                    mods.some((m) => m !== mod && m instanceof incompatibleMod)
                ) {
                    mods = mods.filter(
                        (m) =>
                            // Keep the mod itself.
                            m === mod || !(m instanceof incompatibleMod),
                    );
                }
            }
        }

        return mods;
    }

    /**
     * Removes speed-changing mods from an array of mods.
     *
     * @param mods The array of mods.
     * @returns A new array with speed changing mods filtered out.
     */
    static removeSpeedChangingMods<T extends Mod>(mods: T[]): T[] {
        return mods.filter(
            (m) => !this.speedChangingMods.some((v) => m.acronym === v.acronym),
        );
    }

    /**
     * Applies the selected `Mod`s to a `BeatmapDifficulty`.
     *
     * @param difficulty The `BeatmapDifficulty` to apply the `Mod`s to.
     * @param mode The game mode to apply the `Mod`s for.
     * @param mods The selected `Mod`s.
     * @param customSpeedMultiplier The custom speed multiplier to apply.
     * @param withRateChange Whether to apply rate changes.
     * @param oldStatistics Whether to enforce old statistics. Some `Mod`s behave differently with this flag.
     */
    static applyModsToBeatmapDifficulty(
        difficulty: BeatmapDifficulty,
        mode: Modes,
        mods: Mod[],
        customSpeedMultiplier = 1,
        withRateChange = false,
        oldStatistics = false,
    ) {
        for (const mod of mods) {
            if (mod.isApplicableToDifficulty()) {
                mod.applyToDifficulty(mode, difficulty);
            }
        }

        let rate = customSpeedMultiplier;

        for (const mod of mods) {
            if (mod.isApplicableToDifficultyWithSettings()) {
                mod.applyToDifficultyWithSettings(
                    mode,
                    difficulty,
                    mods,
                    customSpeedMultiplier,
                );
            }

            if (mod.isApplicableToTrackRate()) {
                rate = mod.applyToRate(rate, oldStatistics);
            }
        }

        if (!withRateChange) {
            return;
        }

        // Apply rate adjustments
        const preempt =
            BeatmapDifficulty.difficultyRange(
                difficulty.ar,
                HitObject.preemptMax,
                HitObject.preemptMid,
                HitObject.preemptMin,
            ) / rate;
        difficulty.ar = BeatmapDifficulty.inverseDifficultyRange(
            preempt,
            HitObject.preemptMax,
            HitObject.preemptMid,
            HitObject.preemptMin,
        );

        switch (mode) {
            case Modes.droid:
                if (mods.some((m) => m instanceof ModPrecise)) {
                    const hitWindow = new PreciseDroidHitWindow(difficulty.od);

                    difficulty.od = PreciseDroidHitWindow.greatWindowToOD(
                        hitWindow.greatWindow / rate,
                    );
                } else {
                    const hitWindow = new DroidHitWindow(difficulty.od);

                    difficulty.od = DroidHitWindow.greatWindowToOD(
                        hitWindow.greatWindow / rate,
                    );
                }

                break;

            case Modes.osu: {
                const hitWindow = new OsuHitWindow(difficulty.od);

                difficulty.od = OsuHitWindow.greatWindowToOD(
                    hitWindow.greatWindow / rate,
                );

                break;
            }
        }
    }

    /**
     * Calculates the rate for the track with the selected `Mod`s.
     *
     * @param mods The list of selected `Mod`s.
     * @param oldStatistics Whether to enforce old statistics. Some `Mod`s behave differently with this flag.
     * @returns The rate with `Mod`s.
     */
    static calculateRateWithMods(
        mods: Iterable<Mod>,
        oldStatistics?: boolean,
    ): number {
        let rate = 1;

        for (const mod of mods) {
            if (mod.isApplicableToTrackRate()) {
                rate = mod.applyToRate(rate, oldStatistics);
            }
        }

        return rate;
    }

    /**
     * Processes parsing options.
     *
     * @param mods The mods to process.
     * @param options The options to process.
     * @returns The processed mods.
     */
    private static processParsingOptions<T extends Mod>(
        mods: T[],
        options?: ModParseOptions,
    ): T[] {
        if (options?.checkDuplicate !== false) {
            mods = this.checkDuplicateMods(mods);
        }

        if (options?.checkIncompatible !== false) {
            mods = this.checkIncompatibleMods(mods);
        }

        return mods;
    }
}
