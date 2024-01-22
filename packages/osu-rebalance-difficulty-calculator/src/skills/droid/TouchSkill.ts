import { Mod } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSkill } from "./DroidSkill";
import { TouchProbability } from "./TouchProbability";
import { TouchHand } from "../../structures/TouchHand";

export abstract class TouchSkill extends DroidSkill {
    private readonly probabilites: TouchProbability[] = [];
    private readonly maxProbabilities = 15;

    protected readonly clockRate: number;
    protected readonly greatWindow: number;

    constructor(mods: Mod[], clockRate: number, greatWindow: number) {
        super(mods);

        this.clockRate = clockRate;
        this.greatWindow = greatWindow;
    }

    protected override strainValueAt(current: DroidDifficultyHitObject) {
        if (this.probabilites.length === 0) {
            this.probabilites.push(
                new TouchProbability(
                    this.mods,
                    this.clockRate,
                    this.greatWindow,
                    current,
                ),
            );

            return 0;
        }

        const newProbabilities: TouchProbability[] = [];

        for (const probability of this.probabilites) {
            const leftProbability = new TouchProbability(probability);
            const rightProbability = new TouchProbability(probability);
            const dragProbability = new TouchProbability(probability);

            leftProbability.process(current, TouchHand.left);
            rightProbability.process(current, TouchHand.right);
            dragProbability.process(current, TouchHand.drag);

            const leftStrain = this.getProbabilityTotalStrain(leftProbability);
            const rightStrain =
                this.getProbabilityTotalStrain(rightProbability);
            const dragStrain = this.getProbabilityTotalStrain(dragProbability);

            const leftWeight = Math.sqrt(rightStrain * dragStrain);
            const rightWeight = Math.sqrt(leftStrain * dragStrain);
            const dragWeight = Math.sqrt(leftStrain * rightStrain);
            const sumWeight = leftWeight + rightWeight + dragWeight;

            leftProbability.probability *=
                sumWeight > 0 ? leftWeight / sumWeight : 1 / 3;
            rightProbability.probability *=
                sumWeight > 0 ? rightWeight / sumWeight : 1 / 3;
            dragProbability.probability *=
                sumWeight > 0 ? dragWeight / sumWeight : 1 / 3;

            newProbabilities.push(
                leftProbability,
                rightProbability,
                dragProbability,
            );
        }

        // Only keep the most probable possibilities.
        this.probabilites.length = 0;
        newProbabilities.sort((a, b) => b.probability - a.probability);

        const totalProbabilities = Math.min(
            newProbabilities.length,
            this.maxProbabilities,
        );
        let totalMostProbable = 0;

        for (let i = 0; i < totalProbabilities; ++i) {
            totalMostProbable += newProbabilities[i].probability;
            this.probabilites.push(newProbabilities[i]);
        }

        // Make sure total probability sums up to 1.
        for (const p of this.probabilites) {
            p.probability =
                totalMostProbable > 0
                    ? p.probability / totalMostProbable
                    : 1 / totalProbabilities;
        }

        return this.probabilites.reduce(
            (a, v) => a + this.getProbabilityStrain(v) * v.probability,
            0,
        );
    }

    protected calculateTotalStrain(aimStrain: number, tapStrain: number) {
        return Math.pow(
            Math.pow(aimStrain, 3 / 2) + Math.pow(tapStrain, 3 / 2),
            2 / 3,
        );
    }

    protected abstract getProbabilityStrain(
        probability: TouchProbability,
    ): number;

    protected abstract getProbabilityTotalStrain(
        probability: TouchProbability,
    ): number;
}
