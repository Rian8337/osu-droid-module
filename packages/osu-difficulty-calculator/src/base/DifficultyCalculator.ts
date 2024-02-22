import { Beatmap, Mod, MapStats, Utils, Modes } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DifficultyAttributes } from "../structures/DifficultyAttributes";
import { StrainPeaks } from "../structures/StrainPeaks";
import { DifficultyCalculationOptions } from "../structures/DifficultyCalculationOptions";
import { Skill } from "./Skill";
import { CacheableDifficultyAttributes } from "../structures/CacheableDifficultyAttributes";

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
    readonly objects: THitObject[] = [];

    /**
     * The modifications applied.
     */
    mods: Mod[] = [];

    /**
     * The total star rating of the beatmap.
     */
    total: number = 0;

    /**
     * The map statistics of the beatmap after modifications are applied.
     */
    stats: MapStats = new MapStats();

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

    protected abstract readonly difficultyMultiplier: number;
    protected abstract readonly mode: Modes;

    /**
     * Constructs a new instance of the calculator.
     *
     * @param beatmap The beatmap to calculate. This beatmap will be deep-cloned to prevent reference changes.
     */
    constructor(beatmap: Beatmap) {
        this.beatmap = Utils.deepCopy(beatmap);
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
     * @param options Options for the difficulty calculation.
     * @returns The current instance.
     */
    calculate(options?: DifficultyCalculationOptions): this {
        this.mods = options?.mods ?? [];
        const { difficulty } = this.beatmap;

        this.stats = new MapStats({
            ...options?.stats,
            cs: options?.stats?.forceCS
                ? options.stats.cs ?? difficulty.cs
                : difficulty.cs,
            ar: options?.stats?.forceAR
                ? options.stats.ar ?? difficulty.ar
                : difficulty.ar,
            od: options?.stats?.forceOD
                ? options.stats.od ?? difficulty.od
                : difficulty.od,
            hp: options?.stats?.forceHP
                ? options.stats.hp ?? difficulty.hp
                : difficulty.hp,
            mods: options?.mods,
        }).calculate({ mode: this.mode });

        this.preProcess();

        this.populateDifficultyAttributes();

        this.objects.push(...this.generateDifficultyHitObjects());

        this.calculateAll();

        return this;
    }

    /**
     * Generates difficulty hitobjects for this calculator.
     */
    protected abstract generateDifficultyHitObjects(): THitObject[];

    /**
     * Performs some pre-processing before proceeding with difficulty calculation.
     */
    protected preProcess(): void {
        void 0;
    }

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
     */
    protected populateDifficultyAttributes(): void {
        this.attributes.approachRate = this.stats.ar!;
        this.attributes.hitCircleCount = this.beatmap.hitObjects.circles;
        this.attributes.maxCombo = this.beatmap.maxCombo;
        this.attributes.mods = this.mods.slice();
        this.attributes.overallDifficulty = this.stats.od!;
        this.attributes.sliderCount = this.beatmap.hitObjects.sliders;
        this.attributes.spinnerCount = this.beatmap.hitObjects.spinners;
        this.attributes.clockRate = this.stats.speedMultiplier;
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
