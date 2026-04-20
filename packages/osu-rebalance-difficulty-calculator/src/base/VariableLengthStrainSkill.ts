import { Utils } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { StrainPeak } from "../structures/StrainPeak";
import { Skill } from "./Skill";
import { IHasPeakDifficulty } from "./IHasPeakDifficulty";

/**
 * A skill that evaluates strain over a variable length of time. A new strain peak is created for every
 * {@link DifficultyHitObject}.
 */
export abstract class VariableLengthStrainSkill
    extends Skill
    implements IHasPeakDifficulty
{
    /**
     * The weight by which each strain value decays.
     */
    protected readonly decayWeight: number = 0.9;

    /**
     * The maximum length of a strain section, in milliseconds.
     */
    protected readonly maxSectionLength: number = 400;

    /**
     * The number of {@link maxSectionLength} sections calculated such that enough of the difficulty value is preserved.
     *
     * This should be overridden if strains are ever used outside of {@link difficultyValue}, or if {@link difficultyValue}
     * is overridden to not use the default geometric sum.
     *
     * This should be removed in the future when a better memory-saving technique is implemented.
     */
    protected get maxStoredSections(): number {
        return 11 / (1 - this.decayWeight);
    }

    private currentSectionPeak = 0;
    private currentSectionBegin = 0;
    private currentSectionEnd = 0;
    private totalLength = 0;

    private readonly strainPeaks: StrainPeak[] = [];

    get peaks(): readonly number[] {
        return this.strainPeaks.map((s) => s.value);
    }

    /**
     * Stores previous strains so that, if a difficult {@link DifficultyHitObject} is followed by an easier
     * {@link DifficultyHitObject}, the difficult one gets a full strain instead of being cut short.
     */
    private readonly queuedStrains: QueuedStrain[] = [];

    static difficultyToPerformance(difficulty: number): number {
        return 4 * Math.pow(difficulty, 3);
    }

    /**
     * Obtains the live strain peaks for each {@link maxSectionLength} of the beatmap, including the
     * peak of the current section.
     */
    getCurrentStrainPeaks(): StrainPeak[] {
        return this.strainPeaks.concat(
            new StrainPeak(
                this.currentSectionPeak,
                this.currentSectionEnd - this.currentSectionBegin,
            ),
        );
    }

    override difficultyValue(): number {
        // Sections with 0 strain are excluded to avoid worst-case time complexity of the following sort (e.g. /b/2351871).
        // These sections will not contribute to the difficulty.
        const strains = this.getCurrentStrainPeaks()
            .filter((s) => s.value > 0)
            .sort((a, b) => {
                if (a.value === b.value) {
                    return b.sectionLength - a.sectionLength;
                }

                return b.value - a.value;
            });

        // Time is measured in units of strains.
        let time = 0;
        let difficulty = 0;

        for (const strain of strains) {
            /* Weighting function can be thought of as:
                    b
                    ∫ decayWeight^x dx
                    a
                where a = startTime and b = endTime

                Technically, the function below has been slightly modified from the equation above.
                The real function would be
                    double weight = Math.pow(this.decayWeight, startTime) - Math.pow(this.decayWeight, endTime))
                    ...
                    return difficulty / Math.log(1 / this.decayWeight)
                E.g. for a decayWeight of 0.9, we're multiplying by 10 instead of 9.49122...

                This change makes it so that a beatmap composed solely of maxSectionLength chunks will have the exact same value
                when summed in this class and StrainSkill.
                Doing this ensures the relationship between strain values and difficulty values remains the same between the two
                classes.
            */
            const startTime = time;
            const endTime = time + strain.sectionLength;

            const weight =
                Math.pow(this.decayWeight, startTime) -
                Math.pow(this.decayWeight, endTime);

            difficulty += strain.value * weight;
            time = endTime;
        }

        return difficulty / (1 - this.decayWeight);
    }

    /**
     * Returns the number of strains weighed against the top strain.
     *
     * The result is scaled by clock rate as it affects the total number of strains.
     */
    countTopWeightedStrains(difficultyValue: number): number {
        if (this.objectDifficulties.length === 0) {
            return 0;
        }

        // This is what the top strain is if all strain values were identical.
        const consistentTopStrain = difficultyValue * (1 - this.decayWeight);

        if (consistentTopStrain === 0) {
            return this.objectDifficulties.length;
        }

        // Use a weighted sum of all strains.
        return this.objectDifficulties.reduce(
            (total, next) =>
                total +
                1.1 / (1 + Math.exp(-10 * (next / consistentTopStrain - 0.88))),
            0,
        );
    }

    protected override processInternal(current: DifficultyHitObject): number {
        if (current.index === 0) {
            this.currentSectionBegin = current.startTime;
            this.currentSectionEnd =
                this.currentSectionBegin + this.maxSectionLength;

            this.currentSectionPeak = this.strainValueAt(current);
            return this.currentSectionPeak;
        }

        this.backfillPeaks(current);

        const currentStrain = this.strainValueAt(current);

        // If the current strain is larger than the current peak, begin a new peak.
        // Otherwise, add it to the queue.
        if (currentStrain > this.currentSectionPeak) {
            // Clear the queue since none of the strains in there would contribute to difficulty.
            this.queuedStrains.length = 0;

            // End the current section with the new peak.
            this.saveCurrentPeak(current.startTime - this.currentSectionBegin);

            // Set up the new section to start at the current object with the current strain.
            this.currentSectionBegin = current.startTime;
            this.currentSectionEnd =
                this.currentSectionBegin + this.maxSectionLength;
            this.currentSectionPeak = currentStrain;
        } else {
            // Empty the queue of smaller elements as they would not contribute to difficulty.
            while (
                this.queuedStrains.length > 0 &&
                this.queuedStrains.at(-1)!.strainValue < currentStrain
            ) {
                this.queuedStrains.pop();
            }

            this.queuedStrains.push({
                strainValue: currentStrain,
                startTime: current.startTime,
            });
        }

        return currentStrain;
    }

    /**
     * Calculates the strain value at the {@link DifficultyHitObject}. This value is calculated with or without respect to
     * previous {@link DifficultyHitObject}s.
     *
     * @param current The {@link DifficultyHitObject} for which the strain value should be calculated.
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
     * Fills the space between the end of the current section and the current {@link DifficultyHitObject}, if any.
     *
     * @param current The current {@link DifficultyHitObject}.
     */
    private backfillPeaks(current: DifficultyHitObject) {
        // If the current object starts after the current section ends, we want to start a new section without any harsh drop-off.
        // If we have previous strains that influence the current difficulty, we will prioritize those first.
        // Otherwise, start with the current object's initial strain.
        while (current.startTime > this.currentSectionEnd) {
            // Save the current peak, marking the end of the section.
            this.saveCurrentPeak(
                this.currentSectionEnd - this.currentSectionBegin,
            );

            this.currentSectionBegin = this.currentSectionEnd;

            // If we have queued strains, use those until the object falls into the new section.
            if (this.queuedStrains.length > 0) {
                const { strainValue, startTime } = this.queuedStrains.shift()!;

                // We want the section to end `maxSectionLength` after the strain we are using as an influence.
                // This means the queued strain will exist in its own section if the gap between it and the object is large enough.
                // This ensures there's no harsh difficulty difference between 2 sections if such a gap exists.
                this.currentSectionEnd = startTime + this.maxSectionLength;
                this.startNewSectionFrom(this.currentSectionBegin, current);

                // If the current object's peak was higher, we do not want to override it with a lower strain.
                // Only use the queued strain if it contributes more difficulty.
                this.currentSectionPeak = Math.max(
                    this.currentSectionPeak,
                    strainValue,
                );
            } else {
                // If the queue is empty, we should start the section from the object instead.
                // The queue can be empty if we are starting off of the back of a new peak, or if we drained through all the
                // queue and the object is still later than the section end.
                this.currentSectionEnd =
                    this.currentSectionBegin + this.maxSectionLength;
                this.startNewSectionFrom(this.currentSectionBegin, current);
            }
        }
    }

    /**
     * Saves the current peak strain level to the list of strain peaks, which will be used to calculate an overall difficulty.
     */
    private saveCurrentPeak(sectionLength: number) {
        this.addStrainPeakInPlace(
            new StrainPeak(this.currentSectionPeak, sectionLength),
        );

        this.totalLength += sectionLength;

        // Remove from the front of our strain peaks if there is any which are too deep to contribute to difficulty.
        // `maxStoredSections` dictates for us how many sections will preserve at least 99.999% of difficulty.
        const maxTotalLength = this.maxStoredSections * this.maxSectionLength;

        while (this.totalLength > maxTotalLength) {
            this.totalLength -= this.strainPeaks.shift()!.sectionLength;
        }
    }

    private startNewSectionFrom(time: number, current: DifficultyHitObject) {
        // The maximum strain of the new section is not zero by default.
        // This means we need to capture the strain level at the beginning of the new section, and use that as the initial
        // peak level.
        this.currentSectionPeak = this.calculateInitialStrain(time, current);
    }

    private addStrainPeakInPlace(strainPeak: StrainPeak) {
        const { index } = Utils.binarySearch(this.strainPeaks, (s) =>
            s.compareTo(strainPeak),
        );

        this.strainPeaks.splice(index, 0, strainPeak);
    }
}

interface QueuedStrain {
    readonly strainValue: number;
    readonly startTime: number;
}
