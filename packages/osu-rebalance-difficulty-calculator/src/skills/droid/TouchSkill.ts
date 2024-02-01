import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSkill } from "./DroidSkill";
import { TouchProbability } from "./TouchProbability";
import { TouchHand } from "../../structures/TouchHand";
import { RawTouchSkill } from "./RawTouchSkill";
import { DifficultyHitObjectCache } from "../../utils/DifficultyHitObjectCache";
import { Mod } from "@rian8337/osu-base";

export abstract class TouchSkill extends DroidSkill {
    protected readonly objectCache: DifficultyHitObjectCache<DroidDifficultyHitObject>;

    private readonly probabilities: TouchProbability[] = [];
    private readonly maxProbabilities = 15;

    constructor(
        mods: Mod[],
        objectCache: DifficultyHitObjectCache<DroidDifficultyHitObject>,
    ) {
        super(mods);

        this.objectCache = objectCache;
    }

    protected override strainValueAt(current: DroidDifficultyHitObject) {
        if (current.index === 0) {
            const probability = new TouchProbability(this.getRawSkills());

            // Process the first object to add to history.
            probability.process(current, TouchHand.drag);

            this.probabilities.push(probability);

            return 0;
        }

        const newProbabilities: TouchProbability[] = [];

        for (const probability of this.probabilities) {
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
        this.probabilities.length = 0;
        newProbabilities.sort((a, b) => b.probability - a.probability);

        const totalProbabilities = Math.min(
            newProbabilities.length,
            this.maxProbabilities,
        );
        let totalMostProbable = 0;

        for (let i = 0; i < totalProbabilities; ++i) {
            totalMostProbable += newProbabilities[i].probability;
            this.probabilities.push(newProbabilities[i]);
        }

        // Make sure total probability sums up to 1.
        for (const p of this.probabilities) {
            p.probability =
                totalMostProbable > 0
                    ? p.probability / totalMostProbable
                    : 1 / totalProbabilities;
        }

        return this.probabilities.reduce(
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

    protected abstract getRawSkills(): RawTouchSkill[];

    protected abstract getProbabilityStrain(
        probability: TouchProbability,
    ): number;

    protected abstract getProbabilityTotalStrain(
        probability: TouchProbability,
    ): number;
}
