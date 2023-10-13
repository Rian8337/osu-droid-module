import { OsuSkill } from "./OsuSkill";
import { Mod } from "@rian8337/osu-base";
import { OsuAimEvaluator } from "../../evaluators/osu/OsuAimEvaluator";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class OsuAim extends OsuSkill {
    protected override readonly strainDecayBase: number = 0.15;
    protected override readonly reducedSectionCount: number = 10;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly decayWeight: number = 0.9;

    private currentAimStrain: number = 0;
    private readonly skillMultiplier: number = 23.55;
    private readonly withSliders: boolean;

    constructor(mods: Mod[], withSliders: boolean) {
        super(mods);

        this.withSliders = withSliders;
    }

    protected override strainValueAt(current: OsuDifficultyHitObject): number {
        this.currentAimStrain *= this.strainDecay(current.deltaTime);
        this.currentAimStrain +=
            OsuAimEvaluator.evaluateDifficultyOf(current, this.withSliders) *
            this.skillMultiplier;

        return this.currentAimStrain;
    }

    protected override calculateInitialStrain(
        time: number,
        current: OsuDifficultyHitObject,
    ): number {
        return (
            this.currentAimStrain *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    /**
     * @param current The hitobject to save to.
     */
    protected override saveToHitObject(current: OsuDifficultyHitObject): void {
        if (this.withSliders) {
            current.aimStrainWithSliders = this.currentAimStrain;
        } else {
            current.aimStrainWithoutSliders = this.currentAimStrain;
        }
    }
}
