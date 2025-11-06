import {
    Beatmap,
    DroidHitWindow,
    DroidPlayableBeatmap,
    Mod,
    ModAutopilot,
    ModFlashlight,
    ModMap,
    ModPrecise,
    ModRelax,
    ModReplayV6,
    ModScoreV2,
    ModTraceable,
    OsuHitWindow,
    PreciseDroidHitWindow,
} from "@rian8337/osu-base";
import { DifficultyCalculator } from "./base/DifficultyCalculator";
import { Skill } from "./base/Skill";
import { StrainSkill } from "./base/StrainSkill";
import { DroidDifficultyHitObject } from "./preprocessing/DroidDifficultyHitObject";
import { DroidAim } from "./skills/droid/DroidAim";
import { DroidFlashlight } from "./skills/droid/DroidFlashlight";
import { DroidReading } from "./skills/droid/DroidReading";
import { DroidRhythm } from "./skills/droid/DroidRhythm";
import { DroidTap } from "./skills/droid/DroidTap";
import { ExtendedDroidDifficultyAttributes } from "./structures/ExtendedDroidDifficultyAttributes";

/**
 * A difficulty calculator for osu!droid gamemode.
 */
export class DroidDifficultyCalculator extends DifficultyCalculator<
    DroidPlayableBeatmap,
    DroidDifficultyHitObject,
    ExtendedDroidDifficultyAttributes
> {
    /**
     * The strain threshold to start detecting for possible three-fingered section.
     *
     * Increasing this number will result in less sections being flagged.
     */
    static readonly threeFingerStrainThreshold = 175;

    private readonly difficultyMultiplier = 0.18;

    constructor() {
        super();

        this.difficultyAdjustmentMods.push(
            ModPrecise,
            ModScoreV2,
            ModTraceable,
            ModReplayV6,
        );
    }

    override retainDifficultyAdjustmentMods(mods: Mod[]): Mod[] {
        return mods.filter(
            (mod) =>
                mod.isApplicableToDroid() &&
                mod.isDroidRelevant &&
                this.difficultyAdjustmentMods.some((m) => mod instanceof m),
        );
    }

    protected override createDifficultyAttributes(
        beatmap: DroidPlayableBeatmap,
        skills: Skill[],
        objects: DroidDifficultyHitObject[],
    ): ExtendedDroidDifficultyAttributes {
        const attributes = new ExtendedDroidDifficultyAttributes();

        attributes.mods = beatmap.mods;
        attributes.maxCombo = beatmap.maxCombo;
        attributes.clockRate = beatmap.speedMultiplier;
        attributes.hitCircleCount = beatmap.hitObjects.circles;
        attributes.sliderCount = beatmap.hitObjects.sliders;
        attributes.spinnerCount = beatmap.hitObjects.spinners;

        let greatWindow: number;

        if (attributes.mods.has(ModPrecise)) {
            greatWindow = new PreciseDroidHitWindow(beatmap.difficulty.od)
                .greatWindow;
        } else {
            greatWindow = new DroidHitWindow(beatmap.difficulty.od).greatWindow;
        }

        attributes.overallDifficulty = OsuHitWindow.greatWindowToOD(
            greatWindow / attributes.clockRate,
        );

        this.populateAimAttributes(attributes, skills, objects);
        this.populateTapAttributes(attributes, skills, objects);
        this.populateRhythmAttributes(attributes, skills);
        this.populateFlashlightAttributes(attributes, skills);
        this.populateReadingAttributes(attributes, skills);

        const aimPerformanceValue = DroidAim.difficultyToPerformance(
            attributes.aimDifficulty,
        );

        const tapPerformanceValue = DroidTap.difficultyToPerformance(
            attributes.tapDifficulty,
        );

        const flashlightPerformanceValue =
            DroidFlashlight.difficultyToPerformance(
                attributes.flashlightDifficulty,
            );

        const readingPerformanceValue = DroidReading.difficultyToPerformance(
            attributes.readingDifficulty,
        );

        const basePerformanceValue = Math.pow(
            Math.pow(aimPerformanceValue, 1.1) +
                Math.pow(tapPerformanceValue, 1.1) +
                Math.pow(flashlightPerformanceValue, 1.1) +
                Math.pow(readingPerformanceValue, 1.1),
            1 / 1.1,
        );

        if (basePerformanceValue > 1e-5) {
            // Document for formula derivation:
            // https://docs.google.com/document/d/10DZGYYSsT_yjz2Mtp6yIJld0Rqx4E-vVHupCqiM4TNI/edit
            attributes.starRating =
                0.027 *
                (Math.cbrt(
                    (100000 / Math.pow(2, 1 / 1.1)) * basePerformanceValue,
                ) +
                    4);
        } else {
            attributes.starRating = 0;
        }

        return attributes;
    }

    protected override createPlayableBeatmap(
        beatmap: Beatmap,
        mods?: ModMap,
    ): DroidPlayableBeatmap {
        return beatmap.createDroidPlayableBeatmap(mods);
    }

    protected override createDifficultyHitObjects(
        beatmap: DroidPlayableBeatmap,
    ) {
        const clockRate = beatmap.speedMultiplier;
        const difficultyObjects: DroidDifficultyHitObject[] = [];
        const { objects } = beatmap.hitObjects;

        for (let i = 0; i < objects.length; ++i) {
            const difficultyObject = new DroidDifficultyHitObject(
                objects[i],
                objects[i - 1] ?? null,
                difficultyObjects,
                clockRate,
                i - 1,
            );

            difficultyObject.computeProperties(clockRate);
            difficultyObjects.push(difficultyObject);
        }

        return difficultyObjects;
    }

    protected override createSkills(beatmap: DroidPlayableBeatmap): Skill[] {
        const { mods } = beatmap;
        const skills: Skill[] = [];

        if (!mods.has(ModAutopilot)) {
            skills.push(new DroidAim(mods, true));
            skills.push(new DroidAim(mods, false));
        }

        if (!mods.has(ModRelax)) {
            // Tap skills depend on rhythm skill, so we put it first
            skills.push(new DroidRhythm(mods));
            skills.push(new DroidTap(mods, true));
            skills.push(new DroidTap(mods, false));
            skills.push(new DroidTap(mods, true, 50));
        }

        skills.push(
            new DroidReading(
                mods,
                beatmap.speedMultiplier,
                beatmap.hitObjects.objects,
            ),
        );

        if (mods.has(ModFlashlight)) {
            skills.push(new DroidFlashlight(mods, true));
            skills.push(new DroidFlashlight(mods, false));
        }

        return skills;
    }

    protected override createStrainPeakSkills(
        beatmap: DroidPlayableBeatmap,
    ): StrainSkill[] {
        const { mods } = beatmap;

        return [
            new DroidAim(mods, true),
            new DroidAim(mods, false),
            new DroidTap(mods, true),
            new DroidFlashlight(mods, true),
        ];
    }

    private populateAimAttributes(
        attributes: ExtendedDroidDifficultyAttributes,
        skills: Skill[],
        objects: DroidDifficultyHitObject[],
    ) {
        const aim = skills.find(
            (s) => s instanceof DroidAim && s.withSliders,
        ) as DroidAim | undefined;

        const aimNoSlider = skills.find(
            (s) => s instanceof DroidAim && !s.withSliders,
        ) as DroidAim | undefined;

        if (!aim || !aimNoSlider || attributes.mods.has(ModAutopilot)) {
            attributes.aimDifficulty = 0;
            attributes.aimDifficultSliderCount = 0;
            attributes.aimDifficultStrainCount = 0;
            return;
        }

        attributes.aimDifficulty = this.calculateRating(aim);
        attributes.aimDifficultSliderCount = aim.countDifficultSliders();
        attributes.aimDifficultStrainCount = aim.countTopWeightedStrains();

        if (attributes.mods.has(ModRelax)) {
            attributes.aimDifficulty *= 0.9;
        }

        const topDifficultSliders: { index: number; velocity: number }[] = [];

        for (let i = 0; i < objects.length; ++i) {
            const object = objects[i];
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
                attributes.difficultSliders.push({
                    index: slider.index,
                    difficultyRating: slider.velocity / velocitySum,
                });
            }
        }

        attributes.difficultSliders.sort(
            (a, b) => b.difficultyRating - a.difficultyRating,
        );

        // Take the top 15% most difficult sliders.
        while (
            attributes.difficultSliders.length >
            Math.ceil(0.15 * attributes.sliderCount)
        ) {
            attributes.difficultSliders.pop();
        }

        if (attributes.aimDifficulty > 0) {
            attributes.sliderFactor =
                this.calculateRating(aimNoSlider) / attributes.aimDifficulty;
        } else {
            attributes.sliderFactor = 1;
        }
    }

    private populateTapAttributes(
        attributes: ExtendedDroidDifficultyAttributes,
        skills: Skill[],
        objects: DroidDifficultyHitObject[],
    ) {
        const tap = skills.find(
            (s) => s instanceof DroidTap && s.considerCheesability,
        ) as DroidTap | undefined;

        const tapVibro = skills.find(
            (s) =>
                s instanceof DroidTap &&
                s.considerCheesability &&
                s.strainTimeCap !== undefined,
        ) as DroidTap | undefined;

        if (!tap || !tapVibro || attributes.mods.has(ModRelax)) {
            attributes.tapDifficulty = 0;
            attributes.tapDifficultStrainCount = 0;
            attributes.speedNoteCount = 0;
            attributes.averageSpeedDeltaTime = 0;
            attributes.vibroFactor = 1;

            return;
        }

        attributes.tapDifficulty = this.calculateRating(tap);
        attributes.tapDifficultStrainCount = tap.countTopWeightedStrains();

        attributes.speedNoteCount = tap.relevantNoteCount();
        attributes.averageSpeedDeltaTime = tap.relevantDeltaTime();

        if (attributes.tapDifficulty > 0) {
            attributes.vibroFactor =
                this.calculateRating(tapVibro) / attributes.tapDifficulty;
        }

        const { threeFingerStrainThreshold } = DroidDifficultyCalculator;
        const minSectionObjectCount = 5;

        let inSpeedSection = false;
        let firstSpeedObjectIndex = 0;

        for (let i = 2; i < objects.length; ++i) {
            const current = objects[i];
            const prev = objects[i - 1];

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
                    i === objects.length - 1)
            ) {
                const lastSpeedObjectIndex =
                    i - (i === objects.length - 1 ? 0 : 1);
                inSpeedSection = false;

                // Ignore sections that don't meet object count requirement.
                if (i - firstSpeedObjectIndex < minSectionObjectCount) {
                    continue;
                }

                attributes.possibleThreeFingeredSections.push({
                    firstObjectIndex: firstSpeedObjectIndex,
                    lastObjectIndex: lastSpeedObjectIndex,
                    sumStrain: Math.pow(
                        objects
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

    private populateRhythmAttributes(
        attributes: ExtendedDroidDifficultyAttributes,
        skills: Skill[],
    ) {
        const rhythm = skills.find((s) => s instanceof DroidRhythm) as
            | DroidRhythm
            | undefined;

        attributes.rhythmDifficulty =
            rhythm && !attributes.mods.has(ModRelax)
                ? this.calculateRating(rhythm)
                : 0;
    }

    private populateFlashlightAttributes(
        attributes: ExtendedDroidDifficultyAttributes,
        skills: Skill[],
    ) {
        const flashlight = skills.find(
            (s) => s instanceof DroidFlashlight && s.withSliders,
        ) as DroidFlashlight | undefined;

        const flashlightNoSliders = skills.find(
            (s) => s instanceof DroidFlashlight && !s.withSliders,
        ) as DroidFlashlight | undefined;

        if (!flashlight || !flashlightNoSliders) {
            attributes.flashlightDifficulty = 0;
            attributes.flashlightDifficultStrainCount = 0;
            attributes.flashlightSliderFactor = 1;
            return;
        }

        attributes.flashlightDifficulty = this.calculateRating(flashlight);
        attributes.flashlightDifficultStrainCount =
            flashlight.countTopWeightedStrains();

        if (attributes.mods.has(ModRelax)) {
            attributes.flashlightDifficulty *= 0.7;
        } else if (attributes.mods.has(ModAutopilot)) {
            attributes.flashlightDifficulty *= 0.4;
        }

        if (attributes.flashlightDifficulty > 0) {
            attributes.flashlightSliderFactor =
                this.calculateRating(flashlightNoSliders) /
                attributes.flashlightDifficulty;
        } else {
            attributes.flashlightSliderFactor = 1;
        }
    }

    private populateReadingAttributes(
        attributes: ExtendedDroidDifficultyAttributes,
        skills: Skill[],
    ) {
        const reading = skills.find((s) => s instanceof DroidReading) as
            | DroidReading
            | undefined;

        if (!reading) {
            attributes.readingDifficulty = 0;
            attributes.readingDifficultNoteCount = 0;
            return;
        }

        attributes.readingDifficulty = this.calculateRating(reading);
        attributes.readingDifficultNoteCount = reading.countTopWeightedNotes();

        if (attributes.mods.has(ModRelax)) {
            attributes.readingDifficulty *= 0.7;
        } else if (attributes.mods.has(ModAutopilot)) {
            attributes.readingDifficulty *= 0.4;
        }

        // Consider accuracy difficulty.
        const ratingMultiplier =
            0.75 +
            Math.pow(Math.max(0, attributes.overallDifficulty), 2.2) / 800;

        attributes.readingDifficulty *= Math.sqrt(ratingMultiplier);
    }

    /**
     * Calculates the base rating of a `Skill`.
     *
     * @param skill The `Skill` to calculate the rating of.
     * @returns The rating of the `Skill`.
     */
    private calculateRating(skill: Skill): number {
        return Math.sqrt(skill.difficultyValue()) * this.difficultyMultiplier;
    }
}
