import { Skill } from "../../base/Skill";
import { StrainValue } from "../../structures/StrainValue";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class DroidSkill extends Skill {
    /**
     * The bonus multiplier that is given for a sequence of notes of equal difficulty.
     */
    protected abstract readonly starsPerDouble: number;

    /**
     * The strains of hitobjects.
     */
    readonly strains: StrainValue[] = [];

    /**
     * Determines how quickly strain decays for the given skill.
     *
     * For example, a value of 0.15 indicates that strain decays to 15% of its original value in one second.
     */
    protected abstract readonly strainDecayBase: number;

    protected readonly sectionLength: number = 400;
    protected currentStrain: number = 0;

    override process(current: DifficultyHitObject): void {
        this.strains.push({
            strain: this.currentStrain * this.strainDecay(current.deltaTime),
            strainCountChange: -1,
        });

        this.currentStrain = this.strainValueAt(current);
        this.saveToHitObject(current);

        this.strains.push({
            strain: this.currentStrain,
            strainCountChange: 1,
        });
    }

    override difficultyValue(): number {
        const strains: StrainValue[] = this.strains
            .slice()
            .sort((a, b) => b.strain - a.strain);

        // Math here preserves the property that two notes of equal difficulty x, we have their summed difficulty = x * starsPerDouble.
        // This also applies to two sets of notes with equal difficulty.
        let result: number = 0;
        let frequency: number = 0;
        const strainDecayRate: number = Math.log(this.strainDecayBase) / 1000;

        for (let i = 0; i < strains.length - 1; ++i) {
            const current: StrainValue = strains[i];
            const next: StrainValue = strains[i + 1];

            frequency += current.strainCountChange;

            if (frequency > 0 && current.strain > 0) {
                const combinedDecay: number =
                    this.sectionLength * (strainDecayRate / frequency);

                result +=
                    (this.calculateWeightedStrain(next.strain) -
                        this.calculateWeightedStrain(current.strain)) /
                    combinedDecay;
            }
        }

        return Math.pow(result, Math.log2(this.starsPerDouble));
    }

    /**
     * Calculates the strain value at a hitobject.
     */
    protected abstract strainValueAt(current: DifficultyHitObject): number;

    /**
     * Saves the current strain to a hitobject.
     */
    protected abstract saveToHitObject(current: DifficultyHitObject): void;

    /**
     * Calculates strain decay for a specified time frame.
     *
     * @param ms The time frame to calculate.
     */
    protected strainDecay(ms: number): number {
        return Math.pow(this.strainDecayBase, ms / 1000);
    }

    /**
     * Calculates the strain to be weighed towards the final difficulty value.
     *
     * @param strain The strain.
     * @returns The weighed strain.
     */
    private calculateWeightedStrain(strain: number): number {
        return Math.pow(strain, 1 / Math.log2(this.starsPerDouble));
    }
}
