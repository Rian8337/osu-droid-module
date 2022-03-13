import { Interpolation, MathUtils } from "@rian8337/osu-base";
import { StrainSkill } from "../base/StrainSkill";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class DroidSkill extends StrainSkill {
    /**
     * The bonus multiplier that is given for a sequence of notes of equal difficulty.
     */
    protected abstract readonly starsPerDouble: number;

    override difficultyValue(): number {
        const sortedStrains: number[] = this.strainPeaks
            .slice()
            .sort((a, b) => {
                return b - a;
            });

        // We are reducing the highest strains first to account for extreme difficulty spikes.
        for (
            let i = 0;
            i < Math.min(sortedStrains.length, this.reducedSectionCount);
            ++i
        ) {
            const scale: number = Math.log10(
                Interpolation.lerp(
                    1,
                    10,
                    MathUtils.clamp(i / this.reducedSectionCount, 0, 1)
                )
            );

            sortedStrains[i] *= Interpolation.lerp(
                this.reducedSectionBaseline,
                1,
                scale
            );
        }

        // Math here preserves the property that two notes of equal difficulty x, we have their summed difficulty = x * starsPerDouble.
        // This also applies to two sets of notes with equal difficulty.
        return Math.pow(
            sortedStrains.reduce(
                (a, v) => a + Math.pow(v, 1 / Math.log2(this.starsPerDouble)),
                0
            ),
            Math.log2(this.starsPerDouble)
        );
    }
}
