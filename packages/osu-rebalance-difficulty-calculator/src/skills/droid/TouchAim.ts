import { Mod, OsuHitWindow } from "@rian8337/osu-base";
import { TouchProbability } from "./TouchProbability";
import { TouchSkill } from "./TouchSkill";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

export class TouchAim extends TouchSkill {
    protected override readonly strainDecayBase = 0.15;
    protected override readonly reducedSectionCount = 10;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly starsPerDouble = 1.05;

    private readonly withSliders: boolean;
    private currentAimStrain = 0;

    constructor(
        mods: Mod[],
        clockRate: number,
        overallDifficulty: number,
        withSliders: boolean,
    ) {
        super(
            mods,
            clockRate,
            new OsuHitWindow(overallDifficulty).hitWindowFor300(),
        );

        this.withSliders = withSliders;
    }

    protected override strainValueAt(current: DroidDifficultyHitObject) {
        this.currentAimStrain = super.strainValueAt(current);

        return this.currentAimStrain;
    }

    protected override getProbabilityStrain(probability: TouchProbability) {
        if (this.withSliders) {
            return probability.skills.aimWithSliders.currentStrain;
        } else {
            return probability.skills.aimWithoutSliders.currentStrain;
        }
    }

    protected override getProbabilityTotalStrain(
        probability: TouchProbability,
    ) {
        return this.calculateTotalStrain(
            this.getProbabilityStrain(probability),
            probability.skills.tapWithCheesability.currentStrain,
        );
    }

    protected override calculateInitialStrain(
        time: number,
        current: DroidDifficultyHitObject,
    ) {
        return (
            this.currentAimStrain *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override getObjectStrain() {
        return this.currentAimStrain;
    }

    protected override saveToHitObject(current: DroidDifficultyHitObject) {
        if (this.withSliders) {
            current.aimStrainWithSliders = this.currentAimStrain;
        } else {
            current.aimStrainWithoutSliders = this.currentAimStrain;
        }
    }
}
