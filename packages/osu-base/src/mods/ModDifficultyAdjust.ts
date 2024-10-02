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
 * Represents the difficulty adjust (DA) mod.
 *
 * This is not a real mod in osu! but is used to force difficulty values in the game.
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
    readonly droidScoreMultiplier = 1;
    readonly droidString = "";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = false;
    readonly pcScoreMultiplier = 1;
    readonly bitwise = 0;

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
