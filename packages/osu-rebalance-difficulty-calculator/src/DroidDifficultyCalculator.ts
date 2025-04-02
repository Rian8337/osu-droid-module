import {
    Beatmap,
    DroidHitWindow,
    DroidPlayableBeatmap,
    Mod,
    ModAutopilot,
    ModFlashlight,
    ModPrecise,
    ModRelax,
    ModScoreV2,
    ModTraceable,
    OsuHitWindow,
    PreciseDroidHitWindow,
} from "@rian8337/osu-base";
import { DifficultyCalculator } from "./base/DifficultyCalculator";
import { Skill } from "./base/Skill";
import { DroidDifficultyHitObject } from "./preprocessing/DroidDifficultyHitObject";
import { DroidAim } from "./skills/droid/DroidAim";
import { DroidFlashlight } from "./skills/droid/DroidFlashlight";
import { DroidRhythm } from "./skills/droid/DroidRhythm";
import { DroidSkill } from "./skills/droid/DroidSkill";
import { DroidTap } from "./skills/droid/DroidTap";
import { DroidVisual } from "./skills/droid/DroidVisual";
import { ExtendedDroidDifficultyAttributes } from "./structures/ExtendedDroidDifficultyAttributes";
import { StrainSkill } from "./base/StrainSkill";

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

    protected override readonly difficultyMultiplier = 0.18;

    constructor() {
        super();

        this.difficultyAdjustmentMods
            .add(ModPrecise)
            .add(ModScoreV2)
            .add(ModTraceable);
    }

    protected override createDifficultyAttributes(
        beatmap: DroidPlayableBeatmap,
        skills: Skill[],
        objects: DroidDifficultyHitObject[],
    ): ExtendedDroidDifficultyAttributes {
        const attributes = new ExtendedDroidDifficultyAttributes();

        attributes.mods = beatmap.mods.slice();
        attributes.maxCombo = beatmap.maxCombo;
        attributes.clockRate = beatmap.speedMultiplier;
        attributes.hitCircleCount = beatmap.hitObjects.circles;
        attributes.sliderCount = beatmap.hitObjects.sliders;
        attributes.spinnerCount = beatmap.hitObjects.spinners;

        this.populateAimAttributes(attributes, skills, objects);
        this.populateTapAttributes(attributes, skills, objects);
        this.populateRhythmAttributes(attributes, skills);
        this.populateFlashlightAttributes(attributes, skills);
        this.populateVisualAttributes(attributes, skills);

        if (attributes.mods.some((m) => m instanceof ModRelax)) {
            attributes.aimDifficulty *= 0.9;
            attributes.tapDifficulty = 0;
            attributes.rhythmDifficulty = 0;
            attributes.flashlightDifficulty *= 0.7;
            attributes.visualDifficulty = 0;
        } else if (attributes.mods.some((m) => m instanceof ModAutopilot)) {
            attributes.aimDifficulty = 0;
            attributes.flashlightDifficulty *= 0.3;
            attributes.visualDifficulty *= 0.8;
        }

        const aimPerformanceValue = this.basePerformanceValue(
            Math.pow(attributes.aimDifficulty, 0.8),
        );

        const tapPerformanceValue = this.basePerformanceValue(
            attributes.tapDifficulty,
        );

        const flashlightPerformanceValue =
            Math.pow(attributes.flashlightDifficulty, 1.6) * 25;

        const visualPerformanceValue =
            Math.pow(attributes.visualDifficulty, 1.6) * 22.5;

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
            attributes.starRating =
                0.027 *
                (Math.cbrt(
                    (100000 / Math.pow(2, 1 / 1.1)) * basePerformanceValue,
                ) +
                    4);
        } else {
            attributes.starRating = 0;
        }

        let greatWindow: number;

        if (attributes.mods.some((m) => m instanceof ModPrecise)) {
            greatWindow = new PreciseDroidHitWindow(beatmap.difficulty.od)
                .greatWindow;
        } else {
            greatWindow = new DroidHitWindow(beatmap.difficulty.od).greatWindow;
        }

        attributes.overallDifficulty = OsuHitWindow.greatWindowToOD(
            greatWindow / attributes.clockRate,
        );

        return attributes;
    }

    protected override createPlayableBeatmap(
        beatmap: Beatmap,
        mods: Mod[],
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
                objects[i - 2] ?? null,
                difficultyObjects,
                clockRate,
                i - 1,
            );

            difficultyObject.computeProperties(clockRate, objects);
            difficultyObjects.push(difficultyObject);
        }

        return difficultyObjects;
    }

    protected override createSkills(
        beatmap: DroidPlayableBeatmap,
    ): DroidSkill[] {
        const { mods } = beatmap;
        const skills: DroidSkill[] = [];

        if (!mods.some((m) => m instanceof ModAutopilot)) {
            skills.push(new DroidAim(mods, true));
            skills.push(new DroidAim(mods, false));
        }

        if (!mods.some((m) => m instanceof ModRelax)) {
            // Tap and visual skills depend on rhythm skill, so we put it first
            skills.push(new DroidRhythm(mods));
            skills.push(new DroidTap(mods, true));
            skills.push(new DroidTap(mods, false));
            skills.push(new DroidVisual(mods, true));
            skills.push(new DroidVisual(mods, false));
        }

        if (mods.some((m) => m instanceof ModFlashlight)) {
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

        if (!aim || !aimNoSlider) {
            return;
        }

        attributes.aimDifficulty = this.calculateRating(aim);
        attributes.aimDifficultSliderCount = aim.countDifficultSliders();
        attributes.aimDifficultStrainCount = aim.countDifficultStrains();

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

        if (!tap) {
            return;
        }

        attributes.tapDifficulty = this.calculateRating(tap);

        attributes.tapDifficultStrainCount = tap.countDifficultStrains();

        attributes.speedNoteCount = tap.relevantNoteCount();
        attributes.averageSpeedDeltaTime = tap.relevantDeltaTime();

        if (attributes.tapDifficulty > 0) {
            const tapVibro = new DroidTap(
                attributes.mods,
                true,
                attributes.averageSpeedDeltaTime,
            );

            for (const object of objects) {
                tapVibro.process(object);
            }

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

        if (!rhythm) {
            return;
        }

        attributes.rhythmDifficulty = this.calculateRating(rhythm);
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
            return;
        }

        attributes.flashlightDifficulty = this.calculateRating(flashlight);
        attributes.flashlightDifficultStrainCount =
            flashlight.countDifficultStrains();

        if (attributes.flashlightDifficulty > 0) {
            attributes.flashlightSliderFactor =
                this.calculateRating(flashlightNoSliders) /
                attributes.flashlightDifficulty;
        } else {
            attributes.flashlightSliderFactor = 1;
        }
    }

    private populateVisualAttributes(
        attributes: ExtendedDroidDifficultyAttributes,
        skills: Skill[],
    ) {
        const visual = skills.find(
            (s) => s instanceof DroidVisual && s.withSliders,
        ) as DroidVisual | undefined;

        const visualNoSliders = skills.find(
            (s) => s instanceof DroidVisual && !s.withSliders,
        ) as DroidVisual | undefined;

        if (!visual || !visualNoSliders) {
            return;
        }

        attributes.visualDifficulty = this.calculateRating(visual);
        attributes.visualDifficultStrainCount = visual.countDifficultStrains();

        if (attributes.visualDifficulty > 0) {
            attributes.visualSliderFactor =
                this.calculateRating(visualNoSliders) /
                attributes.visualDifficulty;
        } else {
            attributes.visualSliderFactor = 1;
        }
    }
}
