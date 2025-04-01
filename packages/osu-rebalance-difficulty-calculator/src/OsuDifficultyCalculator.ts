import { OsuAim } from "./skills/osu/OsuAim";
import { OsuSpeed } from "./skills/osu/OsuSpeed";
import { DifficultyCalculator } from "./base/DifficultyCalculator";
import { OsuSkill } from "./skills/osu/OsuSkill";
import { OsuFlashlight } from "./skills/osu/OsuFlashlight";
import {
    ModRelax,
    ModFlashlight,
    ModTouchDevice,
    Modes,
    ModUtil,
    Beatmap,
    BeatmapDifficulty,
    HitObject,
    ModAutopilot,
    MathUtils,
    ModDifficultyAdjust,
    ModDoubleTime,
    ModEasy,
    ModHalfTime,
    ModHardRock,
    ModHidden,
    ModNightCore,
    ModCustomSpeed,
} from "@rian8337/osu-base";
import { OsuDifficultyAttributes } from "./structures/OsuDifficultyAttributes";
import { OsuDifficultyHitObject } from "./preprocessing/OsuDifficultyHitObject";
import { CacheableDifficultyAttributes } from "./structures/CacheableDifficultyAttributes";

/**
 * A difficulty calculator for osu!standard gamemode.
 */
export class OsuDifficultyCalculator extends DifficultyCalculator<
    OsuDifficultyHitObject,
    OsuDifficultyAttributes
> {
    /**
     * The aim star rating of the beatmap.
     */
    get aim(): number {
        return this.attributes.aimDifficulty;
    }

    /**
     * The speed star rating of the beatmap.
     */
    get speed(): number {
        return this.attributes.speedDifficulty;
    }

    /**
     * The flashlight star rating of the beatmap.
     */
    get flashlight(): number {
        return this.attributes.flashlightDifficulty;
    }

    override readonly attributes: OsuDifficultyAttributes = {
        speedDifficulty: 0,
        mods: [],
        starRating: 0,
        maxCombo: 0,
        aimDifficulty: 0,
        flashlightDifficulty: 0,
        speedNoteCount: 0,
        sliderFactor: 0,
        clockRate: 1,
        approachRate: 0,
        overallDifficulty: 0,
        hitCircleCount: 0,
        sliderCount: 0,
        spinnerCount: 0,
        aimDifficultSliderCount: 0,
        aimDifficultStrainCount: 0,
        speedDifficultStrainCount: 0,
    };

    override get cacheableAttributes(): CacheableDifficultyAttributes<OsuDifficultyAttributes> {
        return {
            ...this.attributes,
            mods: ModUtil.modsToOsuString(this.attributes.mods),
        };
    }

    protected static override readonly difficultyAdjustmentMods = new Set([
        ModTouchDevice,
        ModDoubleTime,
        ModNightCore,
        ModCustomSpeed,
        ModDifficultyAdjust,
        ModHalfTime,
        ModEasy,
        ModHardRock,
        ModFlashlight,
        ModHidden,
        ModRelax,
        ModAutopilot,
    ]);

    protected override readonly difficultyMultiplier = 0.0675;
    protected override readonly mode = Modes.osu;

    /**
     * Calculates the aim star rating of the beatmap and stores it in this instance.
     */
    calculateAim(): void {
        if (this.mods.some((m) => m instanceof ModAutopilot)) {
            this.attributes.aimDifficulty = 0;
            return;
        }

        const aimSkill = new OsuAim(this.mods, true);
        const aimSkillWithoutSliders = new OsuAim(this.mods, false);

        this.calculateSkills(aimSkill, aimSkillWithoutSliders);
        this.postCalculateAim(aimSkill, aimSkillWithoutSliders);
    }

    /**
     * Calculates the speed star rating of the beatmap and stores it in this instance.
     */
    calculateSpeed(): void {
        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.attributes.speedDifficulty = 0;
            return;
        }

        const speedSkill = new OsuSpeed(this.mods);

        this.calculateSkills(speedSkill);
        this.postCalculateSpeed(speedSkill);
    }

    /**
     * Calculates the flashlight star rating of the beatmap and stores it in this instance.
     */
    calculateFlashlight(): void {
        if (!this.mods.some((m) => m instanceof ModFlashlight)) {
            this.attributes.flashlightDifficulty = 0;
            return;
        }

        const flashlightSkill = new OsuFlashlight(this.mods);

        this.calculateSkills(flashlightSkill);
        this.postCalculateFlashlight(flashlightSkill);
    }

    override calculateTotal(): void {
        const aimPerformanceValue = this.basePerformanceValue(this.aim);
        const speedPerformanceValue = this.basePerformanceValue(this.speed);
        let flashlightPerformanceValue = 0;

        if (this.mods.some((m) => m instanceof ModFlashlight)) {
            flashlightPerformanceValue = Math.pow(this.flashlight, 2) * 25;
        }

        const basePerformanceValue = Math.pow(
            Math.pow(aimPerformanceValue, 1.1) +
                Math.pow(speedPerformanceValue, 1.1) +
                Math.pow(flashlightPerformanceValue, 1.1),
            1 / 1.1,
        );

        if (basePerformanceValue > 1e-5) {
            // Document for formula derivation:
            // https://docs.google.com/document/d/10DZGYYSsT_yjz2Mtp6yIJld0Rqx4E-vVHupCqiM4TNI/edit
            this.attributes.starRating =
                Math.cbrt(1.15) *
                0.027 *
                (Math.cbrt(
                    (100000 / Math.pow(2, 1 / 1.1)) * basePerformanceValue,
                ) +
                    4);
        } else {
            this.attributes.starRating = 0;
        }
    }

    override calculateAll(): void {
        const skills = this.createSkills();
        this.calculateSkills(...skills);

        const aimSkill = skills.find(
            (s) => s instanceof OsuAim && s.withSliders,
        ) as OsuAim | undefined;

        const aimSkillWithoutSliders = skills.find(
            (s) => s instanceof OsuAim && !s.withSliders,
        ) as OsuAim | undefined;

        const speedSkill = skills.find((s) => s instanceof OsuSpeed) as
            | OsuSpeed
            | undefined;

        const flashlightSkill = skills.find(
            (s) => s instanceof OsuFlashlight,
        ) as OsuFlashlight | undefined;

        if (aimSkill && aimSkillWithoutSliders) {
            this.postCalculateAim(aimSkill, aimSkillWithoutSliders);
        }

        if (speedSkill) {
            this.postCalculateSpeed(speedSkill);
        }

        if (flashlightSkill) {
            this.postCalculateFlashlight(flashlightSkill);
        }

        this.calculateTotal();
    }

    override toString(): string {
        return (
            this.total.toFixed(2) +
            " stars (" +
            this.aim.toFixed(2) +
            " aim, " +
            this.speed.toFixed(2) +
            " speed, " +
            this.flashlight.toFixed(2) +
            " flashlight)"
        );
    }

    protected override generateDifficultyHitObjects(
        beatmap: Beatmap,
        clockRate: number,
    ) {
        const difficultyObjects: OsuDifficultyHitObject[] = [];
        const { objects } = beatmap.hitObjects;

        for (let i = 0; i < objects.length; ++i) {
            const difficultyObject = new OsuDifficultyHitObject(
                objects[i],
                objects[i - 1] ?? null,
                objects[i - 2] ?? null,
                difficultyObjects,
                clockRate,
            );

            difficultyObject.computeProperties(clockRate, objects);
            difficultyObjects.push(difficultyObject);
        }

        return difficultyObjects;
    }

    protected override createSkills(): OsuSkill[] {
        const skills: OsuSkill[] = [];

        if (!this.mods.some((m) => m instanceof ModAutopilot)) {
            skills.push(new OsuAim(this.mods, true));
            skills.push(new OsuAim(this.mods, false));
        }

        if (!this.mods.some((m) => m instanceof ModRelax)) {
            skills.push(new OsuSpeed(this.mods));
        }

        if (this.mods.some((m) => m instanceof ModFlashlight)) {
            skills.push(new OsuFlashlight(this.mods));
        }

        return skills;
    }

    protected override populateDifficultyAttributes(
        beatmap: Beatmap,
        clockRate: number,
    ): void {
        super.populateDifficultyAttributes(beatmap, clockRate);

        const preempt =
            BeatmapDifficulty.difficultyRange(
                beatmap.difficulty.ar,
                HitObject.preemptMax,
                HitObject.preemptMid,
                HitObject.preemptMin,
            ) / clockRate;

        this.attributes.approachRate = BeatmapDifficulty.inverseDifficultyRange(
            preempt,
            HitObject.preemptMax,
            HitObject.preemptMid,
            HitObject.preemptMin,
        );
    }

    /**
     * Called after aim skill calculation.
     *
     * @param aimSkill The aim skill that considers sliders.
     * @param aimSkillWithoutSliders The aim skill that doesn't consider sliders.
     */
    private postCalculateAim(
        aimSkill: OsuAim,
        aimSkillWithoutSliders: OsuAim,
    ): void {
        this.strainPeaks.aimWithSliders = aimSkill.strainPeaks;
        this.strainPeaks.aimWithoutSliders = aimSkillWithoutSliders.strainPeaks;

        this.attributes.aimDifficulty = this.starValue(
            aimSkill.difficultyValue(),
        );

        if (this.aim) {
            this.attributes.sliderFactor =
                this.starValue(aimSkillWithoutSliders.difficultyValue()) /
                this.aim;
        }

        if (this.mods.some((m) => m instanceof ModTouchDevice)) {
            this.attributes.aimDifficulty = Math.pow(this.aim, 0.8);
        }

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.attributes.aimDifficulty *= 0.9;
        } else if (this.mods.some((m) => m instanceof ModAutopilot)) {
            this.attributes.aimDifficulty = 0;
        }

        this.attributes.aimDifficultStrainCount =
            aimSkill.countDifficultStrains();

        this.attributes.aimDifficultSliderCount =
            aimSkill.countDifficultSliders();
    }

    /**
     * Called after speed skill calculation.
     *
     * @param speedSkill The speed skill.
     */
    private postCalculateSpeed(speedSkill: OsuSpeed): void {
        this.strainPeaks.speed = speedSkill.strainPeaks;

        this.attributes.speedDifficulty = this.mods.some(
            (m) => m instanceof ModRelax,
        )
            ? 0
            : this.starValue(speedSkill.difficultyValue());

        if (this.mods.some((m) => m instanceof ModAutopilot)) {
            this.attributes.speedDifficulty *= 0.5;
        }

        this.attributes.speedDifficultStrainCount =
            speedSkill.countDifficultStrains();

        const objectStrains = this.objects.map((v) => v.speedStrain);
        const maxStrain = MathUtils.max(objectStrains);

        if (maxStrain) {
            this.attributes.speedNoteCount = objectStrains.reduce(
                (total, next) =>
                    total + 1 / (1 + Math.exp(-((next / maxStrain) * 12 - 6))),
                0,
            );
        }
    }

    /**
     * Called after flashlight skill calculation.
     *
     * @param flashlightSkill The flashlight skill.
     */
    private postCalculateFlashlight(flashlightSkill: OsuFlashlight): void {
        this.strainPeaks.flashlight = flashlightSkill.strainPeaks;

        this.attributes.flashlightDifficulty = this.starValue(
            flashlightSkill.difficultyValue(),
        );

        if (this.mods.some((m) => m instanceof ModTouchDevice)) {
            this.attributes.flashlightDifficulty = Math.pow(
                this.flashlight,
                0.8,
            );
        }

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.attributes.flashlightDifficulty *= 0.7;
        } else if (this.mods.some((m) => m instanceof ModAutopilot)) {
            this.attributes.flashlightDifficulty *= 0.4;
        }
    }
}
