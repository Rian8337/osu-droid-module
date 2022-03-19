import { Beatmap, Mod, MapStats, modes, Utils } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DifficultyHitObjectCreator } from "../preprocessing/DifficultyHitObjectCreator";
import { StrainSkill } from "./StrainSkill";
import { DifficultyAttributes } from "./DifficultyAttributes";

/**
 * The base of difficulty calculation.
 */
export abstract class StarRating {
    /**
     * The calculated beatmap.
     */
    map: Beatmap = new Beatmap();

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
    readonly strainPeaks: {
        /**
         * The strain peaks of aim difficulty if sliders are considered.
         */
        aimWithSliders: number[];
        /**
         * The strain peaks of aim difficulty if sliders are not considered.
         */
        aimWithoutSliders: number[];
        /**
         * The strain peaks of speed difficulty.
         */
        speed: number[];
        /**
         * The strain peaks of flashlight difficulty.
         */
        flashlight: number[];
    } = {
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
        aimDifficultStrainCount: 0,
        speedDifficultStrainCount: 0,
    };

    protected readonly sectionLength: number = 400;
    protected abstract readonly difficultyMultiplier: number;

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
     * The first object doesn't generate a strain
     * so we begin calculating from the second object.
     *
     * Also don't forget to manually add the peak strain for the last
     * section which would otherwise be ignored.
     */
    protected calculate(
        params: {
            /**
             * The beatmap to calculate.
             */
            map: Beatmap;

            /**
             * Applied modifications in osu!standard format.
             */
            mods?: Mod[];

            /**
             * Custom map statistics to apply custom speed multiplier as well as old statistics.
             */
            stats?: MapStats;
        },
        mode: modes
    ): this {
        const map: Beatmap = (this.map = Utils.deepCopy(params.map));

        const mod: Mod[] = (this.mods = params.mods ?? this.mods);

        this.stats = new MapStats({
            cs: map.cs,
            ar: map.ar,
            od: map.od,
            hp: map.hp,
            mods: mod,
            speedMultiplier: params.stats?.speedMultiplier ?? 1,
            oldStatistics: params.stats?.oldStatistics ?? false,
        }).calculate({ mode: mode });

        this.generateDifficultyHitObjects(mode);
        this.calculateAll();

        return this;
    }

    /**
     * Generates difficulty hitobjects for this calculator.
     *
     * @param mode The gamemode to generate difficulty hitobjects for.
     */
    generateDifficultyHitObjects(mode: modes): void {
        this.objects.length = 0;
        this.objects.push(
            ...new DifficultyHitObjectCreator().generateDifficultyObjects({
                objects: this.map.objects,
                circleSize: <number>this.stats.cs,
                speedMultiplier: this.stats.speedMultiplier,
                mode: mode,
            })
        );
    }

    /**
     * Calculates the skills provided.
     *
     * @param skills The skills to calculate.
     */
    protected calculateSkills(...skills: StrainSkill[]): void {
        this.objects.slice(1).forEach((h, i) => {
            skills.forEach((skill) => {
                skill.processInternal(h);

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
