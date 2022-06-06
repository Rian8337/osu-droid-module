import { Precision, Slider, Spinner } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class DroidFlashlight extends DroidSkill {
    protected override readonly historyLength: number = 10;
    protected override readonly skillMultiplier: number = 0.15;
    protected override readonly strainDecayBase: number = 0.15;
    protected override readonly reducedSectionCount: number = 10;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly starsPerDouble: number = 1.05;

    protected strainValueOf(current: DifficultyHitObject): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            (Precision.almostEqualsNumber(current.deltaTime, 0, 1) &&
                (this.previous[0]?.object instanceof Slider
                    ? Math.min(
                          this.previous[0].object.stackedEndPosition.getDistance(
                              current.object.stackedPosition
                          ),
                          this.previous[0].object.lazyEndPosition!.getDistance(
                              current.object.stackedPosition
                          )
                      )
                    : this.previous[0]?.object.stackedEndPosition.getDistance(
                          current.object.stackedPosition
                      )) <=
                    2 * current.object.radius)
        ) {
            return 0;
        }

        const scalingFactor: number = 52 / current.object.radius;

        let smallDistNerf: number = 1;

        let cumulativeStrainTime: number = 0;

        let result: number = 0;

        let last: DifficultyHitObject = current;

        for (let i = 0; i < this.previous.length; ++i) {
            const currentObject: DifficultyHitObject = this.previous[i];

            if (
                !(currentObject.object instanceof Spinner) &&
                // Exclude overlapping objects that can be tapped at once.
                !Precision.almostEqualsNumber(currentObject.deltaTime, 0, 1)
            ) {
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

        return Math.pow(smallDistNerf * result, 2);
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain +=
            this.strainValueOf(current) * this.skillMultiplier;

        return this.currentStrain;
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.flashlightStrain = this.currentStrain;
    }
}
