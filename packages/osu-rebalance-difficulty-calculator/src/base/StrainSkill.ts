import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { IHasPeakDifficulty } from "./IHasPeakDifficulty";
import { Skill } from "./Skill";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class StrainSkill extends Skill implements IHasPeakDifficulty {
    /**
     * The number of sections with the highest strains, which the peak strain reductions will apply to.
     * This is done in order to decrease their impact on the overall difficulty of the map for this skill.
     */
    protected readonly reducedSectionCount: number = 10;

    /**
     * The baseline multiplier applied to the section with the biggest strain.
     */
    protected readonly reducedSectionBaseline: number = 0.75;

    protected readonly _objectStrains: number[] = [];

    /**
     * The strains of hitobjects.
     */
    get objectStrains(): readonly number[] {
        return this._objectStrains;
    }

    private readonly strainPeaks: number[] = [];

    get peaks(): readonly number[] {
        return this.currentStrainPeaks;
    }

    private readonly sectionLength = 400;
    private currentStrain = 0;
    private currentSectionPeak = 0;
    private currentSectionEnd = 0;

    /**
     * Converts a difficulty value to a performance value.
     *
     * @param difficulty The difficulty value to convert.
     * @returns The performance value.
     */
    static difficultyToPerformance(difficulty: number): number {
        return Math.pow(5 * Math.max(1, difficulty / 0.0675) - 4, 3) / 100000;
    }

    /**
     * Obtains the live strain peaks for each {@link sectionLength} of the beatmap, including the peak of the current section.
     */
    get currentStrainPeaks(): number[] {
        return this.strainPeaks.concat(this.currentSectionPeak);
    }

    /**
     * Returns the number of strains weighed against the top strain.
     *
     * The result is scaled by clock rate as it affects the total number of strains.
     *
     * @param difficultyValue The final difficulty value.
     */
    countTopWeightedStrains(difficultyValue: number): number {
        if (difficultyValue === 0) {
            return 0;
        }

        // This is what the top strain is if all strain values were identical.
        const consistentTopStrain = difficultyValue / 10;

        if (consistentTopStrain === 0) {
            return this._objectStrains.length;
        }

        // Use a weighted sum of all strains.
        return this._objectStrains.reduce(
            (total, next) =>
                total +
                1.1 / (1 + Math.exp(-10 * (next / consistentTopStrain - 0.88))),
            0,
        );
    }

    protected override processInternal(current: DifficultyHitObject): number {
        // The first object doesn't generate a strain, so we begin with an incremented section end
        if (current.index === 0) {
            this.currentSectionEnd = this.calculateCurrentSectionStart(current);
        }

        while (current.startTime > this.currentSectionEnd) {
            this.saveCurrentPeak();
            this.startNewSectionFrom(this.currentSectionEnd, current);
            this.currentSectionEnd += this.sectionLength;
        }

        // Ignore the first hitobject.
        this.currentStrain = this.strainValueAt(current);

        this.saveToHitObject(current, this.currentStrain);

        this.currentSectionPeak = Math.max(
            this.currentStrain,
            this.currentSectionPeak,
        );

        return this.currentStrain;
    }

    /**
     * Calculates the starting time of a strain section at an object.
     *
     * @param current The object at which the strain section starts.
     * @returns The start time of the strain section.
     */
    protected calculateCurrentSectionStart(
        current: DifficultyHitObject,
    ): number {
        return (
            Math.ceil(current.startTime / this.sectionLength) *
            this.sectionLength
        );
    }

    /**
     * Calculates the strain value at a hitobject.
     *
     * @param current The hitobject to calculate.
     */
    protected abstract strainValueAt(current: DifficultyHitObject): number;

    /**
     * Retrieves the peak strain at a point in time.
     *
     * @param time The time to retrieve the peak strain at.
     * @param current The current hit object.
     * @returns The peak strain.
     */
    protected abstract calculateInitialStrain(
        time: number,
        current: DifficultyHitObject,
    ): number;

    /**
     * Saves the current peak strain level to the list of strain peaks, which will be used to calculate an overall difficulty.
     */
    private saveCurrentPeak(): void {
        this.strainPeaks.push(this.currentSectionPeak);
    }

    /**
     * Sets the initial strain level for a new section.
     *
     * @param time The beginning of the new section in milliseconds.
     * @param current The current hitobject.
     */
    private startNewSectionFrom(
        time: number,
        current: DifficultyHitObject,
    ): void {
        // The maximum strain of the new section is not zero by default.
        // This means we need to capture the strain level at the beginning of the new section, and use that as the initial peak level.
        this.currentSectionPeak = this.calculateInitialStrain(time, current);
    }
}
