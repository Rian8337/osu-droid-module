import { Mod } from "@rian8337/osu-base";
import { DroidAimEvaluator } from "../../evaluators/droid/DroidAimEvaluator";
import { DroidSkill } from "./DroidSkill";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class DroidAim extends DroidSkill {
    protected override readonly strainDecayBase = 0.15;
    protected override readonly reducedSectionCount = 10;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly starsPerDouble = 1.05;

    private readonly skillMultiplier = 24.55;

    private readonly withSliders: boolean;
    private currentAimStrain = 0;

    constructor(mods: Mod[], withSliders: boolean) {
        super(mods);

        this.withSliders = withSliders;
    }

    protected override strainValueAt(
        current: DroidDifficultyHitObject,
    ): number {
        this.currentAimStrain *= this.strainDecay(current.deltaTime);
        this.currentAimStrain +=
            DroidAimEvaluator.evaluateDifficultyOf(current, this.withSliders) *
            this.skillMultiplier;

        return this.currentAimStrain;
    }

    protected override calculateInitialStrain(
        time: number,
        current: DroidDifficultyHitObject,
    ): number {
        return (
            this.currentAimStrain *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override getObjectStrain(): number {
        return this.currentAimStrain;
    }

    /**
     * @param current The hitobject to save to.
     */
    protected override saveToHitObject(
        current: DroidDifficultyHitObject,
    ): void {
        if (this.withSliders) {
            current.aimStrainWithSliders = this.currentAimStrain;
        } else {
            current.aimStrainWithoutSliders = this.currentAimStrain;
        }
    }
}
