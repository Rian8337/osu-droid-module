import { HitObject } from "../beatmap/hitobjects/HitObject";
import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { ModUtil } from "../utils/ModUtil";
import { IModApplicableToDifficultyWithSettings } from "./IModApplicableToDifficultyWithSettings";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObjectWithSettings } from "./IModApplicableToHitObjectWithSettings";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { SerializedMod } from "./SerializedMod";

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

    readonly osuRanked = false;
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

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        this.cs = mod.settings?.cs as number | undefined;
        this.ar = mod.settings?.ar as number | undefined;
        this.od = mod.settings?.od as number | undefined;
        this.hp = mod.settings?.hp as number | undefined;
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

            const trackRate = ModUtil.calculateRateWithMods(mods);

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
    ): void {
        // Special case for force AR, where the AR value is kept constant with respect to game time.
        // This makes the player perceive the fade in animation as is under all speed multipliers.
        if (this.ar === undefined) {
            return;
        }

        const trackRate = ModUtil.calculateRateWithMods(mods);
        hitObject.timeFadeIn *= trackRate;
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        if (
            this.cs === undefined &&
            this.ar === undefined &&
            this.od === undefined &&
            this.hp === undefined
        ) {
            return null;
        }

        const settings: Record<string, unknown> = {};

        if (this.cs !== undefined) {
            settings.cs = this.cs;
        }

        if (this.ar !== undefined) {
            settings.ar = this.ar;
        }

        if (this.od !== undefined) {
            settings.od = this.od;
        }

        if (this.hp !== undefined) {
            settings.hp = this.hp;
        }

        return settings;
    }
}
