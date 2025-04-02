import {
    Beatmap,
    DroidHitWindow,
    Mod,
    ModAutopilot,
    ModCustomSpeed,
    ModDifficultyAdjust,
    ModDoubleTime,
    ModEasy,
    Modes,
    ModFlashlight,
    ModHalfTime,
    ModHardRock,
    ModHidden,
    ModNightCore,
    ModPrecise,
    ModRelax,
    ModUtil,
    OsuHitWindow,
    PreciseDroidHitWindow,
} from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { CacheableDifficultyAttributes } from "../structures/CacheableDifficultyAttributes";
import { DifficultyAttributes } from "../structures/DifficultyAttributes";
import { StrainPeaks } from "../structures/StrainPeaks";
import { Skill } from "./Skill";

/**
 * The base of a difficulty calculator.
 */
export abstract class DifficultyCalculator<
    THitObject extends DifficultyHitObject,
    TAttributes extends DifficultyAttributes,
> {
    /**
     * The calculated beatmap.
     */
    readonly beatmap: Beatmap;

    /**
     * The difficulty objects of the beatmap.
     */
    private _objects: THitObject[] = [];

    /**
     * The difficulty objects of the beatmap.
     */
    get objects(): readonly THitObject[] {
        return this._objects;
    }

    /**
     * The modifications applied.
     */
    mods: Mod[] = [];

    /**
     * The total star rating of the beatmap.
     */
    get total(): number {
        return this.attributes.starRating;
    }

    /**
     * The strain peaks of various calculated difficulties.
     */
    readonly strainPeaks: StrainPeaks = {
        aimWithSliders: [],
        aimWithoutSliders: [],
        speed: [],
        flashlight: [],
    };

    /**
     * The difficulty attributes that can be used to calculate performance points.
     */
    abstract readonly attributes: TAttributes;

    /**
     * The difficulty attributes that can be cached. It can also be used to calculate performance points.
     */
    abstract get cacheableAttributes(): CacheableDifficultyAttributes<TAttributes>;

    /**
     * `Mod`s that adjust the difficulty of a beatmap.
     */
    protected readonly difficultyAdjustmentMods = new Set<typeof Mod>([
        ModDoubleTime,
        ModNightCore,
        ModDifficultyAdjust,
        ModCustomSpeed,
        ModHalfTime,
        ModEasy,
        ModHardRock,
        ModFlashlight,
        ModHidden,
        ModRelax,
        ModAutopilot,
    ]);

    protected abstract readonly difficultyMultiplier: number;
    protected abstract readonly mode: Modes;

    /**
     * Constructs a new instance of the calculator.
     *
     * @param beatmap The beatmap to calculate.
     */
    constructor(beatmap: Beatmap) {
        this.beatmap = beatmap;
    }

    /**
     * Retains `Mod`s that adjust a beatmap's difficulty from the specified mods.
     *
     * @param mods The mods to retain the difficulty adjustment mods from.
     * @returns The retained difficulty adjustment mods.
     */
    retainDifficultyAdjustmentMods(mods: Mod[]): Mod[] {
        return mods.filter((mod) =>
            this.difficultyAdjustmentMods.has(mod.constructor as typeof Mod),
        );
    }

    /**
     * Calculates the star rating of the specified beatmap.
     *
     * The beatmap is analyzed in chunks of `sectionLength` duration.
     * For each chunk the highest hitobject strains are added to
     * a list which is then collapsed into a weighted sum, much
     * like scores are weighted on a user's profile.
     *
     * For subsequent chunks, the initial max strain is calculated
     * by decaying the previous hitobject's strain until the
     * beginning of the new chunk.
     *
     * @param mods The `Mod`s to use for the calculation. Defaults to No Mod.
     * @returns The current instance.
     */
    calculate(mods: Mod[] = []): this {
        this.mods = mods.slice();

        const playableBeatmap = this.beatmap.createPlayableBeatmap({
            mode: this.mode,
            mods: this.mods,
        });

        const clockRate = ModUtil.calculateRateWithMods(mods);

        this.populateDifficultyAttributes(playableBeatmap, clockRate);

        this._objects = this.generateDifficultyHitObjects(
            playableBeatmap,
            clockRate,
        );

        this.calculateAll();

        return this;
    }

    /**
     * Generates difficulty hitobjects for this calculator.
     *
     * @param beatmap The beatmap to generate difficulty hitobjects from.
     * @param clockRate The clock rate of the beatmap.
     */
    protected abstract generateDifficultyHitObjects(
        beatmap: Beatmap,
        clockRate: number,
    ): THitObject[];

    /**
     * Calculates the skills provided.
     *
     * @param skills The skills to calculate.
     */
    protected calculateSkills(...skills: Skill[]): void {
        // The first object doesn't generate a strain, so we begin calculating from the second object.
        for (const object of this.objects.slice(1)) {
            for (const skill of skills) {
                skill.process(object);
            }
        }
    }

    /**
     * Calculates the total star rating of the beatmap and stores it in this instance.
     */
    abstract calculateTotal(): void;

    /**
     * Calculates every star rating of the beatmap and stores it in this instance.
     */
    abstract calculateAll(): void;

    /**
     * Returns a string representative of the class.
     */
    abstract toString(): string;

    /**
     * Creates skills to be calculated.
     */
    protected abstract createSkills(): Skill[];

    /**
     * Populates the stored difficulty attributes with necessary data.
     *
     * @param beatmap The beatmap to populate the attributes with.
     * @param clockRate The clock rate of the beatmap.
     */
    protected populateDifficultyAttributes(
        beatmap: Beatmap,
        clockRate: number,
    ): void {
        this.attributes.hitCircleCount = this.beatmap.hitObjects.circles;
        this.attributes.maxCombo = this.beatmap.maxCombo;
        this.attributes.mods = this.mods.slice();
        this.attributes.sliderCount = this.beatmap.hitObjects.sliders;
        this.attributes.spinnerCount = this.beatmap.hitObjects.spinners;
        this.attributes.clockRate = clockRate;

        let greatWindow: number;

        switch (this.mode) {
            case Modes.droid:
                if (this.mods.some((m) => m instanceof ModPrecise)) {
                    greatWindow = new PreciseDroidHitWindow(
                        beatmap.difficulty.od,
                    ).greatWindow;
                } else {
                    greatWindow = new DroidHitWindow(beatmap.difficulty.od)
                        .greatWindow;
                }

                break;

            case Modes.osu:
                greatWindow = new OsuHitWindow(beatmap.difficulty.od)
                    .greatWindow;

                break;
        }

        this.attributes.overallDifficulty = OsuHitWindow.greatWindowToOD(
            greatWindow / clockRate,
        );
    }

    /**
     * Calculates the star rating value of a difficulty.
     *
     * @param difficulty The difficulty to calculate.
     */
    protected starValue(difficulty: number): number {
        return Math.sqrt(difficulty) * this.difficultyMultiplier;
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
