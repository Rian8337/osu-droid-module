import { HitObject } from "../beatmap/hitobjects/HitObject";
import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { ModUtil } from "../utils/ModUtil";
import { IModApplicableToDifficultyWithSettings } from "./IModApplicableToDifficultyWithSettings";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObjectWithSettings } from "./IModApplicableToHitObjectWithSettings";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the Difficulty Adjust mod.
 */
export class ModDifficultyAdjust
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsu,
        IModApplicableToDifficultyWithSettings,
        IModApplicableToHitObjectWithSettings
{
    override readonly acronym = "DA";
    override readonly name = "Difficulty Adjust";

    readonly droidRanked = false;
    readonly droidString = "";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = false;
    readonly pcScoreMultiplier = 1;

    /**
     * The circle size to enforce.
     */
    cs?: number;

    /**
     * The approach rate to enforce.
     */
    ar?: number;

    /**
     * The overall difficulty to enforce.
     */
    od?: number;

    /**
     * The health drain to enforce.
     */
    hp?: number;

    constructor(values?: {
        cs?: number;
        ar?: number;
        od?: number;
        hp?: number;
    }) {
        super();

        this.cs = values?.cs;
        this.ar = values?.ar;
        this.od = values?.od;
        this.hp = values?.hp;
    }

    calculateDroidScoreMultiplier(difficulty: BeatmapDifficulty): number {
        // Graph: https://www.desmos.com/calculator/yrggkhrkzz
        let multiplier = 1;

        if (this.cs !== undefined) {
            const diff = this.cs - difficulty.cs;

            multiplier *=
                diff >= 0
                    ? 1 + 0.0075 * Math.pow(diff, 1.5)
                    : 2 / (1 + Math.exp(-0.5 * diff));
        }

        if (this.od !== undefined) {
            const diff = this.od - difficulty.od;

            multiplier *=
                diff >= 0
                    ? 1 + 0.005 * Math.pow(diff, 1.3)
                    : 2 / (1 + Math.exp(-0.25 * diff));
        }

        return multiplier;
    }

    applyToDifficultyWithSettings(
        mode: Modes,
        difficulty: BeatmapDifficulty,
        mods: Mod[],
        customSpeedMultiplier: number,
    ): void {
        difficulty.cs = this.cs ?? difficulty.cs;
        difficulty.ar = this.ar ?? difficulty.ar;
        difficulty.od = this.od ?? difficulty.od;
        difficulty.hp = this.hp ?? difficulty.hp;

        // Special case for force AR, where the AR value is kept constant with respect to game time.
        // This makes the player perceive the AR as is under all speed multipliers.
        if (this.ar !== undefined) {
            const preempt = BeatmapDifficulty.difficultyRange(
                this.ar,
                HitObject.preemptMax,
                HitObject.preemptMid,
                HitObject.preemptMin,
            );

            const trackRate = this.calculateTrackRate(
                mods,
                customSpeedMultiplier,
            );

            difficulty.ar = BeatmapDifficulty.inverseDifficultyRange(
                preempt * trackRate,
                HitObject.preemptMax,
                HitObject.preemptMid,
                HitObject.preemptMin,
            );
        }
    }

    applyToHitObjectWithSettings(
        mode: Modes,
        hitObject: HitObject,
        mods: Mod[],
        customSpeedMultiplier: number,
    ): void {
        // Special case for force AR, where the AR value is kept constant with respect to game time.
        // This makes the player perceive the fade in animation as is under all speed multipliers.
        if (this.ar === undefined) {
            return;
        }

        const trackRate = this.calculateTrackRate(mods, customSpeedMultiplier);
        hitObject.timeFadeIn *= trackRate;
    }

    private calculateTrackRate(
        mods: Iterable<Mod>,
        customSpeedMultiplier: number,
    ) {
        return ModUtil.calculateRateWithMods(mods) * customSpeedMultiplier;
    }
}
