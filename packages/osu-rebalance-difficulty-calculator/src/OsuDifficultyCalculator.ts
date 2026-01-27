import {
    Beatmap,
    BeatmapDifficulty,
    HitObject,
    MathUtils,
    Mod,
    ModAutopilot,
    ModBlinds,
    ModFlashlight,
    ModMap,
    ModRelax,
    ModTouchDevice,
    OsuHitWindow,
    OsuPlayableBeatmap,
} from "@rian8337/osu-base";
import { OsuPerformanceCalculator } from "./OsuPerformanceCalculator";
import { OsuRatingCalculator } from "./OsuRatingCalculator";
import { DifficultyCalculator } from "./base/DifficultyCalculator";
import { IHasPeakDifficulty } from "./base/IHasPeakDifficulty";
import { Skill } from "./base/Skill";
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
    private readonly starRatingMultiplier = 0.0265;

    constructor() {
        super();

        this.difficultyAdjustmentMods.push(ModTouchDevice, ModBlinds);
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
        beatmap: Beatmap,
        playableBeatmap: OsuPlayableBeatmap,
        skills: Skill[],
    ): OsuDifficultyAttributes {
        const attributes = new OsuDifficultyAttributes();

        if (playableBeatmap.hitObjects.objects.length === 0) {
            return attributes;
        }

        attributes.mods = playableBeatmap.mods;
        attributes.maxCombo = playableBeatmap.maxCombo;
        attributes.clockRate = playableBeatmap.speedMultiplier;
        attributes.hitCircleCount = playableBeatmap.hitObjects.circles;
        attributes.sliderCount = playableBeatmap.hitObjects.sliders;
        attributes.spinnerCount = playableBeatmap.hitObjects.spinners;
        attributes.drainRate = playableBeatmap.difficulty.hp;

        attributes.approachRate =
            OsuDifficultyCalculator.calculateRateAdjustedApproachRate(
                playableBeatmap.difficulty.ar,
                attributes.clockRate,
            );

        attributes.overallDifficulty =
            OsuDifficultyCalculator.calculateRateAdjustedOverallDifficulty(
                playableBeatmap.difficulty.od,
                attributes.clockRate,
            );

        const aim = skills.find((s) => s instanceof OsuAim && s.withSliders) as
            | OsuAim
            | undefined;

        const aimNoSlider = skills.find(
            (s) => s instanceof OsuAim && !s.withSliders,
        ) as OsuAim | undefined;

        const speed = skills.find((s) => s instanceof OsuSpeed) as
            | OsuSpeed
            | undefined;

        const flashlight = skills.find((s) => s instanceof OsuFlashlight) as
            | OsuFlashlight
            | undefined;

        // Aim attributes
        const aimDifficultyValue = aim?.difficultyValue() ?? 0;

        attributes.aimDifficultSliderCount = aim?.countDifficultSliders() ?? 0;
        attributes.aimDifficultStrainCount =
            aim?.countTopWeightedStrains() ?? 0;

        attributes.sliderFactor =
            aimDifficultyValue > 0
                ? OsuRatingCalculator.calculateDifficultyRating(
                      aimNoSlider?.difficultyValue() ?? 0,
                  ) /
                  OsuRatingCalculator.calculateDifficultyRating(
                      aimDifficultyValue,
                  )
                : 1;

        const aimNoSliderTopWeightedSliderCount =
            aimNoSlider?.countTopWeightedSliders() ?? 0;
        const aimNoSliderDifficultStrainCount =
            aimNoSlider?.countTopWeightedStrains() ?? 0;

        attributes.aimTopWeightedSliderFactor =
            aimNoSliderTopWeightedSliderCount /
            Math.max(
                1,
                aimNoSliderDifficultStrainCount -
                    aimNoSliderTopWeightedSliderCount,
            );

        // Speed attributes
        const speedDifficultyValue = speed?.difficultyValue() ?? 0;

        attributes.speedNoteCount = speed?.relevantNoteCount() ?? 0;
        attributes.speedDifficultStrainCount =
            speed?.countTopWeightedObjectDifficulties(speedDifficultyValue) ??
            0;

        const speedTopWeightedSliderCount =
            speed?.countTopWeightedSliders(speedDifficultyValue) ?? 0;

        attributes.speedTopWeightedSliderFactor =
            speedTopWeightedSliderCount /
            Math.max(
                1,
                attributes.speedDifficultStrainCount -
                    speedTopWeightedSliderCount,
            );

        // Final rating
        const mechanicalDifficultyRating =
            this.calculateMechanicalDifficultyRating(
                aimDifficultyValue,
                speedDifficultyValue,
            );

        const ratingCalculator = new OsuRatingCalculator(
            attributes.mods,
            playableBeatmap.hitObjects.objects.length,
            attributes.approachRate,
            attributes.overallDifficulty,
            mechanicalDifficultyRating,
            attributes.sliderFactor,
        );

        attributes.aimDifficulty =
            ratingCalculator.computeAimRating(aimDifficultyValue);
        attributes.speedDifficulty =
            ratingCalculator.computeSpeedRating(speedDifficultyValue);
        attributes.flashlightDifficulty =
            ratingCalculator.computeFlashlightRating(
                flashlight?.difficultyValue() ?? 0,
            );

        const baseAimPerformance = OsuAim.difficultyToPerformance(
            attributes.aimDifficulty,
        );

        const baseSpeedPerformance = OsuSpeed.difficultyToPerformance(
            attributes.speedDifficulty,
        );

        const baseFlashlightPerformance = OsuFlashlight.difficultyToPerformance(
            attributes.flashlightDifficulty,
        );

        const basePerformance = MathUtils.norm(
            OsuPerformanceCalculator.normExponent,
            baseAimPerformance,
            baseSpeedPerformance,
            baseFlashlightPerformance,
        );

        attributes.starRating = this.calculateStarRating(basePerformance);

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

            difficultyObject.computeProperties(clockRate);
            difficultyObjects.push(difficultyObject);
        }

        return difficultyObjects;
    }

    protected override createSkills(beatmap: OsuPlayableBeatmap): Skill[] {
        const { mods } = beatmap;
        const skills: Skill[] = [];

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
    ): (Skill & IHasPeakDifficulty)[] {
        const { mods } = beatmap;

        return [
            new OsuAim(mods, true),
            new OsuAim(mods, false),
            new OsuSpeed(mods),
            new OsuFlashlight(mods),
        ];
    }

    private calculateMechanicalDifficultyRating(
        aimDifficultyValue: number,
        speedDifficultyValue: number,
    ): number {
        const aimValue = OsuSkill.difficultyToPerformance(
            OsuRatingCalculator.calculateDifficultyRating(aimDifficultyValue),
        );

        const speedValue = OsuSkill.difficultyToPerformance(
            OsuRatingCalculator.calculateDifficultyRating(speedDifficultyValue),
        );

        const totalValue = MathUtils.norm(
            OsuPerformanceCalculator.normExponent,
            aimValue,
            speedValue,
        );

        return this.calculateStarRating(totalValue);
    }

    private calculateStarRating(basePerformance: number): number {
        if (basePerformance <= 1e-5) {
            return 0;
        }

        return (
            Math.cbrt(OsuPerformanceCalculator.finalMultiplier) *
            this.starRatingMultiplier *
            (Math.cbrt((100000 / Math.pow(2, 1 / 1.1)) * basePerformance) + 4)
        );
    }

    static calculateRateAdjustedApproachRate(
        approachRate: number,
        clockRate: number,
    ): number {
        const preempt =
            BeatmapDifficulty.difficultyRange(
                approachRate,
                HitObject.preemptMax,
                HitObject.preemptMid,
                HitObject.preemptMin,
            ) / clockRate;

        return BeatmapDifficulty.inverseDifficultyRange(
            preempt,
            HitObject.preemptMax,
            HitObject.preemptMid,
            HitObject.preemptMin,
        );
    }

    static calculateRateAdjustedOverallDifficulty(
        overallDifficulty: number,
        clockRate: number,
    ): number {
        const greatWindow =
            new OsuHitWindow(overallDifficulty).greatWindow / clockRate;

        return OsuHitWindow.greatWindowToOD(greatWindow);
    }
}
