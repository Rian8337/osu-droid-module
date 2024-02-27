import { IModApplicableToDroid } from "../mods/IModApplicableToDroid";
import { IModApplicableToOsu } from "../mods/IModApplicableToOsu";
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
import { ModReallyEasy } from "../mods/ModReallyEasy";
import { ModRelax } from "../mods/ModRelax";
import { ModScoreV2 } from "../mods/ModScoreV2";
import { ModSmallCircle } from "../mods/ModSmallCircle";
import { ModSpeedUp } from "../mods/ModSpeedUp";
import { ModSpunOut } from "../mods/ModSpunOut";
import { ModSuddenDeath } from "../mods/ModSuddenDeath";
import { ModTouchDevice } from "../mods/ModTouchDevice";

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
     * Mods that are incompatible with each other.
     */
    static readonly incompatibleMods: Mod[][] = [
        [
            new ModDoubleTime(),
            new ModNightCore(),
            new ModHalfTime(),
            new ModSpeedUp(),
        ],
        [new ModNoFail(), new ModSuddenDeath(), new ModPerfect()],
        [new ModHardRock(), new ModEasy()],
        [new ModAuto(), new ModRelax(), new ModAutopilot()],
    ];

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
        new ModHardRock(),
        new ModDoubleTime(),
        new ModNightCore(),
        new ModHalfTime(),
        new ModSpeedUp(),
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
    static readonly speedChangingMods: Mod[] = [
        new ModDoubleTime(),
        new ModNightCore(),
        new ModHalfTime(),
        new ModSpeedUp(),
    ];

    /**
     * Mods that change the way the map looks.
     */
    static readonly mapChangingMods: Mod[] = this.speedChangingMods.concat(
        new ModEasy(),
        new ModHardRock(),
        new ModReallyEasy(),
        new ModSmallCircle(),
    );

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
    ): (Mod & IModApplicableToOsu)[] {
        return <(Mod & IModApplicableToOsu)[]>this.processParsingOptions(
            this.allMods.filter(
                (m) => m.isApplicableToOsu() && m.bitwise & modbits,
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
        for (const incompatibleMod of this.incompatibleMods) {
            const fulfilledMods: T[] = mods.filter((m) =>
                incompatibleMod.some((v) => m.acronym === v.acronym),
            );

            if (fulfilledMods.length > 1) {
                mods = mods.filter((m) =>
                    incompatibleMod.every((v) => m.acronym !== v.acronym),
                );
                // Keep the first selected mod
                mods.push(fulfilledMods[0]);
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
        return mods
            .slice()
            .filter(
                (m) =>
                    !this.speedChangingMods.some(
                        (v) => m.acronym === v.acronym,
                    ),
            );
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
