import {
    Beatmap,
    Mod,
    ModAutopilot,
    ModDifficultyAdjust,
    ModEasy,
    ModFlashlight,
    ModHardRock,
    ModHidden,
    ModMap,
    ModMirror,
    ModRandom,
    ModRateAdjust,
    ModRelax,
    PlayableBeatmap,
} from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DifficultyAttributes } from "../structures/DifficultyAttributes";
import { Skill } from "./Skill";
import { StrainPeaks } from "../structures/StrainPeaks";
import { StrainSkill } from "./StrainSkill";

/**
 * The base of a difficulty calculator.
 */
export abstract class DifficultyCalculator<
    TBeatmap extends PlayableBeatmap,
    THitObject extends DifficultyHitObject,
    TAttributes extends DifficultyAttributes,
> {
    protected abstract readonly difficultyMultiplier: number;

    /**
     * `Mod`s that adjust the difficulty of a beatmap.
     */
    protected readonly difficultyAdjustmentMods: (typeof Mod)[] = [
        ModDifficultyAdjust,
        ModRateAdjust,
        ModEasy,
        ModHardRock,
        ModFlashlight,
        ModHidden,
        ModRelax,
        ModAutopilot,
        ModMirror,
        ModRandom,
    ];

    /**
     * Retains `Mod`s that adjust a beatmap's difficulty from the specified mods.
     *
     * @param mods The mods to retain the difficulty adjustment mods from.
     * @returns The retained difficulty adjustment mods.
     */
    abstract retainDifficultyAdjustmentMods(mods: Mod[]): Mod[];

    /**
     * Calculates the difficulty of a `PlayableBeatmap`.
     *
     * @param beatmap The `PlayableBeatmap` whose difficulty is to be calculated.
     * @returns A `DifficultyAttributes` object describing the difficulty of the `Beatmap`.
     */
    calculate(beatmap: TBeatmap): TAttributes;

    /**
     * Calculates the difficulty of a `Beatmap` with specific `Mod`s.
     *
     * @param beatmap The `Beatmap` whose difficulty is to be calculated.
     * @param mods The `Mod`s to apply to the beatmap. Defaults to No Mod.
     * @returns A `DifficultyAttributes` object describing the difficulty of the `Beatmap`.
     */
    calculate(beatmap: Beatmap, mods?: ModMap): TAttributes;

    calculate(beatmap: Beatmap | TBeatmap, mods?: ModMap): TAttributes {
        const playableBeatmap =
            beatmap instanceof PlayableBeatmap
                ? beatmap
                : this.createPlayableBeatmap(beatmap, mods);

        const skills = this.createSkills(playableBeatmap);
        const objects = this.createDifficultyHitObjects(playableBeatmap);

        for (const object of objects) {
            for (const skill of skills) {
                skill.process(object);
            }
        }

        return this.createDifficultyAttributes(
            playableBeatmap,
            skills,
            objects,
        );
    }

    /**
     * Obtains the strain peaks of a `PlayableBeatmap`.
     *
     * @param beatmap The `PlayableBeatmap` whose strain peaks are to be calculated.
     * @returns The strain peaks of the `PlayableBeatmap`.
     */
    calculateStrainPeaks(beatmap: TBeatmap): StrainPeaks;

    /**
     * Obtains the strain peaks of a `Beatmap` with specific `Mod`s.
     *
     * @param beatmap The `Beatmap` whose strain peaks are to be calculated.
     * @param mods The `Mod`s to apply to the beatmap. Defaults to No Mod.
     * @returns The strain peaks of the `Beatmap`.
     */
    calculateStrainPeaks(beatmap: Beatmap, mods?: ModMap): StrainPeaks;

    calculateStrainPeaks(
        beatmap: Beatmap | TBeatmap,
        mods?: ModMap,
    ): StrainPeaks {
        const playableBeatmap =
            beatmap instanceof PlayableBeatmap
                ? beatmap
                : this.createPlayableBeatmap(beatmap, mods);

        const skills = this.createStrainPeakSkills(playableBeatmap);
        const objects = this.createDifficultyHitObjects(playableBeatmap);

        for (const object of objects) {
            for (const skill of skills) {
                skill.process(object);
            }
        }

        return {
            aimWithSliders: skills[0].strainPeaks,
            aimWithoutSliders: skills[1].strainPeaks,
            speed: skills[2].strainPeaks,
            flashlight: skills[3].strainPeaks,
        };
    }

    /**
     * Creates the `Skill`s to calculate the difficulty of a `PlayableBeatmap`.
     *
     * @param beatmap The `PlayableBeatmap` whose difficulty will be calculated.
     * @return The `Skill`s.
     */
    protected abstract createSkills(beatmap: TBeatmap): Skill[];

    /**
     * Creates the `Skill`s to obtain the strain peaks of a `PlayableBeatmap`.
     *
     * @param beatmap
     */
    protected abstract createStrainPeakSkills(beatmap: TBeatmap): StrainSkill[];

    /**
     * Creates difficulty hitobjects for this calculator.
     *
     * @param beatmap The beatmap to generate difficulty hitobjects from.
     * @returns The generated difficulty hitobjects.
     */
    protected abstract createDifficultyHitObjects(
        beatmap: TBeatmap,
    ): THitObject[];

    /**
     * Creates a `DifficultyAttributes` object to describe a `PlayableBeatmap`'s difficulty.
     *
     * @param beatmap The `PlayableBeatmap` whose difficulty was calculated.
     * @param skills The `Skill`s which processed the `PlayableBeatmap`.
     * @param objects The `DifficultyHitObject`s which were processed.
     * @returns The `DifficultyAttributes` object.
     */
    protected abstract createDifficultyAttributes(
        beatmap: TBeatmap,
        skills: Skill[],
        objects: THitObject[],
    ): TAttributes;

    /**
     * Constructs a `PlayableBeatmap` from a `Beatmap` with specific `Mod`s.
     *
     * @param beatmap The `Beatmap` to create a `PlayableBeatmap` from.
     * @param mods The `Mod`s to apply to the `Beatmap`.
     * @returns The `PlayableBeatmap`.
     */
    protected abstract createPlayableBeatmap(
        beatmap: Beatmap,
        mods?: ModMap,
    ): TBeatmap;

    /**
     * Calculates the base rating of a `Skill`.
     *
     * @param skill The `Skill` to calculate the rating of.
     * @returns The rating of the `Skill`.
     */
    protected calculateRating(skill: Skill): number {
        return Math.sqrt(skill.difficultyValue()) * this.difficultyMultiplier;
    }

    /**
     * Calculates the base performance value of a difficulty rating.
     *
     * @param rating The difficulty rating.
     */
    protected basePerformanceValue(rating: number): number {
        return Math.pow(5 * Math.max(1, rating / 0.0675) - 4, 3) / 100000;
    }
}
