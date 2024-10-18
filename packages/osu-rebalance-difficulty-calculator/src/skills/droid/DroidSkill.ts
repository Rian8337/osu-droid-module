import { Interpolation, MathUtils } from "@rian8337/osu-base";
import { StrainSkill } from "../../base/StrainSkill";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class DroidSkill extends StrainSkill {
    /**
     * The bonus multiplier that is given for a sequence of notes of equal difficulty.
     */
    protected abstract readonly starsPerDouble: number;

    /**
     * The minimum number of strains to judge when computing for retryability.
     */
    protected readonly minimumRetryabilityStrains: number = 500;

    /**
     * Computes the retryability of the beatmap based on the strains of the hitobjects.
     *
     * Earlier difficult strains indicate higher retryability.
     *
     * The result is scaled by clock rate as it affects the total number of strains.
     *
     * @returns A number between 0 and 1. A higher value indicates higher retryability.
     */
    countRetryability(): number {
        if (this._objectStrains.length === 0) {
            return 0;
        }

        const maxStrain = Math.max(...this._objectStrains);

        if (maxStrain === 0) {
            return 0;
        }

        let weightedStrainSum = 0;

        for (let i = 0; i < this._objectStrains.length; ++i) {
            const strainRatio = this._objectStrains[i] / maxStrain;

            // Give more weight to earlier strains.
            const strainPositionWeight =
                1 - Math.pow(i / this._objectStrains.length, 0.75) / 10;

            weightedStrainSum += strainRatio * strainPositionWeight;
        }

        return (
            1 -
            weightedStrainSum /
                Math.max(
                    this._objectStrains.length,
                    this.minimumRetryabilityStrains,
                )
        );
    }

    override process(current: DifficultyHitObject): void {
        super.process(current);

        this._objectStrains.push(this.getObjectStrain(current));
    }

    override difficultyValue(): number {
        const strains = this.strainPeaks.slice();

        if (this.reducedSectionCount > 0) {
            strains.sort((a, b) => b - a);

            // We are reducing the highest strains first to account for extreme difficulty spikes.
            for (
                let i = 0;
                i < Math.min(strains.length, this.reducedSectionCount);
                ++i
            ) {
                const scale = Math.log10(
                    Interpolation.lerp(
                        1,
                        10,
                        MathUtils.clamp(i / this.reducedSectionCount, 0, 1),
                    ),
                );

                strains[i] *= Interpolation.lerp(
                    this.reducedSectionBaseline,
                    1,
                    scale,
                );
            }
        }

        // Math here preserves the property that two notes of equal difficulty x, we have their summed difficulty = x * starsPerDouble.
        // This also applies to two sets of notes with equal difficulty.
        this.difficulty = 0;

        for (const strain of strains) {
            this.difficulty += Math.pow(
                strain,
                1 / Math.log2(this.starsPerDouble),
            );
        }

        this.difficulty = Math.pow(
            this.difficulty,
            Math.log2(this.starsPerDouble),
        );

        return this.difficulty;
    }

    /**
     * Gets the strain of a hitobject.
     *
     * @param current The hitobject to get the strain from.
     * @returns The strain of the hitobject.
     */
    protected abstract getObjectStrain(current: DifficultyHitObject): number;

    protected override calculateCurrentSectionStart(
        current: DifficultyHitObject,
    ): number {
        return current.startTime;
    }
}
