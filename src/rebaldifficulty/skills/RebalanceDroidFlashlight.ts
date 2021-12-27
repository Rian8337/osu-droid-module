import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { RebalanceDifficultyHitObject } from "../preprocessing/RebalanceDifficultyHitObject";
import { RebalanceDroidSkill } from "./RebalanceDroidSkill";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class RebalanceDroidFlashlight extends RebalanceDroidSkill {
    protected override readonly historyLength: number = 10;
    protected override readonly skillMultiplier: number = 0.15;
    protected override readonly strainDecayBase: number = 0.15;
    protected override readonly reducedSectionCount: number = 10;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly starsPerDouble: number = 1.1;

    protected strainValueOf(current: RebalanceDifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        const scalingFactor: number = 52 / current.object.radius;

        let smallDistNerf: number = 1;

        let cumulativeStrainTime: number = 0;

        let result: number = 0;

        let last: RebalanceDifficultyHitObject = current;

        for (let i = 0; i < this.previous.length; ++i) {
            const currentObject: RebalanceDifficultyHitObject = this.previous[i];

            if (!(currentObject.object instanceof Spinner)) {
                const jumpDistance: number =
                    current.object.stackedPosition.subtract(
                        currentObject.object.endPosition
                    ).length;

                cumulativeStrainTime += last.strainTime;

                // We want to nerf objects that can be easily seen within the Flashlight circle radius.
                if (i === 0) {
                    smallDistNerf = Math.min(1, jumpDistance / 75);
                }

                // We also want to nerf stacks so that only the first object of the stack is accounted for.
                const stackNerf: number = Math.min(
                    1,
                    currentObject.lazyJumpDistance / scalingFactor / 25
                );

                result +=
                    (stackNerf * scalingFactor * jumpDistance) /
                    cumulativeStrainTime;
            }

            last = currentObject;
        }

        return Math.pow(smallDistNerf * result, 2) * this.skillMultiplier;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(
        current: RebalanceDifficultyHitObject
    ): number {
        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain +=
            this.strainValueOf(current) * this.skillMultiplier;

        return this.currentStrain;
    }

    protected override saveToHitObject(
        current: RebalanceDifficultyHitObject
    ): void {
        current.flashlightStrain = this.currentStrain;
    }
}
