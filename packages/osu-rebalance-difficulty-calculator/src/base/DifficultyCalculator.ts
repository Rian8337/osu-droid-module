import {
    Beatmap,
    BeatmapHitObjects,
    HitWindow,
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
    ModTimeRamp,
    PlaceableHitObject,
    PlayableBeatmap,
    Slider,
    SliderRepeat,
    SliderTick,
    Utils,
} from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DifficultyAttributes } from "../structures/DifficultyAttributes";
import { StrainPeaks } from "../structures/StrainPeaks";
import { IHasPeakDifficulty } from "./IHasPeakDifficulty";
import { Skill } from "./Skill";
import { TimedDifficultyAttributes } from "../structures/TimedDifficultyAttributes";

/**
 * The base of a difficulty calculator.
 */
export abstract class DifficultyCalculator<
    TBeatmap extends PlayableBeatmap,
    THitObject extends DifficultyHitObject,
    TAttributes extends DifficultyAttributes,
> {
    /**
     * `Mod`s that adjust the difficulty of a beatmap.
     */
    protected readonly difficultyAdjustmentMods: (typeof Mod)[] = [
        ModDifficultyAdjust,
        ModRateAdjust,
        ModTimeRamp,
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
     * Calculates the difficulty of a `Beatmap` with specific `Mod`s.
     *
     * @param beatmap The `Beatmap` whose difficulty is to be calculated.
     * @param mods The `Mod`s to apply to the beatmap. Defaults to No Mod.
     * @returns A `DifficultyAttributes` object describing the difficulty of the `Beatmap`.
     */
    calculate(beatmap: Beatmap, mods?: ModMap): TAttributes {
        const playableBeatmap = this.createPlayableBeatmap(beatmap, mods);
        const skills = this.createSkills(playableBeatmap);
        const objects = this.createDifficultyHitObjects(playableBeatmap);

        for (const object of objects) {
            for (const skill of skills) {
                skill.process(object);
            }
        }

        return this.createDifficultyAttributes(
            beatmap,
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
            aimWithSliders: skills[0].peaks,
            aimWithoutSliders: skills[1].peaks,
            speed: skills[2].peaks,
            flashlight: skills[3].peaks,
        };
    }


    /**
     * Calculates the difficulty of a `Beatmap` with specific `Mod`s and returns a set of
     * `TimedDifficultyAttributes` representing the difficulty at every relevant time value in the `Beatmap`.
     *
     * @param beatmap The `Beatmap` whose difficulty is to be calculated.
     * @param mods The `Mod`s to apply to the `Beatmap`.
     * @return The set of `TimedDifficultyAttributes`.
     */
    calculateTimed(beatmap: Beatmap, mods?: ModMap): TimedDifficultyAttributes<TAttributes>[] {
        if (beatmap.hitObjects.objects.length === 0) {
            return [];
        }

        const playableBeatmap = this.createPlayableBeatmap(beatmap, mods);
        const attributes = Utils.initializeArray<TimedDifficultyAttributes<TAttributes>>(beatmap.hitObjects.objects.length);
        const skills = this.createSkills(playableBeatmap);
        const progressiveBeatmap = new ProgressiveCalculationBeatmap(playableBeatmap);

        const { objects } = playableBeatmap.hitObjects;
        const difficultyObjects = this.createDifficultyHitObjects(playableBeatmap);
        let currentIndex = 0;

        for (let i = 0; i < objects.length; ++i) {
            const obj = objects[i];

            progressiveBeatmap.hitObjects.add(obj);

            while (currentIndex < difficultyObjects.length && difficultyObjects[currentIndex].object.endTime <= obj.endTime) {
                for (const skill of skills) {
                    skill.process(difficultyObjects[currentIndex]);
                }

                ++currentIndex;
            }

            attributes[i] = {
                time: obj.endTime,
                attributes: this.createDifficultyAttributes(beatmap, progressiveBeatmap, skills, difficultyObjects.slice(0, currentIndex)),
                sliderCount: progressiveBeatmap.hitObjects.sliders,
                sliderTickCount: progressiveBeatmap.hitObjects.sliderTicks,
                sliderRepeatCount: progressiveBeatmap.hitObjects.sliderRepeatPoints
            };
        }

        return attributes;
    }

    /**
     * Creates the `Skill`s to calculate the difficulty of a `PlayableBeatmap`.
     *
     * @param beatmap The `PlayableBeatmap` whose difficulty will be calculated.
     * @returns The `Skill`s.
     */
    protected abstract createSkills(beatmap: TBeatmap): Skill[];

    /**
     * Creates the `Skill`s to obtain the strain peaks of a `PlayableBeatmap`.
     *
     * @param beatmap The `PlayableBeatmap` whose strain peaks will be calculated.
     * @returns The `Skill`s.
     */
    protected abstract createStrainPeakSkills(
        beatmap: TBeatmap,
    ): (Skill & IHasPeakDifficulty)[];

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
     * @param beatmap The `Beatmap` whose difficulty was calculated.
     * @param playableBeatmap The `PlayableBeatmap` whose difficulty was calculated.
     * @param skills The `Skill`s which processed the `PlayableBeatmap`.
     * @param objects The `DifficultyHitObject`s which were processed.
     * @returns The `DifficultyAttributes` object.
     */
    protected abstract createDifficultyAttributes(
        beatmap: Beatmap,
        playableBeatmap: PlayableBeatmap,
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
}

/**
 * A {@link PlayableBeatmap} for timed difficulty calculation.
 */
class ProgressiveCalculationBeatmap extends PlayableBeatmap {
    override get maxCombo(): number {
        return (this.hitObjects as ProgressiveCalculationHitObjects).maxCombo;
    }

    private readonly baseHitWindow: HitWindow;

    constructor(baseBeatmap: PlayableBeatmap) {
        super(baseBeatmap, baseBeatmap.mods);

        this.hitObjects = new ProgressiveCalculationHitObjects();
        this.baseHitWindow = baseBeatmap.hitWindow;
    }

    protected override createHitWindow(): HitWindow {
        return this.baseHitWindow;
    }
}

class ProgressiveCalculationHitObjects extends BeatmapHitObjects {
    maxCombo = 0;

    // We store these locally since the super class's getters iterate through all objects, which is inefficient for progressive calculation.
    private sliderTickCount = 0;
    private sliderRepeatCount = 0;

    override get sliderTicks(): number {
        return this.sliderTickCount;
    }

    override get sliderRepeatPoints(): number {
        return this.sliderRepeatCount;
    }

    override add(...objects: PlaceableHitObject[]) {
        super.add(...objects);

        for (const obj of objects) {
            if (obj instanceof Slider) {
                this.maxCombo += obj.nestedHitObjects.length;

                // Similarly, we loop through the nested hit objects since `Slider.ticks` also loops
                // through the nested hit objects, which is inefficient for progressive calculation.
                for (const nestedObj of obj.nestedHitObjects) {
                    if (nestedObj instanceof SliderTick) {
                        ++this.sliderTickCount;
                    } else if (nestedObj instanceof SliderRepeat) {
                        ++this.sliderRepeatCount;
                    }
                }
            } else {
                ++this.maxCombo;
            }
        }
    }

    override removeAt(index: number): PlaceableHitObject | null {
        const obj = super.removeAt(index);

        if (obj !== null) {
            if (obj instanceof Slider) {
                this.maxCombo -= obj.nestedHitObjects.length;

                // Similarly, we loop through the nested hit objects since `Slider.ticks` also loops
                // through the nested hit objects, which is inefficient for progressive calculation.
                for (const nestedObj of obj.nestedHitObjects) {
                    if (nestedObj instanceof SliderTick) {
                        --this.sliderTickCount;
                    } else if (nestedObj instanceof SliderRepeat) {
                        --this.sliderRepeatCount;
                    }
                }
            } else {
                --this.maxCombo;
            }
        }

        return obj;
    }
}