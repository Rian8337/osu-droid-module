import { OsuSkill } from "./OsuSkill";
import { MathUtils, Mod, Slider } from "@rian8337/osu-base";
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
    private readonly skillMultiplier = 25.6;
    private readonly withSliders: boolean;

    private readonly sliderStrains: number[] = [];

    constructor(mods: Mod[], withSliders: boolean) {
        super(mods);

        this.withSliders = withSliders;
    }

    /**
     * Obtains the amount of sliders that are considered difficult in terms of relative strain.
     */
    countDifficultSliders(): number {
        if (this.sliderStrains.length === 0) {
            return 0;
        }

        const maxSliderStrain = MathUtils.max(this.sliderStrains);

        if (maxSliderStrain === 0) {
            return 0;
        }

        return this.sliderStrains.reduce(
            (total, strain) =>
                total +
                1 / (1 + Math.exp(-((strain / maxSliderStrain) * 12 - 6))),
            0,
        );
    }

    protected override strainValueAt(current: OsuDifficultyHitObject): number {
        this.currentAimStrain *= this.strainDecay(current.deltaTime);
        this.currentAimStrain +=
            OsuAimEvaluator.evaluateDifficultyOf(current, this.withSliders) *
            this.skillMultiplier;

        this._objectStrains.push(this.currentAimStrain);

        if (current.object instanceof Slider) {
            this.sliderStrains.push(this.currentAimStrain);
        }

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
