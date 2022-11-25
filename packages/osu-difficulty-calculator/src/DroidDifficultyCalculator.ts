import { DroidAim } from "./skills/droid/DroidAim";
import { DroidTap } from "./skills/droid/DroidTap";
import { DifficultyCalculator } from "./base/DifficultyCalculator";
import { DroidSkill } from "./skills/droid/DroidSkill";
import { DroidFlashlight } from "./skills/droid/DroidFlashlight";
import { DroidRhythm } from "./skills/droid/DroidRhythm";
import { DroidVisual } from "./skills/droid/DroidVisual";
import { ModRelax, ModFlashlight, Modes } from "@rian8337/osu-base";
import { DroidDifficultyAttributes } from "./structures/DroidDifficultyAttributes";

/**
 * A difficulty calculator for osu!droid gamemode.
 */
export class DroidDifficultyCalculator extends DifficultyCalculator {
    /**
     * The aim star rating of the beatmap.
     */
    aim: number = 0;

    /**
     * The tap star rating of the beatmap.
     */
    tap: number = 0;

    /**
     * The rhythm star rating of the beatmap.
     */
    rhythm: number = 0;

    /**
     * The flashlight star rating of the beatmap.
     */
    flashlight: number = 0;

    /**
     * The visual star rating of the beatmap.
     */
    visual: number = 0;

    protected override readonly difficultyMultiplier: number = 0.18;
    protected override readonly mode: Modes = Modes.droid;

    override readonly attributes: DroidDifficultyAttributes = {
        tapDifficulty: 0,
        rhythmDifficulty: 0,
        visualDifficulty: 0,
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

    /**
     * Calculates the aim star rating of the beatmap and stores it in this instance.
     */
    calculateAim(): void {
        const aimSkill: DroidAim = new DroidAim(this.mods, true);
        const aimSkillWithoutSliders: DroidAim = new DroidAim(this.mods, false);

        this.calculateSkills(aimSkill, aimSkillWithoutSliders);

        this.postCalculateAim(aimSkill, aimSkillWithoutSliders);
    }

    /**
     * Calculates the tap star rating of the beatmap and stores it in this instance.
     */
    calculateTap(): void {
        const tapSkill: DroidTap = new DroidTap(this.mods, this.stats.od!);

        this.calculateSkills(tapSkill);

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.tap = 0;
        } else {
            this.postCalculateTap(tapSkill);
        }

        this.calculateSpeedAttributes();
    }

    /**
     * Calculates the rhythm star rating of the beatmap and stores it in this instance.
     */
    calculateRhythm(): void {
        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.rhythm = 0;

            return;
        }

        const rhythmSkill: DroidRhythm = new DroidRhythm(
            this.mods,
            this.stats.od!
        );

        this.calculateSkills(rhythmSkill);

        this.postCalculateRhythm(rhythmSkill);
    }

    /**
     * Calculates the flashlight star rating of the beatmap and stores it in this instance.
     */
    calculateFlashlight(): void {
        const flashlightSkill: DroidFlashlight = new DroidFlashlight(this.mods);

        this.calculateSkills(flashlightSkill);

        this.postCalculateFlashlight(flashlightSkill);
    }

    /**
     * Calculates the visual star rating of the beatmap and stores it in this instance.
     */
    calculateVisual(): void {
        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.visual = 0;

            return;
        }

        const visualSkill: DroidVisual = new DroidVisual(this.mods);

        this.calculateSkills(visualSkill);

        this.postCalculateVisual(visualSkill);
    }

    override calculateTotal(): void {
        const aimPerformanceValue: number = this.basePerformanceValue(this.aim);
        const tapPerformanceValue: number = this.basePerformanceValue(this.tap);
        const flashlightPerformanceValue: number = this.mods.some(
            (m) => m instanceof ModFlashlight
        )
            ? Math.pow(this.flashlight, 2) * 25
            : 0;
        const visualPerformanceValue: number = Math.pow(this.visual, 2) * 22.5;

        const basePerformanceValue: number = Math.pow(
            Math.pow(aimPerformanceValue, 1.1) +
                Math.pow(tapPerformanceValue, 1.1) +
                Math.pow(flashlightPerformanceValue, 1.1) +
                Math.pow(visualPerformanceValue, 1.1),
            1 / 1.1
        );

        if (basePerformanceValue > 1e-5) {
            // Document for formula derivation:
            // https://docs.google.com/document/d/10DZGYYSsT_yjz2Mtp6yIJld0Rqx4E-vVHupCqiM4TNI/edit
            this.total = this.attributes.starRating =
                Math.cbrt(1.12) *
                0.025 *
                (Math.cbrt(
                    (100000 / Math.pow(2, 1 / 1.1)) * basePerformanceValue
                ) +
                    4);
        }
    }

    override calculateAll(): void {
        const skills: DroidSkill[] = this.createSkills();

        const isRelax: boolean = this.mods.some((m) => m instanceof ModRelax);

        if (isRelax) {
            // Remove visual skill to reduce overhead.
            skills.pop();
        }

        this.calculateSkills(...skills);

        const aimSkill: DroidAim = <DroidAim>skills[0];
        const aimSkillWithoutSliders: DroidAim = <DroidAim>skills[1];
        const rhythmSkill: DroidRhythm = <DroidRhythm>skills[2];
        const tapSkill: DroidTap = <DroidTap>skills[3];
        const flashlightSkill: DroidFlashlight = <DroidFlashlight>skills[4];
        const visualSkill: DroidVisual | null =
            <DroidVisual | null>skills[5] ?? null;

        this.postCalculateAim(aimSkill, aimSkillWithoutSliders);

        if (isRelax) {
            this.tap = 0;
        } else {
            this.postCalculateTap(tapSkill);
        }

        this.calculateSpeedAttributes();

        if (!isRelax) {
            this.postCalculateRhythm(rhythmSkill);
        }

        this.postCalculateFlashlight(flashlightSkill);

        if (visualSkill) {
            this.postCalculateVisual(visualSkill);
        }

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
            this.tap.toFixed(2) +
            " tap, " +
            this.rhythm.toFixed(2) +
            " rhythm, " +
            this.flashlight.toFixed(2) +
            " flashlight, " +
            this.visual.toFixed(2) +
            " visual)"
        );
    }

    /**
     * Creates skills to be calculated.
     */
    protected override createSkills(): DroidSkill[] {
        return [
            new DroidAim(this.mods, true),
            new DroidAim(this.mods, false),
            // Tap skill depends on rhythm skill, so we put it first
            new DroidRhythm(this.mods, this.stats.od!),
            new DroidTap(this.mods, this.stats.od!),
            new DroidFlashlight(this.mods),
            new DroidVisual(this.mods),
        ];
    }

    /**
     * Called after aim skill calculation.
     *
     * @param aimSkill The aim skill that considers sliders.
     * @param aimSkillWithoutSliders The aim skill that doesn't consider sliders.
     */
    private postCalculateAim(
        aimSkill: DroidAim,
        aimSkillWithoutSliders: DroidAim
    ): void {
        this.strainPeaks.aimWithSliders = aimSkill.strainPeaks;
        this.strainPeaks.aimWithoutSliders = aimSkillWithoutSliders.strainPeaks;

        this.aim = this.starValue(aimSkill.difficultyValue());

        if (this.aim) {
            this.attributes.sliderFactor =
                this.starValue(aimSkillWithoutSliders.difficultyValue()) /
                this.aim;
        }

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.aim *= 0.9;
        }

        this.attributes.aimDifficulty = this.aim;
    }

    /**
     * Called after tap skill calculation.
     *
     * @param tapSkill The tap skill.
     */
    private postCalculateTap(tapSkill: DroidTap): void {
        this.strainPeaks.speed = tapSkill.strainPeaks;

        this.tap = this.attributes.tapDifficulty = this.starValue(
            tapSkill.difficultyValue()
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
     * Called after rhythm skill calculation.
     *
     * @param rhythmSkill The rhythm skill.
     */
    private postCalculateRhythm(rhythmSkill: DroidRhythm): void {
        this.rhythm = this.attributes.rhythmDifficulty = this.mods.some(
            (m) => m instanceof ModRelax
        )
            ? 0
            : this.starValue(rhythmSkill.difficultyValue());
    }

    /**
     * Called after flashlight skill calculation.
     *
     * @param flashlightSkill The flashlight skill.
     */
    private postCalculateFlashlight(flashlightSkill: DroidFlashlight): void {
        this.strainPeaks.flashlight = flashlightSkill.strainPeaks;

        this.flashlight = this.starValue(flashlightSkill.difficultyValue());

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.flashlight *= 0.7;
        }

        this.attributes.flashlightDifficulty = this.flashlight;
    }

    /**
     * Called after visual skill calculation.
     *
     * @param visualSkill The visual skill.
     */
    private postCalculateVisual(visualSkill: DroidVisual): void {
        this.visual = this.attributes.visualDifficulty = this.mods.some(
            (m) => m instanceof ModRelax
        )
            ? 0
            : this.starValue(visualSkill.difficultyValue());
    }
}
