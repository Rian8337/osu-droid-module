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

    protected readonly _objectStrains: number[] = [];

    /**
     * The strains of hitobjects.
     */
    get objectStrains(): readonly number[] {
        return this._objectStrains;
    }

    /**
     * Returns the number of strains weighed against the top strain.
     *
     * The result is scaled by clock rate as it affects the total number of strains.
     */
    countDifficultStrains(): number {
        if (this._objectStrains.length === 0) {
            return 0;
        }

        const maxStrain = Math.max(...this._objectStrains);

        if (maxStrain === 0) {
            return 0;
        }

        return this._objectStrains.reduce(
            (total, next) => total + Math.pow(next / maxStrain, 4),
            0,
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
                const scale: number = Math.log10(
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
        return Math.pow(
            strains.reduce((a, v) => {
                if (v <= 0) {
                    return a;
                }

                return a + Math.pow(v, 1 / Math.log2(this.starsPerDouble));
            }, 0),
            Math.log2(this.starsPerDouble),
        );
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
