import { Mod, ModHidden, Spinner } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to read every object in the map.
 */
export class DroidVisual extends DroidSkill {
    protected override readonly historyLength: number = 16;
    protected override readonly starsPerDouble: number = 1.025;
    protected override readonly reducedSectionCount: number = 10;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly skillMultiplier: number = 20;
    protected override readonly strainDecayBase: number = 0.1;

    private readonly preempt: number;
    private readonly isHidden: boolean;

    constructor(mods: Mod[], preempt: number) {
        super(mods);

        this.preempt = preempt;
        this.isHidden = mods.some((m) => m instanceof ModHidden);
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected strainValueOf(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        const last: DifficultyHitObject | undefined = this.previous.at(0);

        // Start with base density and give minimum global bonus for Hidden.
        let strain: number =
            (0.25 * current.noteDensity) / (1 + current.overlappingFactor * 5);

        if (this.isHidden) {
            strain +=
                (0.1 * current.noteDensity) /
                (1 + current.overlappingFactor * 2);
        }

        // Give bonus for AR higher than 10.33 or lower than 8.
        if (this.preempt < 400) {
            strain +=
                (0.02375 * (400 - this.preempt)) /
                (1 + current.overlappingFactor * 1.5);
        } else if (this.preempt > 750) {
            strain +=
                ((this.isHidden ? 0.007 : 0.006) * (this.preempt - 750)) /
                (1 + current.overlappingFactor * 2);
        }

        if (current.travelTime) {
            const currentVelocity: number =
                current.travelDistance / current.travelTime;

            // Reward sliders based on velocity, while avoiding overbuffing extremely fast sliders.
            strain += Math.min(10, currentVelocity * 1.5);

            // Reward for velocity changes if the previous object is a slider.
            if (last?.travelTime) {
                const prevVelocity: number =
                    last.travelDistance / last.travelTime;

                // Avoid overbuffing extremely fast sliders.
                strain += Math.min(
                    10,
                    Math.abs(currentVelocity - prevVelocity) * 2.5
                );
            }
        }

        return strain;
    }

    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain +=
            this.strainValueOf(current) * this.skillMultiplier;

        return this.currentStrain;
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.visualStrain = this.currentStrain;
    }
}
