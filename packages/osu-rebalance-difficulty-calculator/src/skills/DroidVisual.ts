import { Mod, ModHidden, Slider, Spinner } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to read every object in the map.
 */
export class DroidVisual extends DroidSkill {
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

        // Start with base density and give minimum global bonus for Hidden.
        // Add density caps for sanity.
        let strain: number =
            Math.min(20, Math.pow(current.noteDensity, 2)) /
            10 /
            (1 + current.overlappingFactor);

        if (this.isHidden) {
            strain +=
                Math.min(25, Math.pow(current.noteDensity, 1.25)) /
                10 /
                (1 + current.overlappingFactor * 1.25);
        }

        // Give bonus for AR higher than 10.33.
        if (this.preempt < 400) {
            strain += Math.pow(400 - this.preempt, 1.3) / 125;
        }

        if (current.object instanceof Slider) {
            const currentVelocity: number =
                current.travelDistance / current.travelTime;

            // Reward sliders based on velocity, while avoiding overbuffing extremely fast sliders.
            strain += Math.min(15, currentVelocity * 2.5);

            // Reward for velocity changes based on last few objects.
            for (let i = 0; i < this.previous.length; ++i) {
                const last: DifficultyHitObject = this.previous[i];

                // Only reward velocity changes for sliders.
                if (!(last.object instanceof Slider)) {
                    continue;
                }

                const prevVelocity: number =
                    last.travelDistance / last.travelTime;

                // Avoid overbuffing extremely fast sliders.
                strain += Math.min(
                    15,
                    (Math.abs(currentVelocity - prevVelocity) *
                        5 *
                        // Add a decay as past objects become more irrelevant
                        (this.previous.length - i)) /
                        this.previous.length
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
