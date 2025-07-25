import { Beatmap } from "../beatmap/Beatmap";
import { DroidHitWindow } from "../beatmap/DroidHitWindow";
import { OsuHitWindow } from "../beatmap/OsuHitWindow";
import { PreciseDroidHitWindow } from "../beatmap/PreciseDroidHitWindow";
import { HitObject } from "../beatmap/hitobjects/HitObject";
import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { Mod } from "../mods/Mod";
import { ModApproachDifferent } from "../mods/ModApproachDifferent";
import { ModAuto } from "../mods/ModAuto";
import { ModAutopilot } from "../mods/ModAutopilot";
import { ModCustomSpeed } from "../mods/ModCustomSpeed";
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
import { ModMap } from "../mods/ModMap";
import { ModMirror } from "../mods/ModMirror";
import { ModMuted } from "../mods/ModMuted";
import { ModNightCore } from "../mods/ModNightCore";
import { ModNoFail } from "../mods/ModNoFail";
import { ModPerfect } from "../mods/ModPerfect";
import { ModPrecise } from "../mods/ModPrecise";
import { ModRandom } from "../mods/ModRandom";
import { ModRateAdjust } from "../mods/ModRateAdjust";
import { ModRateAdjustHelper } from "../mods/ModRateAdjustHelper";
import { ModReallyEasy } from "../mods/ModReallyEasy";
import { ModRelax } from "../mods/ModRelax";
import { ModReplayV6 } from "../mods/ModReplayV6";
import { ModScoreV2 } from "../mods/ModScoreV2";
import { ModSmallCircle } from "../mods/ModSmallCircle";
import { ModSpunOut } from "../mods/ModSpunOut";
import { ModSuddenDeath } from "../mods/ModSuddenDeath";
import { ModSynesthesia } from "../mods/ModSynesthesia";
import { ModTouchDevice } from "../mods/ModTouchDevice";
import { ModTraceable } from "../mods/ModTraceable";
import { ModWindDown } from "../mods/ModWindDown";
import { ModWindUp } from "../mods/ModWindUp";
import { SerializedMod } from "../mods/SerializedMod";

/**
 * Utilities for mods.
 */
export abstract class ModUtil {
    /**
     * All `Mod`s that exists, mapped by their acronym.
     */
    static readonly allMods: ReadonlyMap<string, typeof Mod> = (() => {
        const mods = [
            // Janky order to keep the order on what players are used to
            ModAuto,
            ModRelax,
            ModAutopilot,
            ModEasy,
            ModNoFail,
            ModHidden,
            ModApproachDifferent,
            ModFreezeFrame,
            ModTraceable,
            ModDoubleTime,
            ModNightCore,
            ModHalfTime,
            ModCustomSpeed,
            ModWindDown,
            ModWindUp,
            ModHardRock,
            ModMirror,
            ModGrow,
            ModDeflate,
            ModDifficultyAdjust,
            ModFlashlight,
            ModSuddenDeath,
            ModPerfect,
            ModPrecise,
            ModRandom,
            ModReallyEasy,
            ModMuted,
            ModSynesthesia,
            ModReplayV6,
            ModScoreV2,
            ModSmallCircle,
            ModSpunOut,
            ModTouchDevice,
        ];

        const map = new Map<string, typeof Mod>();

        for (const mod of mods) {
            map.set(new mod().acronym, mod);
        }

        return map;
    })();

    /**
     * Gets a list of mods from a PC modbits.
     *
     * @param modbits The modbits.
     * @returns The list of mods.
     */
    static pcModbitsToMods(modbits: number): ModMap {
        const map = new ModMap();

        if (modbits === 0) {
            return map;
        }

        for (const modType of this.allMods.values()) {
            const mod = new (modType as new () => Mod)();

            if (mod.isApplicableToOsuStable() && (mod.bitwise & modbits) > 0) {
                map.set(mod);
            }
        }

        return map;
    }

    /**
     * Calculates the score multiplier of the given mods and game mode.
     *
     * @param mods The mods to calculate the score multiplier for.
     * @param mode The game mode to calculate the score multiplier for.
     * @param beatmap The beatmap the mods are applied to. Needed for some mods to have an effect on
     * score multiplier (i.e., `ModDifficultyAdjust`).
     * @returns The score multiplier.
     */
    static calculateScoreMultiplier(
        mods: Iterable<Mod>,
        mode: Modes,
        beatmap?: Beatmap,
    ): number {
        // In osu!droid, rate-adjusting mods combine their track rate multipliers together, then bunched together.
        let totalRateAdjustTrackRateMultiplier = 1;
        let scoreMultiplier = 1;

        for (const mod of mods) {
            if (mod.requiresOriginalBeatmap() && beatmap) {
                mod.applyFromBeatmap(beatmap);
            }

            if (mode === Modes.droid && mod instanceof ModRateAdjust) {
                totalRateAdjustTrackRateMultiplier *=
                    mod.trackRateMultiplier.value;
            } else {
                switch (mode) {
                    case Modes.droid:
                        if (mod.isApplicableToDroid()) {
                            scoreMultiplier *= mod.droidScoreMultiplier;
                        }
                        break;

                    case Modes.osu:
                        if (mod.isApplicableToOsuStable()) {
                            scoreMultiplier *= mod.osuScoreMultiplier;
                        }
                        break;
                }
            }
        }

        if (mode === Modes.droid) {
            const rateAdjustHelper = new ModRateAdjustHelper(
                totalRateAdjustTrackRateMultiplier,
            );

            scoreMultiplier *= rateAdjustHelper.droidScoreMultiplier;
        }

        return scoreMultiplier;
    }

    /**
     * Serializes a list of `Mod`s.
     *
     * @param mods The list of `Mod`s to serialize.
     * @param includeNonUserPlayable Whether to include non-user-playable mods. Defaults to `true`.
     * @returns The serialized list of `Mod`s.
     */
    static serializeMods(
        mods: Iterable<Mod>,
        includeNonUserPlayable = true,
    ): SerializedMod[] {
        const serializedMods: SerializedMod[] = [];

        for (const mod of mods) {
            if (!includeNonUserPlayable && !mod.userPlayable) {
                continue;
            }

            serializedMods.push(mod.serialize());
        }

        return serializedMods;
    }

    /**
     * Deserializes a list of `SerializedMod`s.
     *
     * @param mods The list of `SerializedMod`s to deserialize. If a string is provided, it will be parsed as JSON.
     * @returns The deserialized list of `Mod`s.
     */
    static deserializeMods(mods: Iterable<SerializedMod> | string): ModMap {
        const serializedMods =
            typeof mods === "string"
                ? (JSON.parse(mods) as SerializedMod[])
                : mods;

        const map = new ModMap();

        for (const serializedMod of serializedMods) {
            const modType = this.allMods.get(serializedMod.acronym) as
                | (new () => Mod)
                | undefined;

            if (!modType) {
                continue;
            }

            const mod = new modType();

            if (serializedMod.settings) {
                mod.copySettings(serializedMod);
            }

            map.set(mod);
        }

        return map;
    }

    /**
     * Gets a list of mods from a PC mod string, such as "HDHR".
     *
     * @param str The string.
     * @returns The list of mods.
     */
    static pcStringToMods(str: string): ModMap {
        const map = new ModMap();

        str = str.toLowerCase();

        while (str) {
            let nchars = 1;

            for (const [acronym, modType] of this.allMods) {
                if (str.startsWith(acronym.toLowerCase())) {
                    map.set(modType as new () => Mod);
                    nchars = acronym.length;
                    break;
                }
            }

            str = str.slice(nchars);
        }

        return map;
    }

    /**
     * Converts a list of mods into its osu!standard string counterpart.
     *
     * @param mods The array of mods to convert.
     * @returns The string representing the mods in osu!standard.
     */
    static modsToOsuString(mods: Iterable<Mod>): string {
        let str = "";

        for (const mod of mods) {
            if (mod instanceof ModDifficultyAdjust) {
                continue;
            }

            str += mod.acronym;
        }

        return str;
    }

    /**
     * Converts a list of `Mod`s into an ordered string based on {@link allMods}.
     *
     * @param mods The list of `Mod`s to convert.
     * @param includeNonUserPlayable Whether to include non-user-playable mods. Defaults to `true`.
     * @returns The string representing the `Mod`s in ordered form.
     */
    static modsToOrderedString(
        mods: Mod[] | ModMap,
        includeNonUserPlayable = true,
    ): string {
        const strs: string[] = [];

        for (const modType of this.allMods.values()) {
            const mod =
                mods instanceof ModMap
                    ? mods.get(modType as new () => Mod)
                    : mods.find((m) => m instanceof modType);

            if (mod && (includeNonUserPlayable || mod.userPlayable)) {
                strs.push(mod.toString());
                continue;
            }
        }

        return strs.join();
    }

    /**
     * Removes speed-changing mods from an array of mods.
     *
     * @param mods The array of mods.
     * @returns A new array with speed changing mods filtered out.
     */
    static removeSpeedChangingMods<T extends Mod>(mods: T[]): T[] {
        return mods.filter((m) => !(m instanceof ModRateAdjust));
    }

    /**
     * Applies the selected `Mod`s to a `BeatmapDifficulty`.
     *
     * @param difficulty The `BeatmapDifficulty` to apply the `Mod`s to.
     * @param mode The game mode to apply the `Mod`s for.
     * @param mods The selected `Mod`s. Defaults to No Mod.
     * @param withRateChange Whether to apply rate changes. Defaults to `false`.
     */
    static applyModsToBeatmapDifficulty(
        difficulty: BeatmapDifficulty,
        mode: Modes,
        mods?: ModMap,
        withRateChange = false,
    ) {
        if (mods !== undefined) {
            const adjustmentMods = new ModMap();

            for (const mod of mods.values()) {
                if (mod.facilitatesAdjustment()) {
                    adjustmentMods.set(mod);
                }
            }

            for (const mod of mods.values()) {
                if (mod.isApplicableToDifficulty()) {
                    mod.applyToDifficulty(mode, difficulty, adjustmentMods);
                }
            }
        }

        let rate = 1;

        if (mods !== undefined) {
            for (const mod of mods.values()) {
                if (mod.isApplicableToDifficultyWithMods()) {
                    mod.applyToDifficultyWithMods(mode, difficulty, mods);
                }

                if (mod.isApplicableToTrackRate()) {
                    rate = mod.applyToRate(0, rate);
                }
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
                if (mods?.has(ModPrecise)) {
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
     * Calculates the playback rate for the track with the selected `Mod`s at the given time.
     *
     * @param mods The list of selected `Mod`s.
     * @param time The time at which the playback rate is queried, in milliseconds. Defaults to 0.
     * @returns The rate with `Mod`s.
     */
    static calculateRateWithMods(mods: Iterable<Mod>, time = 0): number {
        let rate = 1;

        for (const mod of mods) {
            if (mod.isApplicableToTrackRate()) {
                rate = mod.applyToRate(time, rate);
            }
        }

        return rate;
    }
}
