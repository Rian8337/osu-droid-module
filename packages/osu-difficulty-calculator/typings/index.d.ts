declare module "@rian8337/osu-difficulty-calculator" {
    import { Accuracy, Beatmap, HitObject, MapStats, Mod, modes, OsuHitWindow, Slider, Vector2 } from "@rian8337/osu-base";

    //#region Classes

    /**
     * Represents an osu!standard hit object with difficulty calculation values.
     */
    export class DifficultyHitObject {
        /**
         * The underlying hitobject.
         */
        readonly object: HitObject;
        /**
         * The aim strain generated by the hitobject if sliders are considered.
         */
        aimStrainWithSliders: number;

        /**
         * The aim strain generated by the hitobject if sliders are not considered.
         */
        aimStrainWithoutSliders: number;
        /**
         * The tap strain generated by the hitobject.
         */
        tapStrain: number;
        /**
         * The tap strain generated by the hitobject if `strainTime` isn't modified by
         * OD. This is used in three-finger detection.
         */
        originalTapStrain: number;
        /**
         * The rhythm multiplier generated by the hitobject.
         */
        rhythmMultiplier: number;
        /**
         * The flashlight strain generated by the hitobject.
         */
        flashlightStrain: number;
        /**
         * The normalized distance from the "lazy" end position of the previous hitobject to the start position of this hitobject.
         * 
         * The "lazy" end position is the position at which the cursor ends up if the previous hitobject is followed with as minimal movement as possible (i.e. on the edge of slider follow circles).
         */
        lazyJumpDistance: number;
        /**
         * The normalized shortest distance to consider for a jump between the previous hitobject and this hitobject.
         *
         * This is bounded from above by `lazyJumpDistance`, and is smaller than the former if a more natural path is able to be taken through the previous hitobject.
         *
         * Suppose a linear slider - circle pattern. Following the slider lazily (see: `lazyJumpDistance`) will result in underestimating the true end position of the slider as being closer towards the start position.
         * As a result, `lazyJumpDistance` overestimates the jump distance because the player is able to take a more natural path by following through the slider to its end,
         * such that the jump is felt as only starting from the slider's true end position.
         *
         * Now consider a slider - circle pattern where the circle is stacked along the path inside the slider.
         * In this case, the lazy end position correctly estimates the true end position of the slider and provides the more natural movement path.
         */
        minimumJumpDistance: number;
        /**
         * The time taken to travel through `minimumJumpDistance`, with a minimum value of 25ms.
         */
        minimumJumpTime: number;
        /**
         * The normalized distance between the start and end position of this hitobject.
         */
        travelDistance: number;
        /**
         * The time taken to travel through `travelDistance`, with a minimum value of 25ms for a non-zero distance.
         */
        travelTime: number;
        /**
         * Angle the player has to take to hit this hitobject.
         *
         * Calculated as the angle between the circles (current-2, current-1, current).
         */
        angle: number | null;
        /**
         * The amount of milliseconds elapsed between this hitobject and the last hitobject.
         */
        deltaTime: number;
        /**
         * The amount of milliseconds elapsed since the start time of the previous hitobject, with a minimum of 25ms.
         */
        strainTime: number;
        /**
         * Adjusted start time of the hitobject, taking speed multiplier into account.
         */
        startTime: number;
        /**
         * @param object The underlying hitobject.
         */
        constructor(object: HitObject);
    }

    /**
     * A converter used to convert normal hitobjects into difficulty hitobjects.
     */
    export class DifficultyHitObjectCreator {
        /**
         * The threshold for small circle buff for osu!droid.
         */
        private readonly DROID_CIRCLESIZE_BUFF_THRESHOLD: number;
        /**
         * The threshold for small circle buff for osu!standard.
         */
        private readonly PC_CIRCLESIZE_BUFF_THRESHOLD: number;
        /**
         * The radius of hitobjects.
         */
        private hitObjectRadius: number;
        /**
         * The base normalized radius of hitobjects.
         */
        private readonly normalizedRadius: number;
        /**
         * Generates difficulty hitobjects for difficulty calculation.
         */
        generateDifficultyObjects(params: {
            objects: HitObject[];
            circleSize: number;
            speedMultiplier: number;
            mode: modes;
        }): DifficultyHitObject[];
        /**
         * Calculates a slider's cursor position.
         */
        private calculateSliderCursorPosition(slider: Slider): void;
        /**
         * Gets the scaling factor of a radius.
         *
         * @param mode The mode to get the scaling factor from.
         * @param radius The radiust to get the scaling factor from.
         */
        private getScalingFactor(mode: modes, radius: number): number;
        /**
         * Returns the end cursor position of a hitobject.
         */
        private getEndCursorPosition(object: HitObject): Vector2;
    }

    /**
     * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
     */
    export class DroidAim extends DroidSkill {
        protected override readonly skillMultiplier: number;
        protected override readonly strainDecayBase: number;
        protected override readonly reducedSectionBaseline: number;
        protected override readonly reducedSectionCount: number;
        protected override readonly starsPerDouble: number;
        /**
         * Spacing threshold for a single hitobject spacing.
         */
        private readonly SINGLE_SPACING_THRESHOLD: number;
        private readonly minSpeedBonus: number;
        private readonly wideAngleMultiplier: number;
        private readonly acuteAngleMultiplier: number;
        private readonly sliderMultiplier: number;
        private readonly velocityChangeMultiplier: number;
        private readonly withSliders: boolean;
        constructor(mods: Mod[], withSliders: boolean);
        /**
         * @param current The hitobject to calculate.
         */
        protected strainValueOf(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to calculate.
         */
        protected override strainValueAt(current: DifficultyHitObject): number;
        /**
         * @param currentObject The hitobject to save to.
         */
        protected override saveToHitObject(current: DifficultyHitObject): void;
    }

    /**
     * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
     */
    export class DroidFlashlight extends DroidSkill {
        protected override readonly historyLength: number;
        protected override readonly skillMultiplier: number;
        protected override readonly strainDecayBase: number;
        protected override readonly reducedSectionBaseline: number;
        protected override readonly reducedSectionCount: number;
        protected override readonly starsPerDouble: number;
        /**
         * @param current The hitobject to calculate.
         */
        protected strainValueOf(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to calculate.
         */
        protected override strainValueAt(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to save to.
         */
        protected override saveToHitObject(current: DifficultyHitObject): void;
    }
    /**
     * A performance points calculator that calculates performance points for osu!droid gamemode.
     */
    export class DroidPerformanceCalculator extends PerformanceCalculator {
        override stars: DroidStarRating;
        protected override finalMultiplier: number;
        /**
         * The aim performance value.
         */
        aim: number;
        /**
         * The tap performance value.
         */
        tap: number;
        /**
         * The accuracy performance value.
         */
        accuracy: number;
        /**
         * The flashlight performance value.
         */
        flashlight: number;
        private averageRhythmMultiplier: number;
        override calculate(params: {
            /**
             * The star rating instance to calculate.
             */
            stars: DroidStarRating;
            /**
             * The maximum combo achieved in the score.
             */
            combo?: number;
            /**
             * The accuracy achieved in the score.
             */
            accPercent?: Accuracy | number;
            /**
             * The amount of misses achieved in the score.
             */
            miss?: number;
            /**
             * The tap penalty to apply for penalized scores.
             */
            tapPenalty?: number;
            /**
             * Custom map statistics to apply custom tap multiplier and force AR values as well as old statistics.
             */
            stats?: MapStats;
        }): this;
        /**
         * Calculates the average rhythm multiplier of the beatmap.
         */
        private calculateAverageRhythmMultiplier(): void;
        /**
         * Calculates the aim performance value of the beatmap.
         */
        private calculateAimValue(): void;
        /**
         * Calculates the tap performance value of the beatmap.
         */
        private calculateTapValue(): void;
        /**
         * Calculates the accuracy performance value of the beatmap.
         */
        private calculateAccuracyValue(): void;
        /**
         * Calculates the flashlight performance value of the beatmap.
         */
        private calculateFlashlightValue(): void;
        override toString(): string;
    }

    /**
     * Difficulty calculator for osu!droid gamemode.
     */
    export class DroidStarRating extends StarRating {
        /**
         * The aim star rating of the beatmap.
         */
        aim: number;
        /**
         * The tap star rating of the beatmap.
         */
        tap: number;
        /**
         * The flashlight star rating of the beatmap.
         */
        flashlight: number;
        protected override readonly difficultyMultiplier: number;
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
        calculate(params: {
            /**
             * The beatmap to calculate.
             */
            map: Beatmap;
            /**
             * Applied modifications.
             */
            mods?: Mod[];
            /**
             * Custom map statistics to apply custom tap multiplier as well as old statistics.
             */
            stats?: MapStats;
        }): this;
        /**
         * Calculates the aim star rating of the beatmap and stores it in this instance.
         */
        calculateAim(): void;
        /**
         * Calculates the tap star rating of the beatmap and stores it in this instance.
         */
        calculateTap(): void;
        /**
         * Calculates the flashlight star rating of the beatmap and stores it in this instance.
         */
        calculateFlashlight(): void;
        /**
         * Calculates the total star rating of the beatmap and stores it in this instance.
         */
        calculateTotal(): void;
        /**
         * Calculates every star rating of the beatmap and stores it in this instance.
         */
        calculateAll(): void;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
        /**
         * Creates skills to be calculated.
         */
        protected override createSkills(): DroidSkill[];
        /**
         * Calculates the base rating value of a difficulty.
         */
        private baseRatingValue(difficulty: number): number;
        /**
         * Calculates the base performance value of a difficulty rating.
         *
         * @param rating The difficulty rating.
         */
        private basePerformanceValue(rating: number): number;
    }

    /**
     * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
     */
    export class DroidTap extends DroidSkill {
        protected override readonly historyLength: number;
        protected override readonly skillMultiplier: number;
        protected override readonly strainDecayBase: number;
        protected override readonly reducedSectionBaseline: number;
        protected override readonly reducedSectionCount: number;
        protected override readonly starsPerDouble: number;
        private readonly minSpeedBonus: number;
        private currentTapStrain: number;
        private currentOriginalTapStrain: number;
        private readonly rhythmMultiplier: number;
        private readonly historyTimeMax: number;
        private currentRhythm: number;
        private readonly overallDifficulty: number;
        private readonly hitWindow: OsuHitWindow;
        constructor(mods: Mod[], overallDifficulty: number);
        /**
         * @param current The hitobject to calculate.
         */
        protected strainValueOf(current: DifficultyHitObject): number;
        /**
         * Calculates the tap strain of a hitobject given a specific speed bonus and strain time.
         */
        private tapStrainOf(speedBonus: number, strainTime: number): number;
        /**
         * @param current The hitobject to calculate.
         */
        protected override strainValueAt(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to save to.
         */
        protected override saveToHitObject(current: DifficultyHitObject): void;
    }

    /**
     * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
     */
    export class OsuAim extends OsuSkill {
        protected override readonly skillMultiplier: number;
        protected override readonly strainDecayBase: number;
        protected override readonly reducedSectionCount: number;
        protected override readonly reducedSectionBaseline: number;
        protected override readonly difficultyMultiplier: number;
        protected override readonly decayWeight: number;
        private readonly wideAngleMultiplier: number;
        private readonly acuteAngleMultiplier: number;
        private readonly sliderMultiplier: number;
        private readonly velocityChangeMultiplier: number;
        private readonly withSliders: boolean;
        constructor(mods: Mod[], withSliders: boolean);
        /**
         * @param current The hitobject to calculate.
         */
        protected strainValueOf(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to calculate.
         */
        protected override strainValueAt(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to save to.
         */
        protected override saveToHitObject(current: DifficultyHitObject): void;
    }

    /**
     * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
     */
    export class OsuFlashlight extends OsuSkill {
        protected override readonly historyLength: number;
        protected override readonly skillMultiplier: number;
        protected override readonly strainDecayBase: number;
        protected override readonly reducedSectionCount: number;
        protected override readonly reducedSectionBaseline: number;
        protected override readonly difficultyMultiplier: number;
        protected override readonly decayWeight: number;
        /**
         * @param current The hitobject to calculate.
         */
        protected strainValueOf(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to calculate.
         */
        protected override strainValueAt(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to save to.
         */
        protected override saveToHitObject(current: DifficultyHitObject): void;
    }

    /**
     * A performance points calculator that calculates performance points for osu!standard gamemode.
     */
    export class OsuPerformanceCalculator extends PerformanceCalculator {
        override stars: OsuStarRating;
        protected override finalMultiplier: number;
        /**
         * The aim performance value.
         */
        aim: number;
        /**
         * The speed performance value.
         */
        speed: number;
        /**
         * The accuracy performance value.
         */
        accuracy: number;
        /**
         * The flashlight performance value.
         */
        flashlight: number;
        override calculate(params: {
            /**
             * The star rating instance to calculate.
             */
            stars: OsuStarRating;
            /**
             * The maximum combo achieved in the score.
             */
            combo?: number;
            /**
             * The accuracy achieved in the score.
             */
            accPercent?: Accuracy | number;
            /**
             * The amount of misses achieved in the score.
             */
            miss?: number;
            /**
             * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
             */
            stats?: MapStats;
        }): this;
        /**
         * Calculates the aim performance value of the beatmap.
         */
        private calculateAimValue(): void;
        /**
         * Calculates the speed performance value of the beatmap.
         */
        private calculateSpeedValue(): void;
        /**
         * Calculates the accuracy performance value of the beatmap.
         */
        private calculateAccuracyValue(): void;
        /**
         * Calculates the flashlight performance value of the beatmap.
         */
        private calculateFlashlightValue(): void;
        override toString(): string;
    }

    /**
     * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
     */
    export class OsuSpeed extends OsuSkill {
        /**
         * Spacing threshold for a single hitobject spacing.
         */
        private readonly SINGLE_SPACING_THRESHOLD: number;
        private readonly angleBonusBegin: number;
        protected override readonly skillMultiplier: number;
        protected override readonly strainDecayBase: number;
        protected override readonly reducedSectionCount: number;
        protected override readonly reducedSectionBaseline: number;
        protected override readonly difficultyMultiplier: number;
        protected override readonly decayWeight: number;
        private readonly rhythmMultiplier: number;
        private readonly historyTimeMax: number;
        private currentSpeedStrain: number;
        private currentRhythm: number;
        private readonly minSpeedBonus: number;
        private readonly greatWindow: number;
        constructor(mods: Mod[], greatWindow: number);
        /**
         * @param current The hitobject to calculate.
         */
        protected strainValueOf(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to calculate.
         */
        protected override strainValueAt(current: DifficultyHitObject): number;
        /**
         * Calculates a rhythm multiplier for the difficulty of the tap associated with historic data of the current object.
         */
        private calculateRhythmBonus(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to save to.
         */
        protected override saveToHitObject(current: DifficultyHitObject): void;
    }

    /**
     * Difficulty calculator for osu!standard gamemode.
     */
    export class OsuStarRating extends StarRating {
        /**
         * The aim star rating of the beatmap.
         */
        aim: number;
        /**
         * The speed star rating of the beatmap.
         */
        speed: number;
        /**
         * The flashlight star rating of the beatmap.
         */
        flashlight: number;
        protected readonly difficultyMultiplier: number;
        calculate(params: {
            /**
             * The beatmap to calculate.
             */
            map: Beatmap;
            /**
             * Applied modifications.
             */
            mods?: Mod[];
            /**
             * Custom map statistics to apply custom speed multiplier as well as old statistics.
             */
            stats?: MapStats;
        }): this;
        /**
         * Calculates the aim star rating of the beatmap and stores it in this instance.
         */
        calculateAim(): void;
        /**
         * Calculates the speed star rating of the beatmap and stores it in this instance.
         */
        calculateSpeed(): void;
        /**
         * Calculates the flashlight star rating of the beatmap and stores it in this instance.
         */
        calculateFlashlight(): void;
        /**
         * Calculates the total star rating of the beatmap and stores it in this instance.
         */
        calculateTotal(): void;
        /**
         * Calculates every star rating of the beatmap and stores it in this instance.
         */
        calculateAll(): void;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
        /**
         * Creates skills to be calculated.
         */
        protected override createSkills(): OsuSkill[];
        /**
         * Calculates the base performance value of a difficulty rating.
         *
         * @param rating The difficulty rating.
         */
        private basePerformanceValue(rating: number): number;
        /**
         * Calculates the star rating value of a difficulty.
         *
         * @param difficulty The difficulty to calculate.
         */
        private starValue(difficulty: number): number;
    }

    //#endregion

    //#region Interfaces

    /**
     * Holds additional data that is used in difficulty calculation.
     */
    export interface DifficultyAttributes {
        speedNoteCount: number;
        sliderFactor: number;
    }

    /**
     * The strain peaks of various calculated difficulties.
     */
    export interface StrainPeaks {
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
    }

    //#endregion

    //#region Unexported classes

    /**
     * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
     * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
     */
    abstract class DroidSkill extends StrainSkill {
        /**
         * The bonus multiplier that is given for a sequence of notes of equal difficulty.
         */
        protected abstract readonly starsPerDouble: number;
        override difficultyValue(): number;
    }

    /**
     * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
     * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
     */
    abstract class OsuSkill extends StrainSkill {
        /**
         * The number of sections with the highest strains, which the peak strain reductions will apply to.
         * This is done in order to decrease their impact on the overall difficulty of the map for this skill.
         */
        protected abstract readonly reducedSectionCount: number;
        /**
         * The baseline multiplier applied to the section with the biggest strain.
         */
        protected abstract readonly reducedSectionBaseline: number;
        /**
         * The final multiplier to be applied to the final difficulty value after all other calculations.
         */
        protected abstract readonly difficultyMultiplier: number;
        /**
         * The weight by which each strain value decays.
         */
        protected abstract readonly decayWeight: number;
        override difficultyValue(): number;
    }

    /**
     * The base class of performance calculators.
     */
    abstract class PerformanceCalculator {
        /**
         * The overall performance value.
         */
        total: number;
        /**
         * The calculated accuracy.
         */
        computedAccuracy: Accuracy;
        /**
         * Bitwise value of enabled modifications.
         */
        protected convertedMods: number;
        /**
         * The calculated beatmap.
         */
        abstract stars: StarRating;
        /**
         * The map statistics after applying modifications.
         */
        protected mapStatistics: MapStats;
        /**
         * Penalty for combo breaks.
         */
        protected comboPenalty: number;
        /**
         * The global multiplier to be applied to the final performance value.
         *
         * This is being adjusted to keep the final value scaled around what it used to be when changing things.
         */
        protected abstract finalMultiplier: number;
        /**
         * The amount of misses that are filtered out from sliderbreaks.
         */
        protected effectiveMissCount: number;

        /**
         * Nerf factor used for nerfing beatmaps with very likely dropped sliderends.
         */
        protected sliderNerfFactor: number;
        /**
         * Calculates the performance points of a beatmap.
         */
        abstract calculate(params: {
            /**
             * The star rating instance to calculate.
             */
            stars: StarRating;
            /**
             * The maximum combo achieved in the score.
             */
            combo?: number;
            /**
             * The accuracy achieved in the score.
             */
            accPercent?: Accuracy | number;
            /**
             * The amount of misses achieved in the score.
             */
            miss?: number;
            /**
             * The gamemode to calculate.
             */
            mode?: modes;
            /**
             * The speed penalty to apply for penalized scores. Only applies to droid gamemode.
             */
            speedPenalty?: number;
            /**
             * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
             */
            stats?: MapStats;
        }): this;
        /**
         * Returns a string representative of the class.
         */
        abstract toString(): string;
        /**
         * Calculates the base performance value for of a star rating.
         */
        protected baseValue(stars: number): number;
        /**
         * Processes given parameters for usage in performance calculation.
         */
        protected handleParams(
            params: {
                /**
                 * The star rating instance to calculate.
                 */
                stars: StarRating;
                /**
                 * The maximum combo achieved in the score.
                 */
                combo?: number;
                /**
                 * The accuracy achieved in the score.
                 */
                accPercent?: Accuracy | number;
                /**
                 * The amount of misses achieved in the score.
                 */
                miss?: number;
                /**
                 * The gamemode to calculate.
                 */
                mode?: modes;
                /**
                 * The speed penalty to apply for penalized scores.
                 */
                speedPenalty?: number;
                /**
                 * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
                 */
                stats?: MapStats;
            },
            mode: modes
        ): void;
        /**
         * Calculates the amount of misses + sliderbreaks from combo.
         */
        private calculateEffectiveMissCount(combo: number, maxCombo: number): number;
    }

    /**
     * A bare minimal abstract skill for fully custom skill implementations.
     */
    abstract class Skill {
        /**
         * The hitobjects that were processed previously. They can affect the strain values of the following objects.
         *
         * The latest hitobject is at index 0.
         */
        protected readonly previous: DifficultyHitObject[];
        /**
         * Number of previous hitobjects to keep inside the `previous` array.
         */
        protected readonly historyLength: number;
        /**
         * The mods that this skill processes.
         */
        protected readonly mods: Mod[];
        processInternal(current: DifficultyHitObject): void;
        /**
         * Processes a hitobject.
         *
         * @param current The hitobject to process.
         */
        protected abstract process(current: DifficultyHitObject): void;
        /**
         * Returns the calculated difficulty value representing all hitobjects that have been processed up to this point.
         */
        abstract difficultyValue(): number;
    }

    /**
     * The base of difficulty calculation.
     */
    abstract class StarRating {
        /**
         * The calculated beatmap.
         */
        map: Beatmap;
        /**
         * The difficulty objects of the beatmap.
         */
        readonly objects: DifficultyHitObject[];
        /**
         * The modifications applied.
         */
        mods: Mod[];
        /**
         * The total star rating of the beatmap.
         */
        total: number;
        /**
         * The map statistics of the beatmap after modifications are applied.
         */
        stats: MapStats;
        /**
         * The strain peaks of various calculated difficulties.
         */
        readonly strainPeaks: StrainPeaks;
        /**
         * Additional data that is used in performance calculation.
         */
        readonly attributes: DifficultyAttributes;
        protected readonly sectionLength: number;
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
                 * Applied modifications.
                 */
                mods?: Mod[];
                /**
                 * Custom map statistics to apply custom speed multiplier as well as old statistics.
                 */
                stats?: MapStats;
            },
            mode: modes
        ): this;
        /**
         * Generates difficulty hitobjects for this calculator.
         *
         * @param mode The gamemode to generate difficulty hitobjects for.
         */
        generateDifficultyHitObjects(mode: modes): void;
        /**
         * Calculates the skills provided.
         *
         * @param skills The skills to calculate.
         */
        protected calculateSkills(...skills: Skill[]): void;
        /**
         * Calculates the total star rating of the beatmap and stores it in this instance.
         */
        abstract calculateTotal(): void;
        /**
         * Calculates every star rating of the beatmap and stores it in this instance.
         */
        abstract calculateAll(): void;
        /**
         * Generates the strain chart of this beatmap and returns the chart as a buffer.
         *
         * @param beatmapsetID The beatmapset ID to get background image from. If omitted, the background will be plain white.
         * @param color The color of the graph.
         */
        getStrainChart(
            beatmapsetID?: number,
            color?: string
        ): Promise<Buffer | null>;
        /**
         * Returns a string representative of the class.
         */
        abstract toString(): string;
        /**
         * Creates skills to be calculated.
         */
        protected abstract createSkills(): Skill[];
    }

    /**
     * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
     * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
     */
    abstract class StrainSkill extends Skill {
        /**
         * The strain of currently calculated hitobject.
         */
        protected currentStrain: number;

        /**
         * The current section's strain peak.
         */
        protected currentSectionPeak: number;

        /**
         * Strain peaks are stored here.
         */
        readonly strainPeaks: number[];
        /**
         * The number of sections with the highest strains, which the peak strain reductions will apply to.
         * This is done in order to decrease their impact on the overall difficulty of the map for this skill.
         */
        protected abstract readonly reducedSectionCount: number;

        /**
         * The baseline multiplier applied to the section with the biggest strain.
         */
        protected abstract readonly reducedSectionBaseline: number;

        /**
         * Strain values are multiplied by this number for the given skill. Used to balance the value of different skills between each other.
         */
        protected abstract readonly skillMultiplier: number;

        /**
         * Determines how quickly strain decays for the given skill.
         *
         * For example, a value of 0.15 indicates that strain decays to 15% of its original value in one second.
         */
        protected abstract readonly strainDecayBase: number;

        protected readonly sectionLength: number;

        protected currentSectionEnd: number;

        /**
         * Calculates the strain value of a hitobject and stores the value in it. This value is affected by previously processed objects.
         *
         * @param current The hitobject to process.
         */
        protected override process(current: DifficultyHitObject): void;

        /**
         * Saves the current peak strain level to the list of strain peaks, which will be used to calculate an overall difficulty.
         */
        saveCurrentPeak(): void;

        /**
         * Sets the initial strain level for a new section.
         *
         * @param offset The beginning of the new section in milliseconds, adjusted by speed multiplier.
         */
        protected startNewSectionFrom(offset: number): void;

        /**
         * Calculates strain decay for a specified time frame.
         *
         * @param ms The time frame to calculate.
         */
        protected strainDecay(ms: number): number;

        /**
         * Calculates the strain value at a hitobject.
         */
        protected abstract strainValueAt(current: DifficultyHitObject): number;

        /**
         * Saves the current strain to a hitobject.
         */
        protected abstract saveToHitObject(current: DifficultyHitObject): void;
    }

    //#endregion
}
