import { Interpolation, MathUtils } from "@rian8337/osu-base";
import { StrainSkill } from "../../base/StrainSkill";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class OsuSkill extends StrainSkill {
    /**
     * The weight by which each strain value decays.
     */
    protected abstract readonly decayWeight: number;

    override difficultyValue(): number {
        const strains = this.strainPeaks.slice().sort((a, b) => b - a);

        if (this.reducedSectionCount > 0) {
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

            strains.sort((a, b) => b - a);
        }

        // Difficulty is the weighted sum of the highest strains from every section.
        // We're sorting from highest to lowest strain.
        let difficulty = 0;
        let weight = 1;

        for (const strain of strains) {
            const addition = strain * weight;

            if (difficulty + addition === difficulty) {
                break;
            }

            difficulty += addition;
            weight *= this.decayWeight;
        }

        return difficulty;
    }
}
