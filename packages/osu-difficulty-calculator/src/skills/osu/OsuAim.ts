import { OsuSkill } from "./OsuSkill";
import { Mod } from "@rian8337/osu-base";
import { OsuAimEvaluator } from "../../evaluators/osu/OsuAimEvaluator";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class OsuAim extends OsuSkill {
    protected override readonly strainDecayBase = 0.15;
    protected override readonly reducedSectionCount = 10;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly decayWeight = 0.9;

    private currentAimStrain = 0;
    private readonly skillMultiplier = 25.18;
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

        this._objectStrains.push(this.currentAimStrain);

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
