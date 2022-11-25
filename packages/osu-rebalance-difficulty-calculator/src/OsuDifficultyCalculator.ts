import {
    ModRelax,
    OsuHitWindow,
    ModFlashlight,
    ModTouchDevice,
    Modes,
} from "@rian8337/osu-base";
import { OsuAim } from "./skills/osu/OsuAim";
import { OsuSpeed } from "./skills/osu/OsuSpeed";
import { DifficultyCalculator } from "./base/DifficultyCalculator";
import { OsuSkill } from "./skills/osu/OsuSkill";
import { OsuFlashlight } from "./skills/osu/OsuFlashlight";
import { OsuDifficultyAttributes } from "./structures/OsuDifficultyAttributes";

/**
 * A difficulty calculator for osu!standard gamemode.
 */
export class OsuDifficultyCalculator extends DifficultyCalculator {
    /**
     * The aim star rating of the beatmap.
     */
    aim: number = 0;

    /**
     * The speed star rating of the beatmap.
     */
    speed: number = 0;

    /**
     * The flashlight star rating of the beatmap.
     */
    flashlight: number = 0;

    override readonly attributes: OsuDifficultyAttributes = {
        speedDifficulty: 0,
        mods: [],
        starRating: 0,
        maxCombo: 0,
        aimDifficulty: 0,
        flashlightDifficulty: 0,
        speedNoteCount: 0,
        sliderFactor: 0,
        approachRate: 0,
        overallDifficulty: 0,
        hitCircleCount: 0,
        sliderCount: 0,
        spinnerCount: 0,
    };

    protected override readonly difficultyMultiplier: number = 0.0675;
    protected override readonly mode: Modes = Modes.osu;

    /**
     * Calculates the aim star rating of the beatmap and stores it in this instance.
     */
    calculateAim(): void {
        const aimSkill: OsuAim = new OsuAim(this.mods, true);
        const aimSkillWithoutSliders: OsuAim = new OsuAim(this.mods, false);

        this.calculateSkills(aimSkill, aimSkillWithoutSliders);

        this.postCalculateAim(aimSkill, aimSkillWithoutSliders);
    }

    /**
     * Calculates the speed star rating of the beatmap and stores it in this instance.
     */
    calculateSpeed(): void {
        const speedSkill: OsuSpeed = new OsuSpeed(
            this.mods,
            new OsuHitWindow(this.stats.od!).hitWindowFor300()
        );

        this.calculateSkills(speedSkill);

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.speed = 0;
        } else {
            this.postCalculateSpeed(speedSkill);
        }

        this.calculateSpeedAttributes();
    }

    /**
     * Calculates the flashlight star rating of the beatmap and stores it in this instance.
     */
    calculateFlashlight(): void {
        const flashlightSkill: OsuFlashlight = new OsuFlashlight(this.mods);

        this.calculateSkills(flashlightSkill);

        this.postCalculateFlashlight(flashlightSkill);
    }

    override calculateTotal(): void {
        const aimPerformanceValue: number = this.basePerformanceValue(this.aim);
        const speedPerformanceValue: number = this.basePerformanceValue(
            this.speed
        );
        let flashlightPerformanceValue: number = 0;

        if (this.mods.some((m) => m instanceof ModFlashlight)) {
            flashlightPerformanceValue = Math.pow(this.flashlight, 2) * 25;
        }

        const basePerformanceValue: number = Math.pow(
            Math.pow(aimPerformanceValue, 1.1) +
                Math.pow(speedPerformanceValue, 1.1) +
                Math.pow(flashlightPerformanceValue, 1.1),
            1 / 1.1
        );

        if (basePerformanceValue > 1e-5) {
            // Document for formula derivation:
            // https://docs.google.com/document/d/10DZGYYSsT_yjz2Mtp6yIJld0Rqx4E-vVHupCqiM4TNI/edit
            this.total = this.attributes.starRating =
                Math.cbrt(1.14) *
                0.027 *
                (Math.cbrt(
                    (100000 / Math.pow(2, 1 / 1.1)) * basePerformanceValue
                ) +
                    4);
        }
    }

    override calculateAll(): void {
        const skills: OsuSkill[] = this.createSkills();

        const isRelax: boolean = this.mods.some((m) => m instanceof ModRelax);

        this.calculateSkills(...skills);

        const aimSkill: OsuAim = <OsuAim>skills[0];
        const aimSkillWithoutSliders: OsuAim = <OsuAim>skills[1];
        const speedSkill: OsuSpeed = <OsuSpeed>skills[2];
        const flashlightSkill = <OsuFlashlight>skills[3];

        this.postCalculateAim(aimSkill, aimSkillWithoutSliders);

        if (isRelax) {
            this.speed = 0;
        } else {
            this.postCalculateSpeed(speedSkill);
        }

        this.calculateSpeedAttributes();

        this.postCalculateFlashlight(flashlightSkill);

        this.calculateTotal();
    }

    /**
     * Returns a string representative of the class.
     */
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

    /**
     * Creates skills to be calculated.
     */
    protected override createSkills(): OsuSkill[] {
        return [
            new OsuAim(this.mods, true),
            new OsuAim(this.mods, false),
            new OsuSpeed(
                this.mods,
                new OsuHitWindow(this.stats.od!).hitWindowFor300()
            ),
            new OsuFlashlight(this.mods),
        ];
    }

    /**
     * Called after aim skill calculation.
     *
     * @param aimSkill The aim skill that considers sliders.
     * @param aimSkillWithoutSliders The aim skill that doesn't consider sliders.
     */
    private postCalculateAim(
        aimSkill: OsuAim,
        aimSkillWithoutSliders: OsuAim
    ): void {
        this.strainPeaks.aimWithSliders = aimSkill.strainPeaks;
        this.strainPeaks.aimWithoutSliders = aimSkillWithoutSliders.strainPeaks;

        this.aim = this.starValue(aimSkill.difficultyValue());

        if (this.aim) {
            this.attributes.sliderFactor =
                this.starValue(aimSkillWithoutSliders.difficultyValue()) /
                this.aim;
        }

        if (this.mods.some((m) => m instanceof ModTouchDevice)) {
            this.aim = Math.pow(this.aim, 0.8);
        }

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.aim *= 0.9;
        }

        this.attributes.aimDifficulty = this.aim;
    }

    /**
     * Called after speed skill calculation.
     *
     * @param speedSkill The speed skill.
     */
    private postCalculateSpeed(speedSkill: OsuSpeed): void {
        this.strainPeaks.speed = speedSkill.strainPeaks;

        this.speed = this.attributes.speedDifficulty = this.starValue(
            speedSkill.difficultyValue()
        );
    }

    /**
     * Calculates speed-related attributes.
     */
    private calculateSpeedAttributes(): void {
        const objectStrains: number[] = this.objects.map((v) => v.tapStrain);

        const maxStrain: number = Math.max(...objectStrains);

        if (maxStrain) {
            this.attributes.speedNoteCount = objectStrains.reduce(
                (total, next) =>
                    total + 1 / (1 + Math.exp(-((next / maxStrain) * 12 - 6))),
                0
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

        this.flashlight = this.starValue(flashlightSkill.difficultyValue());

        if (this.mods.some((m) => m instanceof ModTouchDevice)) {
            this.flashlight = Math.pow(this.flashlight, 0.8);
        }

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.flashlight *= 0.7;
        }

        this.attributes.flashlightDifficulty = this.flashlight;
    }
}
