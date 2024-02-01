import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSkill } from "./DroidSkill";
import { TouchProbability } from "./TouchProbability";
import { TouchHand } from "../../structures/TouchHand";
import { RawTouchSkill } from "./RawTouchSkill";
import { DifficultyHitObjectCache } from "../../utils/DifficultyHitObjectCache";
import { Mod } from "@rian8337/osu-base";

export abstract class TouchSkill extends DroidSkill {
    protected readonly objectCache: DifficultyHitObjectCache<DroidDifficultyHitObject>;

    private readonly probabilities = new Array<TouchProbability>(15);

    // I know it is VERY weird to store the number of probabilities in the array here
    // rather than just using Array.length, but this is a very performance crucial
    // task. As such, this is used for optimizations.
    private numProbabilities = 0;

    constructor(
        mods: Mod[],
        objectCount: number,
        objectCache: DifficultyHitObjectCache<DroidDifficultyHitObject>,
    ) {
        super(mods, objectCount);

        this.objectCache = objectCache;
    }

    protected override strainValueAt(current: DroidDifficultyHitObject) {
        if (current.index === 0) {
            const probability = new TouchProbability(this.getRawSkills());

            // Process the first object to add to history.
            probability.process(current, TouchHand.drag);

            this.probabilities[0] = probability;
            this.numProbabilities = 1;

            return 0;
        }

        const newProbabilities = new Array<TouchProbability>(
            this.numProbabilities * 3,
        );

        // Using a manual loop here for optimizations.
        for (let i = 0; i < this.numProbabilities; ++i) {
            const probability = this.probabilities[i];

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

            newProbabilities[i * 3] = leftProbability;
            newProbabilities[i * 3 + 1] = rightProbability;
            newProbabilities[i * 3 + 2] = dragProbability;
        }

        // Only keep the most probable possibilities.
        newProbabilities.sort((a, b) => b.probability - a.probability);

        this.numProbabilities = Math.min(
            newProbabilities.length,
            this.probabilities.length,
        );
        let totalMostProbable = 0;

        for (let i = 0; i < this.numProbabilities; ++i) {
            totalMostProbable += newProbabilities[i].probability;
            this.probabilities[i] = newProbabilities[i];
        }

        let strain = 0;

        for (let i = 0; i < this.numProbabilities; ++i) {
            const p = this.probabilities[i];

            // Make sure total probability sums up to 1.
            p.probability =
                totalMostProbable > 0
                    ? p.probability / totalMostProbable
                    : 1 / this.numProbabilities;

            strain += this.getProbabilityStrain(p) * p.probability;
        }

        return strain;
    }

    protected calculateTotalStrain(aimStrain: number, tapStrain: number) {
        return Math.pow(
            Math.pow(aimStrain, 3 / 2) + Math.pow(tapStrain, 3 / 2),
            2 / 3,
        );
    }

    protected abstract getRawSkills(): RawTouchSkill[];

    protected abstract getProbabilityStrain(
        probability: TouchProbability,
    ): number;

    protected abstract getProbabilityTotalStrain(
        probability: TouchProbability,
    ): number;
}
