import { Skill } from "../../base/Skill";
import { StrainValue } from "../../structures/StrainValue";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class DroidSkill extends Skill {
    /**
     * The final multiplier to be applied to the final difficulty value after all other calculations.
     */
    protected readonly difficultyMultiplier: number = 1.06;

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
    protected readonly decayWeight: number = 0.9;
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

        let result: number = 0;
        let currentWeight: number = 1;
        let frequency: number = 0;

        const strainDecayRate: number = Math.log(this.strainDecayBase) / 1000;
        const sumDecayRate: number =
            Math.log(this.decayWeight) / this.sectionLength;

        for (let i = 0; i < strains.length - 1; ++i) {
            const current: StrainValue = strains[i];
            const next: StrainValue = strains[i + 1];

            frequency += current.strainCountChange;

            if (frequency > 0 && current.strain > 0) {
                const time: number =
                    (Math.log(next.strain / current.strain) * frequency) /
                    strainDecayRate;
                const nextWeight: number =
                    currentWeight * Math.exp(sumDecayRate * time);
                const combinedDecay: number =
                    this.sectionLength *
                    (sumDecayRate + strainDecayRate / frequency);

                result +=
                    (next.strain * nextWeight -
                        current.strain * currentWeight) /
                    combinedDecay;
                currentWeight = nextWeight;
            }
        }

        return result * this.difficultyMultiplier;
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
}
