import {
    Beatmap,
    BeatmapDifficulty,
    HitObject,
    Mod,
    ModAutopilot,
    ModFlashlight,
    ModMap,
    ModRelax,
    ModTouchDevice,
    OsuHitWindow,
    OsuPlayableBeatmap,
} from "@rian8337/osu-base";
import { DifficultyCalculator } from "./base/DifficultyCalculator";
import { Skill } from "./base/Skill";
import { StrainSkill } from "./base/StrainSkill";
import { OsuDifficultyHitObject } from "./preprocessing/OsuDifficultyHitObject";
import { OsuAim } from "./skills/osu/OsuAim";
import { OsuFlashlight } from "./skills/osu/OsuFlashlight";
import { OsuSkill } from "./skills/osu/OsuSkill";
import { OsuSpeed } from "./skills/osu/OsuSpeed";
import { OsuDifficultyAttributes } from "./structures/OsuDifficultyAttributes";

/**
 * A difficulty calculator for osu!standard gamemode.
 */
export class OsuDifficultyCalculator extends DifficultyCalculator<
    OsuPlayableBeatmap,
    OsuDifficultyHitObject,
    OsuDifficultyAttributes
> {
    protected override readonly difficultyMultiplier = 0.0675;

    constructor() {
        super();

        this.difficultyAdjustmentMods.push(ModTouchDevice);
    }

    override retainDifficultyAdjustmentMods(mods: Mod[]): Mod[] {
        return mods.filter(
            (mod) =>
                mod.isApplicableToOsu() &&
                mod.isOsuRelevant &&
                this.difficultyAdjustmentMods.some((m) => mod instanceof m),
        );
    }

    protected override createDifficultyAttributes(
        beatmap: OsuPlayableBeatmap,
        skills: Skill[],
    ): OsuDifficultyAttributes {
        const attributes = new OsuDifficultyAttributes();

        attributes.mods = beatmap.mods;
        attributes.maxCombo = beatmap.maxCombo;
        attributes.clockRate = beatmap.speedMultiplier;
        attributes.hitCircleCount = beatmap.hitObjects.circles;
        attributes.sliderCount = beatmap.hitObjects.sliders;
        attributes.spinnerCount = beatmap.hitObjects.spinners;

        this.populateAimAttributes(attributes, skills);
        this.populateSpeedAttributes(attributes, skills);
        this.populateFlashlightAttributes(attributes, skills);

        if (attributes.mods.has(ModRelax)) {
            attributes.aimDifficulty *= 0.9;
            attributes.speedDifficulty = 0;
            attributes.flashlightDifficulty *= 0.7;
        } else if (attributes.mods.has(ModAutopilot)) {
            attributes.aimDifficulty = 0;
            attributes.speedDifficulty *= 0.5;
            attributes.flashlightDifficulty *= 0.4;
        }

        const aimPerformanceValue = this.basePerformanceValue(
            attributes.aimDifficulty,
        );

        const speedPerformanceValue = this.basePerformanceValue(
            attributes.speedDifficulty,
        );

        const flashlightPerformanceValue =
            Math.pow(attributes.flashlightDifficulty, 2) * 25;

        const basePerformanceValue = Math.pow(
            Math.pow(aimPerformanceValue, 1.1) +
                Math.pow(speedPerformanceValue, 1.1) +
                Math.pow(flashlightPerformanceValue, 1.1),
            1 / 1.1,
        );

        if (basePerformanceValue > 1e-5) {
            // Document for formula derivation:
            // https://docs.google.com/document/d/10DZGYYSsT_yjz2Mtp6yIJld0Rqx4E-vVHupCqiM4TNI/edit
            attributes.starRating =
                Math.cbrt(1.15) *
                0.027 *
                (Math.cbrt(
                    (100000 / Math.pow(2, 1 / 1.1)) * basePerformanceValue,
                ) +
                    4);
        } else {
            attributes.starRating = 0;
        }

        const preempt =
            BeatmapDifficulty.difficultyRange(
                beatmap.difficulty.ar,
                HitObject.preemptMax,
                HitObject.preemptMid,
                HitObject.preemptMin,
            ) / attributes.clockRate;

        attributes.approachRate = BeatmapDifficulty.inverseDifficultyRange(
            preempt,
            HitObject.preemptMax,
            HitObject.preemptMid,
            HitObject.preemptMin,
        );

        const { greatWindow } = new OsuHitWindow(beatmap.difficulty.od);

        attributes.overallDifficulty = OsuHitWindow.greatWindowToOD(
            greatWindow / attributes.clockRate,
        );

        return attributes;
    }

    protected override createPlayableBeatmap(
        beatmap: Beatmap,
        mods?: ModMap,
    ): OsuPlayableBeatmap {
        return beatmap.createOsuPlayableBeatmap(mods);
    }

    protected override createDifficultyHitObjects(beatmap: OsuPlayableBeatmap) {
        const clockRate = beatmap.speedMultiplier;
        const difficultyObjects: OsuDifficultyHitObject[] = [];
        const { objects } = beatmap.hitObjects;

        for (let i = 1; i < objects.length; ++i) {
            const difficultyObject = new OsuDifficultyHitObject(
                objects[i],
                objects[i - 1] ?? null,
                difficultyObjects,
                clockRate,
                i - 1,
            );

            difficultyObject.computeProperties(clockRate, objects);
            difficultyObjects.push(difficultyObject);
        }

        return difficultyObjects;
    }

    protected override createSkills(beatmap: OsuPlayableBeatmap): OsuSkill[] {
        const { mods } = beatmap;
        const skills: OsuSkill[] = [];

        if (!mods.has(ModAutopilot)) {
            skills.push(new OsuAim(mods, true));
            skills.push(new OsuAim(mods, false));
        }

        if (!mods.has(ModRelax)) {
            skills.push(new OsuSpeed(mods));
        }

        if (mods.has(ModFlashlight)) {
            skills.push(new OsuFlashlight(mods));
        }

        return skills;
    }

    protected override createStrainPeakSkills(
        beatmap: OsuPlayableBeatmap,
    ): StrainSkill[] {
        const { mods } = beatmap;

        return [
            new OsuAim(mods, true),
            new OsuAim(mods, false),
            new OsuSpeed(mods),
            new OsuFlashlight(mods),
        ];
    }

    private populateAimAttributes(
        attributes: OsuDifficultyAttributes,
        skills: Skill[],
    ) {
        const aim = skills.find((s) => s instanceof OsuAim && s.withSliders) as
            | OsuAim
            | undefined;

        const aimNoSlider = skills.find(
            (s) => s instanceof OsuAim && !s.withSliders,
        ) as OsuAim | undefined;

        if (!aim || !aimNoSlider) {
            return;
        }

        attributes.aimDifficulty = this.calculateRating(aim);
        attributes.aimDifficultSliderCount = aim.countDifficultSliders();
        attributes.aimDifficultStrainCount = aim.countDifficultStrains();

        if (attributes.aimDifficulty > 0) {
            attributes.sliderFactor =
                this.calculateRating(aimNoSlider) / attributes.aimDifficulty;
        } else {
            attributes.sliderFactor = 1;
        }
    }

    private populateSpeedAttributes(
        attributes: OsuDifficultyAttributes,
        skills: Skill[],
    ) {
        const speed = skills.find((s) => s instanceof OsuSpeed) as
            | OsuSpeed
            | undefined;

        if (!speed) {
            return;
        }

        attributes.speedDifficulty = this.calculateRating(speed);
        attributes.speedNoteCount = speed.relevantNoteCount();
        attributes.speedDifficultStrainCount = speed.countDifficultStrains();
    }

    private populateFlashlightAttributes(
        attributes: OsuDifficultyAttributes,
        skills: Skill[],
    ) {
        const flashlight = skills.find((s) => s instanceof OsuFlashlight) as
            | OsuFlashlight
            | undefined;

        if (!flashlight) {
            return;
        }

        attributes.flashlightDifficulty = this.calculateRating(flashlight);
    }
}
