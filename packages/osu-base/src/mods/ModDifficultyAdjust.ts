import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { IModApplicableToDifficultyWithMods } from "./IModApplicableToDifficultyWithMods";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObjectWithMods } from "./IModApplicableToHitObjectWithMods";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModMap } from "./ModMap";
import { SerializedMod } from "./SerializedMod";
import { NullableDecimalModSetting } from "./settings/NullableDecimalModSetting";

/**
 * Represents the Difficulty Adjust mod.
 */
export class ModDifficultyAdjust
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsu,
        IModApplicableToDifficultyWithMods,
        IModApplicableToHitObjectWithMods
{
    override readonly acronym = "DA";
    override readonly name = "Difficulty Adjust";

    readonly droidRanked = false;
    readonly osuRanked = false;

    /**
     * The circle size to enforce.
     */
    readonly cs = new NullableDecimalModSetting(
        "Circle size",
        "The circle size to enforce.",
        null,
        0,
        15,
        0.1,
        1,
    );

    /**
     * The approach rate to enforce.
     */
    readonly ar = new NullableDecimalModSetting(
        "Approach rate",
        "The approach rate to enforce.",
        null,
        0,
        11,
        0.1,
        1,
    );

    /**
     * The overall difficulty to enforce.
     */
    readonly od = new NullableDecimalModSetting(
        "Overall difficulty",
        "The overall difficulty to enforce.",
        null,
        0,
        11,
        0.1,
        1,
    );

    readonly hp = new NullableDecimalModSetting(
        "Health drain",
        "The health drain to enforce.",
        null,
        0,
        11,
        0.1,
        1,
    );

    private get isRelevant(): boolean {
        return (
            this.cs.value !== null ||
            this.ar.value !== null ||
            this.od.value !== null ||
            this.hp.value !== null
        );
    }

    constructor(values?: {
        cs?: number;
        ar?: number;
        od?: number;
        hp?: number;
    }) {
        super();

        this.cs.value = values?.cs ?? null;
        this.ar.value = values?.ar ?? null;
        this.od.value = values?.od ?? null;
        this.hp.value = values?.hp ?? null;
    }

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        this.cs.value = (mod.settings?.cs ?? null) as number | null;
        this.ar.value = (mod.settings?.ar ?? null) as number | null;
        this.od.value = (mod.settings?.od ?? null) as number | null;
        this.hp.value = (mod.settings?.hp ?? null) as number | null;
    }

    get isDroidRelevant(): boolean {
        return this.isRelevant;
    }

    calculateDroidScoreMultiplier(difficulty: BeatmapDifficulty): number {
        // Graph: https://www.desmos.com/calculator/yrggkhrkzz
        let multiplier = 1;

        if (this.cs.value !== null) {
            const diff = this.cs.value - difficulty.cs;

            multiplier *=
                diff >= 0
                    ? 1 + 0.0075 * Math.pow(diff, 1.5)
                    : 2 / (1 + Math.exp(-0.5 * diff));
        }

        if (this.od.value !== null) {
            const diff = this.od.value - difficulty.od;

            multiplier *=
                diff >= 0
                    ? 1 + 0.005 * Math.pow(diff, 1.3)
                    : 2 / (1 + Math.exp(-0.25 * diff));
        }

        return multiplier;
    }

    get isOsuRelevant(): boolean {
        return this.isRelevant;
    }

    get osuScoreMultiplier(): number {
        return 0.5;
    }

    applyToDifficultyWithMods(
        _: Modes,
        difficulty: BeatmapDifficulty,
        mods: ModMap,
    ): void {
        difficulty.cs = this.cs.value ?? difficulty.cs;
        difficulty.ar = this.ar.value ?? difficulty.ar;
        difficulty.od = this.od.value ?? difficulty.od;
        difficulty.hp = this.hp.value ?? difficulty.hp;

        // Special case for force AR, where the AR value is kept constant with respect to game time.
        // This makes the player perceive the AR as is under all speed multipliers.
        if (this.ar.value !== null) {
            const preempt = BeatmapDifficulty.difficultyRange(
                this.ar.value,
                HitObject.preemptMax,
                HitObject.preemptMid,
                HitObject.preemptMin,
            );

            const trackRate = this.calculateTrackRate(mods.values());

            difficulty.ar = BeatmapDifficulty.inverseDifficultyRange(
                preempt * trackRate,
                HitObject.preemptMax,
                HitObject.preemptMid,
                HitObject.preemptMin,
            );
        }
    }

    applyToHitObjectWithMods(
        _: Modes,
        hitObject: HitObject,
        mods: ModMap,
    ): void {
        // Special case for force AR, where the AR value is kept constant with respect to game time.
        // This makes the player perceive the fade in animation as is under all speed multipliers.
        if (this.ar.value === null) {
            return;
        }

        this.applyFadeAdjustment(hitObject, mods);

        if (hitObject instanceof Slider) {
            for (const nested of hitObject.nestedHitObjects) {
                this.applyFadeAdjustment(nested, mods);
            }
        }
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        if (!this.isRelevant) {
            return null;
        }

        const settings: Record<string, unknown> = {};

        if (this.cs.value !== null) {
            settings.cs = this.cs.value;
        }

        if (this.ar.value !== null) {
            settings.ar = this.ar.value;
        }

        if (this.od.value !== null) {
            settings.od = this.od.value;
        }

        if (this.hp.value !== null) {
            settings.hp = this.hp.value;
        }

        return settings;
    }

    private applyFadeAdjustment(hitObject: HitObject, mods: ModMap) {
        // IMPORTANT: These do not use `ModUtil.calculateRateWithMods` to avoid circular dependency.
        const initialTrackRate = this.calculateTrackRate(mods.values());

        const currentTrackRate = this.calculateTrackRate(
            mods.values(),
            hitObject.startTime,
        );

        // Cancel the rate that was initially applied to timePreempt (via applyToDifficulty above and
        // HitObject.applyDefaults) and apply the current one.
        hitObject.timePreempt *= currentTrackRate / initialTrackRate;
        hitObject.timeFadeIn *= currentTrackRate;
    }

    private calculateTrackRate(mods: Iterable<Mod>, time = 0): number {
        // IMPORTANT: This does not use `ModUtil.calculateRateWithMods` to avoid circular dependency.
        let rate = 1;

        for (const mod of mods) {
            if (mod.isApplicableToTrackRate()) {
                rate = mod.applyToRate(time, rate);
            }
        }

        return rate;
    }

    override equals(other: Mod): other is this {
        return (
            super.equals(other) &&
            other instanceof ModDifficultyAdjust &&
            this.cs.value === other.cs.value &&
            this.ar.value === other.ar.value &&
            this.od.value === other.od.value &&
            this.hp.value === other.hp.value
        );
    }

    override toString(): string {
        if (!this.isRelevant) {
            return super.toString();
        }

        const settings: string[] = [];

        if (this.cs.value !== null) {
            settings.push(`CS${this.cs.toDisplayString()}`);
        }

        if (this.ar.value !== null) {
            settings.push(`AR${this.ar.toDisplayString()}`);
        }

        if (this.od.value !== null) {
            settings.push(`OD${this.od.toDisplayString()}`);
        }

        if (this.hp.value !== null) {
            settings.push(`HP${this.hp.toDisplayString()}`);
        }

        return `${super.toString()} (${settings.join(", ")})`;
    }
}
