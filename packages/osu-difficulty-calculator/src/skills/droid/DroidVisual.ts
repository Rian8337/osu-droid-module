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

    constructor(mods: Mod[]) {
        super(mods);

        this.isHidden = mods.some((m) => m instanceof ModHidden);
    }

    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain +=
            DroidVisualEvaluator.evaluateDifficultyOf(current, this.isHidden) *
            this.skillMultiplier;

        return this.currentStrain;
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.visualStrain = this.currentStrain;
    }
}
