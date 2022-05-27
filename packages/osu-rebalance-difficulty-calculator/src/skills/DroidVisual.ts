import { Mod, ModHidden, Slider, Spinner } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to read every object in the map.
 */
export class DroidVisual extends DroidSkill {
    protected override readonly historyLength: number = 4;
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

        // Start with base density and give global bonus for Hidden.
        // Add density caps for sanity.
        let strain: number =
            Math.min(20, Math.pow(current.noteDensity, 2)) /
            10 /
            (1 + current.overlappingFactor);

        if (this.isHidden) {
            strain +=
                Math.min(25, Math.pow(current.noteDensity, 1.25)) /
                10 /
                (1 + current.overlappingFactor / 1.25);
        }

        // Give bonus for AR higher than 10.33.
        if (this.preempt < 400) {
            strain += Math.pow(400 - this.preempt, 1.3) / 135;
        }

        if (current.object instanceof Slider) {
            const scalingFactor: number = 50 / current.object.radius;

            // Reward sliders based on velocity.
            strain +=
                // Avoid overbuffing extremely fast sliders.
                Math.min(5, current.velocity * 1.25) *
                // Scale with distance travelled to avoid overbuffing fast sliders with short distance.
                Math.min(1, current.travelDistance / scalingFactor / 125);

            let cumulativeStrainTime: number = 0;

            // Reward for velocity changes based on last few sliders.
            for (let i = 0; i < this.previous.length; ++i) {
                const last: DifficultyHitObject = this.previous[i];

                cumulativeStrainTime += last.strainTime;

                if (!(last.object instanceof Slider)) {
                    continue;
                }

                strain +=
                    // Avoid overbuffing extremely fast velocity changes.
                    Math.min(
                        8,
                        2 * Math.abs(current.velocity - last.velocity)
                    ) *
                    // Scale with distance travelled to avoid overbuffing fast sliders with short distance.
                    Math.min(1, last.travelDistance / scalingFactor / 100) *
                    // Scale with cumulative strain time to avoid overbuffing past sliders.
                    Math.min(1, 300 / cumulativeStrainTime);
            }
        }

        return strain;
    }

    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain +=
            this.strainValueOf(current) * this.skillMultiplier;

        return this.currentStrain * (1 + (current.rhythmMultiplier - 1) / 7.5);
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.visualStrain = this.currentStrain;
    }
}
