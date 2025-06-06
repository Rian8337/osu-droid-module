import { ModMap } from "@rian8337/osu-base";
import { DroidVisualEvaluator } from "../../evaluators/droid/DroidVisualEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to read every object in the map.
 */
export class DroidVisual extends DroidSkill {
    protected override readonly starsPerDouble = 1.025;
    protected override readonly reducedSectionCount = 10;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly strainDecayBase = 0.1;

    private currentVisualStrain = 0;
    private currentRhythmMultiplier = 1;
    private readonly skillMultiplier = 10;

    readonly withSliders: boolean;

    constructor(mods: ModMap, withSliders: boolean) {
        super(mods);

        this.withSliders = withSliders;
    }

    protected override strainValueAt(
        current: DroidDifficultyHitObject,
    ): number {
        this.currentVisualStrain *= this.strainDecay(current.deltaTime);
        this.currentVisualStrain +=
            DroidVisualEvaluator.evaluateDifficultyOf(
                current,
                this.mods,
                this.withSliders,
            ) * this.skillMultiplier;

        this.currentRhythmMultiplier = current.rhythmMultiplier;

        return this.currentVisualStrain * this.currentRhythmMultiplier;
    }

    protected override calculateInitialStrain(
        time: number,
        current: DroidDifficultyHitObject,
    ): number {
        return (
            this.currentVisualStrain *
            this.currentRhythmMultiplier *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override getObjectStrain(): number {
        return this.currentVisualStrain * this.currentRhythmMultiplier;
    }

    protected override saveToHitObject(
        current: DroidDifficultyHitObject,
    ): void {
        const strain: number =
            this.currentVisualStrain * this.currentRhythmMultiplier;

        if (this.withSliders) {
            current.visualStrainWithSliders = strain;
        } else {
            current.visualStrainWithoutSliders = strain;
        }
    }
}
