import { DroidAim } from "./skills/droid/DroidAim";
import { DroidTap } from "./skills/droid/DroidTap";
import { DifficultyCalculator } from "./base/DifficultyCalculator";
import { DroidSkill } from "./skills/droid/DroidSkill";
import { DroidFlashlight } from "./skills/droid/DroidFlashlight";
import {
    ModRelax,
    ModFlashlight,
    Modes,
    ModUtil,
    Beatmap,
    ModAutopilot,
} from "@rian8337/osu-base";
import { DroidRhythm } from "./skills/droid/DroidRhythm";
import { DroidVisual } from "./skills/droid/DroidVisual";
import { ExtendedDroidDifficultyAttributes } from "./structures/ExtendedDroidDifficultyAttributes";
import { DroidDifficultyHitObject } from "./preprocessing/DroidDifficultyHitObject";
import { CacheableDifficultyAttributes } from "./structures/CacheableDifficultyAttributes";
import { DroidDifficultyAttributes } from "./structures/DroidDifficultyAttributes";
import { DroidDifficultyCalculationOptions } from "./structures/DroidDifficultyCalculationOptions";

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
    get aim(): number {
        return this.attributes.aimDifficulty;
    }

    /**
     * The tap star rating of the beatmap.
     */
    get tap(): number {
        return this.attributes.tapDifficulty;
    }

    /**
     * The rhythm star rating of the beatmap.
     */
    get rhythm(): number {
        return this.attributes.rhythmDifficulty;
    }

    /**
     * The flashlight star rating of the beatmap.
     */
    get flashlight(): number {
        return this.attributes.flashlightDifficulty;
    }

    /**
     * The visual star rating of the beatmap.
     */
    get visual(): number {
        return this.attributes.visualDifficulty;
    }

    /**
     * The strain threshold to start detecting for possible three-fingered section.
     *
     * Increasing this number will result in less sections being flagged.
     */
    static readonly threeFingerStrainThreshold = 175;

    override readonly attributes: ExtendedDroidDifficultyAttributes = {
        mode: "live",
        aimDifficultSliderCount: 0,
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
            ...this.attributes,
            mods: ModUtil.modsToOsuString(this.attributes.mods),
        };
    }

    protected override readonly difficultyMultiplier = 0.18;
    protected override readonly mode = Modes.droid;

    // Override to use DroidDifficultyCalculationOptions
    override calculate(options?: DroidDifficultyCalculationOptions): this {
        return super.calculate(options);
    }

    /**
     * Calculates the aim star rating of the beatmap and stores it in this instance.
     */
    calculateAim(): void {
        if (this.mods.some((m) => m instanceof ModAutopilot)) {
            this.attributes.aimDifficulty = 0;
            return;
        }

        const aimSkill = new DroidAim(this.mods, true);
        const aimSkillWithoutSliders = new DroidAim(this.mods, false);

        this.calculateSkills(aimSkill, aimSkillWithoutSliders);
        this.postCalculateAim(aimSkill, aimSkillWithoutSliders);
    }

    /**
     * Calculates the tap star rating of the beatmap and stores it in this instance.
     */
    calculateTap(): void {
        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.attributes.tapDifficulty = 0;
            return;
        }

        const tapSkillCheese = new DroidTap(this.mods, true);
        const tapSkillNoCheese = new DroidTap(this.mods, false);
        this.calculateSkills(tapSkillCheese, tapSkillNoCheese);

        const tapSkillVibro = new DroidTap(
            this.mods,
            true,
            tapSkillCheese.relevantDeltaTime(),
        );

        this.calculateSkills(tapSkillVibro);

        this.postCalculateTap(tapSkillCheese, tapSkillVibro);
    }

    /**
     * Calculates the rhythm star rating of the beatmap and stores it in this instance.
     */
    calculateRhythm(): void {
        const rhythmSkill = new DroidRhythm(this.mods);

        this.calculateSkills(rhythmSkill);
        this.postCalculateRhythm(rhythmSkill);
    }

    /**
     * Calculates the flashlight star rating of the beatmap and stores it in this instance.
     */
    calculateFlashlight(): void {
        if (!this.mods.some((m) => m instanceof ModFlashlight)) {
            this.attributes.flashlightDifficulty = 0;
            return;
        }

        const flashlightSkill = new DroidFlashlight(this.mods, true);
        const flashlightSkillWithoutSliders = new DroidFlashlight(
            this.mods,
            false,
        );

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
            this.attributes.visualDifficulty = 0;
            return;
        }

        const visualSkill = new DroidVisual(this.mods, true);
        const visualSkillWithoutSliders = new DroidVisual(this.mods, false);

        this.calculateSkills(visualSkill, visualSkillWithoutSliders);
        this.postCalculateVisual(visualSkill, visualSkillWithoutSliders);
    }

    override calculateTotal(): void {
        const aimPerformanceValue = this.basePerformanceValue(
            Math.pow(this.aim, 0.8),
        );
        const tapPerformanceValue = this.basePerformanceValue(this.tap);
        const flashlightPerformanceValue = this.mods.some(
            (m) => m instanceof ModFlashlight,
        )
            ? Math.pow(this.flashlight, 1.6) * 25
            : 0;
        const visualPerformanceValue = Math.pow(this.visual, 1.6) * 22.5;

        const basePerformanceValue = Math.pow(
            Math.pow(aimPerformanceValue, 1.1) +
                Math.pow(tapPerformanceValue, 1.1) +
                Math.pow(flashlightPerformanceValue, 1.1) +
                Math.pow(visualPerformanceValue, 1.1),
            1 / 1.1,
        );

        if (basePerformanceValue > 1e-5) {
            // Document for formula derivation:
            // https://docs.google.com/document/d/10DZGYYSsT_yjz2Mtp6yIJld0Rqx4E-vVHupCqiM4TNI/edit
            this.attributes.starRating =
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
            (s): s is DroidAim => s instanceof DroidAim && s.withSliders,
        );

        const aimSkillWithoutSliders = skills.find(
            (s): s is DroidAim => s instanceof DroidAim && !s.withSliders,
        );

        const rhythmSkill = skills.find(
            (s) => s instanceof DroidRhythm,
        ) as DroidRhythm;

        const tapSkillCheese = skills.find(
            (s) => s instanceof DroidTap && s.considerCheesability,
        ) as DroidTap | undefined;

        const flashlightSkill = skills.find(
            (s) => s instanceof DroidFlashlight && s.withSliders,
        ) as DroidFlashlight | undefined;

        const flashlightSkillWithoutSliders = skills.find(
            (s) => s instanceof DroidFlashlight && !s.withSliders,
        ) as DroidFlashlight | undefined;

        const visualSkill = skills.find(
            (s) => s instanceof DroidVisual && s.withSliders,
        ) as DroidVisual | undefined;

        const visualSkillWithoutSliders = skills.find(
            (s) => s instanceof DroidVisual && !s.withSliders,
        ) as DroidVisual | undefined;

        if (aimSkill && aimSkillWithoutSliders) {
            this.postCalculateAim(aimSkill, aimSkillWithoutSliders);
        }

        if (tapSkillCheese) {
            const tapSkillVibro = new DroidTap(
                this.mods,
                true,
                tapSkillCheese.relevantDeltaTime(),
            );

            this.calculateSkills(tapSkillVibro);
            this.postCalculateTap(tapSkillCheese, tapSkillVibro);
        }

        this.postCalculateRhythm(rhythmSkill);

        if (flashlightSkill && flashlightSkillWithoutSliders) {
            this.postCalculateFlashlight(
                flashlightSkill,
                flashlightSkillWithoutSliders,
            );
        }

        if (visualSkill && visualSkillWithoutSliders) {
            this.postCalculateVisual(visualSkill, visualSkillWithoutSliders);
        }

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

    protected override generateDifficultyHitObjects(
        beatmap: Beatmap,
        clockRate: number,
    ) {
        const difficultyObjects: DroidDifficultyHitObject[] = [];
        const { objects } = beatmap.hitObjects;

        for (let i = 0; i < objects.length; ++i) {
            const difficultyObject = new DroidDifficultyHitObject(
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

    protected override createSkills(): DroidSkill[] {
        const skills: DroidSkill[] = [];

        if (!this.mods.some((m) => m instanceof ModAutopilot)) {
            skills.push(new DroidAim(this.mods, true));
            skills.push(new DroidAim(this.mods, false));
        }

        if (!this.mods.some((m) => m instanceof ModRelax)) {
            // Tap and visual skills depend on rhythm skill, so we put it first
            skills.push(new DroidRhythm(this.mods));
            skills.push(new DroidTap(this.mods, true));
            skills.push(new DroidTap(this.mods, false));
            skills.push(new DroidVisual(this.mods, true));
            skills.push(new DroidVisual(this.mods, false));
        }

        if (this.mods.some((m) => m instanceof ModFlashlight)) {
            skills.push(new DroidFlashlight(this.mods, true));
            skills.push(new DroidFlashlight(this.mods, false));
        }

        return skills;
    }

    protected override calculateClockRate(
        options?: DroidDifficultyCalculationOptions,
    ): number {
        return (
            ModUtil.calculateRateWithMods(
                options?.mods ?? [],
                options?.oldStatistics,
            ) * (options?.customSpeedMultiplier ?? 1)
        );
    }

    /**
     * Called after aim skill calculation.
     *
     * @param aimSkill The aim skill that considers sliders.
     * @param aimSkillWithoutSliders The aim skill that doesn't consider sliders.
     */
    private postCalculateAim(
        aimSkill: DroidAim,
        aimSkillWithoutSliders: DroidAim,
    ): void {
        this.strainPeaks.aimWithSliders = aimSkill.strainPeaks;
        this.strainPeaks.aimWithoutSliders = aimSkillWithoutSliders.strainPeaks;

        this.attributes.aimDifficulty = this.mods.some(
            (m) => m instanceof ModAutopilot,
        )
            ? 0
            : this.starValue(aimSkill.difficultyValue());

        if (this.aim) {
            this.attributes.sliderFactor =
                this.starValue(aimSkillWithoutSliders.difficultyValue()) /
                this.aim;
        }

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.attributes.aimDifficulty *= 0.9;
        }

        this.attributes.aimDifficultStrainCount =
            aimSkill.countDifficultStrains();

        this.attributes.aimDifficultSliderCount =
            aimSkill.countDifficultSliders();

        this.calculateAimAttributes();
    }

    /**
     * Calculates aim-related attributes.
     */
    private calculateAimAttributes(): void {
        this.attributes.difficultSliders = [];
        const topDifficultSliders: { index: number; velocity: number }[] = [];

        for (let i = 0; i < this.objects.length; ++i) {
            const object = this.objects[i];
            const velocity = object.travelDistance / object.travelTime;
            if (velocity > 0) {
                topDifficultSliders.push({
                    index: i,
                    velocity: velocity,
                });
            }
        }

        const velocitySum = topDifficultSliders.reduce(
            (a, v) => a + v.velocity,
            0,
        );

        for (const slider of topDifficultSliders) {
            const difficultyRating = slider.velocity / velocitySum;

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
     * @param tapSkillVibro The tap skill that considers vibro.
     */
    private postCalculateTap(
        tapSkillCheese: DroidTap,
        tapSkillVibro: DroidTap,
    ): void {
        this.strainPeaks.speed = tapSkillCheese.strainPeaks;

        this.attributes.tapDifficulty = this.mods.some(
            (m) => m instanceof ModRelax,
        )
            ? 0
            : this.starValue(tapSkillCheese.difficultyValue());

        if (this.tap) {
            this.attributes.vibroFactor =
                this.starValue(tapSkillVibro.difficultyValue()) / this.tap;
        }

        this.attributes.speedNoteCount = tapSkillCheese.relevantNoteCount();
        this.attributes.averageSpeedDeltaTime =
            tapSkillCheese.relevantDeltaTime();
        this.attributes.tapDifficultStrainCount =
            tapSkillCheese.countDifficultStrains();

        this.calculateTapAttributes();
    }

    /**
     * Calculates tap-related attributes.
     */
    private calculateTapAttributes(): void {
        this.attributes.possibleThreeFingeredSections = [];
        const { threeFingerStrainThreshold } = DroidDifficultyCalculator;
        const minSectionObjectCount = 5;

        let inSpeedSection = false;
        let firstSpeedObjectIndex = 0;

        for (let i = 2; i < this.objects.length; ++i) {
            const current = this.objects[i];
            const prev = this.objects[i - 1];

            if (
                !inSpeedSection &&
                current.originalTapStrain >= threeFingerStrainThreshold
            ) {
                inSpeedSection = true;
                firstSpeedObjectIndex = i;
                continue;
            }

            const currentDelta = current.deltaTime;
            const prevDelta = prev.deltaTime;

            const deltaRatio =
                Math.min(prevDelta, currentDelta) /
                Math.max(prevDelta, currentDelta);

            if (
                inSpeedSection &&
                (current.originalTapStrain < threeFingerStrainThreshold ||
                    // Stop speed section on slowing down 1/2 rhythm change or anything slower.
                    (prevDelta < currentDelta && deltaRatio <= 0.5) ||
                    // Don't forget to manually add the last section, which would otherwise be ignored.
                    i === this.objects.length - 1)
            ) {
                const lastSpeedObjectIndex =
                    i - (i === this.objects.length - 1 ? 0 : 1);
                inSpeedSection = false;

                // Ignore sections that don't meet object count requirement.
                if (i - firstSpeedObjectIndex < minSectionObjectCount) {
                    continue;
                }

                this.attributes.possibleThreeFingeredSections.push({
                    firstObjectIndex: firstSpeedObjectIndex,
                    lastObjectIndex: lastSpeedObjectIndex,
                    sumStrain: Math.pow(
                        this.objects
                            .slice(
                                firstSpeedObjectIndex,
                                lastSpeedObjectIndex + 1,
                            )
                            .reduce(
                                (a, v) =>
                                    a +
                                    v.originalTapStrain /
                                        threeFingerStrainThreshold,
                                0,
                            ),
                        0.75,
                    ),
                });
            }
        }
    }

    /**
     * Called after rhythm skill calculation.
     *
     * @param rhythmSkill The rhythm skill.
     */
    private postCalculateRhythm(rhythmSkill: DroidRhythm): void {
        this.attributes.rhythmDifficulty = this.mods.some(
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

        this.attributes.flashlightDifficulty = this.starValue(
            flashlightSkill.difficultyValue(),
        );

        if (this.flashlight) {
            this.attributes.flashlightSliderFactor =
                this.starValue(
                    flashlightSkillWithoutSliders.difficultyValue(),
                ) / this.flashlight;
        }

        if (this.mods.some((m) => m instanceof ModAutopilot)) {
            this.attributes.flashlightDifficulty *= 0.3;
        }

        if (this.mods.some((m) => m instanceof ModRelax)) {
            this.attributes.flashlightDifficulty *= 0.7;
        } else if (this.mods.some((m) => m instanceof ModAutopilot)) {
            this.attributes.flashlightDifficulty *= 0.4;
        }

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
        this.attributes.visualDifficulty = this.mods.some(
            (m) => m instanceof ModRelax,
        )
            ? 0
            : this.starValue(visualSkillWithSliders.difficultyValue());

        if (this.visual) {
            this.attributes.visualSliderFactor =
                this.starValue(visualSkillWithoutSliders.difficultyValue()) /
                this.visual;
        }

        if (this.mods.some((m) => m instanceof ModAutopilot)) {
            this.attributes.visualDifficulty *= 0.8;
        }

        this.attributes.visualDifficultStrainCount =
            visualSkillWithSliders.countDifficultStrains();
    }
}
