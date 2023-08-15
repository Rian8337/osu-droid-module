import { Mod, ModHidden } from "@rian8337/osu-base";
import { DroidVisualEvaluator } from "../../evaluators/droid/DroidVisualEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to read every object in the map.
 */
export class DroidVisual extends DroidSkill {
    protected override readonly starsPerDouble: number = 1.025;
    protected override readonly reducedSectionCount: number = 10;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly skillMultiplier: number = 10;
    protected override readonly strainDecayBase: number = 0.1;

    private readonly isHidden: boolean;
    private readonly withsliders: boolean;

    private currentVisualStrain: number = 0;

    constructor(mods: Mod[], withSliders: boolean) {
        super(mods);

        this.isHidden = mods.some((m) => m instanceof ModHidden);
        this.withsliders = withSliders;
    }

    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentVisualStrain *= this.strainDecay(current.deltaTime);
        this.currentVisualStrain +=
            DroidVisualEvaluator.evaluateDifficultyOf(
                current,
                this.isHidden,
                this.withsliders,
            ) * this.skillMultiplier;

        return (
            this.currentVisualStrain * (1 + (current.rhythmMultiplier - 1) / 5)
        );
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        if (this.withsliders) {
            current.visualStrainWithSliders = this.currentStrain;
        } else {
            current.visualStrainWithoutSliders = this.currentStrain;
        }
    }
}
