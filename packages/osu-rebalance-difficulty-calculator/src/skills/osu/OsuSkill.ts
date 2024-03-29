import { Interpolation, MathUtils } from "@rian8337/osu-base";
import { StrainSkill } from "../../base/StrainSkill";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class OsuSkill extends StrainSkill {
    /**
     * The default multiplier applied to the final difficulty value after all other calculations.
     *
     * May be overridden via {@link difficultyMultiplier}.
     */
    static readonly defaultDifficultyMultiplier: number = 1.06;

    /**
     * The final multiplier to be applied to the final difficulty value after all other calculations.
     */
    protected readonly difficultyMultiplier: number =
        OsuSkill.defaultDifficultyMultiplier;

    /**
     * The weight by which each strain value decays.
     */
    protected abstract readonly decayWeight: number;

    override difficultyValue(): number {
        const strains: number[] = this.strainPeaks
            .slice()
            .sort((a, b) => b - a);

        if (this.reducedSectionCount > 0) {
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
                        MathUtils.clamp(i / this.reducedSectionCount, 0, 1)
                    )
                );

                strains[i] *= Interpolation.lerp(
                    this.reducedSectionBaseline,
                    1,
                    scale
                );
            }

            strains.sort((a, b) => b - a);
        }

        // Difficulty is the weighted sum of the highest strains from every section.
        // We're sorting from highest to lowest strain.
        let difficulty: number = 0;
        let weight: number = 1;

        for (const strain of strains) {
            const addition: number = strain * weight;

            if (difficulty + addition === difficulty) {
                break;
            }

            difficulty += addition;
            weight *= this.decayWeight;
        }

        return difficulty * this.difficultyMultiplier;
    }
}
