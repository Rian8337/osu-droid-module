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
} from "@rian8337/osu-base";
import { DroidRhythm } from "./skills/droid/DroidRhythm";
import { DroidVisual } from "./skills/droid/DroidVisual";
import { ExtendedDroidDifficultyAttributes } from "./structures/ExtendedDroidDifficultyAttributes";
import { HighStrainSection } from "./structures/HighStrainSection";
import { DroidDifficultyHitObject } from "./preprocessing/DroidDifficultyHitObject";
import { DroidSnapAim } from "./skills/droid/DroidSnapAim";
import { DroidFlowAim } from "./skills/droid/DroidFlowAim";

/**
 * A difficulty calculator for osu!droid gamemode.
 */
export class DroidDifficultyCalculator extends DifficultyCalculator<DroidDifficultyHitObject> {
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

    private snapAim = 0;
    private flowAim = 0;

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
    };

    protected override readonly difficultyMultiplier: number = 0.18;
    protected override readonly mode: Modes = Modes.droid;

    /**
     * Calculates the aim star rating of the beatmap and stores it in this instance.
     */
    calculateAim(): void {
        const snapAimSkill: DroidSnapAim = new DroidSnapAim(this.mods, true);
        const snapAimSkillWithoutSliders: DroidSnapAim = new DroidSnapAim(
            this.mods,
            false,
        );
        const flowAimSkill: DroidFlowAim = new DroidFlowAim(this.mods);

        this.calculateSkills(
            snapAimSkill,
            snapAimSkillWithoutSliders,
            flowAimSkill,
        );
        this.postCalculateAim(
            snapAimSkill,
            snapAimSkillWithoutSliders,
            flowAimSkill,
        );
    }

    /**
     * Calculates the tap star rating of the beatmap and stores it in this instance.
     */
    calculateTap(): void {
        const od: number = this.stats.od!;

        const tapSkillCheese: DroidTap = new DroidTap(this.mods, od, true);
        const tapSkillNoCheese: DroidTap = new DroidTap(this.mods, od, false);

        this.calculateSkills(tapSkillCheese, tapSkillNoCheese);
        this.postCalculateTap(tapSkillCheese);
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

        const snapAimSkill = <DroidSnapAim>skills[0];
        const snapAimSkillWithoutSliders = <DroidSnapAim>skills[1];
        const flowAimSkill = <DroidFlowAim>skills[2];
        const rhythmSkill = <DroidRhythm>skills[3];
        const tapSkillCheese = <DroidTap>skills[4];
        const flashlightSkill = <DroidFlashlight>skills[6];
        const flashlightSkillWithoutSliders = <DroidFlashlight>skills[7];
        const visualSkill = <DroidVisual>skills[8];
        const visualSkillWithoutSliders = <DroidVisual>skills[9];

        this.postCalculateAim(
            snapAimSkill,
            snapAimSkillWithoutSliders,
            flowAimSkill,
        );

        this.postCalculateTap(tapSkillCheese);
        this.calculateTapAttributes();

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
            " aim (" +
            this.snapAim.toFixed(2) +
            " snap, " +
            this.flowAim.toFixed(2) +
            " flow), " +
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

    protected override createSkills(): DroidSkill[] {
        const od: number = this.stats.od!;

        return [
            new DroidSnapAim(this.mods, true),
            new DroidSnapAim(this.mods, false),
            new DroidFlowAim(this.mods),
            // Tap skill depends on rhythm skill, so we put it first
            new DroidRhythm(this.mods, od),
            new DroidTap(this.mods, od, true),
            new DroidTap(this.mods, od, false),
            new DroidFlashlight(this.mods, true),
            new DroidFlashlight(this.mods, false),
            new DroidVisual(this.mods, true),
            new DroidVisual(this.mods, false),
        ];
    }

    /**
     * Called after aim skill calculation.
     *
     * @param snapAimSkill The snap aim skill that considers sliders.
     * @param snapAimSkillWithoutSliders The snap aim skill that doesn't consider sliders.
     * @param flowAimSkill The flow aim skill.
     */
    private postCalculateAim(
        snapAimSkill: DroidSnapAim,
        snapAimSkillWithoutSliders: DroidSnapAim,
        flowAimSkill: DroidFlowAim,
    ): void {
        this.strainPeaks.aimWithSliders = snapAimSkill.strainPeaks;
        this.strainPeaks.aimWithoutSliders =
            snapAimSkillWithoutSliders.strainPeaks;

        this.snapAim = this.starValue(snapAimSkill.difficultyValue());
        this.flowAim = this.starValue(flowAimSkill.difficultyValue());

        if (this.snapAim > 0) {
            this.attributes.sliderFactor =
                this.starValue(snapAimSkillWithoutSliders.difficultyValue()) /
                this.snapAim;
        }

        this.aim = Math.pow(
            Math.pow(this.snapAim, 1.1) + Math.pow(this.flowAim, 1.1),
            1 / 1.1,
        );

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.aim *= 0.9;
        }

        this.attributes.aimDifficulty = this.aim;

        this.calculateAimAttributes();
    }

    /**
     * Calculates aim-related attributes.
     */
    private calculateAimAttributes(): void {
        const objectStrains: number[] = [];
        let maxStrain: number = 0;
        const topDifficultSliders: { index: number; velocity: number }[] = [];

        for (let i = 0; i < this.objects.length; ++i) {
            const object = this.objects[i];

            objectStrains.push(object.snapAimStrain);
            maxStrain = Math.max(maxStrain, object.snapAimStrain);

            const velocity: number = object.travelDistance / object.travelTime;
            if (velocity > 0) {
                topDifficultSliders.push({
                    index: i,
                    velocity: velocity,
                });
            }
        }

        if (maxStrain) {
            this.attributes.aimNoteCount = objectStrains.reduce(
                (total, next) =>
                    total + 1 / (1 + Math.exp(-((next / maxStrain) * 12 - 6))),
                0,
            );
            this.attributes.aimDifficultStrainCount = objectStrains.reduce(
                (total, next) => total + Math.pow(next / maxStrain, 4),
                0,
            );
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
     * @param tapSkillCheese The tap skill that considers cheesing.
     */
    private postCalculateTap(tapSkillCheese: DroidTap): void {
        this.strainPeaks.speed = tapSkillCheese.strainPeaks;

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.tap = this.attributes.tapDifficulty = 0;
            this.attributes.possibleThreeFingeredSections = [];
        } else {
            this.tap = this.attributes.tapDifficulty = this.starValue(
                tapSkillCheese.difficultyValue(),
            );
        }

        this.calculateTapAttributes();
    }

    /**
     * Calculates tap-related attributes.
     */
    private calculateTapAttributes(): void {
        this.attributes.possibleThreeFingeredSections = [];
        const tempSections: Omit<HighStrainSection, "sumStrain">[] = [];

        const objectStrains: number[] = [];
        const objectDeltaTimes: number[] = [];
        let maxStrain: number = 0;

        const maxSectionDeltaTime: number = 2000;
        const minSectionObjectCount: number = 5;
        let firstObjectIndex: number = 0;

        for (let i = 0; i < this.objects.length - 1; ++i) {
            const current = this.objects[i];
            const next = this.objects[i + 1];

            if (i === 0) {
                objectStrains.push(current.tapStrain);
                objectDeltaTimes.push(current.deltaTime);
            }

            objectStrains.push(next.tapStrain);
            objectDeltaTimes.push(next.deltaTime);
            maxStrain = Math.max(current.tapStrain, maxStrain);

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

        if (maxStrain) {
            this.attributes.speedNoteCount = objectStrains.reduce(
                (total, next) =>
                    total + 1 / (1 + Math.exp(-((next / maxStrain) * 12 - 6))),
                0,
            );

            this.attributes.averageSpeedDeltaTime =
                objectDeltaTimes.reduce(
                    (total, next, index) =>
                        total +
                        (next * 1) /
                            (1 +
                                Math.exp(
                                    -(
                                        (objectStrains[index] / maxStrain) *
                                            25 -
                                        20
                                    ),
                                )),
                    0,
                ) /
                objectStrains.reduce(
                    (total, next) =>
                        total +
                        1 / (1 + Math.exp(-((next / maxStrain) * 25 - 20))),
                    0,
                );

            this.attributes.tapDifficultStrainCount = objectStrains.reduce(
                (total, next) => total + Math.pow(next / maxStrain, 4),
                0,
            );
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

        const objectStrains: number[] = this.objects.map(
            (v) => v.flashlightStrainWithSliders,
        );
        const maxStrain: number = Math.max(...objectStrains);

        if (maxStrain) {
            this.attributes.flashlightDifficultStrainCount =
                objectStrains.reduce(
                    (total, next) => total + Math.pow(next / maxStrain, 4),
                    0,
                );
        }

        this.attributes.flashlightDifficulty = this.flashlight;
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

        const objectStrains: number[] = this.objects.map(
            (v) => v.flashlightStrainWithSliders,
        );
        const maxStrain: number = Math.max(...objectStrains);

        if (maxStrain) {
            this.attributes.visualDifficultStrainCount = objectStrains.reduce(
                (total, next) => total + Math.pow(next / maxStrain, 4),
                0,
            );
        }
    }
}
