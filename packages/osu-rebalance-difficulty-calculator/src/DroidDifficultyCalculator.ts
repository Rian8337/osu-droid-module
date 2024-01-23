import { DroidTap } from "./skills/droid/DroidTap";
import { DifficultyCalculator } from "./base/DifficultyCalculator";
import { DroidSkill } from "./skills/droid/DroidSkill";
import { DroidFlashlight } from "./skills/droid/DroidFlashlight";
import {
    ModRelax,
    ModFlashlight,
    Modes,
    CircleSizeCalculator,
    HitObjectStackEvaluator,
    ModUtil,
    MapStats,
} from "@rian8337/osu-base";
import { DroidRhythm } from "./skills/droid/DroidRhythm";
import { DroidVisual } from "./skills/droid/DroidVisual";
import { ExtendedDroidDifficultyAttributes } from "./structures/ExtendedDroidDifficultyAttributes";
import { HighStrainSection } from "./structures/HighStrainSection";
import { DroidDifficultyHitObject } from "./preprocessing/DroidDifficultyHitObject";
import { CacheableDifficultyAttributes } from "./structures/CacheableDifficultyAttributes";
import { DroidDifficultyAttributes } from "./structures/DroidDifficultyAttributes";
import { TouchTap } from "./skills/droid/TouchTap";
import { TouchAim } from "./skills/droid/TouchAim";

/**
 * A difficulty calculator for osu!droid gamemode.
 */
export class DroidDifficultyCalculator extends DifficultyCalculator<
    DroidDifficultyHitObject,
    DroidDifficultyAttributes
> {
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

    /**
     * The strain threshold to start detecting for possible three-fingered section.
     *
     * Increasing this number will result in less sections being flagged.
     */
    static readonly threeFingerStrainThreshold: number = 175;

    override readonly attributes: ExtendedDroidDifficultyAttributes = {
        tapDifficulty: 0,
        rhythmDifficulty: 0,
        visualDifficulty: 0,
        aimNoteCount: 0,
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
        aimDifficultStrainCount: 0,
        tapDifficultStrainCount: 0,
        flashlightDifficultStrainCount: 0,
        visualDifficultStrainCount: 0,
        flashlightSliderFactor: 0,
        visualSliderFactor: 0,
        possibleThreeFingeredSections: [],
        difficultSliders: [],
        averageSpeedDeltaTime: 0,
        vibroFactor: 1,
    };

    override get cacheableAttributes(): CacheableDifficultyAttributes<DroidDifficultyAttributes> {
        return {
            tapDifficulty: this.tap,
            rhythmDifficulty: this.rhythm,
            visualDifficulty: this.visual,
            mods: ModUtil.modsToOsuString(this.attributes.mods),
            starRating: this.total,
            maxCombo: this.attributes.maxCombo,
            aimDifficulty: this.aim,
            flashlightDifficulty: this.flashlight,
            speedNoteCount: this.attributes.speedNoteCount,
            sliderFactor: this.attributes.sliderFactor,
            clockRate: this.attributes.clockRate,
            approachRate: this.attributes.approachRate,
            overallDifficulty: this.attributes.overallDifficulty,
            hitCircleCount: this.attributes.hitCircleCount,
            sliderCount: this.attributes.sliderCount,
            spinnerCount: this.attributes.spinnerCount,
            aimDifficultStrainCount: this.attributes.aimDifficultStrainCount,
            tapDifficultStrainCount: this.attributes.tapDifficultStrainCount,
            flashlightDifficultStrainCount:
                this.attributes.flashlightDifficultStrainCount,
            visualDifficultStrainCount:
                this.attributes.visualDifficultStrainCount,
            averageSpeedDeltaTime: this.attributes.averageSpeedDeltaTime,
            vibroFactor: this.attributes.vibroFactor,
        };
    }

    protected override readonly difficultyMultiplier: number = 0.18;
    protected override readonly mode: Modes = Modes.droid;

    /**
     * Calculates the aim star rating of the beatmap and stores it in this instance.
     */
    calculateAim(): void {
        const od = this.stats.od!;
        const clockRate = this.stats.speedMultiplier;

        const aimSkill = new TouchAim(this.mods, clockRate, od, true);
        const aimSkillWithoutSliders = new TouchAim(
            this.mods,
            clockRate,
            od,
            false,
        );

        this.calculateSkills(aimSkill, aimSkillWithoutSliders);
        this.postCalculateAim(aimSkill, aimSkillWithoutSliders);
    }

    /**
     * Calculates the tap star rating of the beatmap and stores it in this instance.
     */
    calculateTap(): void {
        const od = this.stats.od!;
        const clockRate = this.stats.speedMultiplier;

        const tapSkillCheese = new TouchTap(this.mods, clockRate, od, true);
        const tapSkillNoCheese = new TouchTap(this.mods, clockRate, od, false);
        const tapSkillNoVibro = new DroidTap(this.mods, od, true);
        this.calculateSkills(tapSkillCheese, tapSkillNoCheese, tapSkillNoVibro);

        const tapSkillVibro = new DroidTap(
            this.mods,
            od,
            true,
            tapSkillCheese.relevantDeltaTime(),
        );

        this.calculateSkills(tapSkillVibro);

        this.postCalculateTap(tapSkillCheese, tapSkillNoVibro, tapSkillVibro);
    }

    /**
     * Calculates the rhythm star rating of the beatmap and stores it in this instance.
     */
    calculateRhythm(): void {
        const rhythmSkill: DroidRhythm = new DroidRhythm(
            this.mods,
            this.stats.od!,
        );

        this.calculateSkills(rhythmSkill);
        this.postCalculateRhythm(rhythmSkill);
    }

    /**
     * Calculates the flashlight star rating of the beatmap and stores it in this instance.
     */
    calculateFlashlight(): void {
        const flashlightSkill: DroidFlashlight = new DroidFlashlight(
            this.mods,
            true,
        );
        const flashlightSkillWithoutSliders: DroidFlashlight =
            new DroidFlashlight(this.mods, false);

        this.calculateSkills(flashlightSkill, flashlightSkillWithoutSliders);
        this.postCalculateFlashlight(
            flashlightSkill,
            flashlightSkillWithoutSliders,
        );
    }

    /**
     * Calculates the visual star rating of the beatmap and stores it in this instance.
     */
    calculateVisual(): void {
        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.visual = this.attributes.visualDifficulty = 0;

            return;
        }

        const visualSkill: DroidVisual = new DroidVisual(this.mods, true);
        const visualSkillWithoutSliders: DroidVisual = new DroidVisual(
            this.mods,
            false,
        );

        this.calculateSkills(visualSkill, visualSkillWithoutSliders);
        this.postCalculateVisual(visualSkill, visualSkillWithoutSliders);
    }

    override calculateTotal(): void {
        const aimPerformanceValue: number = this.basePerformanceValue(
            Math.pow(this.aim, 0.8),
        );
        const tapPerformanceValue: number = this.basePerformanceValue(this.tap);
        const flashlightPerformanceValue: number = this.mods.some(
            (m) => m instanceof ModFlashlight,
        )
            ? Math.pow(this.flashlight, 1.6) * 25
            : 0;
        const visualPerformanceValue: number =
            Math.pow(this.visual, 1.6) * 22.5;

        const basePerformanceValue: number = Math.pow(
            Math.pow(aimPerformanceValue, 1.1) +
                Math.pow(tapPerformanceValue, 1.1) +
                Math.pow(flashlightPerformanceValue, 1.1) +
                Math.pow(visualPerformanceValue, 1.1),
            1 / 1.1,
        );

        if (basePerformanceValue > 1e-5) {
            // Document for formula derivation:
            // https://docs.google.com/document/d/10DZGYYSsT_yjz2Mtp6yIJld0Rqx4E-vVHupCqiM4TNI/edit
            this.total = this.attributes.starRating =
                0.027 *
                (Math.cbrt(
                    (100000 / Math.pow(2, 1 / 1.1)) * basePerformanceValue,
                ) +
                    4);
        } else {
            this.total = this.attributes.starRating = 0;
        }
    }

    override calculateAll(): void {
        const skills: DroidSkill[] = this.createSkills();
        this.calculateSkills(...skills);

        const aimSkill = <TouchAim>skills[0];
        const aimSkillWithoutSliders = <TouchAim>skills[1];
        const tapSkillCheese = <TouchTap>skills[2];
        const tapSkillNoVibro = <DroidTap>skills[4];
        const rhythmSkill = <DroidRhythm>skills[5];
        const flashlightSkill = <DroidFlashlight>skills[6];
        const flashlightSkillWithoutSliders = <DroidFlashlight>skills[7];
        const visualSkill = <DroidVisual>skills[8];
        const visualSkillWithoutSliders = <DroidVisual>skills[9];

        const tapSkillVibro = new DroidTap(
            this.mods,
            this.stats.od!,
            true,
            tapSkillCheese.relevantDeltaTime(),
        );

        this.calculateSkills(tapSkillVibro);

        this.postCalculateAim(aimSkill, aimSkillWithoutSliders);
        this.postCalculateTap(tapSkillCheese, tapSkillNoVibro, tapSkillVibro);
        this.postCalculateRhythm(rhythmSkill);
        this.postCalculateFlashlight(
            flashlightSkill,
            flashlightSkillWithoutSliders,
        );
        this.postCalculateVisual(visualSkill, visualSkillWithoutSliders);

        this.calculateTotal();
    }

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

    protected override preProcess(): void {
        const scale: number = CircleSizeCalculator.standardCSToStandardScale(
            this.stats.cs!,
        );

        for (const object of this.beatmap.hitObjects.objects) {
            object.droidScale = scale;
        }

        HitObjectStackEvaluator.applyDroidStacking(
            this.beatmap.hitObjects.objects,
            this.beatmap.general.stackLeniency,
        );
    }

    protected override generateDifficultyHitObjects() {
        const difficultyObjects: DroidDifficultyHitObject[] = [];
        const { objects } = this.beatmap.hitObjects;

        for (let i = 0; i < objects.length; ++i) {
            const difficultyObject = new DroidDifficultyHitObject(
                objects[i],
                objects[i - 1] ?? null,
                objects[i - 2] ?? null,
                difficultyObjects,
                this.stats.speedMultiplier,
                MapStats.arToMS(this.stats.ar!),
                this.stats.forceAR,
            );

            difficultyObject.computeProperties(
                this.stats.speedMultiplier,
                objects,
            );

            difficultyObjects.push(difficultyObject);
        }

        return difficultyObjects;
    }

    protected override createSkills(): DroidSkill[] {
        const od: number = this.stats.od!;

        return [
            new TouchAim(this.mods, this.stats.speedMultiplier, od, true),
            new TouchAim(this.mods, this.stats.speedMultiplier, od, false),
            // Cheesability tap
            new TouchTap(this.mods, this.stats.speedMultiplier, od, true),
            // Non-cheesability tap
            new TouchTap(this.mods, this.stats.speedMultiplier, od, false),
            // Non-vibro tap
            new DroidTap(this.mods, od, true),
            new DroidRhythm(this.mods, od),
            new DroidFlashlight(this.mods, true),
            new DroidFlashlight(this.mods, false),
            new DroidVisual(this.mods, true),
            new DroidVisual(this.mods, false),
        ];
    }

    /**
     * Called after aim skill calculation.
     *
     * @param touchAimSkill The touch aim skill that considers sliders.
     * @param touchAimSkillWithoutSliders The touch aim skill that doesn't consider sliders.
     */
    private postCalculateAim(
        touchAimSkill: TouchAim,
        touchAimSkillWithoutSliders: TouchAim,
    ): void {
        this.strainPeaks.aimWithSliders = touchAimSkill.strainPeaks;
        this.strainPeaks.aimWithoutSliders =
            touchAimSkillWithoutSliders.strainPeaks;

        this.aim = this.starValue(touchAimSkill.difficultyValue());

        if (this.aim) {
            this.attributes.sliderFactor =
                this.starValue(touchAimSkillWithoutSliders.difficultyValue()) /
                this.aim;
        }

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.aim *= 0.9;
        }

        this.attributes.aimDifficulty = this.aim;
        this.attributes.aimDifficultStrainCount =
            touchAimSkill.countDifficultStrains();

        this.calculateAimAttributes();
    }

    /**
     * Calculates aim-related attributes.
     */
    private calculateAimAttributes(): void {
        const topDifficultSliders: { index: number; velocity: number }[] = [];

        for (let i = 0; i < this.objects.length; ++i) {
            const object = this.objects[i];
            const velocity: number = object.travelDistance / object.travelTime;
            if (velocity > 0) {
                topDifficultSliders.push({
                    index: i,
                    velocity: velocity,
                });
            }
        }

        const velocitySum: number = topDifficultSliders.reduce(
            (a, v) => a + v.velocity,
            0,
        );

        for (const slider of topDifficultSliders) {
            const difficultyRating: number = slider.velocity / velocitySum;

            // Only consider sliders that are fast enough.
            if (difficultyRating > 0.02) {
                this.attributes.difficultSliders.push({
                    index: slider.index,
                    difficultyRating: slider.velocity / velocitySum,
                });
            }
        }

        this.attributes.difficultSliders.sort(
            (a, b) => b.difficultyRating - a.difficultyRating,
        );

        // Take the top 15% most difficult sliders.
        while (
            this.attributes.difficultSliders.length >
            Math.ceil(0.15 * this.beatmap.hitObjects.sliders)
        ) {
            this.attributes.difficultSliders.pop();
        }
    }

    /**
     * Called after tap skill calculation.
     *
     * @param touchTapSkillCheese The touch tap skill that considers cheesing.
     * @param tapSkillNoVibro The tap skill that does not consider vibro.
     * @param tapSkillVibro The tap skill that considers vibro.
     */
    private postCalculateTap(
        touchTapSkillCheese: TouchTap,
        tapSkillNoVibro: DroidTap,
        tapSkillVibro: DroidTap,
    ): void {
        this.strainPeaks.speed = touchTapSkillCheese.strainPeaks;

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.tap = this.attributes.tapDifficulty = 0;
            this.attributes.possibleThreeFingeredSections = [];
        } else {
            this.tap = this.attributes.tapDifficulty = this.starValue(
                touchTapSkillCheese.difficultyValue(),
            );
        }

        const noVibroTap = this.starValue(tapSkillNoVibro.difficultyValue());
        if (noVibroTap) {
            this.attributes.vibroFactor =
                this.starValue(tapSkillVibro.difficultyValue()) / noVibroTap;
        }

        this.attributes.speedNoteCount =
            touchTapSkillCheese.relevantNoteCount();
        this.attributes.averageSpeedDeltaTime =
            touchTapSkillCheese.relevantDeltaTime();
        this.attributes.tapDifficultStrainCount =
            touchTapSkillCheese.countDifficultStrains();

        this.calculateTapAttributes();
    }

    /**
     * Calculates tap-related attributes.
     */
    private calculateTapAttributes(): void {
        this.attributes.possibleThreeFingeredSections = [];
        const tempSections: Omit<HighStrainSection, "sumStrain">[] = [];
        const maxSectionDeltaTime: number = 2000;
        const minSectionObjectCount: number = 5;
        let firstObjectIndex: number = 0;

        for (let i = 0; i < this.objects.length - 1; ++i) {
            const current = this.objects[i];
            const next = this.objects[i + 1];

            const realDeltaTime: number =
                next.object.startTime - current.object.endTime;

            if (realDeltaTime >= maxSectionDeltaTime) {
                // Ignore sections that don't meet object count requirement.
                if (i - firstObjectIndex < minSectionObjectCount) {
                    firstObjectIndex = i + 1;
                    continue;
                }

                tempSections.push({
                    firstObjectIndex,
                    lastObjectIndex: i,
                });

                firstObjectIndex = i + 1;
            }
        }

        // Don't forget to manually add the last beatmap section, which would otherwise be ignored.
        if (this.objects.length - firstObjectIndex > minSectionObjectCount) {
            tempSections.push({
                firstObjectIndex,
                lastObjectIndex: this.objects.length - 1,
            });
        }

        // Refilter with tap strain in mind.
        const { threeFingerStrainThreshold } = DroidDifficultyCalculator;
        for (const section of tempSections) {
            let inSpeedSection: boolean = false;
            let newFirstObjectIndex = section.firstObjectIndex;

            for (
                let i = section.firstObjectIndex;
                i <= section.lastObjectIndex;
                ++i
            ) {
                const current = this.objects[i];

                if (
                    !inSpeedSection &&
                    current.originalTapStrain >= threeFingerStrainThreshold
                ) {
                    inSpeedSection = true;
                    newFirstObjectIndex = i;
                    continue;
                }

                if (
                    inSpeedSection &&
                    current.originalTapStrain < threeFingerStrainThreshold
                ) {
                    inSpeedSection = false;

                    // Ignore sections that don't meet object count requirement.
                    if (i - newFirstObjectIndex < minSectionObjectCount) {
                        continue;
                    }

                    this.attributes.possibleThreeFingeredSections.push({
                        firstObjectIndex: newFirstObjectIndex,
                        lastObjectIndex: i,
                        sumStrain: this.calculateThreeFingerSummedStrain(
                            newFirstObjectIndex,
                            i,
                        ),
                    });
                }
            }

            // Don't forget to manually add the last beatmap section, which would otherwise be ignored.
            // Ignore sections that don't meet object count requirement.
            if (
                inSpeedSection &&
                section.lastObjectIndex - newFirstObjectIndex >=
                    minSectionObjectCount
            ) {
                this.attributes.possibleThreeFingeredSections.push({
                    firstObjectIndex: newFirstObjectIndex,
                    lastObjectIndex: section.lastObjectIndex,
                    sumStrain: this.calculateThreeFingerSummedStrain(
                        newFirstObjectIndex,
                        section.lastObjectIndex,
                    ),
                });
            }
        }
    }

    /**
     * Calculates the sum of strains for possible three-fingered sections.
     *
     * @param firstObjectIndex The index of the first object in the section.
     * @param lastObjectIndex The index of the last object in the section.
     * @returns The summed strain of the section.
     */
    private calculateThreeFingerSummedStrain(
        firstObjectIndex: number,
        lastObjectIndex: number,
    ): number {
        return Math.pow(
            this.objects
                .slice(firstObjectIndex, lastObjectIndex)
                .reduce(
                    (a, v) =>
                        a +
                        v.originalTapStrain /
                            DroidDifficultyCalculator.threeFingerStrainThreshold,
                    0,
                ),
            0.75,
        );
    }

    /**
     * Called after rhythm skill calculation.
     *
     * @param rhythmSkill The rhythm skill.
     */
    private postCalculateRhythm(rhythmSkill: DroidRhythm): void {
        this.rhythm = this.attributes.rhythmDifficulty = this.mods.some(
            (m) => m instanceof ModRelax,
        )
            ? 0
            : this.starValue(rhythmSkill.difficultyValue());
    }

    /**
     * Called after flashlight skill calculation.
     *
     * @param flashlightSkill The flashlight skill that considers sliders.
     * @param flashlightSkillWithoutSliders The flashlight skill that doesn't consider sliders.
     */
    private postCalculateFlashlight(
        flashlightSkill: DroidFlashlight,
        flashlightSkillWithoutSliders: DroidFlashlight,
    ): void {
        this.strainPeaks.flashlight = flashlightSkill.strainPeaks;

        this.flashlight = this.starValue(flashlightSkill.difficultyValue());

        if (this.flashlight) {
            this.attributes.flashlightSliderFactor =
                this.starValue(
                    flashlightSkillWithoutSliders.difficultyValue(),
                ) / this.flashlight;
        }

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.flashlight *= 0.7;
        }

        this.attributes.flashlightDifficulty = this.flashlight;
        this.attributes.flashlightDifficultStrainCount =
            flashlightSkill.countDifficultStrains();
    }

    /**
     * Called after visual skill calculation.
     *
     * @param visualSkillWithSliders The visual skill that considers sliders.
     * @param visualSkillWithoutSliders The visual skill that doesn't consider sliders.
     */
    private postCalculateVisual(
        visualSkillWithSliders: DroidVisual,
        visualSkillWithoutSliders: DroidVisual,
    ): void {
        this.visual = this.attributes.visualDifficulty = this.mods.some(
            (m) => m instanceof ModRelax,
        )
            ? 0
            : this.starValue(visualSkillWithSliders.difficultyValue());

        if (this.visual) {
            this.attributes.visualSliderFactor =
                this.starValue(visualSkillWithoutSliders.difficultyValue()) /
                this.visual;
        }

        this.attributes.visualDifficultStrainCount =
            visualSkillWithSliders.countDifficultStrains();
    }
}
