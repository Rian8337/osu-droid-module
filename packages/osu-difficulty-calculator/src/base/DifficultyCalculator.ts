import { Beatmap, Mod, MapStats, Utils, Modes } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DifficultyHitObjectCreator } from "../preprocessing/DifficultyHitObjectCreator";
import { StrainSkill } from "./StrainSkill";
import { DifficultyCalculationOptions } from "../structures/DifficultyCalculationOptions";
import { DifficultyAttributes } from "../structures/DifficultyAttributes";
import { StrainPeaks } from "../structures/StrainPeaks";

/**
 * The base of difficulty calculators.
 */
export abstract class DifficultyCalculator {
    /**
     * The calculated beatmap.
     */
    readonly beatmap: Beatmap;

    /**
     * The difficulty objects of the beatmap.
     */
    readonly objects: DifficultyHitObject[] = [];

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
     * Additional data that is used in performance calculation.
     */
    readonly attributes: DifficultyAttributes = {
        speedNoteCount: 0,
        sliderFactor: 1,
    };

    protected readonly sectionLength: number = 400;
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

        this.stats = new MapStats({
            cs: this.beatmap.difficulty.cs,
            ar: this.beatmap.difficulty.ar,
            od: this.beatmap.difficulty.od,
            hp: this.beatmap.difficulty.hp,
            mods: options?.mods,
            speedMultiplier: options?.stats?.speedMultiplier,
            oldStatistics: options?.stats?.oldStatistics,
        }).calculate({ mode: this.mode });

        this.generateDifficultyHitObjects();

        this.calculateAll();

        return this;
    }

    /**
     * Generates difficulty hitobjects for this calculator.
     */
    generateDifficultyHitObjects(): void {
        this.objects.length = 0;
        this.objects.push(
            ...new DifficultyHitObjectCreator().generateDifficultyObjects({
                objects: this.beatmap.hitObjects.objects,
                circleSize: this.beatmap.difficulty.cs,
                mods: this.mods,
                speedMultiplier: this.stats.speedMultiplier,
                mode: this.mode,
                preempt: MapStats.arToMS(this.stats.ar!),
            })
        );
    }

    /**
     * Calculates the skills provided.
     *
     * @param skills The skills to calculate.
     */
    protected calculateSkills(...skills: StrainSkill[]): void {
        // The first object doesn't generate a strain, so we begin calculating from the second object.
        this.objects.slice(1).forEach((h, i) => {
            skills.forEach((skill) => {
                skill.process(h);

                if (i === this.objects.length - 2) {
                    // Don't forget to save the last strain peak, which would otherwise be ignored.
                    skill.saveCurrentPeak();
                }
            });
        });
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
    protected abstract createSkills(): StrainSkill[];

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
