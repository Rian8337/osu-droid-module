import { Modes } from "../constants/Modes";
import { DroidHitWindow, OsuHitWindow } from "../utils/HitWindow";
import { Mod } from "../mods/Mod";
import { ModDoubleTime } from "../mods/ModDoubleTime";
import { ModHalfTime } from "../mods/ModHalfTime";
import { ModNightCore } from "../mods/ModNightCore";
import { ModHardRock } from "../mods/ModHardRock";
import { ModEasy } from "../mods/ModEasy";
import { ModPrecise } from "../mods/ModPrecise";
import { ModReallyEasy } from "../mods/ModReallyEasy";
import { ModUtil } from "./ModUtil";
import { CircleSizeCalculator } from "./CircleSizeCalculator";
import { ModSpeedUp } from "../mods/ModSpeedUp";

/**
 * A structure to initialize a `MapStats` instance.
 */
export type MapStatsInit = Partial<{
    /**
     * The circle size of the beatmap.
     *
     * In osu!droid gamemode, this is the value of the CS converted to osu!standard CS after calling `calculate()`.
     */
    cs: number;

    /**
     * The approach rate of the beatmap.
     */
    ar: number;

    /**
     * The overall difficulty of the beatmap.
     *
     * In osu!droid gamemode, this is the value of the CS converted to osu!standard CS after calling `calculate()`,
     * provided that the `convertDroidOD` property was not set to `false`.
     */
    od: number;

    /**
     * The health drain rate of the beatmap.
     */
    hp: number;

    /**
     * The enabled modifications.
     */
    mods: Mod[];

    /**
     * The speed multiplier applied from all modifications.
     */
    speedMultiplier: number;

    /**
     * Whether to force the CS into the given CS. This will ignore the effect of game modifications.
     *
     * When calculating for osu!droid gamemode, the CS will still be converted to osu!standard CS.
     */
    forceCS: boolean;

    /**
     * Whether to force the AR into the given AR.
     * This will ignore the effect of game modifications and speed multiplier.
     */
    forceAR: boolean;

    /**
     * Whether to force the OD into the given OD.
     * This will ignore the effect of game modifications and speed multiplier.
     *
     * When calculating for osu!droid gamemode, the OD will still be converted to osu!standard OD.
     * Set the `convertDroidOD` property to `false` when calling `calculate()` to disable this behavior.
     */

    forceOD: boolean;

    /**
     * Whether to force the HP into the given HP.
     * This will ignore the effect of game modifications and speed multiplier.
     */
    forceHP: boolean;

    /**
     * Whether to calculate for old statistics for osu!droid gamemode (1.6.7 and older). Defaults to `false`.
     */
    oldStatistics: boolean;
}>;

/**
 * Holds general beatmap statistics for further modifications.
 */
export class MapStats implements MapStatsInit {
    cs?: number;
    ar?: number;
    od?: number;
    hp?: number;
    mods: Mod[];
    speedMultiplier: number;
    forceCS: boolean;
    forceAR: boolean;
    forceOD: boolean;
    forceHP: boolean;
    oldStatistics: boolean;

    /**
     * Whether this map statistics have been calculated.
     */
    private calculated = false;

    static readonly OD0_MS = 80;
    static readonly OD10_MS = 20;
    static readonly AR0_MS = 1800;
    static readonly AR5_MS = 1200;
    static readonly AR10_MS = 450;

    static readonly OD_MS_STEP = (MapStats.OD0_MS - MapStats.OD10_MS) / 10;
    static readonly AR_MS_STEP1 = (MapStats.AR0_MS - MapStats.AR5_MS) / 5;
    static readonly AR_MS_STEP2 = (MapStats.AR5_MS - MapStats.AR10_MS) / 5;

    constructor(values?: MapStatsInit) {
        this.cs = values?.cs;
        this.ar = values?.ar;
        this.od = values?.od;
        this.hp = values?.hp;
        this.mods = values?.mods ?? [];

        this.speedMultiplier = values?.speedMultiplier ?? 1;

        this.forceCS = values?.forceCS ?? false;
        this.forceAR = values?.forceAR ?? false;
        this.forceOD = values?.forceOD ?? false;
        this.forceHP = values?.forceHP ?? false;

        this.oldStatistics = values?.oldStatistics ?? false;
    }

    /**
     * Calculates map statistics.
     *
     * This can only be called once for an instance.
     */
    calculate(params?: {
        /**
         * The gamemode to calculate for. Defaults to `Modes.osu`.
         */
        mode?: Modes;

        /**
         * The applied modifications in osu!standard format.
         */
        mods?: string;

        /**
         * The speed multiplier to calculate for.
         */
        speedMultiplier?: number;

        /**
         * Whether force AR is turned on.
         */
        isForceAR?: boolean;

        /**
         * Whether to convert osu!droid OD to osu!standard OD. Defaults to `true`.
         * Will only be considered when using `Modes.droid` for `mode`.
         */
        convertDroidOD?: boolean;
    }): MapStats {
        if (this.calculated) {
            return this;
        }

        this.calculated = true;

        if (params?.mods) {
            this.mods = ModUtil.pcStringToMods(params.mods);
        }
        if (params?.speedMultiplier) {
            this.speedMultiplier = params.speedMultiplier;
        }
        if (params?.isForceAR) {
            this.forceAR = params.isForceAR;
        }

        let statisticsMultiplier: number = 1;

        if (this.mods.some((m) => m instanceof ModDoubleTime)) {
            this.speedMultiplier *= 1.5;
        }
        if (this.mods.some((m) => m instanceof ModHalfTime)) {
            this.speedMultiplier *= 0.75;
        }
        if (this.mods.some((m) => m instanceof ModNightCore)) {
            this.speedMultiplier *= 1.5;
        }
        if (this.mods.some((m) => m instanceof ModSpeedUp)) {
            this.speedMultiplier *= 1.25;
        }
        if (this.mods.some((m) => m instanceof ModHardRock)) {
            statisticsMultiplier *= 1.4;
        }
        if (this.mods.some((m) => m instanceof ModEasy)) {
            statisticsMultiplier *= 0.5;
        }

        switch (params?.mode ?? Modes.osu) {
            case Modes.droid:
                // In droid pre-1.6.8, NC speed multiplier is assumed bugged (1.39).
                if (
                    this.mods.some((m) => m instanceof ModNightCore) &&
                    this.oldStatistics
                ) {
                    this.speedMultiplier *= 1.39 / 1.5;
                }

                // CS and OD work differently in droid, therefore it
                // needs to be computed regardless of map-changing mods
                // and statistics multiplier.
                if (this.od !== undefined) {
                    let droidToMS: number;
                    const isPrecise = this.mods.some(
                        (m) => m instanceof ModPrecise,
                    );

                    if (this.forceOD) {
                        droidToMS = new DroidHitWindow(this.od).hitWindowFor300(
                            isPrecise,
                        );
                    } else {
                        // Apply non-speed changing mods to OD.
                        this.od *= statisticsMultiplier;
                        if (this.mods.some((m) => m instanceof ModReallyEasy)) {
                            this.od /= 2;
                        }

                        this.od = Math.min(this.od, 10);

                        // Consider speed multiplier as well when converting to milliseconds.
                        droidToMS =
                            new DroidHitWindow(this.od).hitWindowFor300(
                                isPrecise,
                            ) / this.speedMultiplier;
                    }

                    if (params?.convertDroidOD !== false) {
                        // Convert droid hit window to osu!standard OD.
                        this.od = OsuHitWindow.hitWindow300ToOD(droidToMS);
                    } else {
                        // Convert droid hit window back to original OD.
                        this.od = DroidHitWindow.hitWindow300ToOD(
                            droidToMS,
                            isPrecise,
                        );
                    }
                }

                // HR and EZ works differently in droid in terms of
                // CS modification (even CS in itself as well).
                //
                // If present mods are found, they need to be removed
                // from the bitwise enum of mods to prevent double
                // calculation.
                if (this.cs !== undefined) {
                    if (this.forceCS) {
                        const scale = CircleSizeCalculator.droidCSToDroidScale(
                            this.cs,
                        );
                        const radius =
                            CircleSizeCalculator.droidScaleToStandardRadius(
                                scale,
                            );
                        this.cs =
                            CircleSizeCalculator.standardRadiusToStandardCS(
                                radius,
                                true,
                            );
                    } else {
                        const scale = CircleSizeCalculator.droidCSToDroidScale(
                            this.cs,
                            this.mods,
                        );
                        const radius =
                            CircleSizeCalculator.droidScaleToStandardRadius(
                                scale,
                            );
                        this.cs = Math.min(
                            CircleSizeCalculator.standardRadiusToStandardCS(
                                radius,
                                true,
                            ),
                            10,
                        );
                    }
                }

                if (this.hp !== undefined && !this.forceHP) {
                    if (this.mods.some((m) => m instanceof ModReallyEasy)) {
                        this.hp /= 2;
                    }
                    this.hp = Math.min(this.hp * statisticsMultiplier, 10);
                }

                if (this.ar !== undefined && !this.forceAR) {
                    this.ar *= statisticsMultiplier;
                    if (this.mods.some((m) => m instanceof ModReallyEasy)) {
                        if (this.mods.some((m) => m instanceof ModEasy)) {
                            this.ar *= 2;
                            this.ar -= 0.5;
                        }
                        this.ar -= 0.5;
                        this.ar -= this.speedMultiplier - 1;
                    }
                    this.ar = MapStats.modifyAR(
                        this.ar,
                        this.speedMultiplier,
                        1,
                    );
                }
                break;
            case Modes.osu:
                if (
                    !this.mods.some((m) =>
                        ModUtil.mapChangingMods.find(
                            (mod) => mod.acronym === m.acronym,
                        ),
                    ) &&
                    this.speedMultiplier === 1
                ) {
                    break;
                }

                if (this.cs !== undefined && !this.forceCS) {
                    if (this.mods.some((m) => m instanceof ModHardRock)) {
                        this.cs *= 1.3;
                    }
                    if (this.mods.some((m) => m instanceof ModEasy)) {
                        this.cs *= 0.5;
                    }
                    this.cs = Math.min(this.cs, 10);
                }

                if (this.hp !== undefined && !this.forceHP) {
                    this.hp = Math.min(this.hp * statisticsMultiplier, 10);
                }

                if (this.ar !== undefined && !this.forceAR) {
                    this.ar = MapStats.modifyAR(
                        this.ar,
                        this.speedMultiplier,
                        statisticsMultiplier,
                    );
                }

                if (this.od !== undefined && !this.forceOD) {
                    this.od = MapStats.modifyOD(
                        this.od,
                        this.speedMultiplier,
                        statisticsMultiplier,
                    );
                }
                break;
        }
        return this;
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `CS: ${this.cs?.toFixed(2)}, AR: ${this.ar?.toFixed(
            2,
        )}, OD: ${this.od?.toFixed(2)}, HP: ${this.hp?.toFixed(2)}`;
    }

    /**
     * Utility function to apply speed and flat multipliers to stats where speed changes apply for AR.
     *
     * @param baseAR The base AR value.
     * @param speedMultiplier The speed multiplier to calculate.
     * @param statisticsMultiplier The statistics multiplier to calculate from map-changing nonspeed-changing mods.
     */
    static modifyAR(
        baseAR: number,
        speedMultiplier: number,
        statisticsMultiplier: number,
    ): number {
        let ar: number = baseAR;
        ar *= statisticsMultiplier;
        let arMS: number = this.arToMS(ar);
        arMS = Math.min(this.AR0_MS, Math.max(this.AR10_MS, arMS));
        arMS /= speedMultiplier;
        ar =
            arMS > this.AR5_MS
                ? (this.AR0_MS - arMS) / this.AR_MS_STEP1
                : 5 + (this.AR5_MS - arMS) / this.AR_MS_STEP2;
        return ar;
    }

    /**
     * Converts an AR value to its milliseconds value.
     *
     * @param ar The AR to convert.
     * @returns The milliseconds value represented by the AR.
     */
    static arToMS(ar: number): number {
        return ar < 5.0
            ? this.AR0_MS - this.AR_MS_STEP1 * ar
            : this.AR5_MS - this.AR_MS_STEP2 * (ar - 5);
    }

    /**
     * Utility function to apply speed and flat multipliers to stats where speed changes apply for OD.
     *
     * @param baseOD The base OD value.
     * @param speedMultiplier The speed multiplier to calculate.
     * @param statisticsMultiplier The statistics multiplier to calculate from map-changing nonspeed-changing mods.
     */
    static modifyOD(
        baseOD: number,
        speedMultiplier: number,
        statisticsMultiplier: number,
    ): number {
        const hitWindowGreat: number =
            new OsuHitWindow(
                Math.min(10, baseOD * statisticsMultiplier),
            ).hitWindowFor300() / speedMultiplier;

        return (this.OD0_MS - hitWindowGreat) / this.OD_MS_STEP;
    }
}
